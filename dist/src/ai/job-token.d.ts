import { type AiComputeJob } from "./policy.js";
export declare function signAiJob(job: AiComputeJob, secret: string): string;
export declare function verifyAiJob(job: AiComputeJob, signatureHex: string, secret: string): boolean;
//# sourceMappingURL=job-token.d.ts.map