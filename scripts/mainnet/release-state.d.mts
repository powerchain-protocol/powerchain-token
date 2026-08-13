export type MainnetReleaseState =
  | "SOURCE_READY"
  | "BUILD_READY"
  | "EVIDENCE_READY"
  | "AUTHORIZED"
  | "CONSUMED";

export interface MainnetReleaseReadiness {
  codeReady: boolean;
  buildReady: boolean;
  deploymentEvidenceReady: boolean;
  releaseAuthorized: boolean;
  authorizationConsumed: boolean;
}

export const MAINNET_RELEASE_STATES:
  readonly MainnetReleaseState[];

export function deriveMainnetReleaseState(
  input: MainnetReleaseReadiness,
): MainnetReleaseState;

export function assertMainnetStateTransition(
  from: MainnetReleaseState,
  to: MainnetReleaseState,
): void;
