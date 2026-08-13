export interface IntegrationReconciliation {
    lockedPwrcBaseUnits: bigint;
    circulatingWpwrcBaseUnits: bigint;
    /** Finalized canonical PWRC lock not yet minted on Sui. */
    pendingSolanaToSuiBaseUnits: bigint;
    /** Finalized wPWRC burn not yet released from Solana custody. */
    pendingSuiToSolanaBaseUnits: bigint;
}
export declare function bridgeExposureBaseUnits(input: IntegrationReconciliation): bigint;
export declare function assertBridgeConservation(input: IntegrationReconciliation): void;
//# sourceMappingURL=reconcile.d.ts.map