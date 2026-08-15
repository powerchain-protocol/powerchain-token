import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const policy =
  fs.readFileSync(
    "apps/api/lib/token-policy.mjs",
    "utf8",
  );
const nativeAdapter =
  fs.readFileSync(
    "apps/api/lib/native-token.mjs",
    "utf8",
  );
const server =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );
const sdk =
  fs.readFileSync(
    "packages/sdk/src/api-client.ts",
    "utf8",
  );
const sdkToken =
  fs.readFileSync(
    "packages/sdk/src/token.ts",
    "utf8",
  );

test(
  "API canonical token policy is loaded from committed config",
  () => {
    for (const invariant of [
      "config/token-policy.json",
      "POWERCHAIN_PWRC_TOKEN_POLICY_V1",
      "PWRC_TOKEN_POLICY_COMMITMENT_MISMATCH",
      "canonicalTokenPolicy",
      "canonicalNativeTokenPolicy",
    ]) {
      assert.ok(
        policy.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "legacy native policy derives from canonical source while keeping legacy commitment",
  () => {
    assert.ok(
      nativeAdapter.includes(
        "canonicalNativeTokenPolicy",
      ),
    );
    assert.ok(
      nativeAdapter.includes(
        "POWERCHAIN_NATIVE_PWRC_POLICY_V1",
      ),
    );
  },
);

test(
  "canonical policy route and SDK client are wired",
  () => {
    assert.ok(
      server.includes(
        '"/api/v1/token/policy"',
      ),
    );
    assert.ok(
      sdk.includes(
        'tokenPolicy()',
      ),
    );
    assert.ok(
      sdk.includes(
        '"/api/v1/token/policy"',
      ),
    );
    assert.ok(
      sdk.includes(
        "PowerChainFeeQuote",
      ),
    );
    assert.ok(
      sdk.includes(
        "bridgeQuoteSuiToSolana",
      ),
    );
  },
);

test(
  "SDK token entry point reuses protocol amount and policy utilities",
  () => {
    for (const invariant of [
      "@powerchain/protocol/token-amount",
      "@powerchain/protocol/token-policy",
      "@powerchain/protocol/fees",
    ]) {
      assert.ok(
        sdkToken.includes(
          invariant,
        ),
      );
    }
  },
);
