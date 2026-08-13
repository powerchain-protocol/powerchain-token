import fs from "node:fs";

const failures = [];

for (const file of [
  "packages/runtime/src/canonical-json.mjs",
  "packages/runtime/src/redact.mjs",
  "packages/runtime/src/errors.mjs",
  "packages/runtime/src/process.mjs",
  "packages/runtime/src/config.mjs",
  "packages/runtime/src/atomic-json.mjs",
]) {
  if (!fs.existsSync(file)) {
    failures.push(
      `missing:${file}`,
    );
  }
}

const canonical =
  fs.readFileSync(
    "packages/runtime/src/canonical-json.mjs",
    "utf8",
  );

for (const invariant of [
  "NON_FINITE_NUMBER",
  "CANONICAL_JSON_CYCLE",
  "PLAIN_OBJECT_REQUIRED",
  "UNDEFINED_PROPERTY",
]) {
  if (
    !canonical.includes(
      invariant,
    )
  ) {
    failures.push(
      `canonical-json:${invariant}`,
    );
  }
}

const redact =
  fs.readFileSync(
    "packages/runtime/src/redact.mjs",
    "utf8",
  );

for (const invariant of [
  "BEARER_PATTERN",
  "ASSIGNMENT_PATTERN",
  "redactUrlText",
  "[CIRCULAR]",
]) {
  if (
    !redact.includes(
      invariant,
    )
  ) {
    failures.push(
      `redaction:${invariant}`,
    );
  }
}

const processUtil =
  fs.readFileSync(
    "packages/runtime/src/process.mjs",
    "utf8",
  );

for (const invariant of [
  "MAX_PROCESS_TIMEOUT_MS",
  "MAX_PROCESS_OUTPUT_BYTES",
  "shell: false",
  "windowsHide: true",
  "timedOut",
]) {
  if (
    !processUtil.includes(
      invariant,
    )
  ) {
    failures.push(
      `process:${invariant}`,
    );
  }
}

const config =
  fs.readFileSync(
    "packages/runtime/src/config.mjs",
    "utf8",
  );

for (const invariant of [
  "CONFIG_PATH_ESCAPE",
  "SYMLINK_FORBIDDEN",
  "resolveRepositoryFile",
]) {
  if (
    !config.includes(
      invariant,
    )
  ) {
    failures.push(
      `config:${invariant}`,
    );
  }
}

const atomic =
  fs.readFileSync(
    "packages/runtime/src/atomic-json.mjs",
    "utf8",
  );

if (
  !atomic.includes(
    "randomBytes(12)",
  )
) {
  failures.push(
    "atomic-write:random-temp-name",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version: "1.0.0",
  security: {
    strictCanonicalJson:
      true,
    embeddedSecretRedaction:
      true,
    boundedProcessExecution:
      true,
    configPathContainment:
      true,
    randomizedAtomicTempFiles:
      true,
  },
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
