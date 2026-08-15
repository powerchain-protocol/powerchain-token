import test from "node:test";
import assert from "node:assert/strict";
import {
  buildHeliusRpcUrl,
  buildHeliusWebSocketUrl,
  redactHeliusUrl,
  resolveHeliusApiKey,
} from "../packages/protocol/src/helius.js";

test(
  "Helius endpoint builders bind network and redact credentials",
  () => {
    const rpc =
      buildHeliusRpcUrl(
        "mainnet-beta",
        "example-key-123",
      );
    const ws =
      buildHeliusWebSocketUrl(
        "devnet",
        "example-key-456",
      );

    assert.match(
      rpc,
      /^https:\/\/mainnet\.helius-rpc\.com\//,
    );
    assert.match(
      ws,
      /^wss:\/\/devnet\.helius-rpc\.com\//,
    );
    assert.ok(
      redactHeliusUrl(
        rpc,
      ).includes(
        "REDACTED",
      ),
    );
    assert.equal(
      redactHeliusUrl(
        rpc,
      ).includes(
        "example-key-123",
      ),
      false,
    );
  },
);

test(
  "production Mainnet requires dedicated Helius key",
  () => {
    assert.throws(
      () =>
        resolveHeliusApiKey(
          "mainnet-beta",
          {
            NODE_ENV:
              "production",
            HELIUS_API_KEY:
              "generic-key-123",
          },
        ),
      /PWRC_HELIUS_MAINNET_API_KEY_REQUIRED/,
    );

    assert.equal(
      resolveHeliusApiKey(
        "mainnet-beta",
        {
          NODE_ENV:
            "production",
          HELIUS_MAINNET_API_KEY:
            "mainnet-key-123",
        },
      ),
      "mainnet-key-123",
    );
  },
);

test(
  "Devnet accepts dedicated key before generic fallback",
  () => {
    assert.equal(
      resolveHeliusApiKey(
        "devnet",
        {
          HELIUS_DEVNET_API_KEY:
            "devnet-key-123",
          HELIUS_API_KEY:
            "generic-key-456",
        },
      ),
      "devnet-key-123",
    );

    assert.equal(
      resolveHeliusApiKey(
        "devnet",
        {
          HELIUS_API_KEY:
            "generic-key-456",
        },
      ),
      "generic-key-456",
    );
  },
);
