export function assertVerifiedAnchorIdlRuntime(runtime) {
    if (!runtime?.verified) {
        throw new Error("PWRC_GENERATED_ANCHOR_IDL_NOT_VERIFIED");
    }
    if (runtime.version !== "1.0.0") {
        throw new Error("PWRC_GENERATED_ANCHOR_IDL_VERSION_INVALID");
    }
    if (!/^[a-f0-9]{64}$/i.test(runtime.generatedIdlSha256)) {
        throw new Error("PWRC_GENERATED_ANCHOR_IDL_HASH_INVALID");
    }
    if (!/^[a-f0-9]{64}$/i.test(runtime.abiFingerprint)) {
        throw new Error("PWRC_ABI_FINGERPRINT_INVALID");
    }
}
export function assertVerifiedSuiAbiRuntime(runtime) {
    if (!runtime?.verified) {
        throw new Error("WPWRC_NORMALIZED_ABI_NOT_VERIFIED");
    }
    if (runtime.version !== "1.0.0") {
        throw new Error("WPWRC_NORMALIZED_ABI_VERSION_INVALID");
    }
    if (!/^[a-f0-9]{64}$/i.test(runtime.normalizedModulesSha256)) {
        throw new Error("WPWRC_NORMALIZED_ABI_HASH_INVALID");
    }
    if (!/^0x[a-f0-9]{64}$/i.test(runtime.packageId)) {
        throw new Error("WPWRC_PACKAGE_ID_INVALID");
    }
}
//# sourceMappingURL=runtime.js.map