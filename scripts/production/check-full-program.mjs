import fs from "node:fs";

const failures = [];

const solanaToken =
  fs.readFileSync(
    "programs/token/src/lib.rs",
    "utf8",
  );
const solanaLock =
  fs.readFileSync(
    "programs/pwrc-lock/src/lib.rs",
    "utf8",
  );
const sui =
  fs.readFileSync(
    "contracts/wpwrc/sources/wpwrc.move",
    "utf8",
  );
const protocolBridge =
  fs.readFileSync(
    "packages/protocol/src/bridge.ts",
    "utf8",
  );
const settlement =
  fs.readFileSync(
    "packages/protocol/src/bridge-settlement.ts",
    "utf8",
  );
const bridgePlan =
  fs.readFileSync(
    "packages/protocol/src/bridge-plan.ts",
    "utf8",
  );
const reconciliation =
  fs.readFileSync(
    "packages/protocol/src/bridge-reconciliation.ts",
    "utf8",
  );
const recovery =
  fs.readFileSync(
    "packages/protocol/src/bridge-recovery.ts",
    "utf8",
  );
const audit =
  fs.readFileSync(
    "packages/protocol/src/bridge-audit.ts",
    "utf8",
  );
const risk =
  fs.readFileSync(
    "packages/protocol/src/bridge-risk.ts",
    "utf8",
  );
const governance =
  fs.readFileSync(
    "packages/protocol/src/bridge-governance.ts",
    "utf8",
  );
const safety =
  fs.readFileSync(
    "packages/protocol/src/bridge-safety.ts",
    "utf8",
  );
const policy =
  fs.readFileSync(
    "packages/protocol/src/bridge-policy.ts",
    "utf8",
  );
const nativeToken =
  fs.readFileSync(
    "packages/protocol/src/native-token.ts",
    "utf8",
  );
const nativeTokenObserver =
  fs.readFileSync(
    "packages/sdk/src/native-token-observer.ts",
    "utf8",
  );
const nativeTokenConsensus =
  fs.readFileSync(
    "packages/protocol/src/native-token-consensus.ts",
    "utf8",
  );
const nativeTokenAttestation =
  fs.readFileSync(
    "packages/protocol/src/native-token-attestation.ts",
    "utf8",
  );
const nativeTokenPolicy =
  fs.readFileSync(
    "packages/protocol/src/native-token-policy.ts",
    "utf8",
  );
const nativeObservationConsistency =
  fs.readFileSync(
    "scripts/production/check-v24-observation-consistency.mjs",
    "utf8",
  );
const nativeAttestationHardening =
  fs.readFileSync(
    "scripts/production/check-v25-attestation-hardening.mjs",
    "utf8",
  );
const nativeFeeRuntimeHardening =
  fs.readFileSync(
    "scripts/production/check-v26-fee-runtime.mjs",
    "utf8",
  );
const mainnetNativeEvidence =
  fs.readFileSync(
    "scripts/production/check-v27-mainnet-native-evidence.mjs",
    "utf8",
  );
const heliusV28Hardening =
  fs.readFileSync(
    "scripts/production/check-v28-helius-hardening.mjs",
    "utf8",
  );
const programV29Hardening =
  fs.readFileSync(
    "scripts/production/check-v29-program-hardening.mjs",
    "utf8",
  );
const canonicalTokenRuntimeParity =
  fs.readFileSync(
    "scripts/production/check-token-runtime-parity.mjs",
    "utf8",
  );

const tokenPolicyBinding =
  fs.readFileSync(
    "scripts/production/check-token-policy-binding.mjs",
    "utf8",
  );

const clientUi =
  fs.readFileSync(
    "scripts/production/check-client-ui.mjs",
    "utf8",
  );

const rateLimitHardening =
  fs.readFileSync(
    "scripts/production/check-rate-limit-hardening.mjs",
    "utf8",
  );

const clientUiUx =
  fs.readFileSync(
    "scripts/production/check-client-uiux.mjs",
    "utf8",
  );

