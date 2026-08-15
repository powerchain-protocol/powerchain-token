import {
  API_ROUTES,
  apiIndex,
} from "../../apps/api/lib/api-registry.mjs";
import {
  bridgeStatus,
  quoteSolanaToSuiBridge,
  quoteSuiToSolanaBridge,
} from "../../apps/api/lib/bridge-routes.mjs";
import {
  readinessState,
} from "../../apps/api/lib/status.mjs";
import {
  bridgeLifecyclePolicy,
} from "../../apps/api/lib/bridge-lifecycle.mjs";
import {
  bridgeExecutionPolicy,
} from "../../apps/api/lib/bridge-plan.mjs";
import {
  bridgeReconciliationPolicy,
} from "../../apps/api/lib/bridge-reconciliation.mjs";
import {
  bridgeRecoveryPolicy,
} from "../../apps/api/lib/bridge-recovery.mjs";
import {
  bridgeAuditPolicy,
} from "../../apps/api/lib/bridge-audit.mjs";
import {
  bridgeRiskPolicy,
} from "../../apps/api/lib/bridge-risk.mjs";
import {
  bridgeGovernancePolicy,
} from "../../apps/api/lib/bridge-governance.mjs";
import {
  bridgeSafetyPolicy,
} from "../../apps/api/lib/bridge-safety.mjs";
import {
  bridgePolicyConfigSurface,
} from "../../apps/api/lib/bridge-policy-config.mjs";
import {
  nativePwrcPolicy,
} from "../../apps/api/lib/native-token.mjs";
import {
  publicFeePolicy,
  publicPlatformState,
} from "../../apps/api/lib/public-platform.mjs";

const failures = [];

const index =
  apiIndex();

if (
  index.version !==
    "1.0.0" ||
  index.basePath !==
    "/api/v1" ||
  index.endpoints.length !==
    API_ROUTES.length
) {
  failures.push(
    "api-index",
  );
}

const routeKeys =
  new Set();

for (const route of API_ROUTES) {
  const key =
    `${route.method}:${route.path}`;

  if (routeKeys.has(key)) {
    failures.push(
      `duplicate-route:${key}`,
    );
  }

  routeKeys.add(key);

  if (
    route.method !==
      "GET"
  ) {
    failures.push(
      `write-route:${key}`,
    );
  }
}

const status =
  bridgeStatus({
    PWRC_CLUSTER:
      "devnet",
    SUI_NETWORK:
      "devnet",
    PWRC_BRIDGE_EXECUTION_ENABLED:
      "false",
  });

if (
  status.enabled !==
    false ||
  status.writesExposedByThisApi !==
    false ||
  status.canonical.symbol !==
    "PWRC" ||
  status.wrapped.symbol !==
    "wPWRC"
) {
  failures.push(
    "bridge-status",
  );
}

const quote =
  quoteSolanaToSuiBridge({
    amountBaseUnits:
      "1000000000000",
    serviceEnabled:
      false,
    serviceBps:
      250,
    serviceRecipient:
      null,
    quoteTtlMs:
      30_000,
  });

if (
  quote.direction !==
    "solana-to-sui" ||
  quote.canonical
    .lockedBackingBaseUnits !==
    quote.wrapped
      .mintBaseUnits ||
  quote.wrapped.ratio !==
    "1:1-base-units"
) {
  failures.push(
    "bridge-quote",
  );
}


const reverseQuote =
  quoteSuiToSolanaBridge({
    amountBaseUnits:
      "1000000000000",
    serviceEnabled:
      false,
    serviceBps:
      250,
    serviceRecipient:
      null,
    quoteTtlMs:
      30_000,
  });

if (
  reverseQuote.direction !==
    "sui-to-solana" ||
  reverseQuote.wrapped
    .burnBaseUnits !==
    "1000000000000" ||
  reverseQuote.wrapped
    .sourceNativeTransferFeeBaseUnits !==
    "0" ||
  reverseQuote.canonical
    .releaseGrossBaseUnits !==
    "1000000000000" ||
  reverseQuote.canonical
    .destinationNativeTransferFeeBaseUnits !==
    "25000000000" ||
  reverseQuote.canonical
    .recipientNetBaseUnits !==
    "975000000000"
) {
  failures.push(
    "reverse-bridge-quote",
  );
}











const nativePolicy =
  nativePwrcPolicy();

if (
  nativePolicy.standard !==
    "Token-2022" ||
  nativePolicy.decimals !==
    9 ||
  nativePolicy.fixedSupply !==
    "18446000000" ||
  nativePolicy.nativeTransferFee
    .basisPoints !==
    250 ||
  nativePolicy.nativeTransferFee
    .maximumFeePwrc !==
    "1000000" ||
  nativePolicy.verifier
    .mintInstruction !==
    false ||
  nativePolicy.publicWrites !==
    false
) {
  failures.push(
    "native-pwrc-policy",
  );
}

const policyConfig =
  bridgePolicyConfigSurface(
    {},
  );

if (
  policyConfig.configured !==
    false ||
  policyConfig.failClosed !==
    true ||
  policyConfig.secretsExposed !==
    false ||
  policyConfig.publicWrites !==
    false
) {
  failures.push(
    "bridge-policy-config",
  );
}

const safetyPolicy =
  bridgeSafetyPolicy();

