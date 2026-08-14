import fs from "node:fs";

const failures = [];

for (const file of [
  "apps/shared/graceful-http.mjs",
  "apps/api/server.mjs",
  "apps/client/server.mjs",
  "apps/docs/server.mjs",
  "scripts/fullstack/start.mjs",
]) {
  if (!fs.existsSync(file)) {
    failures.push(
      `shutdown:missing:${file}`,
    );
  }
}

const helper =
  fs.readFileSync(
    "apps/shared/graceful-http.mjs",
    "utf8",
  );
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
const docs =
  fs.readFileSync(
    "apps/docs/server.mjs",
    "utf8",
  );

for (const invariant of [
  "server.close(",
  "closeIdleConnections",
  "closeAllConnections",
  "SIGTERM",
  "SIGINT",
]) {
  if (!helper.includes(invariant)) {
    failures.push(
      `shutdown:helper:${invariant}`,
    );
  }
}

if (
  !api.includes(
    "installGracefulHttpShutdown",
  )
) {
  failures.push(
    "shutdown:api",
  );
}

if (
  !client.includes(
    "installGracefulHttpShutdown",
  )
) {
  failures.push(
    "shutdown:client",
  );
}

if (
  !docs.includes(
    "installGracefulHttpShutdown",
  )
) {
  failures.push(
    "shutdown:docs",
  );
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
