import {
  spawn,
} from "node:child_process";

const children =
  new Set();

function start(
  name,
  script,
) {
  const child =
    spawn(
      process.execPath,
      [script],
      {
        cwd:
          process.cwd(),
        env:
          process.env,
        stdio:
          "inherit",
      },
    );

  children.add(child);

  child.on(
    "exit",
    (code, signal) => {
      children.delete(
        child,
      );

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
        shutdown(
          "child-exit",
          1,
        );
      }
    },
  );

  return child;
}

let shuttingDown =
  false;

function shutdown(
  signal,
  exitCode = 0,
) {
  if (shuttingDown) {
    return;
  }

  shuttingDown =
    true;

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
      for (
        const child of
        children
      ) {
        if (
          child.exitCode ===
            null
        ) {
          child.kill(
            "SIGKILL",
          );
        }
      }

      process.exit(
        exitCode,
      );
    },
    5_000,
  ).unref();

  if (
    children.size === 0
  ) {
    process.exit(
      exitCode,
    );
  }
}

start(
  "api",
  "apps/api/server.mjs",
);

start(
  "web",
  "apps/web/server.mjs",
);

process.on(
  "SIGINT",
  () =>
    shutdown(
      "SIGINT",
      0,
    ),
);

process.on(
  "SIGTERM",
  () =>
    shutdown(
      "SIGTERM",
      0,
    ),
);
