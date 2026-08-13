import test from "node:test";
import assert from "node:assert/strict";
import {
  readBooleanEnv,
  readIntegerEnv,
  readEnumEnv,
} from "../packages/protocol/src/common/env.js";
import {
  assertRetryPolicy,
  retryDelayMs,
} from "../packages/protocol/src/common/retry.js";
import {
  assertRuntimePolicy,
  DEFAULT_RUNTIME_POLICY,
} from "../packages/protocol/src/config/runtime.js";
import {
  assertOperationContext,
} from "../packages/protocol/src/handlers/operation-handler.js";
import {
  handleChainWrite,
} from "../packages/protocol/src/handlers/write-handler.js";

test("environment helpers reject malformed values", () => {
  assert.equal(
    readBooleanEnv(
      { FLAG: "true" },
      "FLAG",
    ),
    true,
  );

  assert.equal(
    readIntegerEnv(
      { LIMIT: "8" },
      "LIMIT",
      { min: 1, max: 10 },
    ),
    8,
  );

  assert.equal(
    readEnumEnv(
      { NETWORK: "mainnet" },
      "NETWORK",
      [
        "devnet",
        "mainnet",
      ] as const,
    ),
    "mainnet",
  );

  assert.throws(
    () =>
      readBooleanEnv(
        { FLAG: "maybe" },
        "FLAG",
      ),
    /POWERCHAIN_ENV_BOOLEAN_INVALID/,
  );
});

test("retry policy is bounded", () => {
  assert.doesNotThrow(
    () =>
      assertRetryPolicy({
        maxAttempts: 4,
        baseDelayMs: 250,
        maxDelayMs: 4_000,
      }),
  );

  assert.throws(
    () =>
      assertRetryPolicy({
        maxAttempts: 11,
        baseDelayMs: 250,
        maxDelayMs: 4_000,
      }),
    /POWERCHAIN_RETRY_POLICY_INVALID/,
  );

  assert.equal(
    retryDelayMs(
      10,
      {
        maxAttempts: 10,
        baseDelayMs: 1_000,
        maxDelayMs: 60_000,
      },
    ),
    60_000,
  );
});

test("runtime policy rejects unsafe delay relationships", () => {
  assert.doesNotThrow(
    () =>
      assertRuntimePolicy(
        DEFAULT_RUNTIME_POLICY,
      ),
  );

  assert.throws(
    () =>
      assertRuntimePolicy({
        ...DEFAULT_RUNTIME_POLICY,
        readBaseDelayMs: 5_000,
        readMaxDelayMs: 1_000,
      }),
    /PWRC_RUNTIME_RETRY_DELAY_INVALID/,
  );
});

test("operation request IDs reject whitespace and controls", () => {
  assert.doesNotThrow(
    () =>
      assertOperationContext({
        operation: "status",
        requestId:
          "pwrc:req-123",
      }),
  );

  assert.throws(
    () =>
      assertOperationContext({
        operation: "status",
        requestId:
          " bad id ",
      }),
    /requestId must be/,
  );
});

test("finalized ambiguous write can recover result without resubmission", async () => {
  let submitCalls = 0;

  const result =
    await handleChainWrite({
      simulate:
        async () => {},
      submit:
        async () => {
          submitCalls += 1;
          throw Object.assign(
            new Error(
              "connection lost",
            ),
            {
              signature:
                "sig-123",
            },
          );
        },
      signatureFromError:
        (error) =>
          (
            error as {
              signature?: string;
            }
          ).signature,
      reconcile:
        async () =>
          "finalized",
      recoverFinalizedResult:
        async () => ({
          recovered: true,
        }),
    });

  assert.equal(
    submitCalls,
    1,
  );
  assert.equal(
    result.signature,
    "sig-123",
  );
  assert.deepEqual(
    result.result,
    {
      recovered: true,
    },
  );
});
