export declare const X402_VERSION: "2";
export type X402Asset = "USDC" | "PWRC";
export interface X402PaymentRequirement {
    scheme: "exact";
    network: "solana";
    asset: X402Asset;
    amountBaseUnits: string;
    payTo: string;
    resource: string;
    description?: string;
    expiresAt: number;
}
export interface X402Policy {
    version: "2";
    enabled: boolean;
    defaultAsset: "USDC";
    allowPwrcExperimental: boolean;
    requireFinalizedSettlement: boolean;
    requireUniquePaymentReference: boolean;
}
//# sourceMappingURL=types.d.ts.map