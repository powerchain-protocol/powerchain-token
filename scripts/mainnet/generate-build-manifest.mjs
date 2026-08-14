import fs from "node:fs";
import crypto from "node:crypto";

function sha256(
  file,
) {
  return crypto
    .createHash("sha256")
    .update(
      fs.readFileSync(file),
    )
    .digest("hex");
}

const inputs = [
  "package.json",
  "pnpm-workspace.yaml",
  "scripts/production/check-deprecated-dependencies.mjs",
  "apps/api/proxy.ts",
  "scripts/production/check-runtime-dependencies-proxy.mjs",


  "pnpm-lock.yaml",
  "Cargo.toml",
  "Cargo.lock",
  "Anchor.toml",
  "rust-toolchain.toml",
  "contracts/wpwrc/Move.toml",
  "contracts/wpwrc/Move.lock",
  "config/token.json",
  "config/fees.json",
  "config/programs.json",
  "config/networks.json",
  "config/cdp-sql.json",
  "config/metaplex.json",
  "config/api.json",
  "swagger/openapi.json",
  "swagger/openapi.yaml",
  "packages/protocol/package.json",
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
  "scripts/fullstack/start.mjs",
  "scripts/production/check-env-coverage.mjs",
  "scripts/packages/check-workspace-graph.mjs",
  "config/fees.json",
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



];

const artifacts = [
  "target/deploy/pwrc_lock.so",
  "target/deploy/pwrc_token.so",
];

const missing = [
  ...inputs,
  ...artifacts,
].filter(
  (file) =>
    !fs.existsSync(file),
);

if (missing.length) {
  console.error(
    JSON.stringify(
      {
        ok:
          false,
        version:
          "1.0.0",
        missing,
      },
      null,
      2,
    ),
  );
  process.exit(2);
}

const manifest = {
  version:
    "1.0.0",
  type:
    "powerchain-mainnet-build-manifest",
  generatedAt:
    new Date().toISOString(),
  source: Object.fromEntries(
    inputs.map(
      (file) => [
        file,
        sha256(file),
      ],
    ),
  ),
  artifacts: Object.fromEntries(
    artifacts.map(
      (file) => [
        file,
        {
          sha256:
            sha256(file),
          bytes:
            fs.statSync(file)
              .size,
        },
      ],
    ),
  ),
};

fs.mkdirSync(
  "reports",
  {
    recursive: true,
  },
);

fs.writeFileSync(
  "reports/mainnet-build-manifest.json",
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    manifest,
    null,
    2,
  ),
);
