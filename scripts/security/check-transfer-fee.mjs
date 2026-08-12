import fs from "node:fs";

const failures = [];
const token = JSON.parse(
  fs.readFileSync("config/token.json", "utf8"),
);
const profile = JSON.parse(
  fs.readFileSync(
    "config/security/token2022-profile.json",
    "utf8",
  ),
);
const fees = JSON.parse(
  fs.readFileSync("config/fees.json", "utf8"),
);
const metadata = JSON.parse(
  fs.readFileSync("metadata/metaplex.json", "utf8"),
);
const transfer = fs.readFileSync(
  "packages/native-token-client/src/solana/transfer.ts",
  "utf8",
);
const mint = fs.readFileSync(
  "packages/native-token-client/src/solana/mint.ts",
  "utf8",
);

if (token.mint !== "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc") failures.push("token:mint");
if (token.transferFee?.enabled !== true) failures.push("token:fee-enabled");
if (token.transferFee?.basisPoints !== 250) failures.push("token:fee-bps");
if (token.transferFee?.maximumFeeBaseUnits !== "1000000000000000") failures.push("token:max-fee");
if (!profile.requiredExtensions.includes("TransferFeeConfig")) failures.push("profile:TransferFeeConfig-required");
if (profile.forbiddenExtensions.includes("TransferFeeConfig")) failures.push("profile:TransferFeeConfig-forbidden");
if (fees.token2022TransferFeeExtension?.status !== "required-enabled") failures.push("fees:token2022-status");
if (metadata.transferFeeBasisPoints !== 250) failures.push("metadata:fee-bps");
if (metadata.maximumTransferFeeTokens !== "1000000") failures.push("metadata:max-fee");
if (!transfer.includes("createTransferCheckedWithFeeInstruction")) failures.push("client:fee-aware-transfer");
if (!mint.includes("PWRC_TRANSFER_FEE_CONFIG_REQUIRED")) failures.push("client:fee-config-required");

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  canonicalMint: "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
  transferFeeBasisPoints: 250,
  percentage: "2.5%",
  maximumTransferFeeTokens: "1000000",
  maximumTransferFeeBaseUnits: "1000000000000000",
  failures,
}, null, 2));

if (failures.length) process.exit(1);
