import * as anchor from "@coral-xyz/anchor";
import { type AxiosInstance } from "axios";
import { Connection, Keypair, type Commitment } from "@solana/web3.js";
export type PWRCCluster = "devnet" | "mainnet-beta" | "localnet";
export interface PWRCClientOptions {
    cluster: PWRCCluster;
    rpcUrl?: string;
    commitment?: Commitment;
    wallet?: anchor.Wallet;
    timeoutMs?: number;
}
export interface PWRCRpcResponse<T> {
    jsonrpc: "2.0";
    id: number | string;
    result?: T;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    };
}
export interface PWRCMintSnapshot {
    mint: string;
    cluster: PWRCCluster;
    ownerProgram: string;
    decimals: number;
    supplyBaseUnits: bigint;
    mintAuthority: string | null;
    freezeAuthority: string | null;
    transferFeeBasisPoints: number | null;
    maximumTransferFeeBaseUnits: bigint | null;
    transferFeeConfigAuthority: string | null;
    withdrawWithheldAuthority: string | null;
    observedSlot: number;
}
export interface PWRCCanonicalVerification {
    verified: boolean;
    errors: string[];
    snapshot: PWRCMintSnapshot;
}
export declare function resolveRpcUrl(cluster: PWRCCluster, rpcUrl?: string): string;
export declare function assertSolanaSignature(signature: string): void;
export declare function decodeSecretKey(value: string): Uint8Array;
export declare function loadKeypairFile(filePath: string): Keypair;
export declare function walletFromKeypair(keypair: Keypair): anchor.Wallet;
export declare class PWRCClient {
    readonly cluster: PWRCCluster;
    readonly rpcUrl: string;
    readonly connection: Connection;
    readonly provider: anchor.AnchorProvider | null;
    readonly http: AxiosInstance;
    private requestId;
    constructor(options: PWRCClientOptions);
    static fromKeypair(options: Omit<PWRCClientOptions, "wallet"> & {
        keypair: Keypair;
    }): PWRCClient;
    static fromKeypairFile(options: Omit<PWRCClientOptions, "wallet"> & {
        keypairFile: string;
    }): PWRCClient;
    rpcRead<T>(method: string, params?: unknown[]): Promise<T>;
    getHealth(): Promise<"ok">;
    getMintSnapshot(mintAddress: string): Promise<PWRCMintSnapshot>;
    verifyCanonicalMint(mintAddress?: string, options?: {
        requireFinalized?: boolean;
        requireCanonicalAddress?: boolean;
    }): Promise<PWRCCanonicalVerification>;
    getFinalizedTransaction(signature: string): Promise<anchor.web3.VersionedTransactionResponse>;
}
//# sourceMappingURL=client.d.ts.map