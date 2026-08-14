export function installGracefulHttpShutdown(
  server,
  {
    component,
    timeoutMs = 5_000,
  },
) {
  let closing =
    false;

  async function shutdown(
    signal,
  ) {
    if (closing) {
      return;
    }

    closing =
      true;

    process.stderr.write(
      `PWRC_HTTP_SHUTDOWN:${component}:${signal}\n`,
    );

    const force =
      setTimeout(
        () => {
          server.closeAllConnections?.();
          process.exitCode =
            process.exitCode ||
            1;
        },
        timeoutMs,
      );

    force.unref();

    try {
      server.closeIdleConnections?.();

      await new Promise(
        (resolve) => {
          server.close(
            () =>
              resolve(),
          );
        },
      );
    } finally {
      clearTimeout(force);
    }
  }

  process.once(
    "SIGINT",
    () => {
      void shutdown(
        "SIGINT",
      );
    },
  );

  process.once(
    "SIGTERM",
    () => {
      void shutdown(
        "SIGTERM",
      );
    },
  );

  return {
    shutdown,
  };
}
