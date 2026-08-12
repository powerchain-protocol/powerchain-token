import test from "node:test";
import assert from "node:assert/strict";
import binding from "../idl/bindings/manifest.json";
import fingerprint from "../idl/abi.fingerprint.json";
import expected from "../idl/anchor/pwrc_lock.expected.json";
import sui from "../idl/sui/wpwrc.interface.json";

test("binding is tied to current ABI fingerprint", () => {
  assert.equal(binding.version, "1.0.0");
  assert.equal(
    binding.abiFingerprint,
    fingerprint.combinedAbiSha256,
  );
});

test("binding exposes exact current interface names", () => {
  assert.deepEqual(
    binding.anchor.instructions,
    expected.instructions.map((item) => item.name),
  );
  assert.deepEqual(
    binding.sui.entryFunctions,
    sui.modules.bridge.entryFunctions,
  );
});

test("binding cannot replace generated deployment artifacts", () => {
  assert.equal(
    binding.anchor.generatedIdlRequiredForEncoding,
    true,
  );
  assert.equal(
    binding.sui.verifiedPackageIdRequiredForExecution,
    true,
  );
});
