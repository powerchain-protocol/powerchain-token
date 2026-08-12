export const REQUIRED_TOKEN_2022_EXTENSIONS = [
  "MetadataPointer",
  "TokenMetadata",
] as const;

export const FORBIDDEN_TOKEN_2022_EXTENSIONS = [
  "TransferFeeConfig",
  "PermanentDelegate",
  "MintCloseAuthority",
  "DefaultAccountState",
  "InterestBearingConfig",
  "ScaledUiAmount",
  "Pausable",
  "NonTransferable",
] as const;

export function validateCanonicalPwrcToken2022Profile(input: {
  enabledExtensions: readonly string[];
}): void {
  const enabled = new Set(input.enabledExtensions);

  for (const required of REQUIRED_TOKEN_2022_EXTENSIONS) {
    if (!enabled.has(required)) {
      throw new Error(
        `PWRC_REQUIRED_EXTENSION_MISSING:${required}`,
      );
    }
  }

  for (const forbidden of FORBIDDEN_TOKEN_2022_EXTENSIONS) {
    if (enabled.has(forbidden)) {
      throw new Error(
        `PWRC_FORBIDDEN_EXTENSION_ENABLED:${forbidden}`,
      );
    }
  }
}
