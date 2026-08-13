export type ReplayDomain = "solana-lock" | "sui-mint" | "sui-burn" | "solana-release" | "quarterly-burn";
export interface ReplayKeyInput {
    domain: ReplayDomain;
    network: string;
    reference: string;
}
export declare function buildReplayKey(input: ReplayKeyInput): string;
export interface ReplayStore {
    has(key: string): Promise<boolean>;
    /** Must be atomic and return false when key already exists. */
    reserve(key: string): Promise<boolean>;
}
export declare function reserveReplayKey(store: ReplayStore, key: string): Promise<void>;
export declare function assertReplayUnused(store: ReplayStore, key: string): Promise<void>;
//# sourceMappingURL=replay.d.ts.map