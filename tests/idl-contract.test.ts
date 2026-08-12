import test from "node:test";
import assert from "node:assert/strict";
import expected from "../idl/anchor/pwrc_lock.expected.json";
import sui from "../idl/sui/wpwrc.interface.json";

test("Anchor expected IDL contract matches canonical policy", () => {
  assert.equal(expected.version, "1.0.0");
  assert.equal(expected.canonicalRules.pwrcDecimals, 9);
  assert.equal(expected.canonicalRules.wpwrcDecimals, 9);
  assert.equal(expected.canonicalRules.baseUnitFactor, "1");
  assert.equal(expected.canonicalRules.transferFeeBps, 0);
});

test("Sui interface never invents package ID", () => {
  assert.equal(sui.asset.decimals, 9);
  assert.equal(sui.asset.genesisSupplyBaseUnits, "0");
  assert.equal(sui.identity.isPackageId, false);
  assert.equal(sui.deployment.packageId, null);
});


test("Anchor expected interface preserves source names and account lists", () => {
  const lock = expected.instructions.find(
    (instruction) => instruction.name === "lockToSui",
  );
  assert.equal(lock?.sourceName, "lock_to_sui");
  assert.deepEqual(lock?.accounts, [
    "owner",
    "source",
    "vault",
    "mint",
    "config",
    "receipt",
    "tokenProgram",
    "systemProgram",
  ]);
});

test("Sui interface includes burn-intent lifecycle", () => {
  assert.ok(
    sui.modules.bridge.entryFunctions.includes(
      "stage_canonical_burn_intent",
    ),
  );
  assert.ok(
    sui.modules.bridge.entryFunctions.includes(
      "lower_canonical_supply_ceiling",
    ),
  );
  assert.ok(
    sui.modules.bridge.entryFunctions.includes(
      "cancel_bridge_authority",
    ),
  );
});
