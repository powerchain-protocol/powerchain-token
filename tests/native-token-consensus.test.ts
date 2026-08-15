import test from "node:test";
import assert from "node:assert/strict";
import {
  assertNativePwrcConsensus,
  evaluateNativePwrcConsensus,
  nativePwrcObservationFingerprint,
} from "../packages/protocol/src/native-token-consensus.js";
import {
  PWRC_REQUIRED_TOKEN_2022_EXTENSIONS,
} from "../packages/protocol/src/native-token.js";
import {
  PWRC_CANONICAL_MINT,
  PWRC_GENESIS_BASE_UNITS,
  PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
  PWRC_METADATA_URI,
  PWRC_TRANSFER_FEE_BPS,
  SOLANA_TOKEN_2022_PROGRAM_ID,
} from "../packages/protocol/src/constants.js";

const observation = {
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

const snapshots = [
  {
    observer:
      "primary-rpc",
    observedAt:
      "2026-08-15T00:00:00.000Z",
    slot:
      100n,
    observation,
  },
  {
    observer:
      "secondary-rpc",
    observedAt:
      "2026-08-15T00:00:00.000Z",
    slot:
      101n,
    observation: {
      ...observation,
      extensions: [
        "TokenMetadata",
        "TransferFeeConfig",
        "MetadataPointer",
      ],
    },
  },
] as const;

test(
  "native PWRC observation fingerprint normalizes extension order",
  () => {
    assert.equal(
      nativePwrcObservationFingerprint(
        snapshots[0].observation,
      ),
      nativePwrcObservationFingerprint(
        snapshots[1].observation,
      ),
    );
  },
);

test(
  "two independent matching observers reach consensus",
  () => {
    const result =
      evaluateNativePwrcConsensus(
        snapshots,
      );

    assert.equal(
      result.consensus,
      true,
    );
    assert.match(
      result.snapshotSha256 ?? "",
      /^[a-f0-9]{64}$/,
    );
    assert.equal(
      assertNativePwrcConsensus(
        snapshots,
      ),
      result.snapshotSha256,
    );
  },
);

test(
  "consensus detects supply divergence",
  () => {
    const result =
      evaluateNativePwrcConsensus([
        snapshots[0],
        {
          ...snapshots[1],
          observation: {
            ...observation,
            supplyBaseUnits:
              PWRC_GENESIS_BASE_UNITS -
              1n,
          },
        },
      ]);

    assert.equal(
      result.consensus,
      false,
    );
    assert.ok(
      result.failures.includes(
        "PWRC_NATIVE_CONSENSUS_OBSERVATION_MISMATCH",
      ),
    );
  },
);

test(
  "consensus requires independent observers",
  () => {
    const result =
      evaluateNativePwrcConsensus([
        snapshots[0],
        {
          ...snapshots[1],
          observer:
            "primary-rpc",
        },
      ]);

    assert.equal(
      result.consensus,
      false,
    );
    assert.ok(
      result.failures.some(
        (failure) =>
          failure.startsWith(
            "PWRC_NATIVE_CONSENSUS_DUPLICATE_OBSERVER:",
          ),
      ),
    );
  },
);


test(
  "consensus rejects matching but invalid canonical profiles",
  () => {
    const invalidObservation = {
      ...observation,
      supplyBaseUnits:
        PWRC_GENESIS_BASE_UNITS -
        1n,
    };

    const result =
      evaluateNativePwrcConsensus([
        {
          ...snapshots[0],
          observation:
            invalidObservation,
        },
        {
          ...snapshots[1],
          observation:
            invalidObservation,
        },
      ]);

    assert.equal(
      result.consensus,
      false,
    );
    assert.ok(
      result.failures.some(
        (failure) =>
          failure.startsWith(
            "PWRC_NATIVE_CONSENSUS_PROFILE_INVALID:primary-rpc:PWRC_NATIVE_SUPPLY_MISMATCH",
          ),
      ),
    );
    assert.ok(
      result.failures.some(
        (failure) =>
          failure.startsWith(
            "PWRC_NATIVE_CONSENSUS_PROFILE_INVALID:secondary-rpc:PWRC_NATIVE_SUPPLY_MISMATCH",
          ),
      ),
    );
  },
);

test(
  "consensus snapshot commitment is stable under observer input ordering",
  () => {
    const forward =
      evaluateNativePwrcConsensus(
        snapshots,
      );
    const reverse =
      evaluateNativePwrcConsensus(
        [
          snapshots[1],
          snapshots[0],
        ],
      );

    assert.equal(
      forward.consensus,
      true,
    );
    assert.equal(
      reverse.consensus,
      true,
    );
    assert.equal(
      forward.snapshotSha256,
      reverse.snapshotSha256,
    );
  },
);
