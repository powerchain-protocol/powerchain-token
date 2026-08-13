import { spawnSync } from "node:child_process";

const EXPECTED_NODE = "26.7.0";
const EXPECTED_PNPM = "10.21.0";

function run(command, args) {
  return spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function readVersion(command) {
  const result = run(command, ["--version"]);
  if (result.error || result.status !== 0) {
    return null;
  }
  return (
    result.stdout.trim() ||
    result.stderr.trim()
  );
}

if (process.versions.node !== EXPECTED_NODE) {
  console.error(
    `PWRC_NODE_VERSION_MISMATCH: expected ${EXPECTED_NODE}, got ${process.versions.node}`,
  );
  console.error(
    `Use .nvmrc/.node-version and activate Node ${EXPECTED_NODE} first.`,
  );
  process.exit(1);
}

let pnpm = readVersion("pnpm");

if (pnpm !== EXPECTED_PNPM) {
  const corepack = readVersion("corepack");

  if (!corepack) {
    console.error(
      "PWRC_COREPACK_UNAVAILABLE: install Corepack, then rerun setup.",
    );
    console.error(
      "npm install --global corepack@latest",
    );
    console.error("corepack enable");
    console.error(
      `corepack prepare pnpm@${EXPECTED_PNPM} --activate`,
    );
    process.exit(2);
  }

  const prepare = spawnSync(
    "corepack",
    [
      "prepare",
      `pnpm@${EXPECTED_PNPM}`,
      "--activate",
    ],
    { stdio: "inherit" },
  );

  if (prepare.status !== 0) {
    process.exit(prepare.status ?? 1);
  }

  pnpm = readVersion("pnpm");
}

if (pnpm !== EXPECTED_PNPM) {
  console.error(
    `PWRC_PNPM_VERSION_MISMATCH: expected ${EXPECTED_PNPM}, got ${pnpm ?? "unavailable"}`,
  );
  process.exit(3);
}

console.log(JSON.stringify({
  ok: true,
  version: "1.0.0",
  node: process.versions.node,
  pnpm,
  buildApprovalPolicy: "pnpm-workspace.yaml:onlyBuiltDependencies",
}, null, 2));
