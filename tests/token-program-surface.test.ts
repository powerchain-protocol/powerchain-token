import test from "node:test";
import assert from "node:assert/strict";
import expected from "../idl/anchor/pwrc_token.expected.json";

test("token verifier exposes no mint instruction", () => {
  assert.equal(
    expected.canonicalRules
      .publicMintInstructionAllowed,
    false,
  );

  assert.deepEqual(
    expected.instructions.map(
      (instruction) => instruction.name,
    ),
    ["verifyCanonicalMint"],
  );
});

test("token verifier canonical rules stay fixed", () => {
  assert.equal(
    expected.canonicalRules.decimals,
    9,
  );
  assert.equal(
    expected.canonicalRules.fixedSupplyBaseUnits,
    "18446000000000000000",
  );
  assert.equal(
    expected.canonicalRules.transferFeeBps,
    250,
  );
});

test("token verifier fee cap stays canonical", () => {
  assert.equal(
    expected.canonicalRules.maximumTransferFeeTokens,
    "1000000",
  );
  assert.equal(
    expected.canonicalRules.maximumTransferFeeBaseUnits,
    "1000000000000000",
  );
});
