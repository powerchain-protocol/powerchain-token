import fs from "node:fs";

const failures = [];
const warnings = [];

function read(
  file,
  {
    required = true,
  } = {},
) {
  if (!fs.existsSync(file)) {
    if (required) {
      failures.push(
        `missing:${file}`,
      );
    }

    return "";
  }

  return fs.readFileSync(
    file,
    "utf8",
  );
}

const requiredFiles = [
  "scripts/bootstrap/platform-preflight.sh",
  "scripts/bootstrap/macos-node.sh",
  "scripts/bootstrap/activate-node.sh",
  "scripts/bootstrap/inspect-shell.sh",
  "scripts/toolchain/node-policy.mjs",
  ".nvmrc",
  ".node-version",
  "pnpm-workspace.yaml",
  "package.json",
];

for (const file of requiredFiles) {
  read(file);
}

const workspace =
  read(
    "pnpm-workspace.yaml",
  );

if (
  /(^|\n)\s*(useNodeVersion|nodeVersion)\s*:/m.test(
    workspace,
  )
) {
  failures.push(
    "pnpm-node-download-pin-present",
  );
}

if (
  !workspace.includes(
    "engineStrict: true",
  )
) {
  failures.push(
    "workspace-engine-strict-missing",
  );
}

const packageJsonText =
  read(
    "package.json",
  );

let packageJson = {};

try {
  packageJson =
    JSON.parse(
      packageJsonText,
    );
} catch {
  failures.push(
    "package-json-invalid",
  );
}

const expectedNodeEngine =
  ">=22.22.3 <23 || >=24.18.1 <25 || >=26.5.1 <27";

if (
  packageJson.engines?.node !==
    expectedNodeEngine
) {
  failures.push(
    "package-node-engine-policy",
  );
}

if (
  packageJson.engines?.pnpm !==
    "10.21.0"
) {
  failures.push(
    "package-pnpm-engine-policy",
  );
}

if (
  packageJson.packageManager !==
    "pnpm@10.21.0"
) {
  failures.push(
    "package-manager-policy",
  );
}

for (const file of [
  ".nvmrc",
  ".node-version",
]) {
  const value =
    read(file).trim();

  if (
    value !== "22.22.3"
  ) {
    failures.push(
      `${file}:baseline`,
    );
  }
}

const preflight =
  read(
    "scripts/bootstrap/platform-preflight.sh",
  );

for (const invariant of [
  "PWRC_STALE_BROKEN_NODE_SELECTED",
  "activate-node.sh",
  "26.7.0",
]) {
  if (
    !preflight.includes(
      invariant,
    )
  ) {
    failures.push(
      `platform-preflight:${invariant}`,
    );
  }
}

const activation =
  read(
    "scripts/bootstrap/activate-node.sh",
  );

for (const invariant of [
  "nvm deactivate",
  "nvm use",
  "PWRC_NODE_PATH_MISMATCH",
  "PWRC_NODE_BINARY_CANNOT_START",
  "PWRC_PNPM_CANNOT_START",
  "corepack prepare",
]) {
  if (
    !activation.includes(
      invariant,
    )
  ) {
    failures.push(
      `activation:${invariant}`,
    );
  }
}

// Local shell state is diagnostic only and must never make a repository
// production-static check fail.
if (
  process.env.NODE_OPTIONS
) {
  warnings.push(
    "local-node-options-set",
  );
}

if (
  process.version !==
    "v22.22.3"
) {
  warnings.push(
    `validation-runtime:${process.version}`,
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      policy: {
        localNodeBaseline:
          "22.22.3",
        nodeEngine:
          expectedNodeEngine,
        pnpm:
          "10.21.0",
        sourceableActivation:
          true,
        staleNodePathDetection:
          true,
        pnpmNodeDownloadPin:
          false,
      },
      warnings,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
