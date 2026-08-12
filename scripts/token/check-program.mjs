import fs from "node:fs";

const failures = [];
const lib = fs.readFileSync(
  "programs/token/src/lib.rs",
  "utf8",
);
const constants = fs.readFileSync(
  "programs/token/src/constants.rs",
  "utf8",
);
const invariants = fs.readFileSync(
  "programs/token/src/invariants.rs",
  "utf8",
);

for (const token of [
  "verify_canonical_mint",
  "CanonicalMintVerified",
]) {
  if (!lib.includes(token)) failures.push(`lib:${token}`);
}

for (const token of [
  "PWRC_DECIMALS: u8 = 9",
  "18_446_000_000_000_000_000",
  "PWRC_TRANSFER_FEE_BASIS_POINTS: u16",
  "1000000000000000",
]) {
  if (!constants.includes(token)) failures.push(`constants:${token}`);
}

for (const token of [
  "ExtensionType::TransferFeeConfig",
  "ExtensionType::MetadataPointer",
  "ExtensionType::TokenMetadata",
  "TransferFeeBasisPointsMismatch",
  "MaximumTransferFeeMismatch",
  "mint.base.mint_authority.is_none()",
  "mint.base.freeze_authority.is_none()",
  "PWRC_CANONICAL_MINT_BYTES",
]) {
  if (!invariants.includes(token)) failures.push(`invariants:${token}`);
}

if (lib.includes("pub fn mint") || lib.includes("mint_to")) {
  failures.push("token-program:public-mint-surface-forbidden");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  program: "pwrc-token",
  canonicalMint: "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
  canonicalSupplyBaseUnits: "18446000000000000000",
  decimals: 9,
  transferFeeBasisPoints: 250,
  maximumTransferFeeTokens: "1000000",
  failures,
}, null, 2));

if (failures.length) process.exit(1);