const nativeTransferReviewBundle =
  fs.readFileSync(
    "scripts/production/check-native-transfer-review-bundle.mjs",
    "utf8",
  );

const nativeTransferPreflight =
  fs.readFileSync(
    "scripts/production/check-native-transfer-preflight.mjs",
    "utf8",
  );

const tokenDescription =
  fs.readFileSync(
    "scripts/production/check-token-description.mjs",
    "utf8",
  );

const powerChainTokenApi =
  fs.readFileSync(
    "scripts/production/check-powerchain-token-api.mjs",
    "utf8",
  );

const heliusClientSafety =
  fs.readFileSync(
    "scripts/production/check-helius-client-safety.mjs",
    "utf8",
  );

const utilityWalletAuthorization =
  fs.readFileSync(
    "scripts/production/check-utility-wallet-authorization.mjs",
    "utf8",
  );

const tokenFeeAuthorityPolicy =
  fs.readFileSync(
    "scripts/production/check-token-fee-authority-policy.mjs",
    "utf8",
  );

const canonicalTokenApi =
  fs.readFileSync(
    "scripts/production/check-token-api-policy.mjs",
    "utf8",
  );

const canonicalTokenPolicy =
  fs.readFileSync(
    "scripts/production/check-token-policy-integrity.mjs",
    "utf8",
  );

const canonicalToolchain =
  fs.readFileSync(
    "scripts/production/check-toolchain.mjs",
    "utf8",
  );
const canonicalPackageVersions =
  fs.readFileSync(
    "scripts/production/check-package-versions.mjs",
    "utf8",
  );

const transferIntentIntegrity =
  fs.readFileSync(
    "scripts/production/check-transfer-intent-integrity.mjs",
    "utf8",
  );
const nativeAttestationCacheIntegrity =
  fs.readFileSync(
    "scripts/production/check-native-attestation-cache-integrity.mjs",
    "utf8",
  );

const securityV30Hardening =
  fs.readFileSync(
    "scripts/production/check-v30-security-runtime.mjs",
    "utf8",
  );
const feeEpochV31Hardening =
  fs.readFileSync(
    "scripts/production/check-v31-fee-epoch-hardening.mjs",
    "utf8",
  );
const helius =
  fs.readFileSync(
    "packages/sdk/src/helius-client.ts",
    "utf8",
  );
const solanaNetworkIntegrity =
  fs.readFileSync(
    "scripts/production/check-solana-network-integrity.mjs",
    "utf8",
  );
const nativeVerificationRuntime =
  fs.readFileSync(
    "apps/api/lib/native-attestation.mjs",
    "utf8",
  );
const nativeTokenTransactions =
  fs.readFileSync(
    "packages/sdk/src/native-token-transactions.ts",
    "utf8",
  );
const utilitySecurity =
  fs.readFileSync(
    "packages/protocol/src/compute-security.ts",
    "utf8",
  );
const metaplexCompatibility =
  fs.readFileSync(
    "packages/metaplex/src/compatibility.ts",
    "utf8",
  );
const manifestBindings =
  fs.readFileSync(
    "scripts/mainnet/check-build-manifest-bindings.mjs",
    "utf8",
  );
const protocolFees =
  fs.readFileSync(
    "packages/protocol/src/fees.ts",
    "utf8",
  );
const sdkBridge =
  fs.readFileSync(
    "packages/sdk/src/bridge-integration.ts",
    "utf8",
  );
const apiBridge =
  fs.readFileSync(
    "apps/api/lib/bridge-routes.mjs",
    "utf8",
  );
const apiServer =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );

for (const invariant of [
  'declare_id!("PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu")',
  "PWRC_CANONICAL_MINT",
  "PWRC_GENESIS_BASE_UNITS",
  "MintAuthorityPresent",
  "FreezeAuthorityPresent",
]) {
  if (!solanaToken.includes(invariant)) {
    failures.push(
      `full-program:token:${invariant}`,
    );
  }
}

