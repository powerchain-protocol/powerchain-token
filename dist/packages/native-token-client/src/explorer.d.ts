import type { PowerChainCluster } from "./types/index.js";
export declare const PowerChainExplorer: {
    readonly token: (mint: string, cluster?: PowerChainCluster) => string;
    readonly account: (address: string, cluster?: PowerChainCluster) => string;
    readonly transaction: (signature: string, cluster?: PowerChainCluster) => string;
};
//# sourceMappingURL=explorer.d.ts.map