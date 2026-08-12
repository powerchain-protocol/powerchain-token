import test from "node:test";
import assert from "node:assert/strict";
import { normalizeRpcUrl, normalizeWebSocketUrl } from "../src/common/urls.js";
import { retryDelayMs } from "../src/common/retry.js";
import { assertU64 } from "../src/common/bigint.js";

test("production RPC requires HTTPS and strips trailing slash", () => {
  assert.equal(normalizeRpcUrl("https://rpc.example.com/", true), "https://rpc.example.com");
  assert.throws(() => normalizeRpcUrl("http://rpc.example.com", true), /HTTPS_REQUIRED/);
});

test("production websocket requires WSS", () => {
  assert.equal(normalizeWebSocketUrl("wss://rpc.example.com/", true), "wss://rpc.example.com");
  assert.throws(() => normalizeWebSocketUrl("ws://rpc.example.com", true), /PROTOCOL_FORBIDDEN/);
});

test("retry backoff is bounded", () => {
  const policy = { maxAttempts: 5, baseDelayMs: 250, maxDelayMs: 1000 };
  assert.equal(retryDelayMs(1, policy), 250);
  assert.equal(retryDelayMs(4, policy), 1000);
});

test("u64 validation rejects overflow", () => {
  assert.equal(assertU64(18_446_744_073_709_551_615n), 18_446_744_073_709_551_615n);
  assert.throws(() => assertU64(18_446_744_073_709_551_616n), /U64_OUT_OF_RANGE/);
});

test("retry policy rejects base delay above max delay", () => {
  assert.throws(
    () => retryDelayMs(1, { maxAttempts: 2, baseDelayMs: 2000, maxDelayMs: 1000 }),
    /RETRY_POLICY_INVALID/,
  );
});
