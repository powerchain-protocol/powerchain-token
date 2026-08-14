import fs from "node:fs";

const failures = [];

const mainnetDeploy =
  fs.readFileSync(
    "scripts/mainnet/deploy-solana.sh",
    "utf8",
  );

for (const invariant of [
  "PWRC_MAINNET_DEPLOY_ENABLED",
  "PWRC_MAINNET_DEPLOY_CONFIRMATION",
  "check-program-keypair.sh",
  "program deploy",
  "--program-id",
]) {
  if (!mainnetDeploy.includes(invariant)) {
    failures.push(
      `mainnet-deploy:${invariant}`,
    );
  }
}

const mainnetVerify =
  fs.readFileSync(
    "scripts/mainnet/verify-solana.sh",
    "utf8",
  );

for (const invariant of [
  "PWRC_RPC_URL_SECONDARY",
  "anchor verify",
  "primary-show",
  "secondary-show",
]) {
  if (!mainnetVerify.includes(invariant)) {
    failures.push(
      `mainnet-verify:${invariant}`,
    );
  }
}

const suiMainnet =
  fs.readFileSync(
    "scripts/sui/publish-mainnet.sh",
    "utf8",
  );

for (const invariant of [
  "WPWRC_MAINNET_ENABLED",
  "WPWRC_MAINNET_CONFIRMATION",
  "assert-active-env.sh",
  "sui move build",
  "sui client publish",
  "--json",
]) {
  if (!suiMainnet.includes(invariant)) {
    failures.push(
      `sui-mainnet:${invariant}`,
    );
  }
}

const fullstack =
  fs.readFileSync(
    "scripts/fullstack/start.mjs",
    "utf8",
  );

for (const invariant of [
  "waitForHttp",
  "/api/v1/health",
  "PWRC_FULLSTACK_CHILD_EXIT",
  "SIGKILL",
]) {
  if (!fullstack.includes(invariant)) {
    failures.push(
      `fullstack:${invariant}`,
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