if (
  safetyPolicy.publicWrites !==
    false ||
  safetyPolicy.rules
    .destinationSubmissionRequiresSourceFinality !==
    true ||
  safetyPolicy.rules
    .completionRequiresReconciliation !==
    true ||
  safetyPolicy.rules
    .invalidAuditBlocksProgress !==
    true ||
  safetyPolicy.rules
    .publicControlWrites !==
    false
) {
  failures.push(
    "bridge-safety-policy",
  );
}

const governancePolicy =
  bridgeGovernancePolicy();

if (
  governancePolicy.publicWrites !==
    false ||
  governancePolicy.rules
    .minimumApprovalThreshold !==
    2 ||
  governancePolicy.rules
    .proposerSelfApproval !==
    false ||
  governancePolicy.rules
    .executionRequiresQuorum !==
    true ||
  governancePolicy.rules
    .publicAdminWrites !==
    false
) {
  failures.push(
    "bridge-governance-policy",
  );
}

const riskPolicy =
  bridgeRiskPolicy();

if (
  riskPolicy.publicWrites !==
    false ||
  riskPolicy.rules
    .undercollateralizationTrips !==
    true ||
  riskPolicy.rules
    .reconciliationMismatchTrips !==
    true ||
  riskPolicy.rules
    .newBridgeIntentsBlockedWhenPauseRecommended !==
    true ||
  riskPolicy.rules
    .automaticOnChainPause !==
    false
) {
  failures.push(
    "bridge-risk-policy",
  );
}

const auditPolicy =
  bridgeAuditPolicy();

if (
  auditPolicy.hashChain !==
    true ||
  auditPolicy.correlationIds !==
    true ||
  auditPolicy.publicWrites !==
    false ||
  auditPolicy.rules
    .reconciliationMismatchCritical !==
    true ||
  !auditPolicy
    .sensitiveAttributesForbidden
    .includes(
      "privateKey",
    )
) {
  failures.push(
    "bridge-audit-policy",
  );
}

const recovery =
  bridgeRecoveryPolicy();

if (
  recovery.automaticWriteRetry !==
    false ||
  recovery.readRetry !==
    true ||
  recovery.rules
    .finalityTimeoutUsesReadOnlyPolling !==
    true ||
  recovery.rules
    .reconciliationMismatchTerminal !==
    true ||
  recovery.rules
    .publicWrites !==
    false
) {
  failures.push(
    "bridge-recovery-policy",
  );
}

const reconciliation =
  bridgeReconciliationPolicy();

if (
  reconciliation.rules
    .sourceAndDestinationAmountsMustMatchPrincipal !==
    true ||
  reconciliation.rules
    .sourceAndDestinationChainsMustMatchDirection !==
    true ||
  reconciliation.rules
    .completionWithoutBothFinalityProofs !==
    false ||
  reconciliation.rules
    .publicWrites !==
    false ||
  reconciliation.completionRequires.length !==
    3
) {
  failures.push(
    "bridge-reconciliation-policy",
  );
}

const executionPlan =
  bridgeExecutionPolicy();

if (
  executionPlan.publicWrites !==
    false ||
  executionPlan.blindRetry !==
    false ||
  executionPlan.steps.length !==
    7 ||
  executionPlan.steps
    .filter(
      (step) =>
        step.monetaryWrite,
    )
    .map(
      (step) =>
        step.kind,
    )
    .join(",") !==
    "SOURCE_SUBMIT,DESTINATION_SUBMIT"
) {
  failures.push(
    "bridge-execution-plan",
  );
}

const lifecycle =
  bridgeLifecyclePolicy();

if (
  lifecycle.rules
    .sourceFinalityRequiredBeforeDestinationSubmission !==
    true ||
  lifecycle.rules
    .destinationFinalityRequiredBeforeCompletion !==
    true ||
  lifecycle.rules
    .publicSettlementWrites !==
    false ||
  lifecycle.rules
    .blindRetry !==
    false ||
  lifecycle.completionSequence.join(
    ">",
  ) !==
    "CREATED>SOURCE_FINALIZED>DESTINATION_SUBMITTED>DESTINATION_FINALIZED>COMPLETED"
) {
  failures.push(
    "bridge-lifecycle",
  );
}

const ready =
  readinessState({
    cdpConfigured:
      false,
  });

if (
  ready.ready !==
    true ||
  ready.runtime
    .cdpSqlConfigured !==
    false
) {
  failures.push(
    "readiness",
  );
}


const platform =
  publicPlatformState(
    {},
  );

if (
  platform.canonicalAsset
    ?.mint !==
    "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc" ||
  platform.features
    ?.bridgeWritesExposed !==
    false
) {
  failures.push(
    "platform",
  );
}

const feePolicy =
  publicFeePolicy(
    {},
  );

if (
  feePolicy.nativeToken2022Fee
    ?.basisPoints !==
    250 ||
  feePolicy.nativeToken2022Fee
    ?.maximumFeeTokens !==
    "1000000" ||
  feePolicy.serviceFee
    ?.ordinaryWalletTransferExcluded !==
    true
) {
  failures.push(
    "fee-policy",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length ===
        0,
      version:
        "1.0.0",
      routes:
        API_ROUTES.length,
      bridgeQuote:
        true,
      reverseBridgeQuote:
        true,
      bridgeLifecycle:
        true,
      bridgeExecutionPlan:
        true,
      bridgeReconciliation:
        true,
      bridgeRecovery:
        true,
      bridgeAudit:
        true,
      bridgeRisk:
        true,
      bridgeGovernance:
        true,
      bridgeSafety:
        true,
      bridgePolicyConfig:
        true,
      nativePwrcPolicy:
        true,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
