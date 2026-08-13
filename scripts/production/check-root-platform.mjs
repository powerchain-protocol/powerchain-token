import fs from "node:fs";

const failures = [];

for (const file of [
  "utils/config.mjs",
  "utils/constants.mjs",
  "utils/env.mjs",
  "utils/errors.mjs",
  "utils/logger.mjs",
  "utils/process.mjs",
  "config/registry.json",
  "scripts/production/check-config-registry.mjs",
  "scripts/production/check-utility-duplication.mjs",
]) {
  if (!fs.existsSync(file)) {
    failures.push(
      `missing:${file}`,
    );
  }
}

const processUtil =
  fs.readFileSync(
    "utils/process.mjs",
    "utf8",
  );

for (const invariant of [
  "shell: false",
  "timeout",
  "maxBuffer",
  "allowFailure",
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

const logger =
  fs.readFileSync(
    "utils/logger.mjs",
    "utf8",
  );

if (
  !logger.includes(
    "redactValue",
  )
) {
  failures.push(
    "logger:redaction",
  );
}

const registry =
  JSON.parse(
    fs.readFileSync(
      "config/registry.json",
      "utf8",
    ),
  );

if (
  registry.version !==
    "1.0.0"
) {
  failures.push(
    "registry:version",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version: "1.0.0",
  platform: {
    configRegistry:
      true,
    safeProcessRunner:
      true,
    structuredRedactedLogger:
      true,
    sharedEnvironmentReader:
      true,
    canonicalConstants:
      true,
  },
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
