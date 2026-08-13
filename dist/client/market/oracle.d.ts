import type { BirdeyeMarketClient } from "./birdeye.js";
import type { PythMarketClient } from "./pyth.js";
import { type PriceObservation } from "../../src/market/risk.js";
export interface VerifiedPwrcMarketSnapshot {
    priceUsd: number;
    primary: PriceObservation;
    secondary?: PriceObservation;
    liquidityUsd?: number;
    verified: boolean;
}
export declare function getVerifiedPwrcMarketSnapshot(input: {
    mintAddress: string;
    pyth?: PythMarketClient;
    pythFeedId?: string;
    birdeye?: BirdeyeMarketClient;
    requireProviderAgreement?: boolean;
    requireLiquidity?: boolean;
}): Promise<VerifiedPwrcMarketSnapshot>;
//# sourceMappingURL=oracle.d.ts.map