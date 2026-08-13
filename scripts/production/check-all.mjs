import {
  atomicWriteJsonSync,
} from "../../packages/runtime/src/atomic-json.mjs";
import {
  runCommandSync,
} from "../../packages/runtime/src/process.mjs";

const checks = [
  "scripts/production/check-platform-bootstrap.mjs",
  "scripts/production/test-portable-production-checks.mjs",
  "scripts/production/check-regression-fixtures.mjs",
  "scripts/production/check-docs.mjs",
  "scripts/production/check-docs-app.mjs",
  "scripts/production/test-docs-app.mjs",
  "scripts/production/check-fullstack.mjs",
  "scripts/production/check-fullstack-supervisor.mjs",
  "scripts/production/test-fullstack-ports.mjs",
  "scripts/production/test-fullstack-runtime.mjs",
  "scripts/production/check-security-hardening.mjs",
  "scripts/production/test-root-security.mjs",
  "scripts/production/check-root-platform.mjs",
  "scripts/production/check-root-utils.mjs",
  "scripts/production/check-config-registry.mjs",
  "scripts/production/check-utility-duplication.mjs",
  "scripts/production/check-mainnet-release.mjs",
  "scripts/production/check-relayer-durability.mjs",
  "scripts/production/check-runtime-hardening.mjs",
  "scripts/production/check-typescript-regressions.mjs",
  "scripts/production/check-doctor-portability.mjs",
  "scripts/packages/check-pnpm-build-policy.mjs",
  "scripts/security/check-dependency-security.mjs",
  "scripts/packages/check-monorepo-layout.mjs",
  "scripts/telemetry/check-disabled.mjs",
  "scripts/production/check-source-hazards.mjs",
  "scripts/operations/check-runbook.mjs",
  "scripts/production/check-handlers.mjs",
  "scripts/production/check-transactions.mjs",
  "scripts/production/check-runtime-config.mjs",
  "scripts/token/check-program.mjs",
  "scripts/token/check-manifest.mjs",
  "scripts/idl/check-token-program.mjs",
  "scripts/security/check-wpwrc-spec.mjs",
  "scripts/security/check-transfer-fee.mjs",
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
  "scripts/metadata/check-assets.mjs",
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
  const run =
    runCommandSync({
      command:
        process.execPath,
      args: [script],
      allowFailure: true,
      timeoutMs:
        120_000,
      maxOutputBytes:
        2_000_000,
    });

  let parsed = null;

  try {
    parsed =
      JSON.parse(
        run.stdout.trim(),
      );
  } catch {
    // Some legacy checks still use human-readable stdout.
  }

  results.push({
    script,
    ok:
      run.ok,
    status:
      run.status,
    result:
      parsed,
    stdout:
      parsed
        ? undefined
        : run.stdout.trim() ||
          undefined,
    stderr:
      run.stderr.trim() ||
      undefined,
    signal:
      run.signal,
  });
}

const failures =
  results
    .filter(
      (result) =>
        !result.ok,
    )
    .map(
      (result) =>
        result.script,
    );

const report = {
  ok:
    failures.length === 0,
  version: "1.0.0",
  checks:
    results.length,
  passed:
    results.length -
    failures.length,
  failed:
    failures.length,
  failures,
  results,
};

atomicWriteJsonSync(
  "reports/production-static-validation.json",
  report,
);

console.log(
  JSON.stringify({
    ok:
      report.ok,
    version:
      report.version,
    checks:
      report.checks,
    passed:
      report.passed,
    failed:
      report.failed,
    failures:
      report.failures,
  }, null, 2),
);

if (failures.length) {
  process.exit(1);
}
