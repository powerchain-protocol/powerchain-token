export function nativeTransferRuntimePolicy() {
  return {
    version:
      "1.0.0",
    chain:
      "solana",
    standard:
      "Token-2022",
    transferable:
      true,
    dexTransferCompatible:
      true,
    tradeability:
      "integration-ready",
    exchangeListingVerified:
      false,
    liquidityConfigured:
      false,
    transferInstruction:
      "TransferCheckedWithFee",
    associatedTokenAccounts:
      "idempotent-create-supported",
    nativeTransferFee: {
      basisPoints:
        250,
      maximumFeePwrc:
        "1000000",
      rounding:
        "ceil",
    },
    transactionSafetyCeilings: {
      computeUnitLimit:
        400000,
      priorityFeeMicroLamports:
        "1000000",
      priorityFeeLamports:
        "400000",
    },
    priorityFeeEstimation: {
      provider:
        "helius",
      defaultLevel:
        "Medium",
      transactionEncoding:
        "Base64",
    },
    signing: {
      walletOwned:
        true,
      serverPrivateKeys:
        false,
    },
    liveFeeEpochSafety: {
      productionBuilder:
        "buildVerifiedUnsignedNativePwrcTransferTransaction",
      evidenceDomain:
        "POWERCHAIN_NATIVE_PWRC_TRANSFER_FEE_EPOCH_V1",
      epochBound:
        true,
      finalizedSlotBound:
        true,
      freshnessBound:
        true,
      authorityPolicyCompatible:
        true,
      legacyBuilderAvailable:
        true,
      productionEvidenceRequired:
        true,
    },
    transactionIntegrity: {
      deterministicIntent:
        true,
      exactUnsignedMessageReview:
        true,
      blockhashLifetimeBound:
        true,
      unexpectedInstructionDetection:
        true,
    },
    transactionSubmission: {
      sdkIncluded:
        false,
      walletOrApplicationOwned:
        true,
      blindRetry:
        false,
    },
    publicWrites:
      false,
  };
}

export function utilityRuntimePolicy(
  env =
    process.env,
) {
  const required = [
    "PWRC_UTILITY_MAX_REQUESTS_PER_MINUTE",
    "PWRC_UTILITY_MAX_CONCURRENT_JOBS",
    "PWRC_UTILITY_MAX_PAYLOAD_BYTES",
    "PWRC_UTILITY_MAX_WORK_UNITS",
  ];
  const missing =
    required.filter(
      (key) =>
        !env[key]?.trim(),
    );

  return {
    version:
      "1.0.0",
    asset:
      "PWRC",
    workloads: [
      "ai-inference",
      "ai-agent",
      "embedding",
      "storage",
      "api-compute",
    ],
    configured:
      missing.length ===
      0,
    failClosed:
      missing.length >
      0,
    missing,
    authorization: {
      deterministicSha256:
        true,
      idempotencyRequired:
        true,
      expiryRequired:
        true,
      maxSpendBound:
        true,
      privateKeyRequired:
        false,
    },
    computeSecurity: {
      requestRateLimit:
        true,
      concurrencyLimit:
        true,
      payloadLimit:
        true,
      workBudgetLimit:
        true,
      duplicateRequestRejection:
        true,
      boundedIdempotencyRegistry:
        true,
    },
    publicWrites:
      false,
  };
}
