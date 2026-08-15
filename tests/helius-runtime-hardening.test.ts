import test from "node:test";
import assert from "node:assert/strict";
import {
  createHeliusClient,
} from "../packages/sdk/src/helius-client.js";

test(
  "Helius client serialization never exposes credential-bearing URLs",
  () => {
    const client =
      createHeliusClient({
        apiKey:
          "example-key-123",
        network:
          "mainnet-beta",
        fetchImpl:
          async () =>
            new Response(
              JSON.stringify({
                jsonrpc:
                  "2.0",
                id:
                  "powerchain",
                result:
                  {},
              }),
              {
                status:
                  200,
                headers: {
                  "content-type":
                    "application/json",
                },
              },
            ),
      });

    const serialized =
      JSON.stringify(
        client,
      );

    assert.equal(
      serialized.includes(
        "example-key-123",
      ),
      false,
    );
    assert.equal(
      serialized.includes(
        "api-key",
      ),
      false,
    );
  },
);
