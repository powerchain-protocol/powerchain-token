export interface RelayerQueueItem<T> {
    id: string;
    payload: T;
}
export declare class BoundedRelayerQueue<T> {
    #private;
    readonly maxSize: number;
    constructor(maxSize?: number);
    get size(): number;
    enqueue(item: RelayerQueueItem<T>): void;
    dequeue(): RelayerQueueItem<T> | null;
    peek(): RelayerQueueItem<T> | null;
}
//# sourceMappingURL=queue.d.ts.map