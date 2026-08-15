import {
  canonicalJsonSha256,
} from "./helpers.js";
import {
  evaluateNativePwrcConsensus,
  type NativePwrcObservationSnapshot,
} from "./native-token-consensus.js";

export interface NativePwrcAttestationSnapshot
  extends NativePwrcObservationSnapshot {
  genesisHash:
    string;
  epoch:
    bigint;
  slotStart:
    bigint;
  slotEnd:
    bigint;
  slotSpan:
    bigint;
}

export interface NativePwrcAttestationPolicy {
  expectedGenesisHash:
    string;
  minimumObservers:
    number;
  maxObservationAgeMs:
    number;
  maxSlotSkew:
    bigint;
  maxIntraObservationSlotSkew:
    bigint;
  maxEpochSkew?:
    bigint;
}

export interface NativePwrcAttestationResult {
  version:
    "1.0.0";
  valid:
    boolean;
  consensusSha256:
    string |
    null;
  attestationSha256:
    string |
    null;
  minSlot:
    string |
    null;
  maxSlot:
    string |
    null;
  slotSkew:
    string |
    null;
  epochs:
    readonly string[];
  epochSkew:
    string |
    null;
  evaluationAt:
    string;
  failures:
    readonly string[];
}

function assertPositiveInteger(
  value:
    number,
  code:
    string,
): void {
  if (
    !Number.isSafeInteger(
      value,
    ) ||
    value <= 0
  ) {
    throw new Error(
      code,
    );
  }
}

function assertIsoTimestamp(
  value:
    string,
  code:
    string,
): number {
  const parsed =
    Date.parse(
      value,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
    new Date(
      parsed,
    ).toISOString() !==
      value
  ) {
    throw new Error(
      code,
    );
  }

  return parsed;
}


const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function decodedBase58Length(
  value:
    string,
): number {
  if (
    !/^[1-9A-HJ-NP-Za-km-z]+$/.test(
      value,
    )
  ) {
    return -1;
  }

  const bytes = [
    0,
  ];

  for (
    const character of
      value
  ) {
    const digit =
      BASE58_ALPHABET.indexOf(
        character,
      );

    if (
      digit <
        0
    ) {
      return -1;
    }

    let carry =
      digit;

    for (
      let index =
        0;
      index <
        bytes.length;
      index +=
        1
    ) {
      const current =
        bytes[index] *
          58 +
        carry;
      bytes[index] =
        current &
        0xff;
      carry =
        current >>
        8;
    }

    while (
      carry >
        0
    ) {
      bytes.push(
        carry &
          0xff,
      );
      carry >>=
        8;
    }
  }

  let leadingZeroes =
    0;

  while (
    leadingZeroes <
      value.length &&
    value[
      leadingZeroes
    ] ===
      "1"
  ) {
    leadingZeroes +=
      1;
  }

  const significantLength =
    bytes.length ===
      1 &&
    bytes[0] ===
      0
      ? 0
      : bytes.length;

  return (
    leadingZeroes +
    significantLength
  );
}

function assertGenesisHash(
  value:
    string,
): void {
  if (
    value.length <
      32 ||
    value.length >
      44 ||
    decodedBase58Length(
      value,
    ) !==
      32
  ) {
    throw new Error(
      "PWRC_NATIVE_ATTESTATION_GENESIS_HASH_INVALID",
    );
  }
}

