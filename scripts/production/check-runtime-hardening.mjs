import fs from "node:fs";

const failures = [];

const env = fs.readFileSync(
  "packages/protocol/src/common/env.ts",
  "utf8",
);
const retry = fs.readFileSync(
  "packages/protocol/src/common/retry.ts",
  "utf8",
);
const write = fs.readFileSync(
  "packages/protocol/src/handlers/write-handler.ts",
  "utf8",
);
const operation = fs.readFileSync(
  "packages/protocol/src/handlers/operation-handler.ts",
  "utf8",
);
const runtime = fs.readFileSync(
  "packages/protocol/src/config/runtime.ts",
  "utf8",
);
const clean = fs.readFileSync(
  "scripts/maintenance/clean-cache.mjs",
  "utf8",
);

for (const helper of [
  "readBooleanEnv",
  "readIntegerEnv",
  "readEnumEnv",
]) {
  if (!env.includes(helper)) {
    failures.push(
      `env:${helper}`,
    );
  }
}

for (const invariant of [
  "MAX_READ_RETRY_ATTEMPTS",
  "MAX_READ_RETRY_DELAY_MS",
  "Number.isSafeInteger",
]) {
  if (!retry.includes(invariant)) {
    failures.push(
      `retry:${invariant}`,
    );
  }
}

if (
  !write.includes(
    "recoverFinalizedResult",
  )
) {
  failures.push(
    "write:recovery-hook",
  );
}

if (
  !operation.includes(
    "REQUEST_ID_PATTERN",
  )
) {
  failures.push(
    "operation:request-id-pattern",
  );
}

for (const invariant of [
  "PWRC_RUNTIME_RETRY_DELAY_INVALID",
  "PWRC_RUNTIME_CONFIRMATION_TIMEOUT_TOO_SMALL",
]) {
  if (!runtime.includes(invariant)) {
    failures.push(
      `runtime:${invariant}`,
    );
  }
}

if (
  !clean.includes(
    "workspaceRoots",
  ) ||
  clean.includes(
    'fs.rmSync("node_modules"'
  )
) {
  failures.push(
    "cache:scope",
  );
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  hardening: [
    "typed env parsing",
    "bounded read retries",
    "finalized-write recovery",
    "strict request IDs",
    "runtime policy relationships",
    "workspace cache cleanup",
  ],
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
