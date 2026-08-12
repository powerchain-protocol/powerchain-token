import fs from "node:fs";

const failures = [];
const lock = fs.readFileSync(
  "programs/pwrc-lock/src/lib.rs",
  "utf8",
);
const token = fs.readFileSync(
  "programs/token/src/invariants.rs",
  "utf8",
);
const move = fs.readFileSync(
  "contracts/wpwrc/sources/wpwrc.move",
  "utf8",
);
const bridge = fs.readFileSync(
  "contracts/wpwrc/sources/bridge.move",
  "utf8",
);

for (const value of [
  "PWRC_DECIMALS: u8 = 9",
  "WPWRC_DECIMALS: u8 = 9",
  "PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT: u64 = 1",
  "PWRC_TRANSFER_FEE_BASIS_POINTS: u16 = 250",
  "MintAuthorityMustBeRevoked",
  "FreezeAuthorityMustBeNull",
]) {
  if (!lock.includes(value)) {
    failures.push(`pwrc-lock:${value}`);
  }
}

for (const value of [
  "ExtensionType::TransferFeeConfig",
  "ExtensionType::MetadataPointer",
  "ExtensionType::TokenMetadata",
  "PWRC_CANONICAL_MINT_BYTES",
]) {
  if (!token.includes(value)) {
    failures.push(`pwrc-token:${value}`);
  }
}

for (const value of [
  "treasury_cap: TreasuryCap<WPWRC>",
  "consumed_mint_messages",
  "consumed_burn_references",
]) {
  if (!move.includes(value)) {
    failures.push(`wpwrc:${value}`);
  }
}

for (const value of [
  "mint_from_bridge",
  "burn_for_solana",
]) {
  if (!bridge.includes(value)) {
    failures.push(`bridge:${value}`);
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  programs: {
    pwrcLock: "active-fee-aware",
    pwrcToken: "active-verifier",
    pwrcFees: "deprecated-disabled",
    wpwrcSui:
      "bridge-capability-encapsulated",
  },
  failures,
}, null, 2));

if (failures.length) process.exit(1);
