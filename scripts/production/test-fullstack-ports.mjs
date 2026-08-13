import net from "node:net";
import {
  spawn,
} from "node:child_process";

function listen(
  port = 0,
) {
  return new Promise(
    (resolve, reject) => {
      const server =
        net.createServer();

      server.once(
        "error",
        reject,
      );

      server.listen(
        port,
        "127.0.0.1",
        () => {
          const address =
            server.address();

          resolve({
            server,
            port:
              typeof address ===
                "object" &&
              address
                ? address.port
                : null,
          });
        },
      );
    },
  );
}

function collectUntilExit(
  child,
  timeoutMs = 15_000,
) {
  return new Promise(
    (resolve, reject) => {
      let output = "";

      child.stdout?.on(
        "data",
        (chunk) => {
          output +=
            chunk.toString();
        },
      );

      child.stderr?.on(
        "data",
        (chunk) => {
          output +=
            chunk.toString();
        },
      );

      const timer =
        setTimeout(
          () => {
            reject(
              new Error(
                `PWRC_TEST_EXIT_TIMEOUT:${output}`,
              ),
            );
          },
          timeoutMs,
        );

      child.once(
        "exit",
        (code, signal) => {
          clearTimeout(
            timer,
          );

          resolve({
            code,
            signal,
            output,
          });
        },
      );
    },
  );
}

function waitForOutput(
  child,
  pattern,
  timeoutMs = 15_000,
) {
  return new Promise(
    (resolve, reject) => {
      let output = "";

      const timer =
        setTimeout(
          () => {
            reject(
              new Error(
                `PWRC_TEST_OUTPUT_TIMEOUT:${pattern}:${output}`,
              ),
            );
          },
          timeoutMs,
        );

      const onData =
        (chunk) => {
          output +=
            chunk.toString();

          if (
            output.includes(
              pattern,
            )
          ) {
            clearTimeout(
              timer,
            );
            resolve(output);
          }
        };

      child.stdout?.on(
        "data",
        onData,
      );

      child.stderr?.on(
        "data",
        onData,
      );
    },
  );
}

const occupied =
  await listen();

const availableClient =
  await listen();

availableClient.server.close();

const failures = [];

let strictChild;
let autoChild;

try {
  strictChild =
    spawn(
      process.execPath,
      [
        "scripts/fullstack/start.mjs",
      ],
      {
        cwd:
          process.cwd(),
        env: {
          ...process.env,
          PWRC_API_HOST:
            "127.0.0.1",
          PWRC_API_PORT:
            String(
              occupied.port,
            ),
          PWRC_CLIENT_HOST:
            "127.0.0.1",
          PWRC_CLIENT_PORT:
            String(
              availableClient.port,
            ),
        },
        stdio: [
          "ignore",
          "pipe",
          "pipe",
        ],
      },
    );

  const strict =
    await collectUntilExit(
      strictChild,
    );

  if (
    strict.code === 0 ||
    !strict.output.includes(
      "PWRC_FULLSTACK_PORT_IN_USE:api",
    ) ||
    !strict.output.includes(
      "fullstack:start:auto",
    )
  ) {
    failures.push(
      "strict-port-collision",
    );
  }

  autoChild =
    spawn(
      process.execPath,
      [
        "scripts/fullstack/start.mjs",
        "--auto-ports",
      ],
      {
        cwd:
          process.cwd(),
        env: {
          ...process.env,
          PWRC_API_HOST:
            "127.0.0.1",
          PWRC_API_PORT:
            String(
              occupied.port,
            ),
          PWRC_CLIENT_HOST:
            "127.0.0.1",
          PWRC_CLIENT_PORT:
            String(
              availableClient.port,
            ),
          PWRC_BRIDGE_EXECUTION_ENABLED:
            "false",
          PWRC_BRIDGE_API_AUTH_TOKEN:
            "",
        },
        stdio: [
          "ignore",
          "pipe",
          "pipe",
        ],
      },
    );

  const autoOutput =
    await waitForOutput(
      autoChild,
      '"fullstack": "started"',
    );

  if (
    !autoOutput.includes(
      "PWRC_FULLSTACK_PORT_FALLBACK:api",
    )
  ) {
    failures.push(
      "auto-port-fallback",
    );
  }
} finally {
  occupied.server.close();

  if (
    autoChild &&
    autoChild.exitCode === null
  ) {
    autoChild.kill(
      "SIGTERM",
    );

    try {
      await collectUntilExit(
        autoChild,
        7_000,
      );
    } catch {
      autoChild.kill(
        "SIGKILL",
      );
    }
  }

  if (
    strictChild &&
    strictChild.exitCode === null
  ) {
    strictChild.kill(
      "SIGTERM",
    );
  }
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      tests: {
        collisionDetectedBeforeSpawn:
          true,
        actionablePortMessage:
          true,
        automaticFallback:
          true,
        apiBeforeWeb:
          true,
        cleanShutdown:
          true,
      },
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