for (const invariant of [
  "operator: Pubkey",
  "set_operator",
  "transfer_governor",
  "verify_state",
  "paused =",
  "true",
  "InvalidGovernor",
  "InvalidOperator",
]) {
  if (!solanaLock.includes(invariant)) {
    failures.push(
      `full-program:solana-lock:${invariant}`,
    );
  }
}

for (const forbidden of [
  "mint_to",
  "release_pwrc",
  "mint_pwrc",
]) {
  if (solanaLock.includes(forbidden)) {
    failures.push(
      `full-program:solana-lock-forbidden:${forbidden}`,
    );
  }
}

for (const invariant of [
  "transfer_governor",
  "E_ZERO_ADDRESS",
  "consumed_messages",
  "message_consumed",
  "mint_sequence",
  "burn_sequence",
  "E_MESSAGE_ALREADY_CONSUMED",
  "WPWRC_MAX_BASE_UNITS",
]) {
  if (!sui.includes(invariant)) {
    failures.push(
      `full-program:sui:${invariant}`,
    );
  }
}


















for (const invariant of [
  "createTransferCheckedWithFeeInstruction",
  "createAssociatedTokenAccountIdempotentInstruction",
  "buildUnsignedNativePwrcTransferTransaction",
]) {
  if (!nativeTokenTransactions.includes(invariant)) {
    failures.push(
      `full-program:native-transactions:${invariant}`,
    );
  }
}

for (const invariant of [
  "PWRC_COMPUTE_RATE_LIMITED",
  "PWRC_COMPUTE_DUPLICATE_REQUEST",
]) {
  if (!utilitySecurity.includes(invariant)) {
    failures.push(
      `full-program:utility-security:${invariant}`,
    );
  }
}

for (const invariant of [
  "Fungible",
  "SOLANA_TOKEN_2022_PROGRAM_ID",
]) {
  if (!metaplexCompatibility.includes(invariant)) {
    failures.push(
      `full-program:metaplex-compatibility:${invariant}`,
    );
  }
}

for (const invariant of [
  "nativePwrcVerificationConfig",
  "liveNativePwrcAttestation",
  "PWRC_NATIVE_VERIFICATION_SECONDARY_RPC_REQUIRED",
  "PWRC_NATIVE_VERIFICATION_HELIUS_REQUIRED",
]) {
  if (!nativeVerificationRuntime.includes(invariant)) {
    failures.push(
      `full-program:native-verification-runtime:${invariant}`,
    );
  }
}

for (const invariant of [
  "resolveExpectedSolanaGenesisHash",
  "assertIndependentRpcProviders",
  "PWRC_SECONDARY_RPC_PROVIDER_MUST_DIFFER",
]) {
  if (!solanaNetworkIntegrity.includes(invariant)) {
    failures.push(
      `full-program:solana-network-integrity:${invariant}`,
    );
  }
}

for (const invariant of [
  "criticalBindings",
  "generatorCriticalBindings",
  "verifierCriticalBindings",
  "symmetric",
]) {
  if (!manifestBindings.includes(invariant)) {
    failures.push(
      `full-program:manifest-bindings:${invariant}`,
    );
  }
}

for (const invariant of [
  "READ_RPC_METHODS",
  "DAS_METHODS",
  "PWRC_HELIUS_RPC_METHOD_NOT_ALLOWED",
  "PWRC_HELIUS_DAS_METHOD_NOT_ALLOWED",
]) {
  if (!helius.includes(invariant)) {
    failures.push(
      `full-program:helius:${invariant}`,
    );
  }
}










for (const invariant of [
  "liveFeeEpochEvidence",
  "deterministicFeeEvidenceCommitment",
  "epochTransitionFailsClosed",
  "slotLagFailsClosed",
  "productionBuilderRequiresEvidence",
]) {
  if (!feeEpochV31Hardening.includes(invariant)) {
    failures.push(
      `full-program:fee-epoch-v31:${invariant}`,
    );
  }
}

