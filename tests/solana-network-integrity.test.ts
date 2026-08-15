import test from "node:test";
import assert from "node:assert/strict";
import {
  assertIndependentRpcProviders,
  resolveExpectedSolanaGenesisHash,
  solanaRpcProviderFamily,
} from "../packages/protocol/src/solana.js";

test(
  "trusted Solana genesis hash is required by cluster",
  () => {
    assert.throws(
      () =>
        resolveExpectedSolanaGenesisHash(
          "mainnet-beta",
          {},
        ),
      /PWRC_SOLANA_GENESIS_HASH_REQUIRED:mainnet-beta/,
    );

    assert.equal(
      resolveExpectedSolanaGenesisHash(
        "devnet",
        {
          PWRC_SOLANA_DEVNET_GENESIS_HASH:
            "11111111111111111111111111111111",
        },
      ),
      "11111111111111111111111111111111",
    );
  },
);

test(
  "Helius hosts are classified into one provider family",
  () => {
    assert.equal(
      solanaRpcProviderFamily(
        "https://mainnet.helius-rpc.com/?api-key=one",
      ),
      "helius",
    );
    assert.equal(
      solanaRpcProviderFamily(
        "https://devnet.helius-rpc.com/?api-key=two",
      ),
      "helius",
    );
  },
);

test(
  "secondary RPC must use a different provider family",
  () => {
    assert.throws(
      () =>
        assertIndependentRpcProviders(
          "https://mainnet.helius-rpc.com/?api-key=one",
          "https://mainnet.helius-rpc.com/?api-key=two",
        ),
      /PWRC_SECONDARY_RPC_PROVIDER_MUST_DIFFER:helius/,
    );

    assert.doesNotThrow(
      () =>
        assertIndependentRpcProviders(
          "https://mainnet.helius-rpc.com/?api-key=one",
          "https://rpc.example-provider.invalid/",
        ),
    );
  },
);


test(
  "trusted Solana genesis hash must decode to exactly 32 bytes",
  () => {
    assert.throws(
      () =>
        resolveExpectedSolanaGenesisHash(
          "mainnet-beta",
          {
            PWRC_SOLANA_MAINNET_GENESIS_HASH:
              "22222222222222222222222222222222",
          },
        ),
      /PWRC_SOLANA_GENESIS_HASH_INVALID/,
    );

    assert.doesNotThrow(
      () =>
        resolveExpectedSolanaGenesisHash(
          "mainnet-beta",
          {
            PWRC_SOLANA_MAINNET_GENESIS_HASH:
              "11111111111111111111111111111111",
          },
        ),
    );
  },
);