export function evaluateNativePwrcAttestation(
  snapshots:
    readonly NativePwrcAttestationSnapshot[],
  policy:
    NativePwrcAttestationPolicy,
  now:
    string,
): NativePwrcAttestationResult {
  assertGenesisHash(
    policy.expectedGenesisHash,
  );
  assertPositiveInteger(
    policy.minimumObservers,
    "PWRC_NATIVE_ATTESTATION_MINIMUM_OBSERVERS_INVALID",
  );
  assertPositiveInteger(
    policy.maxObservationAgeMs,
    "PWRC_NATIVE_ATTESTATION_MAX_AGE_INVALID",
  );

  if (
    policy.minimumObservers <
      2
  ) {
    throw new Error(
      "PWRC_NATIVE_ATTESTATION_MINIMUM_OBSERVERS_TOO_LOW",
    );
  }

  if (
    policy.maxSlotSkew <
      0n
  ) {
    throw new Error(
      "PWRC_NATIVE_ATTESTATION_SLOT_SKEW_INVALID",
    );
  }

  if (
    policy.maxIntraObservationSlotSkew <
      0n
  ) {
    throw new Error(
      "PWRC_NATIVE_ATTESTATION_INTRA_SLOT_SKEW_INVALID",
    );
  }

  const maxEpochSkew =
    policy.maxEpochSkew ??
    1n;

  if (
    maxEpochSkew <
      0n
  ) {
    throw new Error(
      "PWRC_NATIVE_ATTESTATION_EPOCH_SKEW_INVALID",
    );
  }

  const nowMs =
    assertIsoTimestamp(
      now,
      "PWRC_NATIVE_ATTESTATION_NOW_INVALID",
    );

  const failures:
    string[] =
    [];

  for (const snapshot of snapshots) {
    assertGenesisHash(
      snapshot.genesisHash,
    );

    if (
      snapshot.genesisHash !==
        policy.expectedGenesisHash
    ) {
      failures.push(
        `PWRC_NATIVE_ATTESTATION_WRONG_GENESIS:${snapshot.observer}`,
      );
    }

    if (
      snapshot.epoch <
        0n
    ) {
      failures.push(
        `PWRC_NATIVE_ATTESTATION_EPOCH_INVALID:${snapshot.observer}`,
      );
    }

    if (
      snapshot.slotStart <
        0n ||
      snapshot.slotEnd <
        snapshot.slotStart ||
      snapshot.slot !==
        snapshot.slotEnd ||
      snapshot.slotSpan !==
        snapshot.slotEnd -
          snapshot.slotStart
    ) {
      failures.push(
        `PWRC_NATIVE_ATTESTATION_SLOT_RANGE_INVALID:${snapshot.observer}`,
      );
    } else if (
      snapshot.slotSpan >
        policy.maxIntraObservationSlotSkew
    ) {
      failures.push(
        `PWRC_NATIVE_ATTESTATION_INTRA_SLOT_SKEW_EXCEEDED:${snapshot.observer}`,
      );
    }

    const observedAtMs =
      assertIsoTimestamp(
        snapshot.observedAt,
        "PWRC_NATIVE_ATTESTATION_OBSERVED_AT_INVALID",
      );

    if (
      observedAtMs >
        nowMs
    ) {
      failures.push(
        `PWRC_NATIVE_ATTESTATION_FROM_FUTURE:${snapshot.observer}`,
      );
    } else if (
      nowMs -
        observedAtMs >
      policy.maxObservationAgeMs
    ) {
      failures.push(
        `PWRC_NATIVE_ATTESTATION_STALE:${snapshot.observer}`,
      );
    }
  }

  const consensus =
    evaluateNativePwrcConsensus(
      snapshots,
      policy.minimumObservers,
    );

  failures.push(
    ...consensus.failures,
  );

  const slots =
    snapshots.map(
      (snapshot) =>
        snapshot.slot,
    );

  const minSlot =
    slots.length
      ? slots.reduce(
          (
            current,
            slot,
          ) =>
            slot <
              current
              ? slot
              : current,
        )
      : null;

  const maxSlot =
    slots.length
      ? slots.reduce(
          (
            current,
            slot,
          ) =>
            slot >
              current
              ? slot
              : current,
        )
      : null;

  const slotSkew =
    minSlot !==
      null &&
    maxSlot !==
      null
      ? maxSlot -
        minSlot
      : null;

  if (
    slotSkew !==
      null &&
    slotSkew >
      policy.maxSlotSkew
  ) {
    failures.push(
      "PWRC_NATIVE_ATTESTATION_SLOT_SKEW_EXCEEDED",
    );
  }

  const epochs =
    [
      ...new Set(
        snapshots.map(
          (snapshot) =>
            snapshot.epoch
              .toString(),
        ),
      ),
    ].sort(
      (
        left,
        right,
      ) =>
        BigInt(left) <
          BigInt(right)
          ? -1
          : BigInt(left) >
              BigInt(right)
            ? 1
            : 0,
    );

  const minEpoch =
    epochs.length
      ? BigInt(
          epochs[0],
        )
      : null;
  const maxEpoch =
    epochs.length
      ? BigInt(
          epochs[
            epochs.length -
              1
          ],
        )
      : null;
  const epochSkew =
    minEpoch !==
      null &&
    maxEpoch !==
      null
      ? maxEpoch -
        minEpoch
      : null;

  if (
    epochSkew !==
      null &&
    epochSkew >
      maxEpochSkew
  ) {
    failures.push(
      "PWRC_NATIVE_ATTESTATION_EPOCH_SKEW_EXCEEDED",
    );
  }

  const uniqueFailures =
    [...new Set(
      failures,
    )];

  const valid =
    uniqueFailures.length ===
      0 &&
    consensus.consensus &&
    Boolean(
      consensus.snapshotSha256,
    );

  const attestationSha256 =
    valid &&
    consensus.snapshotSha256 &&
    minSlot !==
      null &&
    maxSlot !==
      null &&
    slotSkew !==
      null
      ? canonicalJsonSha256({
          domain:
            "POWERCHAIN_NATIVE_PWRC_ATTESTATION_V1",
          expectedGenesisHash:
            policy.expectedGenesisHash,
          consensusSha256:
            consensus.snapshotSha256,
          minimumObservers:
            policy.minimumObservers,
          maxObservationAgeMs:
            policy.maxObservationAgeMs,
          maxSlotSkew:
            policy.maxSlotSkew
              .toString(),
          maxIntraObservationSlotSkew:
            policy.maxIntraObservationSlotSkew
              .toString(),
          maxEpochSkew:
            maxEpochSkew
              .toString(),
          evaluationAt:
            now,
          epochSkew:
            epochSkew
              ?.toString() ??
            null,
          observationRanges:
            snapshots
              .map(
                (snapshot) => ({
                  observer:
                    snapshot.observer,
                  slotStart:
                    snapshot.slotStart
                      .toString(),
                  slotEnd:
                    snapshot.slotEnd
                      .toString(),
                  slotSpan:
                    snapshot.slotSpan
                      .toString(),
                }),
              )
              .sort(
                (
                  left,
                  right,
                ) =>
                  left.observer <
                    right.observer
                    ? -1
                    : left.observer >
                        right.observer
                      ? 1
                      : 0,
              ),
          minSlot:
            minSlot.toString(),
          maxSlot:
            maxSlot.toString(),
          slotSkew:
            slotSkew.toString(),
          epochs,
        })
      : null;

  return {
    version:
      "1.0.0",
    valid,
    consensusSha256:
      consensus.snapshotSha256,
    attestationSha256,
    minSlot:
      minSlot
        ?.toString() ??
      null,
    maxSlot:
      maxSlot
        ?.toString() ??
      null,
    slotSkew:
      slotSkew
        ?.toString() ??
      null,
    epochs,
    epochSkew:
      epochSkew
        ?.toString() ??
      null,
    evaluationAt:
      now,
    failures:
      uniqueFailures,
  };
}

export function assertNativePwrcAttestation(
  snapshots:
    readonly NativePwrcAttestationSnapshot[],
  policy:
    NativePwrcAttestationPolicy,
  now:
    string,
): string {
  const result =
    evaluateNativePwrcAttestation(
      snapshots,
      policy,
      now,
    );

  if (
    !result.valid ||
    !result.attestationSha256
  ) {
    throw new Error(
      `PWRC_NATIVE_ATTESTATION_FAILED:${result.failures.join(",")}`,
    );
  }

  return result.attestationSha256;
}
