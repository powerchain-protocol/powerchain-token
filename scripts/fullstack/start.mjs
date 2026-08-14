import {
  spawn,
} from "node:child_process";
import net from "node:net";

const strict =
  process.argv.includes(
    "--strict-ports",
  );

const host =
  "127.0.0.1";

async function portFree(
  port,
) {
  return await new Promise(
    (resolve) => {
      const socket =
        net.createServer();

      socket.once(
        "error",
        () =>
          resolve(false),
      );

      socket.listen(
        port,
        host,
        () =>
          socket.close(
            () =>
              resolve(true),
          ),
      );
    },
  );
}

async function choosePort(
  preferred,
) {
  if (
    await portFree(
      preferred,
    )
  ) {
    return preferred;
  }

  if (strict) {
    throw new Error(
      `PWRC_FULLSTACK_PORT_IN_USE:${preferred}`,
    );
  }

  for (
    let port =
      preferred + 1;
    port <
      preferred + 200;
    port += 1
  ) {
    if (
      await portFree(
        port,
      )
    ) {
      return port;
    }
  }

  throw new Error(
    "PWRC_FULLSTACK_NO_FREE_PORT",
  );
}

async function waitForHttp(
  url,
  timeoutMs,
) {
  const deadline =
    Date.now() +
    timeoutMs;

  let lastError;

  while (
    Date.now() <
    deadline
  ) {
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

      lastError =
        new Error(
          `HTTP_${response.status}`,
        );
    } catch (error) {
      lastError = error;
    }

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          100,
        ),
    );
  }

  throw new Error(
    `PWRC_FULLSTACK_HEALTH_TIMEOUT:${url}:${lastError instanceof Error ? lastError.message : "unknown"}`,
  );
}

const apiPort =
  await choosePort(
    Number(
      process.env[
        "PWRC_API_PORT"
      ] ??
        8787,
    ),
  );

const clientPort =
  await choosePort(
    Number(
      process.env[
        "PWRC_CLIENT_PORT"
      ] ??
        3000,
    ),
  );

const children =
  [];
let shuttingDown =
  false;

function spawnNode(
  script,
  env,
) {
  const child =
    spawn(
      process.execPath,
      [
        script,
      ],
      {
        stdio:
          "inherit",
        env: {
          ...process.env,
          ...env,
        },
      },
    );

  children.push(
    child,
  );

  return child;
}

const api =
  spawnNode(
    "apps/api/server.mjs",
    {
      PWRC_API_PORT:
        String(apiPort),
    },
  );

api.once(
  "exit",
  (code) => {
    if (
      code !== null &&
      code !== 0
    ) {
      process.stderr.write(
        `PWRC_FULLSTACK_CHILD_EXIT:api:${code}\n`,
      );
    }
  },
);

try {
  await waitForHttp(
    `http://${host}:${apiPort}/api/v1/health`,
    8_000,
  );
} catch (error) {
  api.kill(
    "SIGTERM",
  );
  throw error;
}

const client =
  spawnNode(
    "apps/client/server.mjs",
    {
      PWRC_CLIENT_PORT:
        String(clientPort),
      PWRC_CLIENT_API_URL:
        `http://${host}:${apiPort}`,
    },
  );

try {
  await waitForHttp(
    `http://${host}:${clientPort}/`,
    8_000,
  );
} catch (error) {
  for (const child of children) {
    child.kill(
      "SIGTERM",
    );
  }
  throw error;
}

process.stderr.write(
  `PWRC_FULLSTACK_READY:api=http://${host}:${apiPort}:client=http://${host}:${clientPort}\n`,
);

for (const [name, child] of [
  ["api", api],
  ["client", client],
]) {
  child.on(
    "exit",
    (code, signal) => {
      if (
        !shuttingDown &&
        (code !== 0 || signal)
      ) {
        process.stderr.write(
          `PWRC_FULLSTACK_CHILD_EXIT:${name}:code=${code}:signal=${signal}\n`,
        );
        shutdown(
          `child-exit:${name}`,
        );
      }
    },
  );
}

function shutdown(
  signal,
) {
  if (shuttingDown) return;
  shuttingDown = true;

  process.stderr.write(
    `PWRC_FULLSTACK_SHUTDOWN:${signal}\n`,
  );

  for (const child of children) {
    if (
      child.exitCode ===
        null
    ) {
      child.kill(
        "SIGTERM",
      );
    }
  }

  setTimeout(
    () => {
      for (const child of children) {
        if (
          child.exitCode ===
            null
        ) {
          child.kill(
            "SIGKILL",
          );
        }
      }
      process.exit(0);
    },
    5_000,
  ).unref();
}

process.on(
  "SIGINT",
  () =>
    shutdown("SIGINT"),
);
process.on(
  "SIGTERM",
  () =>
    shutdown("SIGTERM"),
);
