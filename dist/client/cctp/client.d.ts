import { type AxiosInstance } from "axios";
export interface CircleAttestationResponse {
    status?: string;
    messages?: unknown[];
    [key: string]: unknown;
}
/**
 * Read-only Circle attestation client.
 * CCTP burn/mint instructions remain chain-specific and should be constructed
 * from Circle's official program interfaces for the selected environment.
 */
export declare class CctpAttestationClient {
    readonly baseUrl: string;
    readonly http: AxiosInstance;
    constructor(baseUrl: string, http?: AxiosInstance);
    fetchByTransactionHash(txHash: string): Promise<CircleAttestationResponse>;
}
//# sourceMappingURL=client.d.ts.map