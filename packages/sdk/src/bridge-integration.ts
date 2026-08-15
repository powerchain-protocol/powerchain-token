import {
  assertBridgeConservation,
  bridgeConservationState,
  quoteSolanaToSuiBridge,
  quoteSuiToSolanaBridge,
} from "@powerchain/protocol/bridge";
import {
  bridgeEvidenceRequirements,
  buildBridgeExecutionPlan,
} from "@powerchain/protocol/bridge-plan";
import {
  assertBridgeReconciliationRecord,
  createBridgeReconciliationRecord,
} from "@powerchain/protocol/bridge-reconciliation";
import {
  assertBridgeEvidenceFresh,
  bridgeRecoveryDecision,
} from "@powerchain/protocol/bridge-recovery";
import {
  assertBridgeAuditChain,
  classifyBridgeIncidentSeverity,
  createBridgeAuditEvent,
} from "@powerchain/protocol/bridge-audit";
import {
  evaluateBridgeRisk,
} from "@powerchain/protocol/bridge-risk";
import {
  approveBridgeGovernanceProposal,
  bridgeGovernanceExecutionReadiness,
  createBridgeGovernanceProposal,
} from "@powerchain/protocol/bridge-governance";
import {
  evaluateBridgeSafety,
} from "@powerchain/protocol/bridge-safety";
import {
  assertBridgePolicyProfile,
  createBridgePolicyProfile,
} from "@powerchain/protocol/bridge-policy";
import {
  createPowerChainSolanaClients,
} from "./solana-client.js";
import {
  createPowerChainSuiTransportConfig,
  requireWpwrcDeployment,
} from "./sui-client.js";

export interface BridgeIntegrationConfig {
  solanaCluster:
    "localnet" |
    "devnet" |
    "mainnet-beta";
  suiNetwork:
    "localnet" |
    "devnet" |
    "testnet" |
    "mainnet";
  env?:
    NodeJS.ProcessEnv;
}

export function createBridgeIntegration(
  input:
    BridgeIntegrationConfig,
) {
  const env =
    input.env ??
    process.env;

  return {
    solana:
      createPowerChainSolanaClients({
        cluster:
          input.solanaCluster,
        env,
      }),
    sui:
      createPowerChainSuiTransportConfig({
        network:
          input.suiNetwork,
        env,
      }),
    deployment:
      input.suiNetwork ===
        "mainnet" ||
      env[
        "WPWRC_SUI_PACKAGE_ID"
      ]?.trim()
        ? requireWpwrcDeployment({
            network:
              input.suiNetwork,
            env,
          })
        : null,
    quoteSolanaToSuiBridge,
    quoteSuiToSolanaBridge,
    bridgeConservationState,
    assertBridgeConservation,
    buildBridgeExecutionPlan,
    bridgeEvidenceRequirements,
    createBridgeReconciliationRecord,
    assertBridgeReconciliationRecord,
    bridgeRecoveryDecision,
    assertBridgeEvidenceFresh,
    createBridgeAuditEvent,
    assertBridgeAuditChain,
    classifyBridgeIncidentSeverity,
    evaluateBridgeRisk,
    createBridgeGovernanceProposal,
    approveBridgeGovernanceProposal,
    bridgeGovernanceExecutionReadiness,
    evaluateBridgeSafety,
    createBridgePolicyProfile,
    assertBridgePolicyProfile,
  };
}
