import fs from "node:fs";
import path from "node:path";

const apply =
  process.argv.includes(
    "--apply",
  );

const candidates = [
  "src",
  "utils",
];

const backupRoot =
  ".powerchain-migration-backup";

const results = [];

if (
  apply &&
  !fs.existsSync(
    backupRoot,
  )
) {
  fs.mkdirSync(
    backupRoot,
    {
      recursive:
        true,
    },
  );
}

for (const directory of candidates) {
  const exists =
    fs.existsSync(
      directory,
    ) &&
    fs.statSync(
      directory,
    ).isDirectory();

  let files = [];

  if (exists) {
    const stack = [
      directory,
    ];

    while (stack.length) {
      const current =
        stack.pop();

      for (
        const entry of
        fs.readdirSync(
          current,
          {
            withFileTypes:
              true,
          },
        )
      ) {
        const item =
          path.join(
            current,
            entry.name,
          );

        if (entry.isDirectory()) {
          stack.push(item);
        } else {
          files.push(
            path.relative(
              process.cwd(),
              item,
            ),
          );
        }
      }
    }
  }

  let backupPath =
    null;

  if (
    apply &&
    exists
  ) {
    backupPath =
      path.join(
        backupRoot,
        directory,
      );

    if (
      fs.existsSync(
        backupPath,
      )
    ) {
      fs.rmSync(
        backupPath,
        {
          recursive:
            true,
          force:
            true,
        },
      );
    }

    fs.renameSync(
      directory,
      backupPath,
    );
  }

  results.push({
    directory,
    exists,
    files,
    action:
      apply &&
      exists
        ? "moved-to-backup"
        : exists
          ? "would-move-to-backup"
          : "none",
    backupPath,
  });
}

const remaining =
  candidates.filter(
    (directory) =>
      fs.existsSync(
        directory,
      ),
  );

console.log(
  JSON.stringify(
    {
      ok:
        !apply ||
        remaining.length ===
          0,
      version:
        "1.0.0",
      mode:
        apply
          ? "apply"
          : "dry-run",
      nonDestructive:
        true,
      backupRoot,
      results,
      remaining,
    },
    null,
    2,
  ),
);

if (
  apply &&
  remaining.length
) {
  process.exit(1);
}
