import fs from "node:fs";

const failures = [];

const scripts = [
  "scripts/production/check-all.mjs",
  "scripts/production/check-platform-bootstrap.mjs",
  "scripts/packages/check-monorepo-layout.mjs",
  "scripts/telemetry/check-disabled.mjs",
];

for (const file of scripts) {
  if (!fs.existsSync(file)) {
    failures.push(
      `portable:missing:${file}`,
    );
    continue;
  }

  const source =
    fs.readFileSync(
      file,
      "utf8",
    );

  for (const forbidden of [
    "/Users/",
    "/home/runner/",
    "/mnt/data/",
    "process.chdir(",
  ]) {
    if (source.includes(forbidden)) {
      failures.push(
        `portable:absolute-path:${file}:${forbidden}`,
      );
    }
  }
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      checks:
        scripts.length,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
