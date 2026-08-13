import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeRpcUrl,
  normalizeWebSocketUrl,
  normalizeUrl,
} from "../src/common/urls.js";

test("production RPC requires HTTPS", () => {
  assert.equal(
    normalizeRpcUrl("https://rpc.example.com/", true),
    "https://rpc.example.com",
  );
  assert.throws(
    () => normalizeRpcUrl("http://rpc.example.com", true),
    /POWERCHAIN_HTTPS_REQUIRED/,
  );
});

test("production websocket requires WSS", () => {
  assert.equal(
    normalizeWebSocketUrl("wss://rpc.example.com/", true),
    "wss://rpc.example.com",
  );
  assert.throws(
    () => normalizeWebSocketUrl("ws://rpc.example.com", true),
    /POWERCHAIN_URL_PROTOCOL_FORBIDDEN/,
  );
});

test("URLs reject credentials, control characters and overlong values", () => {
  assert.throws(
    () => normalizeUrl("https://user:secret@example.com"),
    /POWERCHAIN_URL_CREDENTIALS_FORBIDDEN/,
  );
  assert.throws(
    () => normalizeUrl("https://example.com/\npath"),
    /POWERCHAIN_URL_CONTROL_CHARACTER_FORBIDDEN/,
  );
  assert.throws(
    () => normalizeUrl(`https://example.com/${"x".repeat(2100)}`),
    /POWERCHAIN_URL_TOO_LONG/,
  );
});
