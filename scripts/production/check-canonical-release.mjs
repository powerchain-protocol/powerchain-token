import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const failures = [];
const expectedVersion =
  "1.0.0";

const release =
  JSON.parse(
    fs.readFileSync(
      "config/release.json",
      "utf8",
    ),
  );
const version =
  JSON.parse(
    fs.readFileSync(
      "config/version.json",
      "utf8",
    ),
  );
const token =
  JSON.parse(
    fs.readFileSync(
      "config/token.json",
      "utf8",
    ),
  );
const assets =
  JSON.parse(
    fs.readFileSync(
      "config/assets.json",
      "utf8",
    ),
  );
const bridge =
  JSON.parse(
    fs.readFileSync(
      "config/bridge.json",
      "utf8",
    ),
  );
const rootPackage =
  JSON.parse(
    fs.readFileSync(
      "package.json",
      "utf8",
    ),
  );
const constants =
  fs.readFileSync(
    "packages/protocol/src/constants.ts",
    "utf8",
  );

for (const [label, actual] of [
  ["release.version", release.version],
  ["version.version", version.version],
  ["token.version", token.version],
  ["assets.version", assets.version],
  ["bridge.version", bridge.version],
  ["package.version", rootPackage.version],
]) {
  if (
    actual !==
      expectedVersion
  ) {
    failures.push(
      `canonical-release:${label}:expected=${expectedVersion}:actual=${String(actual)}`,
    );
  }
}

if (
  release.canonical !==
    true ||
  release.releaseChannel !==
    "stable" ||
  release.artifact !==
    "powerchain-token-1.0.0.zip" ||
  release.iterationLabelsAreReleaseVersions !==
    false
) {
  failures.push(
    "canonical-release:release-policy",
  );
}

if (
  release.toolchain?.node !==
    "26.5.1" ||
  release.toolchain?.nvm !==
    "0.40.6" ||
  release.toolchain?.npm !==
    "11.17.0" ||
  release.toolchain?.pnpm !==
    "11.18.0" ||
  release.toolchain?.typescript !==
    "7.0.2"
) {
  failures.push(
    "canonical-release:toolchain",
  );
}

for (const invariant of [
  'export const PWRC_VERSION = "1.0.0" as const;',
  "POWERCHAIN_RELEASE_VERSION = PWRC_VERSION",
  'POWERCHAIN_NODE_VERSION = "26.5.1"',
  'POWERCHAIN_NVM_VERSION = "0.40.6"',
  'POWERCHAIN_PNPM_VERSION = "11.18.0"',
  'POWERCHAIN_TYPESCRIPT_VERSION = "7.0.2"',
  'WPWRC_METADATA_URI =',
  'WPWRC_METADATA_IMAGE_URI =',
]) {
  if (!constants.includes(invariant)) {
    failures.push(
      `canonical-release:constants:${invariant}`,
    );
  }
}

const wpwrcMetadata =
  JSON.parse(
    fs.readFileSync(
      "metadata/wpwrc.json",
      "utf8",
    ),
  );

if (
  wpwrcMetadata.name !==
    "Wrapped PowerChain" ||
  wpwrcMetadata.symbol !==
    "wPWRC" ||
  wpwrcMetadata.image !==
    "https://token.powerchain.energy/assets/tokens/wpwrc.png"
) {
  failures.push(
    "canonical-release:wpwrc-metadata",
  );
}

const iconPath =
  "assets/tokens/wpwrc.png";

if (
  !fs.existsSync(
    iconPath,
  )
) {
  failures.push(
    "canonical-release:wpwrc-icon-missing",
  );
} else {
  const bytes =
    fs.readFileSync(
      iconPath,
    );

  if (
    bytes.length <
      1024 ||
    bytes.subarray(
      0,
      8,
    ).toString(
      "hex",
    ) !==
      "89504e470d0a1a0a"
  ) {
    failures.push(
      "canonical-release:wpwrc-icon-invalid",
    );
  }
}

const packageFiles = [];

function walk(directory) {
  for (
    const entry of
      fs.readdirSync(
        directory,
        {
          withFileTypes:
            true,
        },
      )
  ) {
    if (
      [
        "node_modules",
        ".git",
        "reports",
        "target",
      ].includes(
        entry.name,
      )
    ) {
      continue;
    }

    const full =
      path.join(
        directory,
        entry.name,
      );

    if (entry.isDirectory()) {
      walk(full);
    } else if (
      entry.name ===
        "package.json"
    ) {
      packageFiles.push(full);
    }
  }
}

walk(".");

for (const file of packageFiles) {
  const pkg =
    JSON.parse(
      fs.readFileSync(
        file,
        "utf8",
      ),
    );

  if (
    pkg.version !==
      undefined &&
    pkg.version !==
      expectedVersion
  ) {
    failures.push(
      `canonical-release:workspace-version:${file}:${pkg.version}`,
    );
  }
}

if (
  assets.canonical !==
    true ||
  assets.assets?.wPWRC?.image !==
    "https://token.powerchain.energy/assets/tokens/wpwrc.png" ||
  assets.assets?.wPWRC?.metadata !==
    "https://token.powerchain.energy/metadata/wpwrc.json"
) {
  failures.push(
    "canonical-release:assets-config",
  );
}

const iconSha256 =
  fs.existsSync(
    iconPath,
  )
    ? crypto
        .createHash(
          "sha256",
        )
        .update(
          fs.readFileSync(
            iconPath,
          ),
        )
        .digest(
          "hex",
        )
    : null;

if (
  iconSha256 &&
  (
    assets.assets?.wPWRC?.imageSha256 !==
      iconSha256 ||
    release.wrappedToken?.imageSha256 !==
      iconSha256
  )
) {
  failures.push(
    "canonical-release:wpwrc-icon-sha256-mismatch",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length ===
    0,
  version:
    expectedVersion,
  canonical:
    true,
  releaseChannel:
    "stable",
  artifact:
    "powerchain-token-1.0.0.zip",
  workspacePackagesChecked:
    packageFiles.length,
  wpwrcIconSha256:
    iconSha256,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
