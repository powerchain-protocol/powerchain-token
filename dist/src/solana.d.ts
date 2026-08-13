export declare const SOLANA_SYSTEM_PROGRAM_ID: "11111111111111111111111111111111";
export declare const SOLANA_TOKEN_PROGRAM_ID: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
export declare const SOLANA_TOKEN_2022_PROGRAM_ID: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
export declare const SOLANA_ASSOCIATED_TOKEN_PROGRAM_ID: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
export declare const METAPLEX_TOKEN_METADATA_PROGRAM_ID: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
export declare const PWRC_LOCK_LOCALNET_PROGRAM_ID: "7JAV3PsxkHh5oKAFDMKqVpKaV2P2P5Vj3Qv15hH8wPwr";
export declare const PWRC_TOKEN_VERIFIER_LOCALNET_PROGRAM_ID: "HRrDxwZzuFreRmkCLY9oFXNGAy2gjd3diHyyTadxd8s6";
export type SolanaCluster = "localnet" | "devnet" | "mainnet-beta";
export type PowerChainProgramKind = "pwrc-lock" | "pwrc-token";
export declare const SOLANA_PUBLIC_RPC: Record<SolanaCluster, string>;
export declare const POWERCHAIN_FORBIDDEN_DEPLOYMENT_PROGRAM_IDS: Set<string>;
export declare function assertPowerChainDeploymentProgramId(value: string, cluster: SolanaCluster): string;
export declare function resolvePowerChainProgramId(kind: PowerChainProgramKind, cluster: SolanaCluster, explicit?: string, env?: NodeJS.ProcessEnv): string;
/** @deprecated Use resolvePowerChainProgramId("pwrc-lock", ...). */
export declare function resolvePwrcProgramId(cluster: SolanaCluster, explicit?: string): string;
export declare function resolvePwrcRpc(cluster: SolanaCluster, explicit?: string, env?: NodeJS.ProcessEnv): string;
//# sourceMappingURL=solana.d.ts.map