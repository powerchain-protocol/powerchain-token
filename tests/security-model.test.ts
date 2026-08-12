import test from "node:test";
import assert from "node:assert/strict";
import {
  validateCanonicalPwrcToken2022Profile,
} from "../src/security/token2022-profile.js";

test("canonical extensions require native transfer fee + metadata", () => {
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

  assert.throws(
    () =>
      validateCanonicalPwrcToken2022Profile({
        enabledExtensions: [
          "MetadataPointer",
          "TokenMetadata",
        ],
      }),
    /PWRC_REQUIRED_EXTENSION_MISSING:TransferFeeConfig/,
  );
});
