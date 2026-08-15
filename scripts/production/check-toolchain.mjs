import fs from "node:fs";

const failures = [];
const expected = {
  version:
    "1.0.0",
  node:
    "26.5.1",
  nvm:
    "0.40.6",
  npm:
    "11.17.0",
  pnpm:
    "11.18.0",
  typescript:
    "7.0.2",
};

const root =
  JSON.parse(
    fs.readFileSync(
      "package.json",
      "utf8",
    ),
  );
const toolchain =
  JSON.parse(
    fs.readFileSync(
      "config/toolchain.json",
      "utf8",
    ),
  );
const stack =
  JSON.parse(
    fs.readFileSync(
      "config/stack.json",
      "utf8",
    ),
  );

const workspaceEnginePackages =
  [
    "apps/api/package.json",
    "apps/client/package.json",
    "apps/docs/package.json",
    "packages/bridge-integration/package.json",
    "packages/cdp-user-wallet/package.json",
    "packages/metaplex/package.json",
    "packages/native-token-client/package.json",
    "packages/protocol/package.json",
    "packages/runtime/package.json",
    "packages/sdk/package.json",
  ];

for (const file of workspaceEnginePackages) {
  const pkg =
    JSON.parse(
      fs.readFileSync(
        file,
        "utf8",
      ),
    );

  if (
    pkg.engines?.node !==
      ">=26.5.1 <27"
  ) {
    failures.push(
      `toolchain:workspace-engine:${file}`,
    );
  }
}

for (const [file, version] of [
  [".nvmrc", expected.node],
  [".node-version", expected.node],
]) {
  if (
    !fs.existsSync(
      file,
    ) ||
    fs.readFileSync(
      file,
      "utf8",
    ).trim() !==
      version
  ) {
    failures.push(
      `toolchain:${file}`,
    );
  }
}

if (
  root.version !==
    expected.version ||
  root.packageManager !==
    `pnpm@${expected.pnpm}` ||
  root.engines?.node !==
    ">=26.5.1 <27" ||
  root.engines?.pnpm !==
    ">=11.18.0 <12"
) {
  failures.push(
    "toolchain:root-package",
  );
}

if (
  toolchain.version !==
    expected.version ||
  toolchain.canonical !==
    true ||
  toolchain.node?.version !==
    expected.node ||
  toolchain.nvm?.version !==
    expected.nvm ||
  toolchain.npm?.version !==
    expected.npm ||
  toolchain.pnpm?.version !==
    expected.pnpm
) {
  failures.push(
    "toolchain:config",
  );
}

for (const [key, value] of Object.entries({
  node:
    expected.node,
  nvm:
    expected.nvm,
  npm:
    expected.npm,
  pnpm:
    expected.pnpm,
  typescript:
    expected.typescript,
})) {
  if (
    stack.toolchain?.[
      key
    ] !== value
  ) {
    failures.push(
      `toolchain:stack:${key}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length ===
    0,
  version:
    "1.0.0",
  canonical:
    true,
  node:
    expected.node,
  nvm:
    expected.nvm,
  npm:
    expected.npm,
  pnpm:
    expected.pnpm,
  typescript:
    expected.typescript,
  exactNodeVersionFiles:
    true,
  workspaceNodeEngineParity:
    true,
  corepackBundledWithNode:
    false,
  noFabricatedLockfile:
    !fs.existsSync(
      "pnpm-lock.yaml",
    ),
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
