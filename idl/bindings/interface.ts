/**
 * Source-level ABI binding descriptor.
 *
 * This is not a generated deployment IDL and must not be used as deployment
 * evidence. Generated Anchor/Sui artifacts remain separate Mainnet gates.
 */
export const POWERCHAIN_IDL_BINDING_VERSION = "1.0.0" as const;

export const POWERCHAIN_IDL_GENERATED_ARTIFACT_VERIFIED = false as const;

export const POWERCHAIN_EXPECTED_ANCHOR_PROGRAMS = [
  "pwrc_lock",
  "pwrc_token",
] as const;

export const POWERCHAIN_EXPECTED_SUI_MODULES = [
  "wpwrc",
] as const;