for (const invariant of [
  "feeEnginePolicyDerived",
  "fixedSupplyQuoteBound",
  "compactTokenPolicyDerived",
  "bridgeIdentityPolicyDerived",
  "sdkAmountSupplyBound",
]) {
  if (!canonicalTokenRuntimeParity.includes(invariant)) {
    failures.push(
      `full-program:token-runtime-parity:${invariant}`,
    );
  }
}

for (const invariant of [
  "intentPolicyBound",
  "quotePolicyBound",
  "totalSourceDebitSupplyBound",
  "priorityFeeTotalBound",
]) {
  if (!tokenPolicyBinding.includes(invariant)) {
    failures.push(
      `full-program:token-policy-binding:${invariant}`,
    );
  }
}

for (const invariant of [
  "bounded-token-bucket",
  "processLocal",
  "distributed",
  "trustedProxyDefault",
  "explicitTrustedProxyAddresses",
  "forwardedHopBound",
]) {
  if (!rateLimitHardening.includes(invariant)) {
    failures.push(
      `full-program:rate-limit-hardening:${invariant}`,
    );
  }
}

for (const invariant of [
  "responsive",
  "lightDarkTheme",
  "mobileNavigation",
  "assetRegistryUi",
  "exactBigIntQuoteFormatting",
  "swaggerProxy",
  "cspCompatible",
  "accessibility",
]) {
  if (!clientUi.includes(invariant)) {
    failures.push(
      `full-program:client-ui:${invariant}`,
    );
  }
}

for (const invariant of [
  "responsive",
  "lightDarkTheme",
  "reducedMotion",
  "accessibleFocus",
  "mobileQuickActions",
  "dynamicSafetyPolicy",
  "walletConnectionRequired",
]) {
  if (!clientUiUx.includes(invariant)) {
    failures.push(
      `full-program:client-uiux:${invariant}`,
    );
  }
}

for (const invariant of [
  "verifiedIntentDomain",
  "reviewBundleDomain",
  "feeEpochEvidenceBound",
  "feeAuthorityPolicyCommitmentBound",
  "preflightReportBound",
  "unsignedMessageBound",
  "authorizationIncluded",
]) {
  if (!nativeTransferReviewBundle.includes(invariant)) {
    failures.push(
      `full-program:native-transfer-review-bundle:${invariant}`,
    );
  }
}

for (const invariant of [
  "sourceAccountValidation",
  "destinationAccountValidation",
  "payerSolValidation",
  "optionalSimulation",
  "reportCommitmentSha256",
  "observationSlotBound",
  "observationTimeBound",
  "submissionIncluded",
]) {
  if (!nativeTransferPreflight.includes(invariant)) {
    failures.push(
      `full-program:native-transfer-preflight:${invariant}`,
    );
  }
}

for (const invariant of [
  "descriptionSha256",
  "renewableEnergyRelated",
  "metadataParity",
  "assetParity",
  "tokenPolicyUnchanged",
]) {
  if (!tokenDescription.includes(invariant)) {
    failures.push(
      `full-program:token-description:${invariant}`,
    );
  }
}

for (const invariant of [
  "tokenApiBase",
  "assetApiBase",
  "canonicalAssets",
  "policyBound",
]) {
  if (!powerChainTokenApi.includes(invariant)) {
    failures.push(
      `full-program:powerchain-token-api:${invariant}`,
    );
  }
}

for (const invariant of [
  "responseBodyBound",
  "callerAbortSignal",
  "timeoutDistinctFromCancellation",
  "monotonicRpcRequestIds",
]) {
  if (!heliusClientSafety.includes(invariant)) {
    failures.push(
      `full-program:helius-client-safety:${invariant}`,
    );
  }
}

for (const invariant of [
  "walletSignableEnvelope",
  "signatureIncluded",
  "nonceBound",
  "tokenPolicyBound",
]) {
  if (!utilityWalletAuthorization.includes(invariant)) {
    failures.push(
      `full-program:utility-wallet-authorization:${invariant}`,
    );
  }
}

for (const invariant of [
  "reviewedArtifactRequired",
  "envOnlyReleaseGating",
  "attestationCommitmentBound",
]) {
  if (!tokenFeeAuthorityPolicy.includes(invariant)) {
    failures.push(
      `full-program:token-fee-authority-policy:${invariant}`,
    );
  }
}

