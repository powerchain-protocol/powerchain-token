import test from "node:test";
import assert from "node:assert/strict";
import {
  nativePwrcTransferPreview,
  PWRC_FORBIDDEN_TOKEN_2022_EXTENSIONS,
  PWRC_REQUIRED_TOKEN_2022_EXTENSIONS,
  verifyNativePwrcMintObservation,
  verifyNativePwrcTransferFeeAuthorities,
} from "../packages/protocol/src/native-token.js";
import {
  PWRC_CANONICAL_MINT,
  PWRC_GENESIS_BASE_UNITS,
  PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
  PWRC_METADATA_URI,
  PWRC_TRANSFER_FEE_BPS,
  PWRC_TRANSFER_FEE_CAP_START_BASE_UNITS,
  SOLANA_TOKEN_2022_PROGRAM_ID,
} from "../packages/protocol/src/constants.js";

function canonicalObservation() {
  return {
    mint:
      PWRC_CANONICAL_MINT,
    ownerProgramId:
      SOLANA_TOKEN_2022_PROGRAM_ID,
    decimals:
      9,
    supplyBaseUnits:
      PWRC_GENESIS_BASE_UNITS,
    mintAuthority:
      null,
    freezeAuthority:
      null,
    extensions:
      [...PWRC_REQUIRED_TOKEN_2022_EXTENSIONS],
    transferFeeBasisPoints:
      PWRC_TRANSFER_FEE_BPS,
    maximumTransferFeeBaseUnits:
      PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
    transferFeeConfigAuthority:
      null,
    withdrawWithheldAuthority:
      null,
    metadataPointer:
      PWRC_CANONICAL_MINT,
    metadataName:
      "PowerChain",
    metadataSymbol:
      "PWRC",
    metadataUri:
      PWRC_METADATA_URI,
  };
}

test(
  "canonical native PWRC observation verifies",
  () => {
    const result =
      verifyNativePwrcMintObservation(
        canonicalObservation(),
      );

    assert.equal(
      result.valid,
      true,
    );
    assert.deepEqual(
      result.failures,
      [],
    );
  },
);

test(
  "native PWRC verifier rejects wrong owner and forbidden extension",
  () => {
    const result =
      verifyNativePwrcMintObservation({
        ...canonicalObservation(),
        ownerProgramId:
          "11111111111111111111111111111111",
        extensions: [
          ...PWRC_REQUIRED_TOKEN_2022_EXTENSIONS,
          PWRC_FORBIDDEN_TOKEN_2022_EXTENSIONS[0],
        ],
      });

    assert.equal(
      result.valid,
      false,
    );
    assert.ok(
      result.failures.includes(
        "PWRC_NATIVE_TOKEN_PROGRAM_MISMATCH",
      ),
    );
    assert.ok(
      result.failures.includes(
        "PWRC_NATIVE_EXTENSION_FORBIDDEN:PermanentDelegate",
      ),
    );
  },
);

test(
  "native PWRC fee reaches exact configured cap threshold",
  () => {
    const below =
      nativePwrcTransferPreview(
        PWRC_TRANSFER_FEE_CAP_START_BASE_UNITS -
          1n,
      );
    const atCap =
      nativePwrcTransferPreview(
        PWRC_TRANSFER_FEE_CAP_START_BASE_UNITS,
      );
    const above =
      nativePwrcTransferPreview(
        PWRC_TRANSFER_FEE_CAP_START_BASE_UNITS +
          1n,
      );

    assert.equal(
      below.feeCapped,
      false,
    );
    assert.equal(
      atCap.nativeTransferFeeBaseUnits,
      PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
    );
    assert.equal(
      atCap.feeCapped,
      true,
    );
    assert.equal(
      above.nativeTransferFeeBaseUnits,
      PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
    );
  },
);

test(
  "native PWRC transfer preview preserves gross equals fee plus net",
  () => {
    const preview =
      nativePwrcTransferPreview(
        1_000n *
          1_000_000_000n,
      );

    assert.equal(
      preview.nativeTransferFeeBaseUnits,
      25n *
        1_000_000_000n,
    );
    assert.equal(
      preview.grossBaseUnits,
      preview.nativeTransferFeeBaseUnits +
        preview.netBaseUnits,
    );
  },
);


test(
  "rejects unknown or duplicate Token-2022 extensions",
  () => {
    const unexpected =
      verifyNativePwrcMintObservation({
        ...canonicalObservation(),
        extensions: [
          ...PWRC_REQUIRED_TOKEN_2022_EXTENSIONS,
          "ConfidentialTransferMint",
        ],
      });

    assert.equal(
      unexpected.valid,
      false,
    );
    assert.ok(
      unexpected.failures.includes(
        "PWRC_NATIVE_EXTENSION_UNEXPECTED:ConfidentialTransferMint",
      ),
    );

    const duplicate =
      verifyNativePwrcMintObservation({
        ...canonicalObservation(),
        extensions: [
          ...PWRC_REQUIRED_TOKEN_2022_EXTENSIONS,
          "TokenMetadata",
        ],
      });

    assert.equal(
      duplicate.valid,
      false,
    );
    assert.ok(
      duplicate.failures.includes(
        "PWRC_NATIVE_EXTENSION_DUPLICATE",
      ),
    );
  },
);


test(
  "transfer fee authority verification is explicit and fail closed",
  () => {
    const observation =
      canonicalObservation();

    const revoked =
      verifyNativePwrcTransferFeeAuthorities(
        observation,
        {
          transferFeeConfigAuthority:
            null,
          withdrawWithheldAuthority:
            null,
        },
      );

    assert.equal(
      revoked.valid,
      true,
    );

    const mismatched =
      verifyNativePwrcTransferFeeAuthorities(
        {
          ...observation,
          transferFeeConfigAuthority:
            "11111111111111111111111111111111",
        },
        {
          transferFeeConfigAuthority:
            null,
          withdrawWithheldAuthority:
            null,
        },
      );

    assert.equal(
      mismatched.valid,
      false,
    );
    assert.ok(
      mismatched.failures.includes(
        "PWRC_NATIVE_TRANSFER_FEE_CONFIG_AUTHORITY_MISMATCH",
      ),
    );
  },
);
