import test from "node:test";
import assert from "node:assert/strict";
import {
  parsePwrcAmount,
  formatPwrcAmount,
} from "../packages/native-token-client/src/amounts.js";
import {
  PWRC_TRANSFER_FEE_BPS,
  PWRC_DECIMALS,
  WPWRC_DECIMALS,
} from "../packages/native-token-client/src/constants.js";
import {
  createSolanaToSuiBridgeIntent,
} from "../packages/native-token-client/src/bridge/index.js";

test("native client canonical profile", () => {
  assert.equal(PWRC_DECIMALS, 9);
  assert.equal(WPWRC_DECIMALS, 9);
  assert.equal(PWRC_TRANSFER_FEE_BPS, 250);
});

test("amount exactness", () => {
  const value = parsePwrcAmount("1.000000001");
  assert.equal(value, 1_000_000_001n);
  assert.equal(
    formatPwrcAmount(value),
    "1.000000001",
  );
});

test("Solana-to-Sui bridge intent uses fee-adjusted backing", () => {
  const intent =
    createSolanaToSuiBridgeIntent({
      canonicalAmountBaseUnits:
        1_000_000_000n,
      recipientSuiAddress:
        "0x" + "1".repeat(64),
    });

  assert.equal(
    intent.canonicalGrossAmountBaseUnits,
    1_000_000_000n,
  );
  assert.equal(
    intent.transferFeeBaseUnits,
    25_000_000n,
  );
  assert.equal(
    intent.canonicalLockedBaseUnits,
    975_000_000n,
  );
  assert.equal(
    intent.wrappedAmountBaseUnits,
    975_000_000n,
  );
});