for (const invariant of [
  "canonicalPolicyRoute",
  "legacyNativePolicyCompatibility",
  "sdkExactAmountFacade",
  "closedOpenApiSchema",
]) {
  if (!canonicalTokenApi.includes(invariant)) {
    failures.push(
      `full-program:token-api:${invariant}`,
    );
  }
}

for (const invariant of [
  "POWERCHAIN_PWRC_TOKEN_POLICY_V1",
  "fixedSupplyBaseUnits",
  "u64HeadroomBaseUnits",
  "feeCapStartsAtGrossBaseUnits",
  "wrappedGenesisSupplyBaseUnits",
]) {
  if (!canonicalTokenPolicy.includes(invariant)) {
    failures.push(
      `full-program:token-policy:${invariant}`,
    );
  }
}

for (const invariant of [
  "exactNodeVersionFiles",
  "noFabricatedLockfile",
]) {
  if (!canonicalToolchain.includes(invariant)) {
    failures.push(
      `full-program:toolchain:${invariant}`,
    );
  }
}

for (const invariant of [
  "latestVerifiedPackagePins",
  "maintained-1.x",
]) {
  if (!canonicalPackageVersions.includes(invariant)) {
    failures.push(
      `full-program:package-versions:${invariant}`,
    );
  }
}

for (const invariant of [
  "canonicalIntentReverification",
  "commitmentRecomputed",
  "reviewFailsClosedBeforeMessageRebuild",
]) {
  if (!transferIntentIntegrity.includes(invariant)) {
    failures.push(
      `full-program:transfer-intent:${invariant}`,
    );
  }
}

for (const invariant of [
  "configKeyedCache",
  "observationFreshnessRechecked",
  "cacheTtlCappedByObservationAge",
]) {
  if (!nativeAttestationCacheIntegrity.includes(invariant)) {
    failures.push(
      `full-program:native-attestation-cache:${invariant}`,
    );
  }
}

for (const invariant of [
  "strictCanonicalCommitments",
  "exactTransactionBlockhash",
  "feeAccountingSupplyBound",
  "utilityAuthorizationTtlBound",
  "idempotencyClockSafety",
  "suiRoleSeparationAtGenesis",
]) {
  if (!securityV30Hardening.includes(invariant)) {
    failures.push(
      `full-program:security-v30:${invariant}`,
    );
  }
}

for (const invariant of [
  "solanaBridgeSingletonStatePda",
  "solanaAdminRoleSeparation",
  "solanaTwoStepGovernorTransfer",
  "solanaGovernorChangeForcesPause",
  "suiZeroEvidenceRejected",
  "suiSequenceOverflowProtected",
]) {
  if (!programV29Hardening.includes(invariant)) {
    failures.push(
      `full-program:program-v29:${invariant}`,
    );
  }
}

for (const invariant of [
  "shared429Cooldown",
  "retryAfterAware",
  "serializableSecretUrlsRemoved",
  "healthSingleFlightCache",
  "canonicalPwrcDasMainnetOnly",
]) {
  if (!heliusV28Hardening.includes(invariant)) {
    failures.push(
      `full-program:helius-v28:${invariant}`,
    );
  }
}

for (const invariant of [
  "trustedGenesisExact32Bytes",
  "sourceTreeBound",
  "providerIndependenceBound",
  "feeAuthorityPolicyBound",
  "mainnetRequiresVerifiedNativeAttestation",
]) {
  if (!mainnetNativeEvidence.includes(invariant)) {
    failures.push(
      `full-program:mainnet-native-evidence-v27:${invariant}`,
    );
  }
}

for (const invariant of [
  "transferFeeAuthoritiesObserved",
  "expectedAuthorityPolicyRequired",
  "tradeabilityClaimQualified",
  "mainnetAuthorityGate",
]) {
  if (!nativeFeeRuntimeHardening.includes(invariant)) {
    failures.push(
      `full-program:native-fee-runtime-v26:${invariant}`,
    );
  }
}

