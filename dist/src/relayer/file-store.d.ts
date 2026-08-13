import type { BridgeIdempotencyRecord, BridgeIdempotencyStore } from "./idempotency.js";
import type { ReplayStore } from "../bridge/replay.js";
export declare class FileBridgeIdempotencyStore implements BridgeIdempotencyStore {
    #private;
    readonly directory: string;
    constructor(directory: string);
    get(key: string): Promise<BridgeIdempotencyRecord | null>;
    put(record: BridgeIdempotencyRecord): Promise<void>;
    reserve(record: BridgeIdempotencyRecord): Promise<boolean>;
    list(): Promise<BridgeIdempotencyRecord[]>;
}
export declare class FileReplayStore implements ReplayStore {
    #private;
    readonly directory: string;
    constructor(directory: string);
    has(key: string): Promise<boolean>;
    reserve(key: string): Promise<boolean>;
}
export declare function loadRecoverableBridgeOperations(store: FileBridgeIdempotencyStore): Promise<BridgeIdempotencyRecord[]>;
//# sourceMappingURL=file-store.d.ts.map