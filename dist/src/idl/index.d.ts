export declare const POWERCHAIN_IDL_VERSION: "1.0.0";
export declare const PWRC_LOCK_IDL_NAME: "pwrc_lock";
export declare const WPWRC_PACKAGE_NAME: "wpwrc";
export type IdlArtifactStatus = "expected-interface" | "generated" | "verified";
export interface PowerChainIdlManifest {
    version: "1.0.0";
    anchor: {
        expected: string;
        generated: string;
        schema: string;
        sourceGeneratedBy: "anchor idl build";
    };
    sui: {
        sourceInterface: string;
        generatedNormalizedModules: string;
        sourceGeneratedBy: "sui move build + normalized module inspection";
    };
}
export * from "./bindings.js";
export * from "./runtime.js";
//# sourceMappingURL=index.d.ts.map