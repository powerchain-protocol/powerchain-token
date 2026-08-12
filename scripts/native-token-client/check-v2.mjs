import fs from "node:fs";

const failures = [];

for (const file of [
  "packages/native-token-client/src/index.ts",
  "packages/native-token-client/src/constants.ts",
  "packages/native-token-client/src/amounts.ts",
  "packages/native-token-client/src/types/index.ts",
  "packages/native-token-client/src/validation/solana.ts",
  "packages/native-token-client/src/validation/sui.ts",
  "packages/native-token-client/src/solana/rpc.ts",
  "packages/native-token-client/src/solana/mint.ts",
  "packages/native-token-client/src/solana/transfer.ts",
  "packages/native-token-client/src/sui/client.ts",
  "packages/native-token-client/src/bridge/index.ts",
  "packages/native-token-client/src/explorer.ts",
]) {
  if (!fs.existsSync(file)) {
    failures.push(`missing:${file}`);
  }
}

const constants = fs.readFileSync(
  "packages/native-token-client/src/constants.ts",
  "utf8",
);
const mint = fs.readFileSync(
  "packages/native-token-client/src/solana/mint.ts",
  "utf8",
);
const transfer = fs.readFileSync(
  "packages/native-token-client/src/solana/transfer.ts",
  "utf8",
);
const bridge = fs.readFileSync(
  "packages/native-token-client/src/bridge/index.ts",
  "utf8",
);

if (!constants.includes("WPWRC_DECIMALS = 9")) {
  failures.push("client:wpwrc-decimals");
}
if (!constants.includes("PWRC_TRANSFER_FEE_BPS = 0")) {
  failures.push("client:no-fee");
}
if (!mint.includes("PWRC_TRANSFER_FEE_CONFIG_MUST_BE_ABSENT")) {
  failures.push("client:mint-no-fee-validation");
}
if (!transfer.includes("createTransferCheckedInstruction")) {
  failures.push("client:checked-transfer");
}
if (
  bridge.includes("1_000n") ||
  bridge.includes("1000n")
) {
  failures.push("client:stale-decimal-conversion");
}
if (!bridge.includes('ratio: "1:1"')) {
  failures.push("client:bridge-ratio");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  client: {
    canonicalDecimals: 9,
    wrappedDecimals: 9,
    transferFeeBps: 0,
    bridgeRatio: "1:1",
  },
  failures,
}, null, 2));

if (failures.length) process.exit(1);
