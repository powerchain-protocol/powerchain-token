export interface RpcRequest {
    method: string;
    params?: readonly unknown[];
}
export declare class PowerChainRpcClient {
    #private;
    readonly endpoint: string;
    constructor(input: {
        endpoint: string;
        timeoutMs?: number;
    });
    request<T>(method: string, params?: readonly unknown[]): Promise<T>;
    batch<T = unknown>(requests: readonly RpcRequest[]): Promise<T[]>;
    getTokenSupply(mint: string): Promise<{
        context: {
            slot: number;
        };
        value: {
            amount: string;
            decimals: number;
            uiAmountString: string;
        };
    }>;
}
//# sourceMappingURL=rpc.d.ts.map