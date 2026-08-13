import net from "node:net";
import {
  spawnSync,
} from "node:child_process";

export function parsePort(
  value,
  fallback,
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  const parsed =
    Number(value);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < 1 ||
    parsed > 65_535
  ) {
    throw new Error(
      `PWRC_FULLSTACK_PORT_INVALID:${value}`,
    );
  }

  return parsed;
}

export function canListen(
  host,
  port,
) {
  return new Promise(
    (resolve) => {
      const server =
        net.createServer();

      const finish =
        (available) => {
          server.removeAllListeners();
          resolve(available);
        };

      server.once(
        "error",
        () =>
          finish(false),
      );

      server.listen(
        port,
        host,
        () => {
          server.close(
            () =>
              finish(true),
          );
        },
      );
    },
  );
}

export function allocateFreePort(
  host,
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
        0,
        host,
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

              if (
                !Number.isSafeInteger(
                  port,
                )
              ) {
                reject(
                  new Error(
                    "PWRC_FULLSTACK_PORT_ALLOCATION_FAILED",
                  ),
                );
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

export function portOwner(
  host,
  port,
) {
  if (
    process.platform !==
      "darwin" &&
    process.platform !==
      "linux"
  ) {
    return null;
  }

  const result =
    spawnSync(
      "lsof",
      [
        "-nP",
        `-iTCP@${host}:${port}`,
        "-sTCP:LISTEN",
      ],
      {
        encoding:
          "utf8",
        shell:
          false,
        timeout:
          2_000,
      },
    );

  if (
    result.error ||
    (
      result.status !== 0 &&
      result.status !== 1
    )
  ) {
    return null;
  }

  const output =
    result.stdout.trim();

  return output || null;
}
