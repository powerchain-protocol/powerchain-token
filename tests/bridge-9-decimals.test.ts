import test from "node:test"; import assert from "node:assert/strict"; import {canonicalToWrappedExact,wrappedToCanonical} from "../src/common/token-units.js";
test("bridge uses identical 9-decimal base units",()=>{assert.equal(canonicalToWrappedExact(1_000_000_001n),1_000_000_001n);assert.equal(wrappedToCanonical(1_000_000_001n),1_000_000_001n);});
