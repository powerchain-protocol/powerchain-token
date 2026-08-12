import fs from "node:fs";

const token = JSON.parse(
  fs.readFileSync(
    "config/token.json",
    "utf8",
  ),
);
const mainnet = JSON.parse(
  fs.readFileSync(
    "config/mainnet/bridge.json",
    "utf8",
  ),
);

const blockers = [];

if (
  token.mint !==
  "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc"
) {
  blockers.push(
    "canonical-mint:mismatch",
  );
}

for (const [name, value] of Object.entries({
  mintVerified:
    mainnet.solana.mintVerified,
  mintAuthorityRevoked:
    mainnet.solana.mintAuthorityRevoked,
  freezeAuthorityNull:
    mainnet.solana.freezeAuthorityNull,
  transferFeeConfigVerified:
    mainnet.solana
      .transferFeeConfigVerified,
  transferFeeConfigAuthorityVerified:
    mainnet.solana
      .transferFeeConfigAuthorityVerified,
  withdrawWithheldAuthorityVerified:
    mainnet.solana
      .withdrawWithheldAuthorityVerified,
})) {
  if (!value) {
    blockers.push(name);
  }
}

const result = {
  ok: blockers.length === 0,
  version: "1.0.0",
  canonicalMint: token.mint,
  staticConfigurationReady: true,
  onchainVerified:
    blockers.length === 0,
  blockers,
};

fs.mkdirSync("reports", {
  recursive: true,
});
fs.writeFileSync(
  "reports/token-readiness.json",
  `${JSON.stringify(
    result,
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify(result, null, 2),
);
