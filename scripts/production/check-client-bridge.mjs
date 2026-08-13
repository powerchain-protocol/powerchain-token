import fs from "node:fs";

const failures = [];
const wpwrc = fs.readFileSync(
  "packages/sdk/src/sui/wpwrc.ts",
  "utf8",
);
const burn = fs.readFileSync(
  "packages/sdk/src/sui/burn-intent.ts",
  "utf8",
);
const quarterly = fs.readFileSync(
  "packages/sdk/src/sui/quarterly-burn.ts",
  "utf8",
);

for (const required of [
  "::bridge::mint_from_bridge",
  "::bridge::burn_for_solana",
  "WPWRC_DECIMALS = 9",
  "PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT = 1n",
]) {
  if (!wpwrc.includes(required)) {
    failures.push(`wpwrc:${required}`);
  }
}

if (wpwrc.includes("destinationChain")) {
  failures.push(
    "wpwrc:stale-generic-destination-chain",
  );
}
if (
  wpwrc.includes(
    "::wpwrc::mint_from_bridge",
  ) ||
  wpwrc.includes(
    "::wpwrc::burn_for_bridge",
  )
) {
  failures.push("wpwrc:stale-module-target");
}

for (const required of [
  "::bridge::set_paused",
  "::bridge::stage_canonical_burn_intent",
  "::bridge::cancel_canonical_burn_intent",
]) {
  if (!burn.includes(required)) {
    failures.push(`burn-intent:${required}`);
  }
}

if (
  !quarterly.includes(
    "::bridge::lower_canonical_supply_ceiling",
  )
) {
  failures.push("quarterly-burn:module-target");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  failures,
}, null, 2));
if (failures.length) process.exit(1);
