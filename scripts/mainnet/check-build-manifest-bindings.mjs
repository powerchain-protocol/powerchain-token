import fs from "node:fs";

const failures = [];

const generator =
  fs.readFileSync(
    "scripts/mainnet/generate-build-manifest.mjs",
    "utf8",
  );
const verifier =
  fs.readFileSync(
    "scripts/mainnet/verify-build-manifest.mjs",
    "utf8",
  );

function extractQuotedList(
  source,
  pattern,
  code,
) {
  const match =
    source.match(
      pattern,
    );

  if (!match) {
    failures.push(
      code,
    );
    return [];
  }

  return [
    ...match[1]
      .matchAll(
        /"([^"]+)"/g,
      ),
  ].map(
    (entry) =>
      entry[1],
  );
}

function duplicateItems(
  items,
) {
  const seen =
    new Set();
  const duplicates =
    new Set();

  for (const item of items) {
    if (
      seen.has(
        item,
      )
    ) {
      duplicates.add(
        item,
      );
    }

    seen.add(
      item,
    );
  }

  return [
    ...duplicates,
  ];
}

function extractQuotedItems(
  source,
  pattern,
  code,
) {
  const match =
    source.match(
      pattern,
    );

  if (!match) {
    failures.push(
      code,
    );
    return new Set();
  }

  return new Set(
    [
      ...match[1]
        .matchAll(
          /"([^"]+)"/g,
        ),
    ].map(
      (entry) =>
        entry[1],
    ),
  );
}

const generatedInputList =
  extractQuotedList(
    generator,
    /const inputs = \[([\s\S]*?)\];/,
    "manifest-bindings:generator-inputs-unreadable",
  );

