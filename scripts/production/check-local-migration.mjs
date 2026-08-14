import fs from "node:fs";

const failures = [];

for (const file of [
  "scripts/packages/cleanup-stale-root-source.mjs",
  "scripts/packages/workspace-doctor.mjs",
  "packages/protocol/idl/bindings/interface.ts",
]) {
  if (!fs.existsSync(file)) {
    failures.push(
      `migration:missing:${file}`,
    );
  }
}

const shim =
  fs.readFileSync(
    "packages/protocol/idl/bindings/interface.ts",
    "utf8",
  );

if (
  !shim.includes(
    '../../../../idl/bindings/interface.js',
  )
) {
  failures.push(
    "migration:idl-shim-target",
  );
}

const cleanup =
  fs.readFileSync(
    "scripts/packages/cleanup-stale-root-source.mjs",
    "utf8",
  );

for (const invariant of [
  '"--apply"',
  '"src"',
  '"utils"',
  ".powerchain-migration-backup",
  "moved-to-backup",
  "fs.renameSync",
]) {
  if (!cleanup.includes(invariant)) {
    failures.push(
      `migration:cleanup:${invariant}`,
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
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
