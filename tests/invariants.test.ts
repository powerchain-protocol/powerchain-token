import test from "node:test";
import assert from "node:assert/strict";
import config from "../config/token.json" with { type: "json" };
import {
  PWRC_GENESIS_BASE_UNITS,
  PWRC_GENESIS_SUPPLY,
  PWRC_MAX_BASE_UNITS,
  TOKEN_2022_PROGRAM_ID,
  U64_MAX,
} from "../packages/protocol/src/constants.js";

test("canonical supply cannot drift", () => {
  assert.equal(PWRC_GENESIS_SUPPLY, 18_446_000_000n);
  assert.equal(PWRC_GENESIS_BASE_UNITS, 18_446_000_000_000_000_000n);
  assert.equal(PWRC_MAX_BASE_UNITS, PWRC_GENESIS_BASE_UNITS);
});

test("PWRC raw supply stays inside u64", () => {
  assert.ok(PWRC_GENESIS_BASE_UNITS <= U64_MAX);
  assert.equal(U64_MAX - PWRC_GENESIS_BASE_UNITS, 744_073_709_551_615n);
});

test("token config has exact production profile", () => {
  assert.equal(config.version, "1.0.0");
  assert.equal(config.tokenProgram, TOKEN_2022_PROGRAM_ID);
  assert.equal(config.decimals, 9);
  assert.deepEqual(config.allowedExtensions, [
    "TransferFeeConfig",
    "MetadataPointer",
    "TokenMetadata",
  ]);
  assert.equal(config.freezeAuthority, null);
});
