import {
  canonicalJsonSha256,
} from "./helpers.js";
import {
  verifyNativePwrcMintObservation,
  type NativePwrcMintObservation,
} from "./native-token.js";

export interface NativePwrcObservationSnapshot {
  observer:
    string;
  observedAt:
    string;
  slot:
    bigint;
  observation:
    NativePwrcMintObservation;
}

export interface NativePwrcConsensusResult {
  version:
    "1.0.0";
  observers:
    readonly string[];
  observationCount:
    number;
  consensus:
    boolean;
  snapshotSha256:
    string |
    null;
  failures:
    readonly string[];
}

function assertObserver(
  value:
    string,
): void {
  if (
    !/^[A-Za-z0-9._:-]{2,128}$/.test(
      value,
    )
  ) {
    throw new Error(
      "PWRC_NATIVE_CONSENSUS_OBSERVER_INVALID",
    );
  }
}

function assertIsoTimestamp(
  value:
    string,
): void {
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
      "PWRC_NATIVE_CONSENSUS_TIMESTAMP_INVALID",
    );
  }
}

function canonicalObservation(
  observation:
    NativePwrcMintObservation,
) {
  return {
    mint:
      observation.mint,
    ownerProgramId:
      observation.ownerProgramId,
    decimals:
      observation.decimals,
    supplyBaseUnits:
      observation
        .supplyBaseUnits
        .toString(),
    mintAuthority:
      observation.mintAuthority,
    freezeAuthority:
      observation.freezeAuthority,
    extensions:
      [...observation.extensions]
        .sort(),
    transferFeeBasisPoints:
      observation
        .transferFeeBasisPoints
        .toString(),
    maximumTransferFeeBaseUnits:
      observation
        .maximumTransferFeeBaseUnits
        .toString(),
    metadataPointer:
      observation.metadataPointer,
    metadataName:
      observation.metadataName,
    metadataSymbol:
      observation.metadataSymbol,
    metadataUri:
      observation.metadataUri,
  };
}

export function nativePwrcObservationFingerprint(
  observation:
    NativePwrcMintObservation,
): string {
  return canonicalJsonSha256({
    domain:
      "POWERCHAIN_NATIVE_PWRC_OBSERVATION_V1",
    observation:
      canonicalObservation(
        observation,
      ),
  });
}

export function evaluateNativePwrcConsensus(
  snapshots:
    readonly NativePwrcObservationSnapshot[],
  minimumObservers =
    2,
): NativePwrcConsensusResult {
  if (
    !Number.isSafeInteger(
      minimumObservers,
    ) ||
    minimumObservers <
      2
  ) {
    throw new Error(
      "PWRC_NATIVE_CONSENSUS_MINIMUM_INVALID",
    );
  }

  const failures:
    string[] =
    [];

  if (
    snapshots.length <
      minimumObservers
  ) {
    failures.push(
      "PWRC_NATIVE_CONSENSUS_INSUFFICIENT_OBSERVERS",
    );
  }

  const observers =
    new Set<string>();

  for (const snapshot of snapshots) {
    assertObserver(
      snapshot.observer,
    );
    assertIsoTimestamp(
      snapshot.observedAt,
    );

    if (
      snapshot.slot <
        0n
    ) {
      throw new Error(
        "PWRC_NATIVE_CONSENSUS_SLOT_INVALID",
      );
    }

    if (
      observers.has(
        snapshot.observer,
      )
    ) {
      failures.push(
        `PWRC_NATIVE_CONSENSUS_DUPLICATE_OBSERVER:${snapshot.observer}`,
      );
    }

    observers.add(
      snapshot.observer,
    );

    const verification =
      verifyNativePwrcMintObservation(
        snapshot.observation,
      );

    if (
      !verification.valid
    ) {
      failures.push(
        `PWRC_NATIVE_CONSENSUS_PROFILE_INVALID:${snapshot.observer}:${verification.failures.join("|")}`,
      );
    }
  }

  const fingerprints =
    snapshots.map(
      (snapshot) =>
        nativePwrcObservationFingerprint(
          snapshot.observation,
        ),
    );

  const firstFingerprint =
    fingerprints[0] ??
    null;

  if (
    firstFingerprint &&
    fingerprints.some(
      (fingerprint) =>
        fingerprint !==
        firstFingerprint,
    )
  ) {
    failures.push(
      "PWRC_NATIVE_CONSENSUS_OBSERVATION_MISMATCH",
    );
  }

  const consensus =
    failures.length ===
      0 &&
    snapshots.length >=
      minimumObservers &&
    Boolean(
      firstFingerprint,
    );

  const snapshotSha256 =
    consensus
      ? canonicalJsonSha256({
          domain:
            "POWERCHAIN_NATIVE_PWRC_CONSENSUS_V1",
          observationSha256:
            firstFingerprint,
          observers:
            snapshots
              .map(
                (snapshot) => ({
                  observer:
                    snapshot.observer,
                  observedAt:
                    snapshot.observedAt,
                  slot:
                    snapshot
                      .slot
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
        })
      : null;

  return {
    version:
      "1.0.0",
    observers:
      [...observers]
        .sort(),
    observationCount:
      snapshots.length,
    consensus,
    snapshotSha256,
    failures,
  };
}

export function assertNativePwrcConsensus(
  snapshots:
    readonly NativePwrcObservationSnapshot[],
  minimumObservers =
    2,
): string {
  const result =
    evaluateNativePwrcConsensus(
      snapshots,
      minimumObservers,
    );

  if (
    !result.consensus ||
    !result.snapshotSha256
  ) {
    throw new Error(
      `PWRC_NATIVE_CONSENSUS_FAILED:${result.failures.join(",")}`,
    );
  }

  return result.snapshotSha256;
}
