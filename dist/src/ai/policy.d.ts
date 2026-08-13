export declare const AI_POLICY_VERSION: "1.0.0";
export declare const AI_DEFAULT_JOB_TTL_SECONDS = 300;
export declare const AI_MAX_JOB_TTL_SECONDS = 900;
export declare const AI_MAX_PROMPT_BYTES = 128000;
export declare const AI_MAX_OUTPUT_TOKENS = 32768;
export declare const AI_MAX_TOOL_CALLS = 32;
export declare const AI_MAX_PARALLEL_TOOLS = 4;
export type AiRiskClass = "low" | "medium" | "high" | "blocked";
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
export declare function sha256Text(value: string): string;
export declare function validatePrompt(prompt: string): string;
export declare function assertAiJob(job: AiComputeJob, now?: number): void;
export declare function assertAiUsageWithinBudget(budget: AiComputeBudget, usage: AiComputeUsage): void;
//# sourceMappingURL=policy.d.ts.map