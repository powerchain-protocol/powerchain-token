import fs from "node:fs";

const failures = [];

const example =
  fs.readFileSync(
    ".env.example",
    "utf8",
  );

for (const required of [
  "PWRC_CANONICAL_MINT=PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
  "PWRC_TOKEN_PROGRAM_ID_DEVNET=PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu",
  "PWRC_LOCK_PROGRAM_ID_MAINNET=",
  "PWRC_TOKEN_PROGRAM_ID_MAINNET=",
  "SUI_NETWORK=devnet",
  "SUI_RPC_URL_SECONDARY=",
  "WPWRC_SUI_PACKAGE_ID=",
  "WPWRC_SUI_BRIDGE_CONTROLLER_ID=",
  "PWRC_SERVICE_FEE_ENABLED=false",
  "PWRC_BRIDGE_EXECUTION_ENABLED=false",
]) {
  if (!example.includes(required)) {
    failures.push(
      `env-example:${required}`,
    );
  }
}

const production =
  fs.readFileSync(
    ".env.production",
    "utf8",
  );

for (const required of [
  "PWRC_CLUSTER=mainnet-beta",
  "SUI_NETWORK=mainnet",
  "PWRC_SERVICE_FEE_ENABLED=false",
  "PWRC_BRIDGE_EXECUTION_ENABLED=false",
  "PWRC_MAINNET_ENABLED=false",
  "WPWRC_MAINNET_ENABLED=false",
]) {
  if (!production.includes(required)) {
    failures.push(
      `env-production:${required}`,
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
