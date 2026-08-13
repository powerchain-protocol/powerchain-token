export interface RelayerQueueItem<T> {
  id: string;
  payload: T;
}

export class BoundedRelayerQueue<T> {
  readonly #items: RelayerQueueItem<T>[] = [];

  constructor(
    readonly maxSize = 1_000,
  ) {
    if (
      !Number.isInteger(maxSize) ||
      maxSize < 1 ||
      maxSize > 100_000
    ) {
      throw new Error("PWRC_RELAYER_QUEUE_SIZE_INVALID");
    }
  }

  get size(): number {
    return this.#items.length;
  }

  enqueue(item: RelayerQueueItem<T>): void {
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

  dequeue(): RelayerQueueItem<T> | null {
    return this.#items.shift() ?? null;
  }

  peek(): RelayerQueueItem<T> | null {
    return this.#items[0] ?? null;
  }
}
