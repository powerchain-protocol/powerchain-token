import fs from "node:fs";
import path from "node:path";

const failures = [];
const expected =
  "1.0.0";

const versionConfig =
  JSON.parse(
    fs.readFileSync(
      "config/version.json",
      "utf8",
    ),
  );
const releaseConfig =
  JSON.parse(
    fs.readFileSync(
      "config/release.json",
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

if (
  versionConfig.version !==
    expected ||
  versionConfig.canonical !==
    true ||
  versionConfig.releaseChannel !==
    "stable"
) {
  failures.push(
    "canonical-version:config",
  );
}

if (
  releaseConfig.version !==
    expected ||
  releaseConfig.canonical !==
    true ||
  releaseConfig.releaseChannel !==
    "stable" ||
  releaseConfig.artifact !==
    "powerchain-token-1.0.0.zip"
) {
  failures.push(
    "canonical-version:release-config",
  );
}

if (
  rootPackage.version !==
    expected
) {
  failures.push(
    "canonical-version:root-package",
  );
}

if (
  !constants.includes(
    'export const PWRC_VERSION = "1.0.0" as const;',
  )
) {
  failures.push(
    "canonical-version:constants",
  );
}

const packageFiles = [];

function walk(
  directory,
) {
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

    if (
      entry.isDirectory()
    ) {
      walk(
        full,
      );
      continue;
    }

    if (
      entry.name ===
        "package.json"
    ) {
      packageFiles.push(
        full,
      );
    }
  }
}

walk(
  ".",
);

for (
  const file of
    packageFiles
) {
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
      expected
  ) {
    failures.push(
      `canonical-version:package:${file}:${pkg.version}`,
    );
  }
}

for (const file of [
  "config/token.json",
  "config/stack.json",
  "config/fees.json",
  "config/networks.json",
  "config/programs.json",
  "config/api.json",
]) {
  if (
    !fs.existsSync(
      file,
    )
  ) {
    continue;
  }

  const value =
    JSON.parse(
      fs.readFileSync(
        file,
        "utf8",
      ),
    );

  if (
    value.version !==
      undefined &&
    value.version !==
      expected
  ) {
    failures.push(
      `canonical-version:config-parity:${file}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length ===
    0,
  canonicalVersion:
    expected,
  config:
    versionConfig.version,
  releaseConfig:
    releaseConfig.version,
  constants:
    expected,
  rootPackage:
    rootPackage.version,
  packageFilesChecked:
    packageFiles.length,
  releaseChannel:
    versionConfig.releaseChannel,
  incrementalReleaseVersioning:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
