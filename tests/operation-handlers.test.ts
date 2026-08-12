import test from "node:test";
import assert from "node:assert/strict";
import {
  handleOperation,
} from "../src/handlers/operation-handler.js";
import {
  handleChainWrite,
} from "../src/handlers/write-handler.js";
import {
  PowerChainError,
  PowerChainErrorCode,
} from "../src/common/errors.js";


test("operation handler rejects zero settlement", async () => {
  await assert.rejects(
    () => handleOperation(
      {
        operation: "transfer",
        requestId: "r1",
        amountBaseUnits: 0n,
      },
      async () => true,
    ),
    /ZERO_AMOUNT/,
  );
});


test("operation handler wraps unknown failures without misclassifying provider disagreement", async () => {
  await assert.rejects(
    () => handleOperation(
      {
        operation: "status",
        requestId: "status-1",
      },
      async () => {
        throw new Error("boom");
      },
    ),
    (error: unknown) =>
      error instanceof PowerChainError &&
      error.code === PowerChainErrorCode.OperationFailed,
  );
});


test("write handler simulates and reconciles finalized writes", async () => {
  let simulated = false;
  const result = await handleChainWrite({
    simulate: async () => {
      simulated = true;
    },
    submit: async () => ({
      signature: "sig-1",
      result: 42,
    }),
    reconcile: async () => "finalized",
  });

  assert.equal(simulated, true);
  assert.equal(result.result, 42);
});


test("write handler never blind retries unknown submissions", async () => {
  await assert.rejects(
    () => handleChainWrite({
      simulate: async () => undefined,
      submit: async () => {
        throw new Error("transport disconnected");
      },
      reconcile: async () => "unknown",
    }),
    (error: unknown) =>
      error instanceof PowerChainError &&
      error.code === PowerChainErrorCode.AmbiguousWrite,
  );
});
