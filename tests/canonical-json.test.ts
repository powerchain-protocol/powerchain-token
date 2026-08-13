import test from "node:test";
import assert from "node:assert/strict";
import { canonicalJson } from "../packages/protocol/src/canonical-json.js";

test("canonicalJson is stable across object key order", () => {
  assert.equal(canonicalJson({ b: 2, a: { d: 4, c: 3 } }), canonicalJson({ a: { c: 3, d: 4 }, b: 2 }));
});
