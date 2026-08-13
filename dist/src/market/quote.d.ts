export interface PwrcTradeQuote {
    version: "1.0.0";
    quoteId: string;
    inputMint: string;
    outputMint: string;
    inputAmountBaseUnits: string;
    minimumOutputBaseUnits: string;
    slippageBps: number;
    issuedAt: number;
    expiresAt: number;
    route: string;
}
export declare function buildQuoteId(quote: Omit<PwrcTradeQuote, "quoteId">): string;
export declare function assertPwrcTradeQuote(quote: PwrcTradeQuote, now?: number): void;
//# sourceMappingURL=quote.d.ts.map