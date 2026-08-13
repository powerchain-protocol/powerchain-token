import {
  spawn,
} from "node:child_process";
import net from "node:net";

function freePort() {
  return new Promise(
    (resolve, reject) => {
      const server =
        net.createServer();

      server.once(
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
                reject(
                  error,
                );
              } else {
                resolve(
                  port,
                );
              }
            },
          );
        },
      );
    },
  );
}

async function waitFor(
  url,
  child,
) {
  for (
    let attempt = 0;
    attempt < 60;
    attempt += 1
  ) {
    if (
      child.exitCode !==
        null
    ) {
      throw new Error(
        `PWRC_DOCS_PROCESS_EXITED:${child.exitCode}`,
      );
    }

    try {
      const response =
        await fetch(
          url,
        );

      if (response.ok) {
        return response;
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
    `PWRC_DOCS_START_TIMEOUT:${url}`,
  );
}

const port =
  await freePort();

const child =
  spawn(
    process.execPath,
    [
      "apps/docs/server.mjs",
    ],
    {
      cwd:
        process.cwd(),
      env: {
        ...process.env,
        PWRC_DOCS_HOST:
          "127.0.0.1",
        PWRC_DOCS_PORT:
          String(
            port,
          ),
        NODE_OPTIONS:
          "",
      },
      stdio:
        "ignore",
    },
  );

const failures = [];

try {
  const health =
    await waitFor(
      `http://127.0.0.1:${port}/health`,
      child,
    );

  const healthBody =
    await health.json();

  if (
    healthBody.ok !== true ||
    healthBody.version !==
      "1.0.0"
  ) {
    failures.push(
      "health",
    );
  }

  const technology =
    await fetch(
      `http://127.0.0.1:${port}/technology`,
    );

  const html =
    await technology.text();

  if (
    technology.status !==
      200 ||
    !html.includes(
      "Technology Overview",
    ) ||
    !html.includes(
      "PowerChain Docs",
    )
  ) {
    failures.push(
      "technology-page",
    );
  }

  const sessions =
    await fetch(
      `http://127.0.0.1:${port}/api/docs/sessions`,
    );

  const sessionsBody =
    await sessions.json();

  if (
    sessionsBody.sessions
      ?.length !== 7
  ) {
    failures.push(
      "sessions-index",
    );
  }

  const missing =
    await fetch(
      `http://127.0.0.1:${port}/not-a-doc`,
    );

  if (
    missing.status !== 404
  ) {
    failures.push(
      "not-found",
    );
  }

  console.log(
    JSON.stringify(
      {
        ok:
          failures.length === 0,
        version:
          "1.0.0",
        port,
        tests: {
          health:
            true,
          technologyPage:
            true,
          sessionIndex:
            true,
          notFound:
            true,
        },
        failures,
      },
      null,
      2,
    ),
  );

  if (failures.length) {
    process.exitCode = 1;
  }
} finally {
  if (
    child.exitCode === null
  ) {
    child.kill(
      "SIGTERM",
    );
  }
}
