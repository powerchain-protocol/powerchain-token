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

export function buildReplayKey(
  input: ReplayKeyInput,
): string {
  const network = input.network.trim().toLowerCase();
  const reference = input.reference.trim();

  if (!network) {
    throw new Error("POWERCHAIN_REPLAY_NETWORK_REQUIRED");
  }
  if (!reference) {
    throw new Error("POWERCHAIN_REPLAY_REFERENCE_REQUIRED");
  }

  return [
    "powerchain",
    "1.0.0",
    input.domain,
    network,
    reference,
  ].join(":");
}

export interface ReplayStore {
  has(key: string): Promise<boolean>;
  add(key: string): Promise<void>;
}

export async function assertReplayUnused(
  store: ReplayStore,
  key: string,
): Promise<void> {
  if (await store.has(key)) {
    throw new Error("POWERCHAIN_REPLAY_DETECTED");
  }
}
