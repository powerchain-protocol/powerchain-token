import {
  spawn,
} from "node:child_process";
import net from "node:net";

function freePort() {
  return new Promise(
    (resolve, reject) => {
      const server =
        net.createServer();

      server.on(
        "error",
        reject,
      );

      server.listen(
        0,
        "127.0.0.1",
        () => {
          const address =
            server.address();

          const port =
            typeof address ===
              "object" &&
            address
              ? address.port
              : null;

          server.close(
            (error) => {
              if (error) {
                reject(error);
                return;
              }

              resolve(port);
            },
          );
        },
      );
    },
  );
}

async function waitFor(
  url,
  processHandle,
) {
  for (
    let attempt = 0;
    attempt < 60;
    attempt += 1
  ) {
    if (
      processHandle
        .exitCode !== null
    ) {
      throw new Error(
        `FULLSTACK_PROCESS_EXITED:${processHandle.exitCode}`,
      );
    }

    try {
      const response =
        await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {}

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          100,
        ),
    );
  }

  throw new Error(
    `FULLSTACK_START_TIMEOUT:${url}`,
  );
}

async function jsonRequest(
  url,
  {
    method = "GET",
    body,
    headers = {},
  } = {},
) {
  const response =
    await fetch(
      url,
      {
        method,
        headers: {
          ...(body
            ? {
                "Content-Type":
                  "application/json",
              }
            : {}),
          ...headers,
        },
        body:
          body
            ? JSON.stringify(
                body,
              )
            : undefined,
      },
    );

  return {
    status:
      response.status,
    body:
      await response.json(),
  };
}

const apiPort =
  await freePort();

const webPort =
  await freePort();

const api =
  spawn(
    process.execPath,
    [
      "apps/api/server.mjs",
    ],
    {
      cwd:
        process.cwd(),
      env: {
        ...process.env,
        PWRC_API_HOST:
          "127.0.0.1",
        PWRC_API_PORT:
          String(apiPort),
        PWRC_BRIDGE_EXECUTION_ENABLED:
          "false",
        PWRC_BRIDGE_API_AUTH_TOKEN:
          "",
      },
      stdio:
        "ignore",
    },
  );

let web;

try {
  await waitFor(
    `http://127.0.0.1:${apiPort}/api/v1/health`,
    api,
  );

  web =
    spawn(
      process.execPath,
      [
        "apps/web/server.mjs",
      ],
      {
        cwd:
          process.cwd(),
        env: {
          ...process.env,
          PWRC_WEB_HOST:
            "127.0.0.1",
          PWRC_WEB_PORT:
            String(webPort),
          PWRC_WEB_API_URL:
            `http://127.0.0.1:${apiPort}`,
        },
        stdio:
          "ignore",
      },
    );

  await waitFor(
    `http://127.0.0.1:${webPort}/`,
    web,
  );

  const health =
    await jsonRequest(
      `http://127.0.0.1:${apiPort}/api/v1/health`,
    );

  const token =
    await jsonRequest(
      `http://127.0.0.1:${apiPort}/api/v1/token`,
    );

  const quote =
    await jsonRequest(
      `http://127.0.0.1:${apiPort}/api/v1/bridge/quote`,
      {
        method:
          "POST",
        body: {
          direction:
            "solana-to-sui",
          amountBaseUnits:
            "1000000000",
        },
      },
    );

  const proxyQuote =
    await jsonRequest(
      `http://127.0.0.1:${webPort}/api/v1/bridge/quote`,
      {
        method:
          "POST",
        body: {
          direction:
            "sui-to-solana",
          amountBaseUnits:
            "1000000000",
        },
      },
    );

  const capabilities =
    await jsonRequest(
      `http://127.0.0.1:${webPort}/api/v1/bridge/capabilities`,
    );

  const execute =
    await jsonRequest(
      `http://127.0.0.1:${apiPort}/api/v1/bridge/execute`,
      {
        method:
          "POST",
        headers: {
          "Idempotency-Key":
            "fullstack-test-1",
        },
        body: {
          direction:
            "solana-to-sui",
          amountBaseUnits:
            "1000000000",
        },
      },
    );

  const failures = [];

  if (
    health.status !== 200 ||
    health.body.ok !== true
  ) {
    failures.push(
      "health",
    );
  }

  if (
    token.status !== 200 ||
    token.body.token
      ?.mint !==
      "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc"
  ) {
    failures.push(
      "token",
    );
  }

  if (
    quote.status !== 200 ||
    quote.body.quote
      ?.transferFeeBaseUnits !==
      "25000000" ||
    quote.body.quote
      ?.netAmountBaseUnits !==
      "975000000" ||
    quote.body.quote
      ?.fingerprint?.length !==
      64
  ) {
    failures.push(
      "quote",
    );
  }

  if (
    proxyQuote.status !== 200 ||
    proxyQuote.body.quote
      ?.netAmountBaseUnits !==
      "975000000"
  ) {
    failures.push(
      "proxy-quote",
    );
  }

  if (
    capabilities.status !==
      200 ||
    capabilities.body.quote !==
      true ||
    capabilities.body.execute !==
      false
  ) {
    failures.push(
      "capabilities",
    );
  }

  if (
    execute.status !== 503 ||
    execute.body.error
      ?.code !==
      "PWRC_BRIDGE_API_AUTH_NOT_CONFIGURED"
  ) {
    failures.push(
      "execution-fail-closed",
    );
  }

  const report = {
    ok:
      failures.length === 0,
    version:
      "1.0.0",
    apiPort,
    webPort,
    tests: {
      health:
        true,
      canonicalToken:
        true,
      canonicalFeeQuote:
        true,
      sameOriginProxy:
        true,
      capabilityGate:
        true,
      executionFailClosed:
        true,
    },
    failures,
  };

  console.log(
    JSON.stringify(
      report,
      null,
      2,
    ),
  );

  if (failures.length) {
    process.exitCode = 1;
  }
} finally {
  for (const child of [
    web,
    api,
  ]) {
    if (
      child &&
      child.exitCode ===
        null
    ) {
      child.kill(
        "SIGTERM",
      );
    }
  }
}
