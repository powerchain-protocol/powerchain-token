export type BridgeDirection = "solana-to-sui" | "sui-to-solana";

export interface BridgeIdempotencyRecord {
  version: "1.0.0";
  key: string;
  direction: BridgeDirection;
  sourceReference: string;
  destinationReference?: string;
  state:
    | "observed"
    | "verified"
    | "submitted"
    | "finalized"
    | "reconciled"
    | "blocked";
  attempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface BridgeIdempotencyStore {
  get(key: string): Promise<BridgeIdempotencyRecord | null>;
  put(record: BridgeIdempotencyRecord): Promise<void>;
}

export function buildBridgeIdempotencyKey(input: {
  direction: BridgeDirection;
  sourceReference: string;
}): string {
  const ref = input.sourceReference.trim();
  if (!ref) throw new Error("PWRC_RELAYER_SOURCE_REFERENCE_REQUIRED");
  return `pwrc:${input.direction}:${ref}`;
}

export async function assertNotFinalized(
  store: BridgeIdempotencyStore,
  key: string,
): Promise<void> {
  const existing = await store.get(key);
  if (
    existing?.state === "finalized" ||
    existing?.state === "reconciled"
  ) {
    throw new Error("PWRC_RELAYER_ALREADY_PROCESSED");
  }
}
