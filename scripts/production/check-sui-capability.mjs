import fs from "node:fs";

const failures = [];
const wpwrc = fs.readFileSync(
  "contracts/wpwrc/sources/wpwrc.move",
  "utf8",
);
const bridge = fs.readFileSync(
  "contracts/wpwrc/sources/bridge.move",
  "utf8",
);
const moveToml = fs.readFileSync(
  "contracts/wpwrc/Move.toml",
  "utf8",
);

for (const required of [
  "treasury_cap: TreasuryCap<WPWRC>",
  "transfer::share_object(BridgeController",
  "consumed_mint_messages",
  "consumed_burn_references",
  "coin::burn(",
  "MAX_SUPPLY_BASE_UNITS - current_supply",
]) {
  if (!wpwrc.includes(required)) {
    failures.push(`wpwrc:${required}`);
  }
}


if (!/edition\s*=\s*"2024"/.test(moveToml)) {
  failures.push("Move.toml:edition-2024");
}
if (/^Sui\s*=/m.test(moveToml)) {
  failures.push("Move.toml:explicit-Sui-dependency");
}
if (!wpwrc.includes("currency.finalize(ctx)")) {
  failures.push("wpwrc:coin-registry-finalize");
}
if (!wpwrc.includes("public_transfer(metadata_cap, sender)")) {
  failures.push("wpwrc:metadata-cap-custody");
}

if (/public_transfer\s*\(\s*treasury_cap/.test(wpwrc)) {
  failures.push(
    "TreasuryCap must remain encapsulated in BridgeController",
  );
}

for (const required of [
  "mint_from_bridge",
  "burn_for_solana",
]) {
  if (!bridge.includes(required)) {
    failures.push(`bridge:${required}`);
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  treasuryCapEncapsulated:
    failures.length === 0,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
