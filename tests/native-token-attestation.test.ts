import test from "node:test";
import assert from "node:assert/strict";
import {
  assertNativePwrcAttestation,
  evaluateNativePwrcAttestation,
} from "../packages/protocol/src/native-token-attestation.js";
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

const expectedGenesisHash =
  "11111111111111111111111111111111";

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
      1000n,
    slotStart:
      995n,
    slotEnd:
      1000n,
    slotSpan:
      5n,
    epoch:
      900n,
    genesisHash:
      expectedGenesisHash,
    observation,
  },
  {
    observer:
      "secondary-rpc",
    observedAt:
      "2026-08-15T00:00:01.000Z",
    slot:
      1010n,
    slotStart:
      1004n,
    slotEnd:
      1010n,
    slotSpan:
      6n,
    epoch:
      900n,
    genesisHash:
      expectedGenesisHash,
    observation,
  },
] as const;

const policy = {
  expectedGenesisHash,
  minimumObservers:
    2,
  maxObservationAgeMs:
    60_000,
  maxSlotSkew:
    128n,
  maxIntraObservationSlotSkew:
    16n,
  maxEpochSkew:
    1n,
};

test(
  "matching fresh RPC snapshots produce deterministic attestation",
  () => {
    const now =
      "2026-08-15T00:00:30.000Z";
    const first =
      evaluateNativePwrcAttestation(
        snapshots,
        policy,
        now,
      );
    const second =
      evaluateNativePwrcAttestation(
        snapshots,
        policy,
        now,
      );

    assert.equal(
      first.valid,
      true,
    );
    assert.equal(
      first.attestationSha256,
      second.attestationSha256,
    );
    assert.equal(
      assertNativePwrcAttestation(
        snapshots,
        policy,
        now,
      ),
      first.attestationSha256,
    );
  },
);

test(
  "attestation rejects wrong Solana genesis hash",
  () => {
    const result =
      evaluateNativePwrcAttestation(
        [
          snapshots[0],
          {
            ...snapshots[1],
            genesisHash:
              "Vote111111111111111111111111111111111111111",
          },
        ],
        policy,
        "2026-08-15T00:00:30.000Z",
      );

    assert.equal(
      result.valid,
      false,
    );
    assert.ok(
      result.failures.includes(
        "PWRC_NATIVE_ATTESTATION_WRONG_GENESIS:secondary-rpc",
      ),
    );
  },
);

test(
  "attestation rejects stale and future observations",
  () => {
    const stale =
      evaluateNativePwrcAttestation(
        snapshots,
        policy,
        "2026-08-15T00:02:00.000Z",
      );

    assert.equal(
      stale.valid,
      false,
    );
    assert.ok(
      stale.failures.some(
        (failure) =>
          failure.startsWith(
            "PWRC_NATIVE_ATTESTATION_STALE:",
          ),
      ),
    );

    const future =
      evaluateNativePwrcAttestation(
        snapshots,
        policy,
        "2026-08-14T23:59:59.000Z",
      );

    assert.equal(
      future.valid,
      false,
    );
    assert.ok(
      future.failures.some(
        (failure) =>
          failure.startsWith(
            "PWRC_NATIVE_ATTESTATION_FROM_FUTURE:",
          ),
      ),
    );
  },
);

test(
  "attestation rejects excessive finalized slot skew",
  () => {
    const result =
      evaluateNativePwrcAttestation(
        [
          snapshots[0],
          {
            ...snapshots[1],
            slot:
              1200n,
          },
        ],
        policy,
        "2026-08-15T00:00:30.000Z",
      );

    assert.equal(
      result.valid,
      false,
    );
    assert.ok(
      result.failures.includes(
        "PWRC_NATIVE_ATTESTATION_SLOT_SKEW_EXCEEDED",
      ),
    );
  },
);


test(
  "attestation rejects invalid or excessive intra-observation slot ranges",
  () => {
    const invalidRange =
      evaluateNativePwrcAttestation(
        [
          snapshots[0],
          {
            ...snapshots[1],
            slotStart:
              1011n,
            slotEnd:
              1010n,
            slotSpan:
              0n,
          },
        ],
        policy,
        "2026-08-15T00:00:30.000Z",
      );

    assert.equal(
      invalidRange.valid,
      false,
    );
    assert.ok(
      invalidRange.failures.includes(
        "PWRC_NATIVE_ATTESTATION_SLOT_RANGE_INVALID:secondary-rpc",
      ),
    );

    const excessive =
      evaluateNativePwrcAttestation(
        [
          snapshots[0],
          {
            ...snapshots[1],
            slotStart:
              980n,
            slotEnd:
              1010n,
            slotSpan:
              30n,
          },
        ],
        policy,
        "2026-08-15T00:00:30.000Z",
      );

    assert.equal(
      excessive.valid,
      false,
    );
    assert.ok(
      excessive.failures.includes(
        "PWRC_NATIVE_ATTESTATION_INTRA_SLOT_SKEW_EXCEEDED:secondary-rpc",
      ),
    );
  },
);


test(
  "attestation rejects non-32-byte genesis hashes",
  () => {
    assert.throws(
      () =>
        evaluateNativePwrcAttestation(
          snapshots,
          {
            ...policy,
            expectedGenesisHash:
              "22222222222222222222222222222222",
          },
          "2026-08-15T00:00:30.000Z",
        ),
      /PWRC_NATIVE_ATTESTATION_GENESIS_HASH_INVALID/,
    );
  },
);

test(
  "attestation permits adjacent epoch boundary but rejects distant epochs",
  () => {
    const adjacent =
      evaluateNativePwrcAttestation(
        [
          snapshots[0],
          {
            ...snapshots[1],
            epoch:
              901n,
          },
        ],
        policy,
        "2026-08-15T00:00:30.000Z",
      );

    assert.equal(
      adjacent.valid,
      true,
    );
    assert.equal(
      adjacent.epochSkew,
      "1",
    );

    const distant =
      evaluateNativePwrcAttestation(
        [
          snapshots[0],
          {
            ...snapshots[1],
            epoch:
              999n,
          },
        ],
        policy,
        "2026-08-15T00:00:30.000Z",
      );

    assert.equal(
      distant.valid,
      false,
    );
    assert.equal(
      distant.epochSkew,
      "99",
    );
    assert.ok(
      distant.failures.includes(
        "PWRC_NATIVE_ATTESTATION_EPOCH_SKEW_EXCEEDED",
      ),
    );
  },
);

test(
  "attestation commitment binds evaluation time",
  () => {
    const first =
      evaluateNativePwrcAttestation(
        snapshots,
        policy,
        "2026-08-15T00:00:30.000Z",
      );
    const second =
      evaluateNativePwrcAttestation(
        snapshots,
        policy,
        "2026-08-15T00:00:31.000Z",
      );

    assert.equal(
      first.valid,
      true,
    );
    assert.equal(
      second.valid,
      true,
    );
    assert.notEqual(
      first.attestationSha256,
      second.attestationSha256,
    );
    assert.equal(
      first.evaluationAt,
      "2026-08-15T00:00:30.000Z",
    );
  },
);
