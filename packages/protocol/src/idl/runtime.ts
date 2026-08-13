export interface VerifiedAnchorIdlRuntime {
  version: "1.0.0";
  verified: true;
  generatedIdlSha256: string;
  abiFingerprint: string;
}

export function assertVerifiedAnchorIdlRuntime(
  runtime:
    | VerifiedAnchorIdlRuntime
    | null
    | undefined,
): asserts runtime is VerifiedAnchorIdlRuntime {
  if (!runtime?.verified) {
    throw new Error(
      "PWRC_GENERATED_ANCHOR_IDL_NOT_VERIFIED",
    );
  }

  if (runtime.version !== "1.0.0") {
    throw new Error(
      "PWRC_GENERATED_ANCHOR_IDL_VERSION_INVALID",
    );
  }

  if (
    !/^[a-f0-9]{64}$/i.test(
      runtime.generatedIdlSha256,
    )
  ) {
    throw new Error(
      "PWRC_GENERATED_ANCHOR_IDL_HASH_INVALID",
    );
  }

  if (
    !/^[a-f0-9]{64}$/i.test(
      runtime.abiFingerprint,
    )
  ) {
    throw new Error(
      "PWRC_ABI_FINGERPRINT_INVALID",
    );
  }
}

export interface VerifiedSuiAbiRuntime {
  version: "1.0.0";
  verified: true;
  normalizedModulesSha256: string;
  packageId: string;
}

export function assertVerifiedSuiAbiRuntime(
  runtime:
    | VerifiedSuiAbiRuntime
    | null
    | undefined,
): asserts runtime is VerifiedSuiAbiRuntime {
  if (!runtime?.verified) {
    throw new Error(
      "WPWRC_NORMALIZED_ABI_NOT_VERIFIED",
    );
  }

  if (runtime.version !== "1.0.0") {
    throw new Error(
      "WPWRC_NORMALIZED_ABI_VERSION_INVALID",
    );
  }

  if (
    !/^[a-f0-9]{64}$/i.test(
      runtime.normalizedModulesSha256,
    )
  ) {
    throw new Error(
      "WPWRC_NORMALIZED_ABI_HASH_INVALID",
    );
  }

  if (
    !/^0x[a-f0-9]{64}$/i.test(
      runtime.packageId,
    )
  ) {
    throw new Error(
      "WPWRC_PACKAGE_ID_INVALID",
    );
  }
}
