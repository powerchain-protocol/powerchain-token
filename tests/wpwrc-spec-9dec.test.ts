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

test("PWRC and wPWRC use identical 9-decimal base units", () => {
  assert.equal(PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT, 1n);
  assert.equal(
    canonicalToWrappedExact(1_000_000_000n),
    1_000_000_000n,
  );
  assert.equal(
    wrappedToCanonical(1_000_000_000n),
    1_000_000_000n,
  );
});

test("minimal Token-2022 profile excludes transfer fees", () => {
  assert.doesNotThrow(() =>
    validateCanonicalPwrcToken2022Profile({
      enabledExtensions: ["MetadataPointer", "TokenMetadata"],
    }),
  );

  assert.throws(
    () =>
      validateCanonicalPwrcToken2022Profile({
        enabledExtensions: [
          "MetadataPointer",
          "TokenMetadata",
          "TransferFeeConfig",
        ],
      }),
    /PWRC_FORBIDDEN_EXTENSION_ENABLED/,
  );
});
