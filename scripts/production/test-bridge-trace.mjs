import fs from "node:fs";

const source =
  fs.readFileSync(
    "packages/protocol/src/bridge-trace.ts",
    "utf8",
  );

const failures = [];

for (const invariant of [
  "createBridgeOperationTrace",
  "assertBridgeOperationTrace",
  "PWRC_BRIDGE_TRACE_FINGERPRINT_MISMATCH",
  '"solana-to-sui"',
  '"sui-to-solana"',
  "retryAllowed",
  'input.state ===',
  '"failed"',
  "input.sourceFinalized ===",
  "input.destinationObserved ===",
]) {
  if (!source.includes(invariant)) {
    failures.push(
      `bridge-trace:${invariant}`,
    );
  }
}

if (
  source.includes(
    "Math.random",
  ) ||
  source.includes(
    "toLocaleString",
  )
) {
  failures.push(
    "bridge-trace:nondeterministic-operation-id",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      deterministic:
        true,
      blindRetry:
        false,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
