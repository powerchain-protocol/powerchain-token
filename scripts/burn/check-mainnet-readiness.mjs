import fs from "node:fs";

const required = [
  "PWRC_CANONICAL_MINT",
  "PWRC_BURN_SOURCE_TOKEN_ACCOUNT",
  "PWRC_BURN_AUTHORITY",
  "PWRC_BURN_AUTHORITY_TYPE",
  "PWRC_SOLANA_RPC_PRIMARY",
  "PWRC_SOLANA_RPC_SECONDARY",
  "WPWRC_SUI_PACKAGE_ID",
  "WPWRC_SUI_BRIDGE_CONTROLLER_ID",
];

const blockers = [];

for (const key of required) {
  if (!process.env[key]) blockers.push(`${key} missing`);
}

if (
  process.env.PWRC_BURN_AUTHORITY_TYPE &&
  !["multisig", "threshold"].includes(
    process.env.PWRC_BURN_AUTHORITY_TYPE.toLowerCase(),
  )
) {
  blockers.push("PWRC_BURN_AUTHORITY_TYPE must be multisig or threshold");
}

if (
  process.env.PWRC_SOLANA_RPC_PRIMARY &&
  process.env.PWRC_SOLANA_RPC_SECONDARY &&
  process.env.PWRC_SOLANA_RPC_PRIMARY === process.env.PWRC_SOLANA_RPC_SECONDARY
) {
  blockers.push("primary and secondary Solana RPC must be independent");
}

const result = {
  version: "1.0.0",
  ready: blockers.length === 0,
  blockers,
};

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync(
  "reports/pwrc-quarterly-burn-mainnet-readiness.json",
  `${JSON.stringify(result, null, 2)}\n`,
);

console.log(JSON.stringify(result, null, 2));
if (!result.ready) process.exitCode = 1;
