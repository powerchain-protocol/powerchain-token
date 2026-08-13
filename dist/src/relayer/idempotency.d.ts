export type BridgeDirection = "solana-to-sui" | "sui-to-solana";
export interface BridgeIdempotencyRecord {
    version: "1.0.0";
    key: string;
    direction: BridgeDirection;
    sourceReference: string;
    destinationReference?: string;
    state: "observed" | "verified" | "reserved" | "submitted" | "finalized" | "reconciled" | "blocked";
    attempts: number;
    createdAt: string;
    updatedAt: string;
}
export interface BridgeIdempotencyStore {
    get(key: string): Promise<BridgeIdempotencyRecord | null>;
    put(record: BridgeIdempotencyRecord): Promise<void>;
    /** Atomic insert-if-absent. */
    reserve(record: BridgeIdempotencyRecord): Promise<boolean>;
}
export declare function buildBridgeIdempotencyKey(input: {
    direction: BridgeDirection;
    sourceReference: string;
}): string;
export declare function reserveBridgeOperation(store: BridgeIdempotencyStore, record: BridgeIdempotencyRecord): Promise<void>;
export declare function assertNotFinalized(store: BridgeIdempotencyStore, key: string): Promise<void>;
//# sourceMappingURL=idempotency.d.ts.map