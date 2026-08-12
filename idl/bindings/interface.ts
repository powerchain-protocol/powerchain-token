/**
 * Source-derived PowerChain interface descriptor.
 *
 * This is NOT Anchor-generated client code. It is generated from the
 * checked-in expected interface contract and is safe for compile-time
 * routing/feature discovery. Runtime transaction encoding must use the real
 * toolchain-generated IDL once available.
 */

export const POWERCHAIN_BINDINGS_VERSION = "1.0.0" as const;

export const POWERCHAIN_ABI_FINGERPRINT =
  "96e74184c08f283c4de057b96d8e0a31123c44cd6fa249a0ca37c0cb9944f608" as const;

export const PWRC_LOCK_INSTRUCTIONS = [
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

export type PwrcLockInstruction =
  (typeof PWRC_LOCK_INSTRUCTIONS)[number];

export const WPWRC_BRIDGE_ENTRY_FUNCTIONS = [
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

export type WpwrcBridgeEntryFunction =
  (typeof WPWRC_BRIDGE_ENTRY_FUNCTIONS)[number];

export interface PowerChainInterfaceBinding {
  version: "1.0.0";
  abiFingerprint: typeof POWERCHAIN_ABI_FINGERPRINT;
  anchor: {
    program: "pwrc_lock";
    instructions: readonly PwrcLockInstruction[];
    generatedIdlRequiredForEncoding: true;
  };
  sui: {
    package: "wpwrc";
    entryFunctions: readonly WpwrcBridgeEntryFunction[];
    verifiedPackageIdRequiredForExecution: true;
  };
}

export const POWERCHAIN_INTERFACE_BINDING: PowerChainInterfaceBinding = {
  version: "1.0.0",
  abiFingerprint: POWERCHAIN_ABI_FINGERPRINT,
  anchor: {
    program: "pwrc_lock",
    instructions: PWRC_LOCK_INSTRUCTIONS,
    generatedIdlRequiredForEncoding: true,
  },
  sui: {
    package: "wpwrc",
    entryFunctions: WPWRC_BRIDGE_ENTRY_FUNCTIONS,
    verifiedPackageIdRequiredForExecution: true,
  },
};
