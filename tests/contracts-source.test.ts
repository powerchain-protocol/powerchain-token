import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const wpwrc = readFileSync(
  "contracts/wpwrc/sources/wpwrc.move",
  "utf8",
);
const state = readFileSync(
  "contracts/wpwrc/sources/state.move",
  "utf8",
);
const moveToml = readFileSync(
  "contracts/wpwrc/Move.toml",
  "utf8",
);


test("wPWRC TreasuryCap stays inside BridgeController", () => {
  assert.match(
    wpwrc,
    /treasury_cap:\s*TreasuryCap<WPWRC>/,
  );
  assert.doesNotMatch(
    wpwrc,
    /public_transfer\(treasury_cap/,
  );
});


test("wPWRC consumes nonzero 32-byte bridge references", () => {
  assert.match(state, /assert_nonzero_bytes32/);
  assert.match(wpwrc, /consumed_mint_messages/);
  assert.match(wpwrc, /consumed_burn_references/);
});


test("Sui package uses current Move 2024 manifest shape", () => {
  assert.match(moveToml, /edition\s*=\s*"2024"/);
  assert.doesNotMatch(moveToml, /^Sui\s*=/m);
});
