import fs from "node:fs";

const failures = [];

const proxy =
  fs.readFileSync(
    "apps/api/proxy.ts",
    "utf8",
  );
const cdp =
  fs.readFileSync(
    "packages/cdp-user-wallet/src/index.ts",
    "utf8",
  );
const root =
  JSON.parse(
    fs.readFileSync(
      "package.json",
      "utf8",
    ),
  );

for (const forbidden of [
  "env.POWERCHAIN_CDP_PROJECT_ID",
  "env.POWERCHAIN_CDP_USER_WALLET_ENABLED",
  "env.POWERCHAIN_CDP_APP_NAME",
]) {
  if (
    cdp.includes(
      forbidden,
    )
  ) {
    failures.push(
      `env-index-signature:${forbidden}`,
    );
  }
}

for (const required of [
  'env["POWERCHAIN_CDP_PROJECT_ID"]',
  'env["POWERCHAIN_CDP_USER_WALLET_ENABLED"]',
  'env["POWERCHAIN_CDP_APP_NAME"]',
]) {
  if (
    !cdp.includes(
      required,
    )
  ) {
    failures.push(
      `env-bracket-access:${required}`,
    );
  }
}

for (const [
  dependency,
  version,
] of Object.entries({
  "@coral-xyz/anchor":
    "0.32.1",
  "axios":
    "1.19.0",
  "dotenv":
    "17.4.2",
  "ws":
    "8.21.1",
})) {
  if (
    root.dependencies?.[
      dependency
    ] !== version
  ) {
    failures.push(
      `runtime-dependency:${dependency}`,
    );
  }
}

if (
  root.devDependencies?.[
    "@types/ws"
  ] !== "8.18.1"
) {
  failures.push(
    "runtime-dependency:@types/ws",
  );
}

for (const invariant of [
  "POWERCHAIN_PROXY_TARGET_NOT_ALLOWED",
  "POWERCHAIN_WS_PROXY_TARGET_NOT_ALLOWED",
  "POWERCHAIN_PROXY_DISABLED",
  "POWERCHAIN_WS_PROXY_DISABLED",
  '"https:"',
  '"wss:"',
  "maxRedirects:",
  "handshakeTimeout:",
  "perMessageDeflate:",
]) {
  if (
    !proxy.includes(
      invariant,
    )
  ) {
    failures.push(
      `proxy:${invariant}`,
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
      cdpBracketEnvAccess:
        true,
      proxy:
        "apps/api/proxy.ts",
      fs:
        "node-builtin",
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