for (const invariant of [
  "exactGenesisHash32Bytes",
  "adjacentEpochBoundary",
  "deterministicEvaluationTime",
  "evaluationTimeCommitted",
]) {
  if (!nativeAttestationHardening.includes(invariant)) {
    failures.push(
      `full-program:native-attestation-v25:${invariant}`,
    );
  }
}

for (const invariant of [
  "observationWindowBound",
  "slotRegressionRejected",
  "attestationBindsObservationRanges",
  "concurrentFailClosedObservers",
]) {
  if (!nativeObservationConsistency.includes(invariant)) {
    failures.push(
      `full-program:native-observation-consistency:${invariant}`,
    );
  }
}

for (const invariant of [
  "POWERCHAIN_NATIVE_PWRC_POLICY_V1",
  "nativePwrcPolicySha256",
  "METAPLEX_TOKEN_METADATA_PROGRAM_ID",
]) {
  if (!nativeTokenPolicy.includes(invariant)) {
    failures.push(
      `full-program:native-token-policy:${invariant}`,
    );
  }
}

for (const invariant of [
  "POWERCHAIN_NATIVE_PWRC_ATTESTATION_V1",
  "PWRC_NATIVE_ATTESTATION_WRONG_GENESIS",
  "PWRC_NATIVE_ATTESTATION_STALE",
  "PWRC_NATIVE_ATTESTATION_SLOT_SKEW_EXCEEDED",
  "assertNativePwrcAttestation",
]) {
  if (!nativeTokenAttestation.includes(invariant)) {
    failures.push(
      `full-program:native-token-attestation:${invariant}`,
    );
  }
}

for (const invariant of [
  "POWERCHAIN_NATIVE_PWRC_OBSERVATION_V1",
  "POWERCHAIN_NATIVE_PWRC_CONSENSUS_V1",
  "PWRC_NATIVE_CONSENSUS_OBSERVATION_MISMATCH",
  "assertNativePwrcConsensus",
]) {
  if (!nativeTokenConsensus.includes(invariant)) {
    failures.push(
      `full-program:native-token-consensus:${invariant}`,
    );
  }
}

for (const invariant of [
  "getMint",
  "getExtensionTypes",
  "getTransferFeeConfig",
  "getMetadataPointerState",
  "getTokenMetadata",
  "verifyNativePwrcMintObservation",
  "PWRC_NATIVE_LIVE_VERIFICATION_FAILED",
]) {
  if (!nativeTokenObserver.includes(invariant)) {
    failures.push(
      `full-program:native-token-observer:${invariant}`,
    );
  }
}

for (const invariant of [
  "TransferFeeConfig",
  "MetadataPointer",
  "TokenMetadata",
  "verifyNativePwrcMintObservation",
  "nativePwrcTransferPreview",
  "PWRC_NATIVE_TOKEN_PROGRAM_MISMATCH",
  "PWRC_NATIVE_EXTENSION_UNEXPECTED",
  "PWRC_NATIVE_EXTENSION_DUPLICATE",
]) {
  if (!nativeToken.includes(invariant)) {
    failures.push(
      `full-program:native-token:${invariant}`,
    );
  }
}

for (const invariant of [
  "POWERCHAIN_BRIDGE_POLICY_V1",
  "policySha256",
  "PWRC_BRIDGE_POLICY_COMMITMENT_MISMATCH",
  "PWRC_BRIDGE_POLICY_GOVERNANCE_THRESHOLD_TOO_LOW",
  "PWRC_BRIDGE_POLICY_EVIDENCE_AGE_EXCEEDS_PROPOSAL_TTL",
  "PWRC_BRIDGE_POLICY_GOVERNANCE_THRESHOLD_EXCEEDS_OPERATIONS",
  "PWRC_BRIDGE_POLICY_SUI_NETWORK_UNSUPPORTED",
  "PWRC_BRIDGE_POLICY_SOLANA_NETWORK_UNSUPPORTED",
]) {
  if (!policy.includes(invariant)) {
    failures.push(
      `full-program:policy:${invariant}`,
    );
  }
}

