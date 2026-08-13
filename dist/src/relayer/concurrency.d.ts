export declare class BoundedExecutor {
    #private;
    constructor(maxConcurrency?: number);
    get active(): number;
    get queued(): number;
    run<T>(fn: () => Promise<T>): Promise<T>;
}
//# sourceMappingURL=concurrency.d.ts.map