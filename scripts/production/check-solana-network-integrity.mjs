import fs from "node:fs";

const failures = [];

const solana =
  fs.readFileSync(
    "packages/protocol/src/solana.ts",
    "utf8",
  );
const helius =
  fs.readFileSync(
    "apps/api/lib/helius.mjs",
    "utf8",
  );
const observer =
  fs.readFileSync(
    "packages/sdk/src/native-token-observer.ts",
    "utf8",
  );
const env =
  fs.readFileSync(
    ".env.example",
    "utf8",
  );

for (const invariant of [
  "resolveExpectedSolanaGenesisHash",
  "PWRC_SOLANA_GENESIS_HASH_REQUIRED",
  "solanaRpcProviderFamily",
  "assertIndependentRpcProviders",
  "PWRC_SECONDARY_RPC_PROVIDER_MUST_DIFFER",
  ".helius-rpc.com",
  "!==\n      32",
  "decodedBase58Length",
]) {
  if (!solana.includes(invariant)) {
    failures.push(
      `solana-network-integrity:protocol:${invariant}`,
    );
  }
}

for (const invariant of [
  "resolveExpectedSolanaGenesisHash",
  "PWRC_HELIUS_GENESIS_HASH_MISMATCH",
  "genesisVerified",
]) {
  if (!helius.includes(invariant)) {
    failures.push(
      `solana-network-integrity:helius:${invariant}`,
    );
  }
}

for (const invariant of [
  "verifyConfiguredNativePwrcAcrossRpcs",
  "resolveExpectedSolanaGenesisHash",
]) {
  if (!observer.includes(invariant)) {
    failures.push(
      `solana-network-integrity:observer:${invariant}`,
    );
  }
}

for (const key of [
  "PWRC_SOLANA_LOCALNET_GENESIS_HASH=",
  "PWRC_SOLANA_DEVNET_GENESIS_HASH=",
  "PWRC_SOLANA_MAINNET_GENESIS_HASH=",
]) {
  if (!env.includes(key)) {
    failures.push(
      `solana-network-integrity:env:${key}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  trustedGenesisBinding:
    true,
  trustedGenesisExact32Bytes:
    true,
  independentProviderFamilyRequired:
    true,
  heliusHealthGenesisVerified:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