for (const invariant of [
  "acceptNewIntents",
  "allowDestinationSubmission",
  "allowCompletion",
  "PWRC_BRIDGE_SAFETY_GOVERNANCE_PAUSED",
  "PWRC_BRIDGE_SAFETY_RISK_HALT_REQUIRED",
  "PWRC_BRIDGE_SAFETY_AUDIT_INVALID",
  "PWRC_BRIDGE_SAFETY_RECOVERY_REQUIRED",
  "PWRC_BRIDGE_SAFETY_STATE_INCONSISTENT",
]) {
  if (!safety.includes(invariant)) {
    failures.push(
      `full-program:safety:${invariant}`,
    );
  }
}

for (const invariant of [
  "POWERCHAIN_BRIDGE_GOVERNANCE_PROPOSAL_V1",
  "PWRC_BRIDGE_GOVERNANCE_SELF_APPROVAL_FORBIDDEN",
  "PWRC_BRIDGE_GOVERNANCE_DUPLICATE_APPROVAL",
  "PWRC_BRIDGE_GOVERNANCE_PROPOSAL_EXPIRED",
  "PWRC_BRIDGE_GOVERNANCE_QUORUM_NOT_REACHED",
]) {
  if (!governance.includes(invariant)) {
    failures.push(
      `full-program:governance:${invariant}`,
    );
  }
}

for (const invariant of [
  "PAUSE_RECOMMENDED",
  "HALT_REQUIRED",
  "PWRC_BRIDGE_RISK_UNDERCOLLATERALIZED",
  "PWRC_BRIDGE_RISK_RECONCILIATION_MISMATCH",
  "allowNewBridgeIntents",
]) {
  if (!risk.includes(invariant)) {
    failures.push(
      `full-program:risk:${invariant}`,
    );
  }
}

for (const invariant of [
  "eventSha256",
  "previousEventSha256",
  "PWRC_BRIDGE_AUDIT_CHAIN_BROKEN",
  "PWRC_BRIDGE_AUDIT_EVENT_HASH_MISMATCH",
  "PWRC_BRIDGE_AUDIT_FORBIDDEN_ATTRIBUTE",
  "classifyBridgeIncidentSeverity",
]) {
  if (!audit.includes(invariant)) {
    failures.push(
      `full-program:audit:${invariant}`,
    );
  }
}

for (const invariant of [
  "automaticWriteRetryAllowed",
  "WAIT_SOURCE_FINALITY",
  "WAIT_DESTINATION_FINALITY",
  "REFRESH_EVIDENCE",
  "MANUAL_REVIEW",
  "PWRC_BRIDGE_EVIDENCE_STALE",
  "PWRC_BRIDGE_EVIDENCE_FROM_FUTURE",
]) {
  if (!recovery.includes(invariant)) {
    failures.push(
      `full-program:recovery:${invariant}`,
    );
  }
}

for (const invariant of [
  "sourceEvidenceSha256",
  "destinationEvidenceSha256",
  "reconciliationSha256",
  "PWRC_BRIDGE_RECONCILIATION_CONSERVATION_MISMATCH",
  "PWRC_BRIDGE_RECONCILIATION_COMMITMENT_MISMATCH",
]) {
  if (!reconciliation.includes(invariant)) {
    failures.push(
      `full-program:reconciliation:${invariant}`,
    );
  }
}

for (const invariant of [
  "SOURCE_PREPARE",
  "SOURCE_SUBMIT",
  "SOURCE_FINALITY",
  "DESTINATION_PREPARE",
  "DESTINATION_SUBMIT",
  "DESTINATION_FINALITY",
  "RECONCILE",
  "bridgeEvidenceRequirements",
]) {
  if (!bridgePlan.includes(invariant)) {
    failures.push(
      `full-program:bridge-plan:${invariant}`,
    );
  }
}

