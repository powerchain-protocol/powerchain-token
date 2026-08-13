import fs from "node:fs";
import {
  runCommandSync,
} from "../../packages/runtime/src/process.mjs";

const checks = [
  "scripts/production/check-all.mjs",
  "scripts/release/verify-provenance.mjs",
  "scripts/mainnet/verify-build-manifest.mjs",
  "scripts/mainnet/verify-evidence.mjs",
  "scripts/mainnet/verify-evidence-bindings.mjs",
  "scripts/mainnet/verify-release-authorization.mjs",
  "scripts/mainnet/check-release-authorization-unused.mjs",
  "scripts/mainnet/status.mjs",
];

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

  if (run.stdout) {
    process.stdout.write(
      run.stdout,
    );
  }

  if (run.stderr) {
    process.stderr.write(
      run.stderr,
    );
  }

  if (!run.ok) {
    process.exit(
      run.status ?? 1,
    );
  }
}

const report =
  JSON.parse(
    fs.readFileSync(
      "reports/mainnet-status.json",
      "utf8",
    ),
  );

if (
  report.readyForMainnet !==
    true ||
  report.releaseState !==
    "AUTHORIZED" ||
  report.authorizationConsumed !==
    false
) {
  console.error(
    "PWRC_MAINNET_PREFLIGHT_BLOCKED",
  );
  process.exit(2);
}

const proof =
  runCommandSync({
    command:
      process.execPath,
    args: [
      "scripts/mainnet/write-preflight-proof.mjs",
    ],
    allowFailure: true,
    timeoutMs:
      30_000,
    maxOutputBytes:
      500_000,
  });

if (proof.stdout) {
  process.stdout.write(
    proof.stdout,
  );
}

if (proof.stderr) {
  process.stderr.write(
    proof.stderr,
  );
}

if (!proof.ok) {
  process.exit(
    proof.status ?? 1,
  );
}

console.log(
  "PWRC_MAINNET_PREFLIGHT_PASS",
);
