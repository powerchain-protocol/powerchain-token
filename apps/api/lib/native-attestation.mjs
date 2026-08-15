import crypto from "node:crypto";
import {
  createPowerChainSolanaReadConnections,
  verifyConfiguredNativePwrcAcrossRpcs,
} from "@powerchain/sdk";
import {
  resolveExpectedSolanaGenesisHash,
  resolveRpc,
  resolveSecondaryRpc,
  solanaRpcProviderFamily,
} from "@powerchain/protocol/solana";
import {
  PWRC_CANONICAL_MINT,
} from "@powerchain/protocol/constants";
import {
  nativePwrcPolicySha256,
} from "@powerchain/protocol/native-token-policy";
import {
  heliusConfigStatus,
} from "./helius.mjs";

function parseBoundedInteger(
  value,
  {
    key,
    fallback,
    min,
    max,
  },
) {
  const raw =
    value?.trim() ||
    String(
      fallback,
    );
  const parsed =
    Number(
      raw,
    );

  if (
    !Number.isSafeInteger(
      parsed,
    ) ||
    parsed <
      min ||
    parsed >
      max
  ) {
    throw new Error(
      `PWRC_NATIVE_VERIFICATION_CONFIG_INVALID:${key}`,
    );
  }

  return parsed;
}



const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function decodedBase58Length(
  value,
) {
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

function parseNullableAuthority(
  value,
  key,
) {
  const normalized =
    value?.trim();

  if (!normalized) {
    throw new Error(
      `PWRC_NATIVE_VERIFICATION_CONFIG_INVALID:${key}`,
    );
  }

  if (
    normalized ===
      "null"
  ) {
    return null;
  }

  if (
    normalized.length <
      32 ||
    normalized.length >
      44 ||
    decodedBase58Length(
      normalized,
    ) !==
      32
  ) {
    throw new Error(
      `PWRC_NATIVE_VERIFICATION_CONFIG_INVALID:${key}`,
    );
  }

  return normalized;
}

function clusterFromEnv(
  env,
) {
  const cluster =
    env.PWRC_CLUSTER ??
    "localnet";

  if (
    cluster !==
      "localnet" &&
    cluster !==
      "devnet" &&
    cluster !==
      "mainnet-beta"
  ) {
    throw new Error(
      "PWRC_NATIVE_VERIFICATION_CLUSTER_INVALID",
    );
  }

  return cluster;
}

export function nativePwrcVerificationConfig(
  env =
    process.env,
) {
  const cluster =
    clusterFromEnv(
      env,
    );
  const transferFeeAuthorityPolicy =
    cluster ===
      "localnet"
      ? null
      : {
          transferFeeConfigAuthority:
            parseNullableAuthority(
              env.PWRC_TRANSFER_FEE_CONFIG_AUTHORITY_EXPECTED,
              "PWRC_TRANSFER_FEE_CONFIG_AUTHORITY_EXPECTED",
            ),
          withdrawWithheldAuthority:
            parseNullableAuthority(
              env.PWRC_WITHDRAW_WITHHELD_AUTHORITY_EXPECTED,
              "PWRC_WITHDRAW_WITHHELD_AUTHORITY_EXPECTED",
            ),
        };
  const minimumObservers =
    parseBoundedInteger(
      env.PWRC_NATIVE_VERIFY_MIN_OBSERVERS,
      {
        key:
          "PWRC_NATIVE_VERIFY_MIN_OBSERVERS",
        fallback:
          2,
        min:
          2,
        max:
          8,
      },
    );
  const maxObservationAgeMs =
    parseBoundedInteger(
      env.PWRC_NATIVE_VERIFY_MAX_AGE_MS,
      {
        key:
          "PWRC_NATIVE_VERIFY_MAX_AGE_MS",
        fallback:
          60_000,
        min:
          1_000,
        max:
          300_000,
      },
    );
  const maxSlotSkew =
    parseBoundedInteger(
      env.PWRC_NATIVE_VERIFY_MAX_SLOT_SKEW,
      {
        key:
          "PWRC_NATIVE_VERIFY_MAX_SLOT_SKEW",
        fallback:
          128,
        min:
          0,
        max:
          100_000,
      },
    );

  const maxIntraObservationSlotSkew =
    parseBoundedInteger(
      env.PWRC_NATIVE_VERIFY_MAX_INTRA_SLOT_SKEW,
      {
        key:
          "PWRC_NATIVE_VERIFY_MAX_INTRA_SLOT_SKEW",
        fallback:
          maxSlotSkew,
        min:
          0,
        max:
          100_000,
      },
    );

  const maxEpochSkew =
    parseBoundedInteger(
      env.PWRC_NATIVE_VERIFY_MAX_EPOCH_SKEW,
      {
        key:
          "PWRC_NATIVE_VERIFY_MAX_EPOCH_SKEW",
        fallback:
          1,
        min:
          0,
        max:
          8,
      },
    );

  const failures = [];

  let expectedGenesisHash =
    null;
  try {
    expectedGenesisHash =
      resolveExpectedSolanaGenesisHash(
        cluster,
        env,
      );
  } catch (error) {
    failures.push(
      error instanceof Error
        ? error.message
        : "PWRC_NATIVE_VERIFICATION_GENESIS_CONFIG_INVALID",
    );
  }

  let secondaryConfigured =
    false;
  try {
    secondaryConfigured =
      Boolean(
        resolveSecondaryRpc(
          cluster,
          env,
        ),
      );
  } catch (error) {
    failures.push(
      error instanceof Error
        ? error.message
        : "PWRC_NATIVE_VERIFICATION_SECONDARY_RPC_INVALID",
    );
  }

  if (
    cluster !==
      "localnet" &&
    !secondaryConfigured
  ) {
    failures.push(
      "PWRC_NATIVE_VERIFICATION_SECONDARY_RPC_REQUIRED",
    );
  }

  const helius =
    heliusConfigStatus(
      env,
    );

  if (
    cluster !==
      "localnet" &&
    !helius.enabled
  ) {
    failures.push(
      "PWRC_NATIVE_VERIFICATION_HELIUS_REQUIRED",
    );
  }

  if (
    cluster !==
      "localnet" &&
    !helius.apiKeyConfigured
  ) {
    failures.push(
      "PWRC_NATIVE_VERIFICATION_HELIUS_KEY_REQUIRED",
    );
  }

  return {
    version:
      "1.0.0",
    cluster,
    configured:
      failures.length ===
      0,
    failClosed:
      failures.length >
      0,
    expectedGenesisHashConfigured:
      expectedGenesisHash !==
      null,
    secondaryProviderConfigured:
      secondaryConfigured,
    heliusConfigured:
      helius.enabled &&
      helius.apiKeyConfigured,
    transferFeeAuthoritiesConfigured:
      cluster ===
        "localnet" ||
      transferFeeAuthorityPolicy !==
        null,
    minimumObservers,
    maxObservationAgeMs,
    maxSlotSkew:
      String(
        maxSlotSkew,
      ),
    maxIntraObservationSlotSkew:
      String(
        maxIntraObservationSlotSkew,
      ),
    maxEpochSkew:
      String(
        maxEpochSkew,
      ),
    failures,
    publicWrites:
      false,
  };
}

async function executeLiveNativePwrcAttestation(
  env =
    process.env,
) {
  const config =
    nativePwrcVerificationConfig(
      env,
    );

  if (
    !config.configured
  ) {
    throw new Error(
      `PWRC_NATIVE_VERIFICATION_NOT_CONFIGURED:${config.failures.join(",")}`,
    );
  }

  const cluster =
    clusterFromEnv(
      env,
    );

  if (
    cluster ===
      "localnet"
  ) {
    throw new Error(
      "PWRC_NATIVE_VERIFICATION_LOCALNET_UNSUPPORTED",
    );
  }

  const connections =
    createPowerChainSolanaReadConnections({
      cluster,
      commitment:
        "finalized",
      env,
    });

  if (
    !connections.secondary
  ) {
    throw new Error(
      "PWRC_NATIVE_VERIFICATION_SECONDARY_RPC_REQUIRED",
    );
  }

  const primaryRpc =
    resolveRpc(
      cluster,
      env,
    );
  const secondaryRpc =
    resolveSecondaryRpc(
      cluster,
      env,
    );

  if (!secondaryRpc) {
    throw new Error(
      "PWRC_NATIVE_VERIFICATION_SECONDARY_RPC_REQUIRED",
    );
  }

  const expectedGenesisHash =
    resolveExpectedSolanaGenesisHash(
      cluster,
      env,
    );
  const transferFeeAuthorityPolicy = {
    transferFeeConfigAuthority:
      parseNullableAuthority(
        env.PWRC_TRANSFER_FEE_CONFIG_AUTHORITY_EXPECTED,
        "PWRC_TRANSFER_FEE_CONFIG_AUTHORITY_EXPECTED",
      ),
    withdrawWithheldAuthority:
      parseNullableAuthority(
        env.PWRC_WITHDRAW_WITHHELD_AUTHORITY_EXPECTED,
        "PWRC_WITHDRAW_WITHHELD_AUTHORITY_EXPECTED",
      ),
  };

  const result =
    await verifyConfiguredNativePwrcAcrossRpcs({
      cluster,
      env,
      observers: [
        {
          name:
            "primary",
          connection:
            connections.primary,
        },
        {
          name:
            "secondary",
          connection:
            connections.secondary,
        },
      ],
      commitment:
        "finalized",
      minimumObservers:
        config.minimumObservers,
      maxObservationAgeMs:
        config.maxObservationAgeMs,
      maxSlotSkew:
        BigInt(
          config.maxSlotSkew,
        ),
      maxIntraObservationSlotSkew:
        BigInt(
          config.maxIntraObservationSlotSkew,
        ),
      maxEpochSkew:
        BigInt(
          config.maxEpochSkew,
        ),
      transferFeeAuthorityPolicy,
    });

  return {
    version:
      "1.0.0",
    cluster,
    verified:
      true,
    mint:
      PWRC_CANONICAL_MINT,
    nativePolicySha256:
      nativePwrcPolicySha256(),
    expectedGenesisHash,
    providerFamilies: [
      solanaRpcProviderFamily(
        primaryRpc,
      ),
      solanaRpcProviderFamily(
        secondaryRpc,
      ),
    ],
    transferFeeAuthorityPolicy,
    observerCount:
      result.snapshots.length,
    consensusSha256:
      result.consensusSha256,
    attestationSha256:
      result.attestationSha256,
    slotRange:
      result.attestation
        ? {
            min:
              result.attestation.minSlot,
            max:
              result.attestation.maxSlot,
            skew:
              result.attestation.slotSkew,
          }
        : null,
    epochs:
      result.attestation
        ?.epochs ??
      [],
    epochSkew:
      result.attestation
        ?.epochSkew ??
      null,
    evaluationAt:
      result.attestation
        ?.evaluationAt ??
      null,
    observationRanges:
      result.snapshots.map(
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
      ),
    publicWrites:
      false,
  };
}


let attestationCache =
  null;
let attestationInFlight =
  null;

function nativeAttestationCacheKey(
  env,
  config,
) {
  let primaryRpc =
    null;
  let secondaryRpc =
    null;

  try {
    primaryRpc =
      resolveRpc(
        config.cluster,
        env,
      );
  } catch {
    // Configuration failures are represented by the resulting key and the
    // normal fail-closed execution path.
  }

  try {
    secondaryRpc =
      resolveSecondaryRpc(
        config.cluster,
        env,
      );
  } catch {
    // Same fail-closed behavior as above.
  }

  return crypto
    .createHash(
      "sha256",
    )
    .update(
      JSON.stringify({
        version:
          "1.0.0",
        cluster:
          config.cluster,
        expectedGenesisHash:
          env.PWRC_SOLANA_MAINNET_GENESIS_HASH ??
          env.PWRC_SOLANA_DEVNET_GENESIS_HASH ??
          null,
        primaryRpc,
        secondaryRpc,
        minimumObservers:
          config.minimumObservers,
        maxObservationAgeMs:
          config.maxObservationAgeMs,
        maxSlotSkew:
          config.maxSlotSkew,
        maxIntraObservationSlotSkew:
          config.maxIntraObservationSlotSkew,
        maxEpochSkew:
          config.maxEpochSkew,
        transferFeeConfigAuthority:
          env.PWRC_TRANSFER_FEE_CONFIG_AUTHORITY_EXPECTED ??
          null,
        withdrawWithheldAuthority:
          env.PWRC_WITHDRAW_WITHHELD_AUTHORITY_EXPECTED ??
          null,
        heliusKey:
          env.HELIUS_API_KEY ??
          null,
      }),
    )
    .digest(
      "hex",
    );
}

function attestationEvaluationExpiresAt(
  value,
  maxObservationAgeMs,
) {
  const evaluationAt =
    Date.parse(
      value.evaluationAt ??
      "",
    );

  if (
    !Number.isFinite(
      evaluationAt,
    )
  ) {
    return 0;
  }

  return (
    evaluationAt +
    maxObservationAgeMs
  );
}

export async function liveNativePwrcAttestation(
  env =
    process.env,
) {
  const cacheMs =
    parseBoundedInteger(
      env.PWRC_NATIVE_ATTESTATION_CACHE_MS,
      {
        key:
          "PWRC_NATIVE_ATTESTATION_CACHE_MS",
        fallback:
          15_000,
        min:
          0,
        max:
          60_000,
      },
    );
  const config =
    nativePwrcVerificationConfig(
      env,
    );
  const cacheKey =
    nativeAttestationCacheKey(
      env,
      config,
    );
  const effectiveCacheMs =
    Math.min(
      cacheMs,
      config.maxObservationAgeMs,
    );
  const now =
    Date.now();

  if (
    effectiveCacheMs >
      0 &&
    attestationCache?.key ===
      cacheKey &&
    now <
      attestationCache.expiresAt &&
    now <
      attestationEvaluationExpiresAt(
        attestationCache.value,
        config.maxObservationAgeMs,
      )
  ) {
    return {
      ...attestationCache.value,
      cache:
        "hit",
    };
  }

  if (
    attestationInFlight?.key ===
      cacheKey
  ) {
    const value =
      await attestationInFlight.promise;

    return {
      ...value,
      cache:
        "shared-flight",
    };
  }

  const promise =
    executeLiveNativePwrcAttestation(
      env,
    );

  attestationInFlight = {
    key:
      cacheKey,
    promise,
  };

  try {
    const value =
      await promise;

    if (
      effectiveCacheMs >
        0
    ) {
      const evaluationExpiresAt =
        attestationEvaluationExpiresAt(
          value,
          config.maxObservationAgeMs,
        );

      attestationCache = {
        key:
          cacheKey,
        value,
        expiresAt:
          Math.min(
            now +
              effectiveCacheMs,
            evaluationExpiresAt,
          ),
      };
    }

    return {
      ...value,
      cache:
        "miss",
    };
  } finally {
    if (
      attestationInFlight
        ?.promise ===
      promise
    ) {
      attestationInFlight =
        null;
    }
  }
}
