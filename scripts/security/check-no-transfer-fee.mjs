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
const transfer = fs.readFileSync(
  "packages/native-token-client/src/solana/transfer.ts",
  "utf8",
);
const mint = fs.readFileSync(
  "packages/native-token-client/src/solana/mint.ts",
  "utf8",
);

if (token.transferFee?.enabled !== false) {
  failures.push("token:transferFee");
}
if (token.transferFee?.basisPoints !== 0) {
  failures.push("token:transferFeeBps");
}
if (
  !profile.forbiddenExtensions.includes(
    "TransferFeeConfig",
  )
) {
  failures.push(
    "profile:TransferFeeConfig",
  );
}
if (fees.protocolFee?.enabled !== false) {
  failures.push("fees:protocol");
}
if (
  fees.token2022TransferFeeExtension
    ?.status !== "disabled"
) {
  failures.push("fees:token2022");
}
if (
  transfer.includes(
    "createTransferCheckedWithFeeInstruction",
  )
) {
  failures.push(
    "client:fee-transfer-instruction",
  );
}
if (
  !transfer.includes(
    "createTransferCheckedInstruction",
  )
) {
  failures.push(
    "client:checked-transfer-missing",
  );
}
if (
  !mint.includes(
    "PWRC_TRANSFER_FEE_CONFIG_MUST_BE_ABSENT",
  )
) {
  failures.push(
    "mint:fee-extension-rejection",
  );
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  canonicalTransferFeeBps: 0,
  transferFeeConfigAllowed: false,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
