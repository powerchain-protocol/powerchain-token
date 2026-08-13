export declare const PWRC_DECIMALS: 9;
export declare const PWRC_MIN_TRANSACTION_BASE_UNITS = 1n;
export declare const PWRC_MARKET_POLICY_VERSION: "1.0.0";
export interface PwrcTradeabilityPolicy {
    version: "1.0.0";
    freelyTransferable: true;
    nonTransferableExtension: false;
    defaultFrozen: false;
    transferHookRequired: false;
    allowlistRequired: false;
    zeroAmountTransactions: false;
}
export declare const PWRC_TRADEABILITY_POLICY: PwrcTradeabilityPolicy;
export declare function assertNonZeroPwrcAmount(amountBaseUnits: bigint, context?: string): void;
export declare function uiToBaseUnits(uiAmount: string): bigint;
export declare function baseUnitsToUi(amountBaseUnits: bigint): string;
//# sourceMappingURL=policy.d.ts.map