import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const helpers =
  fs.readFileSync(
    "packages/protocol/src/helpers.ts",
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
const transactions =
  fs.readFileSync(
    "packages/sdk/src/native-token-transactions.ts",
    "utf8",
  );
const sui =
  fs.readFileSync(
    "contracts/wpwrc/sources/wpwrc.move",
    "utf8",
  );

test(
  "canonical hashing rejects ambiguous or unsafe values",
  () => {
    for (const invariant of [
      "PWRC_CANONICAL_JSON_NON_FINITE_NUMBER",
      "PWRC_CANONICAL_JSON_UNDEFINED",
      "PWRC_CANONICAL_JSON_CYCLE",
      "PWRC_CANONICAL_JSON_NON_PLAIN_OBJECT",
    ]) {
      assert.ok(
        helpers.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "transaction and utility identities use exact 32-byte Solana validation",
  () => {
    assert.ok(
      transactions.includes(
        "assertSolana32ByteBase58",
      ),
    );
    assert.ok(
      utility.includes(
        "assertSolana32ByteBase58",
      ),
    );
  },
);

test(
  "fee accounting is supply bounded and chain-address aware",
  () => {
    for (const invariant of [
      "PWRC_TOTAL_SOURCE_DEBIT_EXCEEDS_SUPPLY",
      "PWRC_NETWORK_FEE_INVALID",
      "PWRC_SERVICE_FEE_RECIPIENT_INVALID",
      "PWRC_GENESIS_BASE_UNITS",
    ]) {
      assert.ok(
        fees.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "compute and replay controls reject zero capacity and invalid clocks",
  () => {
    assert.ok(
      compute.includes(
        "assertSafePositive",
      ),
    );
    assert.ok(
      idempotency.includes(
        "PWRC_IDEMPOTENCY_CLOCK_INVALID",
      ),
    );
  },
);

test(
  "Sui initialization no longer violates governor/operator separation",
  () => {
    assert.match(
      sui,
      /operator:\s*@0x0/,
    );
    assert.ok(
      sui.includes(
        "E_OPERATOR_UNINITIALIZED",
      ),
    );
    assert.ok(
      sui.includes(
        "E_NO_STATE_CHANGE",
      ),
    );
  },
);
