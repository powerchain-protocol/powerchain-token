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
  "config/api.json",
  "swagger/openapi.json",
  "swagger/openapi.yaml",
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
