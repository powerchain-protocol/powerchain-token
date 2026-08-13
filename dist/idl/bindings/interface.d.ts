/**
 * Source-derived PowerChain interface descriptor.
 *
 * This is not generated transaction codec code.
 * Runtime Anchor encoding requires verified generated IDLs.
 */
export declare const POWERCHAIN_BINDINGS_VERSION: "1.0.0";
export declare const POWERCHAIN_ABI_FINGERPRINT: "5ec0f3f78c6c009c03e1e25e879c0d5abbb76c8b341352814ac6dd27cc83fbe5";
export declare const PWRC_LOCK_INSTRUCTIONS: readonly ["initialize", "lockToSui", "releaseFromSui", "setPaused", "proposeOperator", "cancelOperatorRotation", "acceptOperator", "proposeGovernor", "cancelGovernorRotation", "acceptGovernor"];
export declare const PWRC_TOKEN_VERIFIER_INSTRUCTIONS: readonly ["verifyCanonicalMint"];
export declare const WPWRC_BRIDGE_ENTRY_FUNCTIONS: readonly ["configure_authorities", "mint_from_bridge", "burn_for_solana", "set_paused", "stage_canonical_burn_intent", "cancel_canonical_burn_intent", "lower_canonical_supply_ceiling", "propose_bridge_authority", "cancel_bridge_authority", "accept_bridge_authority", "propose_governor", "cancel_governor", "accept_governor"];
export type PwrcLockInstruction = (typeof PWRC_LOCK_INSTRUCTIONS)[number];
export type PwrcTokenVerifierInstruction = (typeof PWRC_TOKEN_VERIFIER_INSTRUCTIONS)[number];
export type WpwrcBridgeEntryFunction = (typeof WPWRC_BRIDGE_ENTRY_FUNCTIONS)[number];
export declare const POWERCHAIN_INTERFACE_BINDING: {
    readonly version: "1.0.0";
    readonly abiFingerprint: "5ec0f3f78c6c009c03e1e25e879c0d5abbb76c8b341352814ac6dd27cc83fbe5";
    readonly anchor: {
        readonly pwrcLock: {
            readonly program: "pwrc_lock";
            readonly instructions: readonly ["initialize", "lockToSui", "releaseFromSui", "setPaused", "proposeOperator", "cancelOperatorRotation", "acceptOperator", "proposeGovernor", "cancelGovernorRotation", "acceptGovernor"];
            readonly generatedIdlRequiredForEncoding: true;
        };
        readonly pwrcToken: {
            readonly program: "pwrc_token";
            readonly instructions: readonly ["verifyCanonicalMint"];
            readonly generatedIdlRequiredForEncoding: true;
        };
    };
    readonly sui: {
        readonly package: "wpwrc";
        readonly entryFunctions: readonly ["configure_authorities", "mint_from_bridge", "burn_for_solana", "set_paused", "stage_canonical_burn_intent", "cancel_canonical_burn_intent", "lower_canonical_supply_ceiling", "propose_bridge_authority", "cancel_bridge_authority", "accept_bridge_authority", "propose_governor", "cancel_governor", "accept_governor"];
        readonly verifiedPackageIdRequiredForExecution: true;
    };
};
//# sourceMappingURL=interface.d.ts.map