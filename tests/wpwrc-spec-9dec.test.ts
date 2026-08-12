import test from "node:test";
import assert from "node:assert/strict";
import {
  canonicalToWrappedExact,
  wrappedToCanonical,
  PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT,
} from "../src/common/token-units.js";
import {
  validateCanonicalPwrcToken2022Profile,
} from "../src/security/token2022-profile.js";

test("PWRC and wPWRC share the same 9-decimal base-unit scale", () => {
  assert.equal(
    PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT,
    1n,
  );
  assert.equal(
    canonicalToWrappedExact(
      1_000_000_000n,
    ),
    1_000_000_000n,
  );
  assert.equal(
    wrappedToCanonical(
      1_000_000_000n,
    ),
    1_000_000_000n,
  );
});

test("canonical Token-2022 profile requires transfer fee + metadata", () => {
  assert.doesNotThrow(() =>
    validateCanonicalPwrcToken2022Profile({
      enabledExtensions: [
        "TransferFeeConfig",
        "MetadataPointer",
        "TokenMetadata",
      ],
      transferFeeBasisPoints: 250,
      maximumTransferFeeBaseUnits:
        1_000_000_000_000_000n,
    }),
  );
});
