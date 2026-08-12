import { readFileSync } from "node:fs";

const token = JSON.parse(
  readFileSync(
    "config/token.json",
    "utf8",
  ),
);

const profile = JSON.parse(
  readFileSync(
    "config/security/token2022-profile.json",
    "utf8",
  ),
);

if (
  token.transferFee?.enabled !== true ||
  token.transferFee?.basisPoints !== 250 ||
  token.transferFee?.maximumFeeTokens !==
    "1000000"
) {
  throw new Error(
    "PWRC_TRANSFER_FEE_POLICY_INVALID",
  );
}

if (
  !profile.requiredExtensions.includes(
    "TransferFeeConfig",
  )
) {
  throw new Error(
    "PWRC_TRANSFER_FEE_EXTENSION_REQUIRED",
  );
}

console.log(JSON.stringify({
  ok: true,
  version: "1.0.0",
  transferFeeBps: 250,
  maximumTransferFeeTokens: "1000000",
}, null, 2));
