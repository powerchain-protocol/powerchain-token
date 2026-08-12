import { domainSeparatedSha256 } from "../common/hash.js";

export type ReplayDomain =
  | "solana-lock"
  | "sui-mint"
  | "sui-burn"
  | "solana-release"
  | "quarterly-burn";

export interface ReplayKeyInput {
  domain: ReplayDomain;
  network: string;
  reference: string;
}

export function buildReplayKey(input: ReplayKeyInput): string {
  const network = input.network.trim().toLowerCase();
  const reference = input.reference.trim();
  if (!network) throw new Error("POWERCHAIN_REPLAY_NETWORK_REQUIRED");
  if (!reference) throw new Error("POWERCHAIN_REPLAY_REFERENCE_REQUIRED");
  return domainSeparatedSha256("POWERCHAIN_REPLAY_V1", {
    version: "1.0.0",
    domain: input.domain,
    network,
    reference,
  });
}

export interface ReplayStore {
  has(key: string): Promise<boolean>;
  /** Must be atomic and return false when key already exists. */
  reserve(key: string): Promise<boolean>;
}

export async function reserveReplayKey(store: ReplayStore, key: string): Promise<void> {
  if (!/^[a-f0-9]{64}$/i.test(key)) throw new Error("POWERCHAIN_REPLAY_KEY_INVALID");
  if (!(await store.reserve(key))) throw new Error("POWERCHAIN_REPLAY_DETECTED");
}

export async function assertReplayUnused(store: ReplayStore, key: string): Promise<void> {
  if (await store.has(key)) throw new Error("POWERCHAIN_REPLAY_DETECTED");
}
