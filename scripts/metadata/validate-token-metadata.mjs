import fs from "node:fs";

const failures = [];
const canonical = JSON.parse(
  fs.readFileSync(
    "metadata/metaplex.json",
    "utf8",
  ),
);

if (canonical.name !== "PowerChain") failures.push("metaplex:name");
if (canonical.symbol !== "PWRC") failures.push("metaplex:symbol");
if (canonical.uri !== "https://powerchain.energy/metadata/metaplex.json") failures.push("metaplex:uri");
if (canonical.decimals !== 9) failures.push("metaplex:decimals");
if (canonical.mint !== "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc") failures.push("metaplex:mint");
if (canonical.tokenProgramId !== "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb") failures.push("metaplex:token-program");
if (canonical.transferFeeBasisPoints !== 250) failures.push("metaplex:fee-bps");
if (canonical.maximumTransferFeeTokens !== "1000000") failures.push("metaplex:max-fee");

for (const extension of [
  "TransferFeeConfig",
  "MetadataPointer",
  "TokenMetadata",
]) {
  if (!canonical.extensions.includes(extension)) {
    failures.push(`metaplex:extension:${extension}`);
  }
}

for (const file of [
  "metadata/metadata.json",
  "metadata/metaplex.metadata.json",
  "metadata/token2022.metadata.json",
]) {
  const data = JSON.parse(
    fs.readFileSync(file, "utf8"),
  );
  if (data.name !== "PowerChain") failures.push(`${file}:name`);
  if (data.symbol !== "PWRC") failures.push(`${file}:symbol`);
  if (data.properties?.decimals !== 9) failures.push(`${file}:decimals`);
  if (data.properties?.mint !== "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc") failures.push(`${file}:mint`);
  if (data.properties?.transfer_fee?.basis_points !== 250) failures.push(`${file}:fee`);
}

const wrapped = JSON.parse(
  fs.readFileSync(
    "metadata/wpwrc.metadata.json",
    "utf8",
  ),
);
if (wrapped.symbol !== "wPWRC") failures.push("wpwrc:symbol");
if (wrapped.properties?.decimals !== 9) failures.push("wpwrc:decimals");
if (wrapped.properties?.canonical_mint !== "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc") failures.push("wpwrc:canonical-mint");
if (wrapped.properties?.canonical_transfer_fee_basis_points !== 250) failures.push("wpwrc:fee");

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  canonical: {
    asset: "PWRC",
    mint: "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
    chain: "solana",
    decimals: 9,
    transferFeeBasisPoints: 250,
    maximumTransferFeeTokens: "1000000",
  },
  wrapped: {
    asset: "wPWRC",
    chain: "sui",
    decimals: 9,
    backing: "1:1 net locked PWRC",
  },
  failures,
}, null, 2));

if (failures.length) process.exit(1);
