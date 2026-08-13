import { createHash } from "node:crypto";

export const AI_POLICY_VERSION = "1.0.0" as const;
export const AI_DEFAULT_JOB_TTL_SECONDS = 300;
export const AI_MAX_JOB_TTL_SECONDS = 900;
export const AI_MAX_PROMPT_BYTES = 128_000;
export const AI_MAX_OUTPUT_TOKENS = 32_768;
export const AI_MAX_TOOL_CALLS = 32;
export const AI_MAX_PARALLEL_TOOLS = 4;

export type AiRiskClass =
  | "low"
  | "medium"
  | "high"
  | "blocked";

export interface AiComputeBudget {
  maxInputTokens: number;
  maxOutputTokens: number;
  maxToolCalls: number;
  maxUsdMicros: bigint;
  maxPwrcBaseUnits: bigint;
}

export interface AiComputeJob {
  version: "1.0.0";
  jobId: string;
  subject: string;
  model: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
  promptSha256: string;
  budget: AiComputeBudget;
  riskClass: AiRiskClass;
  tools: readonly string[];
}

export interface AiComputeUsage {
  inputTokens: number;
  outputTokens: number;
  toolCalls: number;
  usdMicros: bigint;
  pwrcBaseUnits: bigint;
}

export function sha256Text(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function validatePrompt(prompt: string): string {
  const bytes = Buffer.byteLength(prompt, "utf8");
  if (bytes === 0) throw new Error("AI_PROMPT_REQUIRED");
  if (bytes > AI_MAX_PROMPT_BYTES) throw new Error("AI_PROMPT_TOO_LARGE");
  return sha256Text(prompt);
}

export function assertAiJob(job: AiComputeJob, now: number = Math.floor(Date.now() / 1000)): void {
  if (job.version !== AI_POLICY_VERSION) throw new Error("AI_POLICY_VERSION_MISMATCH");
  if (!job.jobId || !job.subject || !job.nonce) throw new Error("AI_JOB_IDENTITY_REQUIRED");
  if (!/^[a-f0-9]{64}$/i.test(job.promptSha256)) throw new Error("AI_PROMPT_HASH_INVALID");
  if (job.issuedAt > now + 30) throw new Error("AI_JOB_ISSUED_IN_FUTURE");
  if (job.expiresAt <= now) throw new Error("AI_JOB_EXPIRED");
  if (job.expiresAt - job.issuedAt > AI_MAX_JOB_TTL_SECONDS) throw new Error("AI_JOB_TTL_TOO_LONG");
  if (job.riskClass === "blocked") throw new Error("AI_JOB_BLOCKED");
  if (job.budget.maxOutputTokens > AI_MAX_OUTPUT_TOKENS) throw new Error("AI_OUTPUT_BUDGET_TOO_HIGH");
  if (job.budget.maxToolCalls > AI_MAX_TOOL_CALLS) throw new Error("AI_TOOL_BUDGET_TOO_HIGH");
  if (job.tools.length > AI_MAX_TOOL_CALLS) throw new Error("AI_TOOL_ALLOWLIST_TOO_LARGE");
}

export function assertAiUsageWithinBudget(
  budget: AiComputeBudget,
  usage: AiComputeUsage,
): void {
  if (usage.inputTokens < 0 || usage.outputTokens < 0 || usage.toolCalls < 0) {
    throw new Error("AI_USAGE_NEGATIVE");
  }
  if (usage.inputTokens > budget.maxInputTokens) throw new Error("AI_INPUT_BUDGET_EXCEEDED");
  if (usage.outputTokens > budget.maxOutputTokens) throw new Error("AI_OUTPUT_BUDGET_EXCEEDED");
  if (usage.toolCalls > budget.maxToolCalls) throw new Error("AI_TOOL_BUDGET_EXCEEDED");
  if (usage.usdMicros > budget.maxUsdMicros) throw new Error("AI_USD_BUDGET_EXCEEDED");
  if (usage.pwrcBaseUnits > budget.maxPwrcBaseUnits) throw new Error("AI_PWRC_BUDGET_EXCEEDED");
}
