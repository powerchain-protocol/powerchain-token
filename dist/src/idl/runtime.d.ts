export interface VerifiedAnchorIdlRuntime {
    version: "1.0.0";
    verified: true;
    generatedIdlSha256: string;
    abiFingerprint: string;
}
export declare function assertVerifiedAnchorIdlRuntime(runtime: VerifiedAnchorIdlRuntime | null | undefined): asserts runtime is VerifiedAnchorIdlRuntime;
export interface VerifiedSuiAbiRuntime {
    version: "1.0.0";
    verified: true;
    normalizedModulesSha256: string;
    packageId: string;
}
export declare function assertVerifiedSuiAbiRuntime(runtime: VerifiedSuiAbiRuntime | null | undefined): asserts runtime is VerifiedSuiAbiRuntime;
//# sourceMappingURL=runtime.d.ts.map