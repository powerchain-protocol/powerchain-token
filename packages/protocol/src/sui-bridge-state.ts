export type SuiBridgeDeploymentState =
  | "NOT_DEPLOYED"
  | "PUBLISHED"
  | "REGISTERED"
  | "IDENTITY_VERIFIED"
  | "CONSERVATION_VERIFIED"
  | "ACTIVE"
  | "PAUSED"
  | "BLOCKED";

export interface SuiBridgeDeploymentRecord {
  version: "1.0.0";
  network: "testnet" | "mainnet";
  state: SuiBridgeDeploymentState;
  packageId?: string;
  coinType?: string;
  currencyObjectId?: string;
  bridgeControllerId?: string;
  operator?: string;
  governor?: string;
  publishDigest?: string;
  registrationDigest?: string;
  lastVerifiedAt?: string;
}

export function assertStateTransition(
  from: SuiBridgeDeploymentState,
  to: SuiBridgeDeploymentState,
): void {
  const allowed: Record<SuiBridgeDeploymentState, readonly SuiBridgeDeploymentState[]> = {
    NOT_DEPLOYED: ["PUBLISHED", "BLOCKED"],
    PUBLISHED: ["REGISTERED", "BLOCKED"],
    REGISTERED: ["IDENTITY_VERIFIED", "BLOCKED"],
    IDENTITY_VERIFIED: ["CONSERVATION_VERIFIED", "PAUSED", "BLOCKED"],
    CONSERVATION_VERIFIED: ["ACTIVE", "PAUSED", "BLOCKED"],
    ACTIVE: ["PAUSED", "BLOCKED"],
    PAUSED: ["CONSERVATION_VERIFIED", "ACTIVE", "BLOCKED"],
    BLOCKED: ["NOT_DEPLOYED", "PUBLISHED", "REGISTERED", "IDENTITY_VERIFIED", "PAUSED"],
  };

  if (!allowed[from].includes(to)) {
    throw new Error(`WPWRC_INVALID_STATE_TRANSITION:${from}->${to}`);
  }
}

export function assertActivationReady(record: SuiBridgeDeploymentRecord): void {
  if (!record.packageId) throw new Error("WPWRC_PACKAGE_ID_REQUIRED");
  if (!record.coinType) throw new Error("WPWRC_COIN_TYPE_REQUIRED");
  if (!record.currencyObjectId) throw new Error("WPWRC_CURRENCY_ID_REQUIRED");
  if (!record.bridgeControllerId) throw new Error("WPWRC_CONTROLLER_ID_REQUIRED");
  if (!record.operator) throw new Error("WPWRC_OPERATOR_REQUIRED");
  if (!record.governor) throw new Error("WPWRC_GOVERNOR_REQUIRED");
  if (!record.publishDigest) throw new Error("WPWRC_PUBLISH_DIGEST_REQUIRED");
  if (!record.registrationDigest) throw new Error("WPWRC_REGISTRATION_DIGEST_REQUIRED");
}
