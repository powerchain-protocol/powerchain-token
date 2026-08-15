import fs from "node:fs";

const failures = [];
const source =
  fs.readFileSync(
    "apps/client/server.mjs",
    "utf8",
  );
const supervisor =
  fs.readFileSync(
    "scripts/fullstack/start.mjs",
    "utf8",
  );

for (const invariant of [
  '"/health"',
  '"/ready"',
  '"cache-control"',
  '"no-store"',
  "PWRC_CLIENT_STATIC_READ_ERROR",
  "PWRC_CLIENT_STATIC_READ_FAILED",
]) {
  if (!source.includes(invariant)) {
    failures.push(
      `client-runtime:${invariant}`,
    );
  }
}

for (const invariant of [
  "/health",
  "PWRC_FULLSTACK_CLIENT_ROOT_WARNING",
]) {
  if (!supervisor.includes(invariant)) {
    failures.push(
      `client-supervisor:${invariant}`,
    );
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  liveness: "/health",
  readiness: "/ready",
  staticRootDiagnosticOnly: true,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
