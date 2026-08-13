import { spawn } from "node:child_process";
import {
  allocateFreePort,
  canListen,
  parsePort,
  portOwner,
} from "./ports.mjs";

const args =
  new Set(
    process.argv.slice(2),
  );

const autoPorts =
  args.has(
    "--auto-ports",
  ) ||
  process.env
    .PWRC_FULLSTACK_AUTO_PORTS ===
    "true";

const apiHost =
  process.env.PWRC_API_HOST ??
  "127.0.0.1";

const clientHost =
  process.env.PWRC_CLIENT_HOST ??
  "127.0.0.1";

let apiPort =
  parsePort(
    process.env.PWRC_API_PORT,
    8787,
  );

let clientPort =
  parsePort(
    process.env.PWRC_CLIENT_PORT,
    3000,
  );

const children =
  new Map();

let shuttingDown =
  false;

function delay(ms) {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms),
  );
}

async function waitForHttp(
  url,
  child,
  name,
) {
  for (
    let attempt = 0;
    attempt < 80;
    attempt += 1
  ) {
    if (
      child.exitCode !== null
    ) {
      throw new Error(
        `PWRC_FULLSTACK_CHILD_EXIT:${name}:${child.exitCode}`,
      );
    }

    try {
      const response =
        await fetch(
          url,
          {
            signal:
              AbortSignal.timeout(
                1_000,
              ),
          },
        );

      if (response.ok) {
        return;
      }
    } catch {}

    await delay(100);
  }

  throw new Error(
    `PWRC_FULLSTACK_START_TIMEOUT:${name}:${url}`,
  );
}

function startChild(
  name,
  script,
  env,
) {
  const child =
    spawn(
      process.execPath,
      [script],
      {
        cwd:
          process.cwd(),
        env: {
          ...process.env,
          ...env,
        },
        stdio:
          "inherit",
      },
    );

  children.set(name, child);

  child.once(
    "exit",
    (code, signal) => {
      children.delete(name);

      if (
        !shuttingDown &&
        (
          code !== 0 ||
          signal
        )
      ) {
        console.error(
          `PWRC_FULLSTACK_CHILD_EXIT:${name}:${code ?? "signal"}:${signal ?? ""}`,
        );

        void shutdown(
          "child-exit",
          1,
        );
      }
    },
  );

  return child;
}

async function shutdown(
  reason,
  exitCode = 0,
) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (
    const child of
    children.values()
  ) {
    if (
      child.exitCode === null
    ) {
      child.kill("SIGTERM");
    }
  }

  const deadline =
    Date.now() + 5_000;

  while (
    children.size > 0 &&
    Date.now() < deadline
  ) {
    await delay(50);
  }

  for (
    const child of
    children.values()
  ) {
    if (
      child.exitCode === null
    ) {
      child.kill("SIGKILL");
    }
  }

  if (
    reason !== "normal"
  ) {
    console.error(
      `PWRC_FULLSTACK_SHUTDOWN:${reason}`,
    );
  }

  process.exit(exitCode);
}

async function resolvePort({
  name,
  host,
  requested,
}) {
  if (
    await canListen(
      host,
      requested,
    )
  ) {
    return requested;
  }

  const owner =
    portOwner(
      host,
      requested,
    );

  if (!autoPorts) {
    console.error(
      `PWRC_FULLSTACK_PORT_IN_USE:${name}:${host}:${requested}`,
    );

    if (owner) {
      console.error(
        "Listening process:",
      );
      console.error(owner);
    }

    console.error("");
    console.error(
      "Stop the existing process, choose another port, or use:",
    );
    console.error(
      "  pnpm fullstack:start:auto",
    );

    throw new Error(
      `PWRC_FULLSTACK_PORT_IN_USE:${name}:${requested}`,
    );
  }

  const fallback =
    await allocateFreePort(host);

  console.warn(
    `PWRC_FULLSTACK_PORT_FALLBACK:${name}:${requested}->${fallback}`,
  );

  return fallback;
}

async function main() {
  apiPort =
    await resolvePort({
      name:
        "api",
      host:
        apiHost,
      requested:
        apiPort,
    });

  clientPort =
    await resolvePort({
      name:
        "client",
      host:
        clientHost,
      requested:
        clientPort,
    });

  if (
    apiHost === clientHost &&
    apiPort === clientPort
  ) {
    throw new Error(
      "PWRC_FULLSTACK_PORT_COLLISION",
    );
  }

  const apiUrl =
    `http://${apiHost}:${apiPort}`;

  const api =
    startChild(
      "api",
      "apps/api/server.mjs",
      {
        PWRC_API_HOST:
          apiHost,
        PWRC_API_PORT:
          String(apiPort),
      },
    );

  try {
    await waitForHttp(
      `${apiUrl}/api/v1/health`,
      api,
      "api",
    );
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : String(error),
    );
    await shutdown(
      "api-start-failed",
      1,
    );
    return;
  }

  const clientUrl =
    `http://${clientHost}:${clientPort}`;

  const client =
    startChild(
      "client",
      "apps/client/server.mjs",
      {
        PWRC_CLIENT_HOST:
          clientHost,
        PWRC_CLIENT_PORT:
          String(clientPort),
        PWRC_CLIENT_API_URL:
          apiUrl,
      },
    );

  try {
    await waitForHttp(
      `${clientUrl}/`,
      client,
      "client",
    );
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : String(error),
    );
    await shutdown(
      "client-start-failed",
      1,
    );
    return;
  }

  console.log(
    JSON.stringify(
      {
        ok:
          true,
        version:
          "1.0.0",
        fullstack:
          "started",
        autoPorts,
        api: {
          host:
            apiHost,
          port:
            apiPort,
          url:
            apiUrl,
        },
        client: {
          host:
            clientHost,
          port:
            clientPort,
          url:
            clientUrl,
          apiTarget:
            apiUrl,
        },
      },
      null,
      2,
    ),
  );
}

process.on(
  "SIGINT",
  () => {
    void shutdown(
      "SIGINT",
      0,
    );
  },
);

process.on(
  "SIGTERM",
  () => {
    void shutdown(
      "SIGTERM",
      0,
    );
  },
);

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "PWRC_FULLSTACK_UNCAUGHT_EXCEPTION",
      error,
    );
    void shutdown(
      "uncaught-exception",
      1,
    );
  },
);

process.on(
  "unhandledRejection",
  (error) => {
    console.error(
      "PWRC_FULLSTACK_UNHANDLED_REJECTION",
      error,
    );
    void shutdown(
      "unhandled-rejection",
      1,
    );
  },
);

try {
  await main();
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : String(error),
  );

  await shutdown(
    "startup-failed",
    1,
  );
}
