import fs from "node:fs";
import crypto from "node:crypto";

const file =
  "reports/mainnet-build-manifest.json";
const failures = [];

function sha256(path) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(path))
    .digest("hex");
}

if (!fs.existsSync(file)) {
  failures.push(`missing:${file}`);
} else {
  let manifest;

  try {
    manifest =
      JSON.parse(
        fs.readFileSync(
          file,
          "utf8",
        ),
      );
  } catch {
    failures.push(
      "build-manifest:invalid-json",
    );
  }

  if (manifest) {
    if (
      manifest.version !==
        "1.0.0" ||
      manifest.type !==
        "powerchain-mainnet-build-manifest"
    ) {
      failures.push(
        "build-manifest:identity",
      );
    }

    for (
      const [
        path,
        expected,
      ] of
      Object.entries(
        manifest.source ??
        {},
      )
    ) {
      if (!fs.existsSync(path)) {
        failures.push(
          `build-manifest:source:missing:${path}`,
        );
        continue;
      }

      const actual =
        sha256(path);

      if (
        actual !==
        String(expected)
          .toLowerCase()
      ) {
        failures.push(
          `build-manifest:source:hash-mismatch:${path}`,
        );
      }
    }

    for (
      const [
        path,
        metadata,
      ] of
      Object.entries(
        manifest.artifacts ??
        {},
      )
    ) {
      if (!fs.existsSync(path)) {
        failures.push(
          `build-manifest:artifact:missing:${path}`,
        );
        continue;
      }

      const actualHash =
        sha256(path);
      const actualBytes =
        fs.statSync(path)
          .size;

      if (
        actualHash !==
        metadata?.sha256
          ?.toLowerCase()
      ) {
        failures.push(
          `build-manifest:artifact:hash-mismatch:${path}`,
        );
      }

      if (
        actualBytes !==
        metadata?.bytes
      ) {
        failures.push(
          `build-manifest:artifact:size-mismatch:${path}`,
        );
      }
    }

    for (const required of [
      "pnpm-lock.yaml",
      "Cargo.lock",
      "contracts/wpwrc/Move.lock",
      "config/token.json",
      "tests/token-amount.test.ts",
      "tests/token-policy-source.test.mjs",
      "scripts/production/check-token-policy-integrity.mjs",
      "packages/protocol/src/token-amount.ts",
      "packages/protocol/src/token-policy.ts",
      "config/token-policy.json",
      "tests/token-policy-binding-source.test.mjs",
      "scripts/production/check-token-policy-binding.mjs",
      "tests/token-api-policy-source.test.mjs",
      "scripts/production/check-token-api-policy.mjs",
      "packages/sdk/src/api-client.ts",
      "packages/sdk/src/token.ts",
      "apps/api/lib/token-policy.mjs",
      "tests/token-runtime-parity-source.test.mjs",
      "scripts/production/check-token-runtime-parity.mjs",
      "apps/api/lib/bridge-routes.mjs",
      "apps/api/lib/fees.mjs",
      "config/fees.json",
      "config/programs.json",
      "config/networks.json",
      "config/cdp-sql.json",
      "config/metaplex.json",
      "config/api.json",
      "swagger/openapi.json",
      "swagger/openapi.yaml",
      "packages/protocol/package.json",
      "tests/solana-network-integrity.test.ts",
      "scripts/production/check-solana-network-integrity.mjs",
      "packages/protocol/src/solana.ts",
      "packages/sdk/src/solana-client.ts",
      "apps/api/package.json",
      "tests/metaplex-compatibility.test.ts",
      "tests/utility-security.test.ts",
      "tests/native-token-transactions.test.ts",
      "scripts/production/check-native-token-runtime.mjs",
      "apps/api/lib/token-runtime.mjs",
      "metadata/metadata.json",
      "packages/metaplex/src/compatibility.ts",
      "packages/protocol/src/compute-security.ts",
      "packages/protocol/src/utility.ts",
      "packages/sdk/src/native-token-transactions.ts",
      "tests/idempotency-registry.test.ts",
      "tests/native-transaction-review.test.ts",
      "tests/native-transfer-intent.test.ts",
      "scripts/production/check-transaction-integrity.mjs",
      "tests/native-attestation-cache-source.test.mjs",
      "tests/transaction-intent-integrity-source.test.mjs",
      "scripts/production/check-native-attestation-cache-integrity.mjs",
      "scripts/production/check-transfer-intent-integrity.mjs",
      "tests/native-token.test.ts",
      "tests/bridge-settlement.test.ts",
      "tests/bridge-safety.test.ts",
      "scripts/production/check-v21-hardening.mjs",
      "packages/protocol/src/bridge-policy.ts",
      "apps/api/lib/bridge-policy-config.mjs",
      "tests/bridge-policy-config.test.mjs",
      "tests/bridge-policy.test.ts",
      "scripts/production/check-v22-policy-hardening.mjs",
      "config/bridge-policy-parity-fixture.json",
      "apps/api/lib/native-token.mjs",
      "tests/native-token-consensus.test.ts",
      "tests/native-token-policy-api.test.mjs",
      "tests/native-token-policy.test.ts",
      "scripts/production/check-v23-native-policy.mjs",
      "tests/native-token-attestation.test.ts",
      "scripts/production/check-v24-observation-consistency.mjs",
      "scripts/production/check-v25-attestation-hardening.mjs",
      "scripts/mainnet/status.mjs",
      "packages/protocol/src/constants.ts",
      "scripts/production/check-v26-fee-runtime.mjs",
      "config/mainnet/native-token-attestation.example.json",
      "tests/token-fee-authority-policy-source.test.mjs",
      "scripts/production/check-token-fee-authority-policy.mjs",
      "scripts/mainnet/seal-token-fee-authorities.mjs",
      "scripts/mainnet/verify-token-fee-authorities.mjs",
      "scripts/mainnet/token-fee-authority-policy.mjs",
      "config/mainnet/token-fee-authorities.example.json",
      "scripts/mainnet/verify-native-token-attestation.mjs",
      "scripts/mainnet/capture-native-token-attestation.mjs",
      "scripts/production/check-v27-mainnet-native-evidence.mjs",
      "tests/helius-runtime-hardening.test.ts",
      "scripts/production/check-v28-helius-hardening.mjs",
      "contracts/wpwrc/sources/wpwrc.move",
      "programs/pwrc-lock/src/lib.rs",
      "programs/token/src/lib.rs",
      "config/programs/policy.json",
      "tests/program-hardening.test.mjs",
      "scripts/production/check-v29-program-hardening.mjs",
      "packages/protocol/src/fees.ts",
      "packages/protocol/src/helpers.ts",
      "tests/v30-source-hardening.test.mjs",
      "scripts/production/check-v30-security-runtime.mjs",
      "packages/protocol/src/native-transfer-fee-evidence.ts",
      "tests/native-transfer-fee-evidence.test.ts",
      "tests/v31-fee-epoch-source.test.mjs",
      "scripts/production/check-v31-fee-epoch-hardening.mjs",
      "scripts/production/check-canonical-version.mjs",
      "scripts/production/check-canonical-release.mjs",
      "assets/tokens/wpwrc.png",
      "metadata/wpwrc.json",
      "config/assets.json",
      "config/release.json",
      "config/version.json",
      "config/native-pwrc-policy-parity-fixture.json",
      "packages/protocol/src/native-token-policy.ts",
      "packages/sdk/src/idempotency-registry.ts",
      "packages/protocol/src/native-transfer-intent.ts",
      "tests/native-verification-config.test.ts",
      "scripts/production/check-native-verification-runtime.mjs",
      "apps/api/lib/native-attestation.mjs",
      "scripts/production/check-helius.mjs",
      "apps/api/lib/helius.mjs",
      "packages/sdk/src/helius-client.ts",
      "packages/protocol/src/helius.ts",
      "scripts/mainnet/check-build-manifest-bindings.mjs",
      "packages/protocol/src/native-token-attestation.ts",
      "packages/protocol/src/native-token-consensus.ts",
      "packages/sdk/src/native-token-observer.ts",
      "packages/protocol/src/native-token.ts",
      "packages/sdk/package.json",
      "packages/metaplex/package.json",
      "packages/protocol/src/metadata.ts",
      "packages/metaplex/src/index.ts",
      "apps/api/lib/api-registry.mjs",
      "apps/api/lib/metadata.mjs",
      "apps/shared/graceful-http.mjs",
      ".env.production",
      ".gitignore",
      "apps/docs/server.mjs",
      "apps/client/server.mjs",
      "scripts/production/check-client-runtime.mjs",
      "scripts/fullstack/start.mjs",
      "scripts/production/check-env-coverage.mjs",
      "scripts/packages/check-workspace-graph.mjs",
      "config/cdp-user-wallet.json",
      "packages/cdp-user-wallet/package.json",
      "packages/cdp-user-wallet/src/index.ts",
      "packages/cdp-user-wallet/src/react.tsx",
      "packages/cdp-user-wallet/tsconfig.json",
      "scripts/production/check-types-boundaries.mjs",
      "tests/cdp-user-wallet.test.ts",
      "tests/service-fee-environment-types.ts",
      "apps/api/lib/service-fee-recipients.mjs",
      "scripts/production/check-identities.mjs",
      "scripts/production/check-cdp-user-wallet.mjs",
      "scripts/production/check-service-fee-recipients.mjs",
      "config/templates/env.example",
      "config/templates/env.production",
      "config/templates/gitignore.txt",
      "scripts/bootstrap/ensure-safe-root-files.mjs",
      ".nvmrc",
      ".node-version",
      ".npmrc",
      "config/toolchain.json",
      "config/stack.json",
      "package.json",
      "scripts/production/check-documentation.mjs",
      "swagger/README.md",
      "programs/token/README.md",
      "programs/pwrc-lock/README.md",
      "programs/README.md",
      "contracts/README.md",
      "CHANGELOG.md",
      "README.md",
      "scripts/production/check-install-policy.mjs",
      "scripts/production/check-typescript-config.mjs",
      "scripts/bootstrap/preinstall.mjs",
      "config/typescript/base.json",
      "scripts/production/check-toolchain.mjs",
      "scripts/production/check-toolchain-runtime.mjs",
      "scripts/production/check-package-versions.mjs",
      "scripts/packages/check-pnpm-build-policy.mjs",
]) {
      if (
        !Object.prototype.hasOwnProperty.call(
          manifest.source ??
          {},
          required,
        )
      ) {
        failures.push(
          `build-manifest:required-source:${required}`,
        );
      }
    }

    for (const required of [
      "target/deploy/pwrc_lock.so",
      "target/deploy/pwrc_token.so",
    ]) {
      if (
        !Object.prototype.hasOwnProperty.call(
          manifest.artifacts ??
          {},
          required,
        )
      ) {
        failures.push(
          `build-manifest:required-artifact:${required}`,
        );
      }
    }
  }
}

const result = {
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  manifest:
    file,
  failures,
};

fs.mkdirSync(
  "reports",
  {
    recursive:
      true,
  },
);

fs.writeFileSync(
  "reports/mainnet-build-manifest-verification.json",
  `${JSON.stringify(result, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(2);
}