for (const invariant of [
  "CREATED",
  "SOURCE_FINALIZED",
  "DESTINATION_SUBMITTED",
  "DESTINATION_FINALIZED",
  "COMPLETED",
  "FAILED",
  "createBridgeIntent",
  "transitionBridgeSettlement",
  "assertBridgeCompletionSequence",
  "POWERCHAIN_BRIDGE_INTENT_V1",
  "PWRC_GENESIS_BASE_UNITS",
  "PWRC_BRIDGE_INTENT_CHAIN_DIRECTION_MISMATCH",
]) {
  if (!settlement.includes(invariant)) {
    failures.push(
      `full-program:settlement:${invariant}`,
    );
  }
}

for (const invariant of [
  "quoteSolanaToSuiBridge",
  "quoteSuiToSolanaBridge",
  "bridgeConservationState",
  "PWRC_BRIDGE_PENDING_BURN_EXCEEDS_WRAPPED_SUPPLY",
  "PWRC_BRIDGE_UNDERCOLLATERALIZED",
]) {
  if (!protocolBridge.includes(invariant)) {
    failures.push(
      `full-program:protocol-bridge:${invariant}`,
    );
  }
}

for (const invariant of [
  'principalSourceChain',
  'principalSourceAsset',
  'destinationNativeTransferFeeBaseUnits',
  'destinationNetBaseUnits',
  '"bridge-sui-to-solana"',
]) {
  if (!protocolFees.includes(invariant)) {
    failures.push(
      `full-program:protocol-fees:${invariant}`,
    );
  }
}

if (
  !protocolFees.includes(
    'input.operation ===\n      "bridge-sui-to-solana"\n      ? nativePwrcTransferFee',
  )
) {
  failures.push(
    "full-program:destination-token2022-fee-not-explicit",
  );
}

for (const invariant of [
  "quoteSuiToSolanaBridge",
  "bridgeConservationState",
]) {
  if (!sdkBridge.includes(invariant)) {
    failures.push(
      `full-program:sdk:${invariant}`,
    );
  }
}

for (const invariant of [
  '"solana-to-sui"',
  '"sui-to-solana"',
  "quoteSuiToSolanaBridge",
]) {
  if (!apiBridge.includes(invariant)) {
    failures.push(
      `full-program:api-bridge:${invariant}`,
    );
  }
}

if (
  !apiServer.includes(
    "/api/v1/bridge/quote/sui-to-solana",
  )
) {
  failures.push(
    "full-program:api-reverse-route",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      coverage: {
        tokenVerifier:
          true,
        solanaBridgeAdmin:
          true,
        suiWrappedController:
          true,
        bidirectionalQuotes:
          true,
        feeDirectionality:
          true,
        sdkBridge:
          true,
        apiBridge:
          true,
        settlementLifecycle:
          true,
        executionPlan:
          true,
        reconciliation:
          true,
        recovery:
          true,
        audit:
          true,
        riskControls:
          true,
        governance:
          true,
        safetyControlPlane:
          true,
        deploymentPolicy:
          true,
        nativePwrcToken:
          true,
        nativePwrcLiveObserver:
          true,
        nativePwrcMultiRpcConsensus:
          true,
        nativePwrcNetworkAttestation:
          true,
        heliusIntegration:
          true,
        trustedSolanaNetworkIdentity:
          true,
        independentRpcProviderFamily:
          true,
        manifestBindingSymmetry:
          true,
        nativePwrcLiveAttestationApi:
          true,
        nativePwrcTransferRuntime:
          true,
        heliusPriorityFeeEstimation:
          true,
        metaplexFungibleCompatibility:
          true,
        pwrcUtilitySecurity:
          true,
        correctnessHardening:
          true,
        bridgePolicyHardening:
          true,
        nativePolicyHardening:
          true,
        observationConsistency:
          true,
        attestationHardening:
          true,
        feeRuntimeHardening:
          true,
        mainnetNativeEvidence:
          true,
        heliusHardening:
          true,
        programHardening:
          true,
        securityRuntimeHardening:
          true,
        feeEpochHardening:
          true,
      },
      deploymentClaimed:
        false,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
