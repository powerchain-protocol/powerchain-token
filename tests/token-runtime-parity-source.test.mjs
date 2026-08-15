import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const policy =
  fs.readFileSync(
    "apps/api/lib/token-policy.mjs",
    "utf8",
  );
const fees =
  fs.readFileSync(
    "apps/api/lib/fees.mjs",
    "utf8",
  );
const bridge =
  fs.readFileSync(
    "apps/api/lib/bridge-routes.mjs",
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

test("API fee engine derives native economics from canonical token policy", () => {
  assert.ok(fees.includes("canonicalTokenEconomics"));
  assert.ok(fees.includes("FIXED_SUPPLY_BASE_UNITS"));
  assert.ok(fees.includes("PWRC_AMOUNT_EXCEEDS_SUPPLY"));
  assert.ok(fees.includes("PWRC_NET_AMOUNT_UNACHIEVABLE"));
  assert.equal(fees.includes("const NATIVE_FEE_BPS = 250n"), false);
});

test("compact token and bridge identity derive from canonical policy", () => {
  assert.ok(policy.includes("canonicalTokenProfile"));
  assert.ok(policy.includes("canonicalTokenSnapshot"));
  assert.ok(server.includes("canonicalTokenProfile"));
  assert.ok(bridge.includes("canonicalTokenSnapshot"));
});

test("SDK bridge amount validation uses protocol fixed-supply validation", () => {
  assert.ok(sdk.includes("assertPositivePwrcBaseUnitsString"));
  assert.ok(sdk.includes("@powerchain/protocol/token-amount"));
});