const requiredSourceList =
  extractQuotedList(
    verifier,
    /for \(const required of \[([\s\S]*?)\]\) \{\s*if \(\s*!Object\.prototype\.hasOwnProperty\.call\(\s*manifest\.source/,
    "manifest-bindings:verifier-required-sources-unreadable",
  );

for (
  const duplicate of
    duplicateItems(
      generatedInputList,
    )
) {
  failures.push(
    `manifest-bindings:generator-duplicate:${duplicate}`,
  );
}

for (
  const duplicate of
    duplicateItems(
      requiredSourceList,
    )
) {
  failures.push(
    `manifest-bindings:verifier-duplicate:${duplicate}`,
  );
}

const generatedInputs =
  extractQuotedItems(
    generator,
    /const inputs = \[([\s\S]*?)\];/,
    "manifest-bindings:generator-inputs-unreadable",
  );

const requiredSources =
  extractQuotedItems(
    verifier,
    /for \(const required of \[([\s\S]*?)\]\) \{\s*if \(\s*!Object\.prototype\.hasOwnProperty\.call\(\s*manifest\.source/,
    "manifest-bindings:verifier-required-sources-unreadable",
  );

const critical = [
  "packages/protocol/src/native-token.ts",
  "packages/sdk/src/native-token-observer.ts",
  "packages/protocol/src/native-token-consensus.ts",
  "packages/protocol/src/native-token-attestation.ts",
  "packages/protocol/src/helius.ts",
  "packages/sdk/src/helius-client.ts",
  "apps/api/lib/helius.mjs",
  "scripts/production/check-helius.mjs",
  "packages/protocol/src/solana.ts",
  "scripts/production/check-solana-network-integrity.mjs",
  "tests/solana-network-integrity.test.ts",
  "apps/api/lib/native-attestation.mjs",
  "scripts/production/check-native-verification-runtime.mjs",
  "tests/native-verification-config.test.ts",
  "packages/sdk/src/solana-client.ts",
  "packages/sdk/src/native-token-transactions.ts",
  "packages/protocol/src/utility.ts",
  "packages/protocol/src/compute-security.ts",
  "packages/metaplex/src/compatibility.ts",
  "metadata/metadata.json",
  "apps/api/lib/token-runtime.mjs",
  "scripts/production/check-native-token-runtime.mjs",
  "tests/native-token-transactions.test.ts",
  "tests/utility-security.test.ts",
  "tests/metaplex-compatibility.test.ts",
  "packages/protocol/src/native-transfer-intent.ts",
  "packages/sdk/src/idempotency-registry.ts",
  "scripts/production/check-transaction-integrity.mjs",
  "tests/native-transfer-intent.test.ts",
  "tests/native-transaction-review.test.ts",
  "tests/idempotency-registry.test.ts",
  "scripts/production/check-v21-hardening.mjs",
  "tests/bridge-safety.test.ts",
  "tests/bridge-settlement.test.ts",
  "tests/native-token.test.ts",
  "scripts/production/check-v22-policy-hardening.mjs",
  "tests/bridge-policy.test.ts",
  "tests/bridge-policy-config.test.mjs",
  "apps/api/lib/bridge-policy-config.mjs",
  "packages/protocol/src/bridge-policy.ts",
  "swagger/openapi.json",
  "config/bridge-policy-parity-fixture.json",
  "packages/protocol/src/native-token-policy.ts",
  "config/native-pwrc-policy-parity-fixture.json",
  "scripts/production/check-v23-native-policy.mjs",
  "tests/native-token-policy.test.ts",
  "tests/native-token-policy-api.test.mjs",
  "tests/native-token-consensus.test.ts",
  "apps/api/lib/native-token.mjs",
  "scripts/production/check-v24-observation-consistency.mjs",
  "tests/native-token-attestation.test.ts",
  "scripts/production/check-v25-attestation-hardening.mjs",
  "scripts/production/check-v26-fee-runtime.mjs",
  "packages/protocol/src/constants.ts",
  "scripts/mainnet/status.mjs",
  "scripts/production/check-v27-mainnet-native-evidence.mjs",
  "scripts/mainnet/capture-native-token-attestation.mjs",
  "scripts/mainnet/verify-native-token-attestation.mjs",
  "config/mainnet/native-token-attestation.example.json",
  "scripts/production/check-v28-helius-hardening.mjs",
  "tests/helius-runtime-hardening.test.ts",
  "scripts/production/check-v29-program-hardening.mjs",
  "tests/program-hardening.test.mjs",
  "config/programs/policy.json",
  "programs/token/src/lib.rs",
  "programs/pwrc-lock/src/lib.rs",
  "contracts/wpwrc/sources/wpwrc.move",
  "scripts/production/check-v30-security-runtime.mjs",
  "tests/v30-source-hardening.test.mjs",
  "packages/protocol/src/helpers.ts",
  "packages/protocol/src/fees.ts",
  "scripts/production/check-v31-fee-epoch-hardening.mjs",
  "tests/v31-fee-epoch-source.test.mjs",
  "tests/native-transfer-fee-evidence.test.ts",
  "packages/protocol/src/native-transfer-fee-evidence.ts",
  "config/version.json",
  "scripts/production/check-canonical-version.mjs",
  "config/release.json",
  "config/assets.json",
  "metadata/wpwrc.json",
  "assets/tokens/wpwrc.png",
  "packages/protocol/src/metadata.ts",
  "scripts/production/check-canonical-release.mjs",
  "scripts/production/check-transfer-intent-integrity.mjs",
  "scripts/production/check-native-attestation-cache-integrity.mjs",
  "tests/transaction-intent-integrity-source.test.mjs",
  "tests/native-attestation-cache-source.test.mjs",
  ".nvmrc",
  ".node-version",
  ".npmrc",
  "config/toolchain.json",
  "config/stack.json",
  "package.json",
  "packages/cdp-user-wallet/package.json",
  "config/cdp-user-wallet.json",
  "scripts/production/check-toolchain.mjs",
  "scripts/production/check-toolchain-runtime.mjs",
  "scripts/production/check-package-versions.mjs",
  "scripts/packages/check-pnpm-build-policy.mjs",
  "scripts/production/check-types-boundaries.mjs",
  "config/typescript/base.json",
  "scripts/bootstrap/preinstall.mjs",
  "scripts/production/check-typescript-config.mjs",
  "scripts/production/check-install-policy.mjs",
  "apps/api/package.json",
  "config/token-policy.json",
  "config/token.json",
  "config/fees.json",
  "packages/protocol/src/token-policy.ts",
  "packages/protocol/src/token-amount.ts",
  "scripts/production/check-token-policy-integrity.mjs",
  "tests/token-policy-source.test.mjs",
  "tests/token-amount.test.ts",
  "apps/api/lib/token-policy.mjs",
  "packages/sdk/src/token.ts",
  "packages/sdk/src/api-client.ts",
  "scripts/production/check-token-api-policy.mjs",
  "tests/token-api-policy-source.test.mjs",
  "apps/api/lib/fees.mjs",
  "apps/api/lib/bridge-routes.mjs",
  "scripts/production/check-token-runtime-parity.mjs",
  "tests/token-runtime-parity-source.test.mjs",
  "scripts/production/check-token-policy-binding.mjs",
  "tests/token-policy-binding-source.test.mjs",
  "config/mainnet/token-fee-authorities.example.json",
  "scripts/mainnet/token-fee-authority-policy.mjs",
  "scripts/mainnet/verify-token-fee-authorities.mjs",
  "scripts/mainnet/seal-token-fee-authorities.mjs",
  "scripts/production/check-token-fee-authority-policy.mjs",
  "tests/token-fee-authority-policy-source.test.mjs",
];

for (const file of critical) {
  if (!generatedInputs.has(file)) {
    failures.push(
      `manifest-bindings:generator-missing:${file}`,
    );
  }

  if (!requiredSources.has(file)) {
    failures.push(
      `manifest-bindings:verifier-missing:${file}`,
    );
  }
}

const generatorOnlyCritical =
  critical.filter(
    (file) =>
      generatedInputs.has(file) &&
      !requiredSources.has(file),
  );

const verifierOnlyCritical =
  critical.filter(
    (file) =>
      requiredSources.has(file) &&
      !generatedInputs.has(file),
  );

if (
  generatorOnlyCritical.length
) {
  failures.push(
    `manifest-bindings:generator-only:${generatorOnlyCritical.join(",")}`,
  );
}

if (
  verifierOnlyCritical.length
) {
  failures.push(
    `manifest-bindings:verifier-only:${verifierOnlyCritical.join(",")}`,
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  criticalBindings:
    critical.length,
  generatorCriticalBindings:
    critical.filter(
      (file) =>
        generatedInputs.has(file),
    ).length,
  verifierCriticalBindings:
    critical.filter(
      (file) =>
        requiredSources.has(file),
    ).length,
  generatorDuplicates:
    duplicateItems(
      generatedInputList,
    ).length,
  verifierDuplicates:
    duplicateItems(
      requiredSourceList,
    ).length,
  symmetric:
    failures.length ===
    0,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
