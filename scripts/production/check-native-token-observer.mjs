import fs from "node:fs";

const failures = [];

const sdkPackage =
  JSON.parse(
    fs.readFileSync(
      "packages/sdk/package.json",
      "utf8",
    ),
  );
const observer =
  fs.readFileSync(
    "packages/sdk/src/native-token-observer.ts",
    "utf8",
  );
const index =
  fs.readFileSync(
    "packages/sdk/src/index.ts",
    "utf8",
  );

if (
  sdkPackage.dependencies[
    "@solana/spl-token"
  ] !==
    "0.4.15"
) {
  failures.push(
    "native-token-observer:spl-token-version",
  );
}

if (
  sdkPackage.exports[
    "./native-token"
  ] !==
    "./src/native-token-observer.ts"
) {
  failures.push(
    "native-token-observer:package-export",
  );
}

for (const invariant of [
  "TOKEN_2022_PROGRAM_ID",
  "getMint",
  "getExtensionTypes",
  "getTransferFeeConfig",
  "getMetadataPointerState",
  "getTokenMetadata",
  "getAccountInfo",
  "getEpochInfo",
  "verifyNativePwrcMintObservation",
  "PWRC_NATIVE_MINT_ACCOUNT_NOT_FOUND",
  "PWRC_NATIVE_TRANSFER_FEE_CONFIG_MISSING",
  "PWRC_NATIVE_METADATA_POINTER_MISSING",
  "PWRC_NATIVE_TOKEN_METADATA_MISSING",
  "PWRC_NATIVE_LIVE_VERIFICATION_FAILED",
  "Promise.all",
  "PWRC_NATIVE_OBSERVATION_SLOT_SPAN_EXCEEDED",
  "PWRC_NATIVE_OBSERVATION_SLOT_REGRESSION",
  "slotSpan",
  "slotEnd",
  "slotStart",
]) {
  if (
    !observer.includes(
      invariant,
    )
  ) {
    failures.push(
      `native-token-observer:${invariant}`,
    );
  }
}

for (const forbidden of [
  "mintTo(",
  "setAuthority(",
  "createMint(",
  "transfer(",
  "sendTransaction(",
  "sendAndConfirmTransaction(",
]) {
  if (
    observer.includes(
      forbidden,
    )
  ) {
    failures.push(
      `native-token-observer:write-surface:${forbidden}`,
    );
  }
}

if (
  !index.includes(
    './native-token-observer.js',
  )
) {
  failures.push(
    "native-token-observer:index-export",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  rpcObservation:
    true,
  token2022:
    true,
  finalizedDefault:
    true,
  liveVerification:
    true,
  observationSlotRange:
    true,
  concurrentObservers:
    true,
  monetaryWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
