export declare class ReadThroughCache {
    #private;
    readonly ttlMs: number;
    readonly maxEntries: number;
    constructor(ttlMs?: number, maxEntries?: number);
    getOrLoad<T>(key: string, loader: () => Promise<T>): Promise<T>;
    clear(): void;
}
//# sourceMappingURL=read-cache.d.ts.map