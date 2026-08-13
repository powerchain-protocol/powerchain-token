export declare const CCTP_VERSION: "v2";
export declare const CCTP_ASSET: "USDC";
export interface CctpTransferIntent {
    sourceDomain: number;
    destinationDomain: number;
    amountUsdcBaseUnits: bigint;
    recipient: string;
    nonce?: string;
}
export interface CctpPolicy {
    version: "v2";
    asset: "USDC";
    allowPwrc: false;
    requireCircleAttestation: true;
    requireFinalizedSourceObservation: true;
    requireDestinationReceiptVerification: true;
}
export declare const PWRC_CCTP_POLICY: CctpPolicy;
export declare function assertCctpIntent(intent: CctpTransferIntent): void;
//# sourceMappingURL=policy.d.ts.map