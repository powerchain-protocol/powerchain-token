import test from "node:test";
import assert from "node:assert/strict";
import {
  assertCanonicalPwrcBaseUnitsString,
  formatPwrcBaseUnits,
  parsePwrcTokensToBaseUnits,
} from "../packages/protocol/src/token-amount.js";

test(
  "PWRC token amounts round-trip exactly without floating point",
  () => {
    for (const [tokens, baseUnits] of [
      ["0", 0n],
      ["0.000000001", 1n],
      ["1", 1_000_000_000n],
      ["40000000", 40_000_000_000_000_000n],
      ["18446000000", 18_446_000_000_000_000_000n],
    ] as const) {
      assert.equal(
        parsePwrcTokensToBaseUnits(
          tokens,
        ),
        baseUnits,
      );
      assert.equal(
        formatPwrcBaseUnits(
          baseUnits,
        ),
        tokens,
      );
    }
  },
);

test(
  "PWRC amount parsing rejects excess precision and supply overflow",
  () => {
    assert.throws(
      () =>
        parsePwrcTokensToBaseUnits(
          "0.0000000001",
        ),
      /PWRC_AMOUNT_PRECISION_EXCEEDED/,
    );
    assert.throws(
      () =>
        parsePwrcTokensToBaseUnits(
          "18446000000.000000001",
        ),
      /PWRC_AMOUNT_EXCEEDS_SUPPLY/,
    );
    assert.throws(
      () =>
        assertCanonicalPwrcBaseUnitsString(
          "01",
        ),
      /PWRC_BASE_UNITS_ENCODING_INVALID/,
    );
  },
);
