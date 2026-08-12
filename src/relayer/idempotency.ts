import { domainSeparatedSha256 } from "../common/hash.js";
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

export function buildBridgeIdempotencyKey(input: {
  direction: BridgeDirection;
  sourceReference: string;
}): string {
  const sourceReference = input.sourceReference.trim();
  if (!sourceReference) throw new Error("PWRC_RELAYER_SOURCE_REFERENCE_REQUIRED");
  return domainSeparatedSha256("POWERCHAIN_RELAYER_IDEMPOTENCY_V1", {
    version: "1.0.0",
    direction: input.direction,
    sourceReference,
  });
}

export async function reserveBridgeOperation(
  store: BridgeIdempotencyStore,
  record: BridgeIdempotencyRecord,
): Promise<void> {
  if (!(await store.reserve(record))) throw new Error("PWRC_RELAYER_ALREADY_RESERVED");
}

export async function assertNotFinalized(
  store: BridgeIdempotencyStore,
  key: string,
): Promise<void> {
  const existing = await store.get(key);
  if (existing?.state === "finalized" || existing?.state === "reconciled") {
    throw new Error("PWRC_RELAYER_ALREADY_PROCESSED");
  }
}
