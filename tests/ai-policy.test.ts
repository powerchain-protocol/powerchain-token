import test from "node:test";
import assert from "node:assert/strict";
import {
  assertAiJob,
  assertAiUsageWithinBudget,
  validatePrompt,
  type AiComputeJob,
} from "../packages/protocol/src/ai/policy.js";

test("AI prompt hashing is deterministic", () => {
  assert.equal(validatePrompt("hello"), validatePrompt("hello"));
});

test("AI usage budget rejects overrun", () => {
  assert.throws(() =>
    assertAiUsageWithinBudget(
      {
        maxInputTokens: 100,
        maxOutputTokens: 100,
        maxToolCalls: 1,
        maxUsdMicros: 1_000_000n,
        maxPwrcBaseUnits: 1_000_000_000n,
      },
      {
        inputTokens: 10,
        outputTokens: 101,
        toolCalls: 0,
        usdMicros: 0n,
        pwrcBaseUnits: 0n,
      },
    ),
  /AI_OUTPUT_BUDGET_EXCEEDED/);
});
