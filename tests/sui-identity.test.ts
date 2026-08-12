import test from "node:test";
import assert from "node:assert/strict";
import {
  POWERCHAIN_SUI_ALIAS,
  POWERCHAIN_SUI_ADDRESS,
} from "../src/sui/identity.js";

test("PowerChain Sui identity is pinned", () => {
  assert.equal(POWERCHAIN_SUI_ALIAS, "powerchain");
  assert.equal(
    POWERCHAIN_SUI_ADDRESS,
    "0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1",
  );
});
