import test from "node:test";
import assert from "node:assert/strict";
import {
  parsePwrcAmount,
  formatPwrcAmount,
} from "../packages/native-token-client/src/amounts.js";
import {
  calculateTransferFeeBaseUnits,
} from "../packages/native-token-client/src/fees.js";
import {
  createSolanaToSuiBridgeIntent,
} from "../packages/native-token-client/src/bridge/index.js";
import {
  PWRC_TRANSFER_FEE_BPS,
  PWRC_DECIMALS,
  WPWRC_DECIMALS,
  PWRC_CANONICAL_MINT_ADDRESS,
} from "../packages/native-token-client/src/constants.js";

test("client uses 9 decimals on both chains", () => {
  assert.equal(PWRC_DECIMALS, 9);
  assert.equal(WPWRC_DECIMALS, 9);
});

test("client uses canonical 250 bps Token-2022 fee", () => {
  assert.equal(PWRC_TRANSFER_FEE_BPS, 250);
  assert.equal(
    calculateTransferFeeBaseUnits(
      1_000_000_000n,
    ),
    25_000_000n,
  );
});

test("client uses supplied canonical mint", () => {
  assert.equal(
    PWRC_CANONICAL_MINT_ADDRESS,
    "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
  );
});

test("exact amount parse/format remains bigint safe", () => {
  const value =
    parsePwrcAmount("1.000000001");
  assert.equal(value, 1_000_000_001n);
  assert.equal(
    formatPwrcAmount(value),
    "1.000000001",
  );
});

test("Solana to Sui bridge mints net locked amount", () => {
  const intent =
    createSolanaToSuiBridgeIntent({
      canonicalAmountBaseUnits:
        1_000_000_000n,
      recipientSuiAddress:
        "0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1",
    });

  assert.equal(
    intent.transferFeeBaseUnits,
    25_000_000n,
  );
  assert.equal(
    intent.wrappedAmountBaseUnits,
    975_000_000n,
  );
});
