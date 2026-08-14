import fs from "node:fs";

const failures = [];
const source =
  fs.readFileSync(
    "apps/docs/server.mjs",
    "utf8",
  );

for (const invariant of [
  "PWRC_DOCS_PORT_INVALID",
  '"/health"',
  '"/ready"',
  "installGracefulHttpShutdown",
  "content-security-policy",
  "x-content-type-options",
  "METHOD_NOT_ALLOWED",
  "NOT_FOUND",
]) {
  if (!source.includes(invariant)) {
    failures.push(
      `docs-runtime:${invariant}`,
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
