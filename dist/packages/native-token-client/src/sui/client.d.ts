import type { ClientWithCoreApi } from "@mysten/sui/client";
import type { PowerChainSuiNetwork } from "../types/index.js";
export declare function getSuiRpcUrl(network: PowerChainSuiNetwork): string;
export declare function getWpwrcBalance(client: ClientWithCoreApi, input: {
    owner: string;
    coinType: string;
}): Promise<{
    owner: string;
    coinType: string;
    decimals: 9;
    totalBaseUnits: bigint;
    coinObjectBaseUnits: bigint;
    addressBalanceBaseUnits: bigint;
}>;
//# sourceMappingURL=client.d.ts.map