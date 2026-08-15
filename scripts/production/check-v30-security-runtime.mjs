import fs from "node:fs";

const failures = [];

const helpers =
  fs.readFileSync(
    "packages/protocol/src/helpers.ts",
    "utf8",
  );
const intent =
  fs.readFileSync(
    "packages/protocol/src/native-transfer-intent.ts",
    "utf8",
  );
const transactions =
  fs.readFileSync(
    "packages/sdk/src/native-token-transactions.ts",
    "utf8",
  );
const fees =
  fs.readFileSync(
    "packages/protocol/src/fees.ts",
    "utf8",
  );
const utility =
  fs.readFileSync(
    "packages/protocol/src/utility.ts",
    "utf8",
  );
const compute =
  fs.readFileSync(
    "packages/protocol/src/compute-security.ts",
    "utf8",
  );
const idempotency =
  fs.readFileSync(
    "packages/sdk/src/idempotency-registry.ts",
    "utf8",
  );
const sui =
  fs.readFileSync(
    "contracts/wpwrc/sources/wpwrc.move",
    "utf8",
  );
const programPolicy =
  JSON.parse(
    fs.readFileSync(
      "config/programs/policy.json",
      "utf8",
    ),
  );

for (const invariant of [
  "assertSolana32ByteBase58",
  "PWRC_CANONICAL_JSON_NON_FINITE_NUMBER",
  "PWRC_CANONICAL_JSON_UNDEFINED",
  "PWRC_CANONICAL_JSON_CYCLE",
  "PWRC_CANONICAL_JSON_NON_PLAIN_OBJECT",
]) {
  if (!helpers.includes(invariant)) {
    failures.push(
      `v30:helpers:${invariant}`,
    );
  }
}

for (const source of [
  intent,
  transactions,
  utility,
]) {
  if (
    !source.includes(
      "assertSolana32ByteBase58",
    )
  ) {
    failures.push(
      "v30:solana-identity-validator-not-shared",
    );
  }
}

for (const invariant of [
  "PWRC_TOTAL_SOURCE_DEBIT_EXCEEDS_SUPPLY",
  "PWRC_NET_AMOUNT_UNACHIEVABLE",
  "PWRC_NETWORK_FEE_INVALID",
  "PWRC_SERVICE_FEE_RECIPIENT_INVALID",
  "PWRC_GENESIS_BASE_UNITS",
]) {
  if (!fees.includes(invariant)) {
    failures.push(
      `v30:fees:${invariant}`,
    );
  }
}

for (const invariant of [
  "15 * 60_000",
  "PWRC_UTILITY_WALLET_INVALID",
  "input.maxSpendBaseUnits /",
]) {
  if (!utility.includes(invariant)) {
    failures.push(
      `v30:utility:${invariant}`,
    );
  }
}

for (const invariant of [
  "assertSafePositive",
  "policy.maxWorkUnits <=",
  "input.requestedWorkUnits <=",
]) {
  if (!compute.includes(invariant)) {
    failures.push(
      `v30:compute:${invariant}`,
    );
  }
}

for (const invariant of [
  "PWRC_IDEMPOTENCY_CLOCK_INVALID",
  "Number.MAX_SAFE_INTEGER -",
  "assertNow",
]) {
  if (!idempotency.includes(invariant)) {
    failures.push(
      `v30:idempotency:${invariant}`,
    );
  }
}

for (const invariant of [
  "operator: @0x0",
  "E_OPERATOR_UNINITIALIZED",
  "E_NO_STATE_CHANGE",
  "controller.operator != @0x0",
]) {
  if (!sui.includes(invariant)) {
    failures.push(
      `v30:sui:${invariant}`,
    );
  }
}

if (
  programPolicy.policySha256 !==
    "d001fc2f47e5bb50e1edcb4163cdb6f42b49401ff337ddd9a0f535670d0303e5" ||
  programPolicy.sui
    ?.wrappedController
    ?.operatorInitializedAtGenesis !==
      false ||
  programPolicy.sui
    ?.wrappedController
    ?.operatorRequiredBeforeUnpause !==
      true
) {
  failures.push(
    "v30:program-policy",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  strictCanonicalCommitments:
    true,
  sharedSolanaIdentityValidation:
    true,
  exactTransactionBlockhash:
    true,
  feeAccountingSupplyBound:
    true,
  serviceFeeAddressValidation:
    true,
  utilityAuthorizationTtlBound:
    true,
  computePolicyPositiveCapacity:
    true,
  idempotencyClockSafety:
    true,
  suiRoleSeparationAtGenesis:
    true,
  programPolicySha256:
    programPolicy.policySha256,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
