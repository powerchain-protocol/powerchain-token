import fs from "node:fs";

const failures = [];
const receipt = fs.readFileSync(
  "src/bridge/receipt.ts",
  "utf8",
);
const reconcile = fs.readFileSync(
  "src/bridge/reconcile.ts",
  "utf8",
);
const lock = fs.readFileSync(
  "programs/pwrc-lock/src/lib.rs",
  "utf8",
);

if (
  !receipt.includes(
    "calculateToken2022TransferFeeBaseUnits",
  )
) {
  failures.push(
    "receipt:fee-adjusted-lock-check",
  );
}

if (
  reconcile.includes("* 1_000n") ||
  reconcile.includes("/ 1_000n")
) {
  failures.push(
    "reconcile:stale-decimal-conversion",
  );
}

for (const required of [
  "PWRC_TRANSFER_FEE_BASIS_POINTS: u16 = 250",
  "PWRC_MAXIMUM_TRANSFER_FEE_BASE_UNITS",
  "calculate_transfer_fee_base_units",
  "wrapped_amount_base_units",
]) {
  if (!lock.includes(required)) {
    failures.push(
      `pwrc-lock:${required}`,
    );
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  upgrade:
    "9-decimal-fee-aware-bridge",
  transferFeeBasisPoints: 250,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
