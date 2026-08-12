import fs from "node:fs";

const failures = [];
const bridge = fs.readFileSync(
  "programs/pwrc-lock/src/lib.rs",
  "utf8",
);
const token = fs.readFileSync(
  "programs/token/src/invariants.rs",
  "utf8",
);

for (const value of [
  "pub const PWRC_DECIMALS: u8 = 9;",
  "pub const WPWRC_DECIMALS: u8 = 9;",
  "pub const PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT: u64 = 1;",
  "PWRC_TRANSFER_FEE_BASIS_POINTS: u16 = 250",
  "calculate_transfer_fee_base_units",
  "TransferFeeConfigRequired",
  "VaultMustStartEmpty",
  "SourceCannotBeVault",
  "DestinationCannotBeVault",
  "RecipientOwnerMismatch",
  "sui_tx_digest",
  "sui_checkpoint",
  "cancel_operator_rotation",
  "cancel_governor_rotation",
]) {
  if (!bridge.includes(value)) {
    failures.push(
      `pwrc-lock:missing:${value}`,
    );
  }
}

for (const value of [
  "ExtensionType::TransferFeeConfig",
  "ExtensionType::MetadataPointer",
  "ExtensionType::TokenMetadata",
  "PWRC_CANONICAL_MINT_BYTES",
  "TransferFeeBasisPointsMismatch",
  "MaximumTransferFeeMismatch",
]) {
  if (!token.includes(value)) {
    failures.push(
      `pwrc-token:missing:${value}`,
    );
  }
}

if (
  bridge.includes(
    "AmountNotRepresentableOnSui",
  )
) {
  failures.push(
    "pwrc-lock:stale-6-decimal-error",
  );
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  activePrograms: [
    "pwrc-lock",
    "pwrc-token",
  ],
  transferFeeBasisPoints: 250,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
