import fs from "node:fs";

const failures = [];

for (const file of [
  "config/networks.json",
  "config/devnet/bridge.json",
  "config/mainnet/bridge.json",
  "packages/protocol/src/helpers.ts",
  "packages/protocol/src/urls.ts",
  "packages/protocol/src/retry.ts",
  "packages/protocol/src/solana.ts",
  "packages/protocol/src/sui.ts",
  "packages/sdk/src/solana-client.ts",
  "packages/sdk/src/sui-client.ts",
  "packages/sdk/src/bridge-integration.ts",
  "scripts/devnet/deploy-solana.sh",
  "scripts/mainnet/deploy-solana.sh",
  "scripts/mainnet/verify-solana.sh",
  "scripts/sui/publish-devnet.sh",
  "scripts/sui/publish-mainnet.sh",
  "scripts/sui/verify-deployment.mjs",
]) {
  if (!fs.existsSync(file)) {
    failures.push(`missing:${file}`);
  }
}

const programs =
  JSON.parse(
    fs.readFileSync(
      "config/programs.json",
      "utf8",
    ),
  );

if (
  programs.pwrcToken
    ?.sourceProgramId !==
    "PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu"
) {
  failures.push(
    "programs:pwrc-token-source-id",
  );
}

if (
  programs.pwrcToken
    ?.mainnetProgramId !==
    null
) {
  failures.push(
    "programs:mainnet-id-must-remain-evidence-driven",
  );
}

const networks =
  JSON.parse(
    fs.readFileSync(
      "config/networks.json",
      "utf8",
    ),
  );

if (
  networks.solana
    ?.["mainnet-beta"]?.dedicatedRpcRequiredInProduction !==
      true ||
  networks.solana
    ?.["mainnet-beta"]?.independentRpcVerificationRequired !==
      true
) {
  failures.push(
    "networks:solana-mainnet-rpc-policy",
  );
}

if (
  networks.sui
    ?.mainnet?.deploymentEvidenceRequired !==
    true
) {
  failures.push(
    "networks:sui-mainnet-evidence-policy",
  );
}

const solana =
  fs.readFileSync(
    "packages/protocol/src/solana.ts",
    "utf8",
  );

for (const invariant of [
  "PWRC_SECONDARY_RPC_MUST_DIFFER",
  "PWRC_PRODUCTION_DEDICATED_RPC_REQUIRED",
  "PWRC_PRODUCTION_DEDICATED_WS_REQUIRED",
  "PWRC_RESERVED_PROGRAM_ID_FORBIDDEN",
]) {
  if (!solana.includes(invariant)) {
    failures.push(
      `solana:${invariant}`,
    );
  }
}

const sui =
  fs.readFileSync(
    "packages/protocol/src/sui.ts",
    "utf8",
  );

for (const invariant of [
  "PWRC_SUI_PRODUCTION_DEDICATED_RPC_REQUIRED",
  "PWRC_SUI_SECONDARY_RPC_MUST_DIFFER",
  "WPWRC_SUI_PACKAGE_ID",
  "WPWRC_SUI_BRIDGE_CONTROLLER_ID",
]) {
  if (!sui.includes(invariant)) {
    failures.push(
      `sui:${invariant}`,
    );
  }
}

const move =
  fs.readFileSync(
    "contracts/wpwrc/sources/wpwrc.move",
    "utf8",
  );

for (const invariant of [
  "BridgeController",
  "MessageKey",
  "consumed_messages",
  "mint_from_solana",
  "burn_for_solana",
  "WPWRC_MAX_BASE_UNITS",
  "BridgeMinted",
  "BridgeBurned",
]) {
  if (!move.includes(invariant)) {
    failures.push(
      `move:${invariant}`,
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
