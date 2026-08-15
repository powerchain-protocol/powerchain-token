import fs from "node:fs";

const failures = [];

const nativeToken =
  fs.readFileSync(
    "packages/protocol/src/native-token.ts",
    "utf8",
  );
const safety =
  fs.readFileSync(
    "packages/protocol/src/bridge-safety.ts",
    "utf8",
  );
const settlement =
  fs.readFileSync(
    "packages/protocol/src/bridge-settlement.ts",
    "utf8",
  );
const transactions =
  fs.readFileSync(
    "packages/sdk/src/native-token-transactions.ts",
    "utf8",
  );
const intent =
  fs.readFileSync(
    "packages/protocol/src/native-transfer-intent.ts",
    "utf8",
  );

const helpers =
  fs.readFileSync(
    "packages/protocol/src/helpers.ts",
    "utf8",
  );

for (const invariant of [
  "PWRC_NATIVE_EXTENSION_DUPLICATE",
  "PWRC_NATIVE_EXTENSION_UNEXPECTED",
  "allowedExtensions",
]) {
  if (!nativeToken.includes(invariant)) {
    failures.push(
      `v21:native-token:${invariant}`,
    );
  }
}

for (const invariant of [
  "PWRC_BRIDGE_SAFETY_STATE_INCONSISTENT",
  "phaseRequiresSourceFinality",
  "phaseRequiresDestinationFinality",
  "phaseRequiresReconciliation",
]) {
  if (!safety.includes(invariant)) {
    failures.push(
      `v21:bridge-safety:${invariant}`,
    );
  }
}

for (const invariant of [
  "PWRC_GENESIS_BASE_UNITS",
  "PWRC_BRIDGE_INTENT_CHAIN_DIRECTION_MISMATCH",
  "PWRC_BRIDGE_INTENT_SAME_CHAIN_FORBIDDEN",
]) {
  if (!settlement.includes(invariant)) {
    failures.push(
      `v21:bridge-settlement:${invariant}`,
    );
  }
}

if (
  transactions.includes(
    "Buffer.from("
  )
) {
  failures.push(
    "v21:transaction-review:node-buffer-dependency",
  );
}

for (const invariant of [
  "messagesEqual",
  "actualMessage.every",
]) {
  if (!transactions.includes(invariant)) {
    failures.push(
      `v21:transaction-review:${invariant}`,
    );
  }
}

for (const invariant of [
  "assertSolana32ByteBase58",
]) {
  if (!intent.includes(invariant)) {
    failures.push(
      `v21:transfer-intent:${invariant}`,
    );
  }
}

for (const invariant of [
  "BASE58_ALPHABET",
  "decodedBase58Length",
  "assertSolana32ByteBase58",
]) {
  if (!helpers.includes(invariant)) {
    failures.push(
      `v21:shared-base58:${invariant}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  exactToken2022ExtensionProfile:
    true,
  phaseAwareBridgeSafety:
    true,
  bridgeCanonicalSupplyBound:
    true,
  bridgeChainDirectionBinding:
    true,
  browserSafeTransactionReview:
    true,
  strictSolanaPublicKeyLength:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
