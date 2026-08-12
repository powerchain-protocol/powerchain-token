import {
  Connection,
  PublicKey,
} from "@solana/web3.js";
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  getExtensionTypes,
  getMint,
  getTransferFeeConfig,
} from "@solana/spl-token";

const mintAddress = process.argv[2];
const rpcUrl = process.argv[3];
const expectedStatus = process.argv[4] ?? "genesis";

if (!mintAddress) throw new Error("PWRC_MINT_REQUIRED");
if (!rpcUrl) throw new Error("PWRC_RPC_URL_REQUIRED");
if (!new URL(rpcUrl).protocol.startsWith("http")) throw new Error("PWRC_RPC_URL_INVALID");

const mintKey = new PublicKey(mintAddress);
const connection = new Connection(rpcUrl, "finalized");
const mint = await getMint(connection, mintKey, "finalized", TOKEN_2022_PROGRAM_ID);
const transferFee = getTransferFeeConfig(mint);
const extensionTypes = getExtensionTypes(mint.tlvData);
const errors = [];

if (mint.decimals !== 9) errors.push(`DECIMALS:${mint.decimals}`);
if (mint.supply !== 18_446_000_000_000_000_000n) errors.push(`SUPPLY:${mint.supply}`);
if (mint.freezeAuthority !== null) errors.push("FREEZE_AUTHORITY_ACTIVE");
if (expectedStatus === "finalized" && mint.mintAuthority !== null) errors.push("MINT_AUTHORITY_ACTIVE");
if (expectedStatus === "genesis" && mint.mintAuthority === null) errors.push("MINT_AUTHORITY_ALREADY_REVOKED");

for (const required of [
  ExtensionType.TransferFeeConfig,
  ExtensionType.MetadataPointer,
  ExtensionType.TokenMetadata,
]) {
  if (!extensionTypes.includes(required)) errors.push(`EXTENSION_MISSING:${ExtensionType[required]}`);
}

const allowed = new Set([
  ExtensionType.TransferFeeConfig,
  ExtensionType.MetadataPointer,
  ExtensionType.TokenMetadata,
]);
for (const extension of extensionTypes) {
  if (!allowed.has(extension)) errors.push(`EXTENSION_FORBIDDEN:${ExtensionType[extension]}`);
}

if (!transferFee) {
  errors.push("TRANSFER_FEE_CONFIG_MISSING");
} else {
  for (const [name, schedule] of [
    ["older", transferFee.olderTransferFee],
    ["newer", transferFee.newerTransferFee],
  ]) {
    if (schedule.transferFeeBasisPoints !== 250) errors.push(`TRANSFER_FEE_BPS_${name.toUpperCase()}:${schedule.transferFeeBasisPoints}`);
    if (schedule.maximumFee !== 1_000_000_000_000_000n) errors.push(`TRANSFER_FEE_MAX_${name.toUpperCase()}:${schedule.maximumFee}`);
  }
}

const result = {
  version: "1.0.0",
  mint: mintAddress,
  expectedStatus,
  decimals: mint.decimals,
  supplyBaseUnits: mint.supply.toString(),
  mintAuthority: mint.mintAuthority?.toBase58() ?? null,
  freezeAuthority: mint.freezeAuthority?.toBase58() ?? null,
  extensions: extensionTypes.map((value) => ExtensionType[value]),
  transferFeeBasisPoints: transferFee?.newerTransferFee.transferFeeBasisPoints ?? null,
  maximumTransferFeeBaseUnits: transferFee?.newerTransferFee.maximumFee.toString() ?? null,
  transferFeeConfigAuthority: transferFee?.transferFeeConfigAuthority?.toBase58() ?? null,
  withdrawWithheldAuthority: transferFee?.withdrawWithheldAuthority?.toBase58() ?? null,
  verified: errors.length === 0,
  errors,
};

console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(2);
