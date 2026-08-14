import fs from "node:fs";

const failures = [];

const validate =
  fs.readFileSync(
    "env/validate.ts",
    "utf8",
  );
const environment =
  fs.readFileSync(
    "env/index.ts",
    "utf8",
  );
const review =
  fs.readFileSync(
    "packages/sdk/src/transaction-review.ts",
    "utf8",
  );

if (
  /loaded\.serviceFee\.recipient\b/.test(
    validate,
  )
) {
  failures.push(
    "service-fee-shape:stale-recipient-property",
  );
}

for (const invariant of [
  "loaded.serviceFee.sourceDebits.solana.recipient",
  "loaded.serviceFee.sourceDebits.sui.recipient",
]) {
  if (!validate.includes(invariant)) {
    failures.push(
      `service-fee-shape:validator:${invariant}`,
    );
  }
}

for (const invariant of [
  "serviceFeeSourceDebitFor",
  "PowerChainServiceFeeSourceChain",
]) {
  if (!environment.includes(invariant)) {
    failures.push(
      `service-fee-shape:environment:${invariant}`,
    );
  }
}

for (const invariant of [
  'serviceFeeSourceChain === "sui"',
  '"Sui Coin"',
  '"Token-2022"',
  '"powerchain-service-fee-source-debit"',
]) {
  if (!review.includes(invariant)) {
    failures.push(
      `service-fee-shape:review:${invariant}`,
    );
  }
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      model:
        "chain-specific-source-debits",
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
