import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  FileBridgeIdempotencyStore,
  FileReplayStore,
  loadRecoverableBridgeOperations,
} from "../packages/protocol/src/relayer/file-store.js";
import {
  buildBridgeIdempotencyKey,
  type BridgeIdempotencyRecord,
} from "../packages/protocol/src/relayer/idempotency.js";
import {
  buildReplayKey,
} from "../packages/protocol/src/bridge/replay.js";

async function withTempDirectory<T>(
  run: (directory: string) => Promise<T>,
): Promise<T> {
  const directory = await mkdtemp(
    join(tmpdir(), "pwrc-relayer-"),
  );
  try {
    return await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("idempotency reservation survives store restart", async () => {
  await withTempDirectory(async (directory) => {
    const key = buildBridgeIdempotencyKey({
      direction: "solana-to-sui",
      sourceReference: "tx:1",
    });

    const record: BridgeIdempotencyRecord = {
      version: "1.0.0",
      key,
      direction: "solana-to-sui",
      sourceReference: "tx:1",
      state: "reserved",
      attempts: 0,
      createdAt: "2026-08-13T00:00:00.000Z",
      updatedAt: "2026-08-13T00:00:00.000Z",
    };

    const first = new FileBridgeIdempotencyStore(directory);
    assert.equal(await first.reserve(record), true);

    const restarted = new FileBridgeIdempotencyStore(directory);
    assert.equal(await restarted.reserve(record), false);
    assert.deepEqual(await restarted.get(key), record);

    const recoverable = await loadRecoverableBridgeOperations(restarted);
    assert.equal(recoverable.length, 1);
    assert.equal(recoverable[0]?.key, key);
  });
});

test("replay reservation survives store restart", async () => {
  await withTempDirectory(async (directory) => {
    const key = buildReplayKey({
      domain: "solana-lock",
      network: "mainnet-beta",
      reference: "signature:0",
    });

    const first = new FileReplayStore(directory);
    assert.equal(await first.reserve(key), true);

    const restarted = new FileReplayStore(directory);
    assert.equal(await restarted.has(key), true);
    assert.equal(await restarted.reserve(key), false);
  });
});
