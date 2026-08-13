export class BoundedRelayerQueue {
    maxSize;
    #items = [];
    constructor(maxSize = 1_000) {
        this.maxSize = maxSize;
        if (!Number.isInteger(maxSize) ||
            maxSize < 1 ||
            maxSize > 100_000) {
            throw new Error("PWRC_RELAYER_QUEUE_SIZE_INVALID");
        }
    }
    get size() {
        return this.#items.length;
    }
    enqueue(item) {
        if (!item.id.trim()) {
            throw new Error("PWRC_RELAYER_QUEUE_ID_REQUIRED");
        }
        if (this.#items.length >= this.maxSize) {
            throw new Error("PWRC_RELAYER_QUEUE_CAPACITY_EXCEEDED");
        }
        if (this.#items.some((x) => x.id === item.id)) {
            throw new Error("PWRC_RELAYER_QUEUE_DUPLICATE_ID");
        }
        this.#items.push(item);
    }
    dequeue() {
        return this.#items.shift() ?? null;
    }
    peek() {
        return this.#items[0] ?? null;
    }
}
//# sourceMappingURL=queue.js.map