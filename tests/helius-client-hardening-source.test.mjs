import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const client =
  fs.readFileSync(
    "packages/sdk/src/helius-client.ts",
    "utf8",
  );
const api =
  fs.readFileSync(
    "apps/api/lib/helius.mjs",
    "utf8",
  );

test(
  "Helius client bounds response bodies before JSON parsing",
  () => {
    for (const invariant of [
      "maxResponseBytes",
      "PWRC_HELIUS_RESPONSE_SIZE_LIMIT_INVALID",
      "PWRC_HELIUS_RESPONSE_TOO_LARGE",
      '"content-length"',
      "response.text()",
      "TextEncoder",
    ]) {
      assert.ok(
        client.includes(
          invariant,
        ),
      );
    }

    assert.equal(
      client.includes(
        "await response.json()",
      ),
      false,
    );
  },
);

test(
  "Helius reads support caller cancellation distinct from timeout",
  () => {
    for (const invariant of [
      "HeliusRequestOptions",
      "AbortSignal",
      "PWRC_HELIUS_CANCELLED",
      "timeoutFired",
      "addEventListener",
      "removeEventListener",
    ]) {
      assert.ok(
        client.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "Helius JSON-RPC IDs are per-client monotonic and API config exposes response bound",
  () => {
    assert.ok(
      client.includes(
        "++rpcRequestId",
      ),
    );
    assert.equal(
      client.includes(
        'id:\n                    "powerchain"',
      ),
      false,
    );
    assert.ok(
      api.includes(
        "HELIUS_MAX_RESPONSE_BYTES",
      ),
    );
    assert.ok(
      api.includes(
        "maxResponseBytes,",
      ),
    );
  },
);

test(
  "Helius hardening preserves read-only surface",
  () => {
    for (const forbidden of [
      '"sendTransaction"',
      '"sendRawTransaction"',
      "sendAndConfirmTransaction(",
      "Keypair.generate(",
      "fromSecretKey(",
    ]) {
      assert.equal(
        client.includes(
          forbidden,
        ),
        false,
      );
    }
  },
);
