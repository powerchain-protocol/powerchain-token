import fs from "node:fs";
import { spawnSync } from "node:child_process";

const checks = [
  "scripts/security/check-wpwrc-spec.mjs",
  "scripts/security/check-no-transfer-fee.mjs",
  "scripts/production/check-stale-model.mjs",
  "scripts/production/check-sui-capability.mjs",
  "scripts/production/check-solana-program.mjs",
  "scripts/production/check-client-bridge.mjs",
  "scripts/integration/check.mjs",
  "scripts/security/check-model.mjs",
  "scripts/security/check-programs.mjs",
  "scripts/security/check-bridge-intent.mjs",
  "scripts/bridge/check-upgrade.mjs",
  "scripts/relayer/check.mjs",
  "scripts/optimization/check.mjs",
  "scripts/optimization/check-v2.mjs",
  "scripts/burn/check-epoch.mjs",
  "scripts/burn/check-quarterly.mjs",
  "scripts/burn/check-race-protection.mjs",
  "scripts/release/check-bridge-release.mjs",
  "scripts/metadata/validate-token-metadata.mjs",
  "scripts/metadata/check-official-links.mjs",
  "scripts/metadata/check-manifest.mjs",
  "scripts/sui/check-zero-genesis.mjs",
  "scripts/sui/check-networks.mjs",
  "scripts/native-token-client/check-v2.mjs",
  "scripts/packages/check-workspace.mjs",
  "scripts/packages/check-exports.mjs",
  "scripts/packages/check-tsconfig.mjs",
  "scripts/packages/check-scripts.mjs",
  "scripts/security/check-manifests.mjs",
];

const results = [];
for (const script of checks) {
  const run = spawnSync(
    process.execPath,
    [script],
    { encoding: "utf8" },
  );

  let parsed = null;
  try {
    parsed = JSON.parse(run.stdout.trim());
  } catch {
    // Some older repository checks may emit valid human-readable output.
  }

  results.push({
    script,
    ok: run.status === 0,
    status: run.status,
    result: parsed,
    stdout: parsed ? undefined : run.stdout.trim(),
    stderr: run.stderr.trim() || undefined,
  });
}

const failures = results
  .filter((result) => !result.ok)
  .map((result) => result.script);

const report = {
  ok: failures.length === 0,
  version: "1.0.0",
  checks: results.length,
  passed: results.length - failures.length,
  failed: failures.length,
  failures,
  results,
};

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync(
  "reports/production-static-validation.json",
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(JSON.stringify({
  ok: report.ok,
  version: report.version,
  checks: report.checks,
  passed: report.passed,
  failed: report.failed,
  failures: report.failures,
}, null, 2));

if (failures.length) process.exit(1);
