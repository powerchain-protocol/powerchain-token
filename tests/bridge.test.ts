import test from "node:test";
import assert from "node:assert/strict";
import {
  assertBridgeConservation,
  bridgeConservationState,
  quoteSolanaToSuiBridge,
  quoteSuiToSolanaBridge,
} from "../packages/protocol/src/bridge.js";

test(
  "Solana to Sui mints net locked PWRC",
  () => {
    const q =
      quoteSolanaToSuiBridge(
        1_000n *
          1_000_000_000n,
      );

    assert.equal(
      q.wrappedMintBaseUnits,
      q.canonicalLockedBaseUnits,
    );
    assert.equal(
      q.nativeTransferFeeBaseUnits,
      25n *
        1_000_000_000n,
    );
  },
);

test(
  "Sui to Solana burns 1:1 principal before destination Token-2022 fee",
  () => {
    const q =
      quoteSuiToSolanaBridge(
        1_000n *
          1_000_000_000n,
      );

    assert.equal(
      q.wrappedBurnBaseUnits,
      1_000n *
        1_000_000_000n,
    );
    assert.equal(
      q.canonicalReleaseGrossBaseUnits,
      q.wrappedBurnBaseUnits,
    );
    assert.equal(
      q.destinationNativeTransferFeeBaseUnits,
      25n *
        1_000_000_000n,
    );
    assert.equal(
      q.canonicalRecipientNetBaseUnits,
      975n *
        1_000_000_000n,
    );
  },
);

test(
  "bridge conservation includes pending directions",
  () => {
    const state =
      bridgeConservationState({
        canonicalLockedBaseUnits:
          1_000n,
        wrappedSupplyBaseUnits:
          900n,
        pendingSolanaToSuiBaseUnits:
          50n,
        pendingSuiToSolanaBaseUnits:
          25n,
      });

    assert.equal(
      state.effectiveWrappedExposureBaseUnits,
      925n,
    );
    assert.equal(
      state.availableBackingBaseUnits,
      75n,
    );
  },
);

test(
  "bridge rejects pending burn larger than wrapped supply",
  () => {
    assert.throws(
      () =>
        assertBridgeConservation({
          canonicalLockedBaseUnits:
            100n,
          wrappedSupplyBaseUnits:
            50n,
          pendingSuiToSolanaBaseUnits:
            51n,
        }),
      /PWRC_BRIDGE_PENDING_BURN_EXCEEDS_WRAPPED_SUPPLY/,
    );
  },
);

test(
  "bridge rejects undercollateralized wrapped exposure",
  () => {
    assert.throws(
      () =>
        assertBridgeConservation({
          canonicalLockedBaseUnits:
            99n,
          wrappedSupplyBaseUnits:
            100n,
        }),
      /PWRC_BRIDGE_UNDERCOLLATERALIZED/,
    );
  },
);
