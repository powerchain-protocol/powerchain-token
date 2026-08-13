import fs from "node:fs";

const failures = [];

const start =
  fs.readFileSync(
    "scripts/fullstack/start.mjs",
    "utf8",
  );

for (const invariant of [
  "PWRC_FULLSTACK_PORT_IN_USE",
  "--auto-ports",
  "PWRC_FULLSTACK_PORT_FALLBACK",
  "/api/v1/health",
  "api-start-failed",
  "client-start-failed",
  "apps/client/server.mjs",
  "PWRC_CLIENT_API_URL",
]) {
  if (!start.includes(invariant)) {
    failures.push(
      `supervisor:${invariant}`,
    );
  }
}

const api =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );

const client =
  fs.readFileSync(
    "apps/client/server.mjs",
    "utf8",
  );

for (const [name, source] of [
  ["api", api],
  ["client", client],
]) {
  if (
    !source.includes(
      `PWRC_SERVER_LISTEN_ERROR:${name}:EADDRINUSE`,
    )
  ) {
    failures.push(
      `${name}:listen-error-handler`,
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
