/**
 * Source-derived PowerChain interface descriptor.
 *
 * This is not generated transaction codec code.
 * Runtime Anchor encoding requires verified generated IDLs.
 */

export const POWERCHAIN_BINDINGS_VERSION =
  "1.0.0" as const;

export const POWERCHAIN_ABI_FINGERPRINT =
  "20aa02c10a6d991bc366dc82f8af52ef835374e4504bc1dd261f896ab3d2c0bf" as const;

export const PWRC_LOCK_INSTRUCTIONS =
  [
  "initialize",
  "lockToSui",
  "releaseFromSui",
  "setPaused",
  "proposeOperator",
  "cancelOperatorRotation",
  "acceptOperator",
  "proposeGovernor",
  "cancelGovernorRotation",
  "acceptGovernor"
] as const;

export const PWRC_TOKEN_VERIFIER_INSTRUCTIONS =
  [
  "verifyCanonicalMint"
] as const;

export const WPWRC_BRIDGE_ENTRY_FUNCTIONS =
  [
  "configure_authorities",
  "mint_from_bridge",
  "burn_for_solana",
  "set_paused",
  "stage_canonical_burn_intent",
  "cancel_canonical_burn_intent",
  "lower_canonical_supply_ceiling",
  "propose_bridge_authority",
  "cancel_bridge_authority",
  "accept_bridge_authority",
  "propose_governor",
  "cancel_governor",
  "accept_governor"
] as const;

export type PwrcLockInstruction =
  (typeof PWRC_LOCK_INSTRUCTIONS)[number];

export type PwrcTokenVerifierInstruction =
  (typeof PWRC_TOKEN_VERIFIER_INSTRUCTIONS)[number];

export type WpwrcBridgeEntryFunction =
  (typeof WPWRC_BRIDGE_ENTRY_FUNCTIONS)[number];

export const POWERCHAIN_INTERFACE_BINDING = {
  version: "1.0.0",
  abiFingerprint:
    POWERCHAIN_ABI_FINGERPRINT,
  anchor: {
    pwrcLock: {
      program: "pwrc_lock",
      instructions:
        PWRC_LOCK_INSTRUCTIONS,
      generatedIdlRequiredForEncoding:
        true,
    },
    pwrcToken: {
      program: "pwrc_token",
      instructions:
        PWRC_TOKEN_VERIFIER_INSTRUCTIONS,
      generatedIdlRequiredForEncoding:
        true,
    },
  },
  sui: {
    package: "wpwrc",
    entryFunctions:
      WPWRC_BRIDGE_ENTRY_FUNCTIONS,
    verifiedPackageIdRequiredForExecution:
      true,
  },
} as const;
