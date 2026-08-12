import test from "node:test";
import assert from "node:assert/strict";
import { buildReplayKey, reserveReplayKey, type ReplayStore } from "../src/bridge/replay.js";

class MemoryReplayStore implements ReplayStore {
  private readonly keys = new Set<string>();
  async has(key: string) { return this.keys.has(key); }
  async reserve(key: string) {
    if (this.keys.has(key)) return false;
    this.keys.add(key);
    return true;
  }
}

test("replay keys are SHA-256 domain separated and atomically reservable", async () => {
  const store = new MemoryReplayStore();
  const key = buildReplayKey({ domain: "solana-lock", network: "mainnet-beta", reference: "sig:0" });
  assert.match(key, /^[a-f0-9]{64}$/);
  await reserveReplayKey(store, key);
  await assert.rejects(() => reserveReplayKey(store, key), /REPLAY_DETECTED/);
});
