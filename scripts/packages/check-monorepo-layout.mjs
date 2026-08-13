import fs from "node:fs";

const failures = [];

const requiredApps = [
  ["apps/api/package.json", "@powerchain/api"],
  ["apps/client/package.json", "@powerchain/client"],
  ["apps/docs/package.json", "@powerchain/docs"],
];

const requiredPackages = [
  ["packages/protocol/package.json", "@powerchain/protocol"],
  ["packages/sdk/package.json", "@powerchain/sdk"],
  ["packages/runtime/package.json", "@powerchain/runtime"],
  ["packages/native-token-client/package.json", "@powerchain/native-token-client"],
  ["packages/bridge-integration/package.json", "@powerchain/bridge-integration"],
  ["packages/docs-ui/package.json", "@powerchain/docs-ui"],
  ["packages/docs-content/package.json", "@powerchain/docs-content"],
];

for (const [file, expectedName] of [...requiredApps, ...requiredPackages]) {
  if (!fs.existsSync(file)) {
    failures.push(`missing:${file}`);
    continue;
  }

  const pkg = JSON.parse(fs.readFileSync(file, "utf8"));

  if (pkg.name !== expectedName) {
    failures.push(`package-name:${file}:${pkg.name}`);
  }

  if (pkg.version !== "1.0.0") {
    failures.push(`package-version:${file}:${pkg.version}`);
  }
}

for (const staleRoot of [
  "src",
  "client",
  "utils",
  "components",
  "sessions",
]) {
  if (fs.existsSync(staleRoot)) {
    failures.push(`stale-root-source:${staleRoot}`);
  }
}

const workspace = fs.readFileSync("pnpm-workspace.yaml", "utf8");

for (const pattern of [
  '"apps/*"',
  '"packages/*"',
]) {
  if (!workspace.includes(pattern)) {
    failures.push(`workspace-pattern:${pattern}`);
  }
}

const rootPackage = JSON.parse(fs.readFileSync("package.json", "utf8"));

if (
  rootPackage.name !== "@powerchain/pwrc" ||
  rootPackage.version !== "1.0.0" ||
  rootPackage.private !== true
) {
  failures.push("root-package-policy");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  apps: requiredApps.length,
  packages: requiredPackages.length,
  rootSourceDirectoriesRemoved: true,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
