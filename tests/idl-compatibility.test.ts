import test from "node:test";
import assert from "node:assert/strict";
import baseline from "../idl/baseline/1.0.0.json" with { type: "json" };
import expected from "../idl/anchor/pwrc_lock.expected.json" with { type: "json" };
import sui from "../idl/sui/wpwrc.interface.json" with { type: "json" };

test("IDL baseline is pinned to 1.0.0", () => {
  assert.equal(baseline.version, "1.0.0");
  assert.equal(
    baseline.policy
      .breakingChangesAllowedWithoutVersionChange,
    false,
  );
});

test("current Anchor interface preserves baseline instructions", () => {
  const current = new Set(
    expected.instructions.map(
      (instruction) => instruction.name,
    ),
  );

  for (const instruction of baseline.anchor.instructions) {
    assert.ok(current.has(instruction.name));
  }
});

test("current Sui interface preserves baseline entries", () => {
  const current = new Set(
    sui.modules.bridge.entryFunctions,
  );

  for (const entry of baseline.sui.entryFunctions) {
    assert.ok(current.has(entry));
  }
});
