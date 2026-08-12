export const REQUIRED_TOKEN_2022_EXTENSIONS = [
  "TransferFeeConfig",
  "MetadataPointer",
  "TokenMetadata",
] as const;

export const FORBIDDEN_TOKEN_2022_EXTENSIONS = [
  "PermanentDelegate",
  "MintCloseAuthority",
  "DefaultAccountState",
  "InterestBearingConfig",
  "ScaledUiAmount",
  "Pausable",
  "NonTransferable",
] as const;

export interface CanonicalPwrcToken2022ProfileInput {
  enabledExtensions: readonly string[];
  transferFeeBasisPoints?: number;
  maximumTransferFeeBaseUnits?: bigint;
}

export function validateCanonicalPwrcToken2022Profile(
  input: CanonicalPwrcToken2022ProfileInput,
): void {
  const enabled =
    new Set(input.enabledExtensions);

  for (
    const required of
    REQUIRED_TOKEN_2022_EXTENSIONS
  ) {
    if (!enabled.has(required)) {
      throw new Error(
        `PWRC_REQUIRED_EXTENSION_MISSING:${required}`,
      );
    }
  }

  for (
    const forbidden of
    FORBIDDEN_TOKEN_2022_EXTENSIONS
  ) {
    if (enabled.has(forbidden)) {
      throw new Error(
        `PWRC_FORBIDDEN_EXTENSION_ENABLED:${forbidden}`,
      );
    }
  }

  if (
    input.transferFeeBasisPoints !==
    undefined &&
    input.transferFeeBasisPoints !== 250
  ) {
    throw new Error(
      "PWRC_TRANSFER_FEE_BPS_MISMATCH",
    );
  }

  if (
    input.maximumTransferFeeBaseUnits !==
    undefined &&
    input.maximumTransferFeeBaseUnits !==
      1_000_000_000_000_000n
  ) {
    throw new Error(
      "PWRC_TRANSFER_FEE_MAXIMUM_MISMATCH",
    );
  }
}
