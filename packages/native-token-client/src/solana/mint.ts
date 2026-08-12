import type {
  Commitment,
  Connection,
  PublicKey,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  getMint,
  getTransferFeeConfig,
} from "@solana/spl-token";
import {
  PWRC_CANONICAL_MINT_ADDRESS,
  PWRC_DECIMALS,
  PWRC_MAX_BASE_UNITS,
  PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
  PWRC_TRANSFER_FEE_BPS,
} from "../constants.js";

function assertFeeSchedule(
  schedule: {
    transferFeeBasisPoints: number;
    maximumFee: bigint;
  },
): void {
  if (
    schedule.transferFeeBasisPoints !==
    PWRC_TRANSFER_FEE_BPS
  ) {
    throw new Error(
      "PWRC_TRANSFER_FEE_BPS_MISMATCH",
    );
  }

  if (
    schedule.maximumFee !==
    PWRC_MAX_TRANSFER_FEE_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_TRANSFER_FEE_MAXIMUM_MISMATCH",
    );
  }
}

export async function assertPwrcMint(
  input: {
    connection: Connection;
    mint: PublicKey;
    commitment?: Commitment;
    requireFixedGenesisSupply?: boolean;
    requireMintAuthorityRevoked?: boolean;
    requireCanonicalMintAddress?: boolean;
  },
): Promise<void> {
  if (
    (input.requireCanonicalMintAddress ??
      true) &&
    input.mint.toBase58() !==
      PWRC_CANONICAL_MINT_ADDRESS
  ) {
    throw new Error(
      "PWRC_CANONICAL_MINT_ADDRESS_MISMATCH",
    );
  }

  const mint =
    await getMint(
      input.connection,
      input.mint,
      input.commitment ?? "finalized",
      TOKEN_2022_PROGRAM_ID,
    );

  if (mint.decimals !== PWRC_DECIMALS) {
    throw new Error(
      "PWRC_MINT_DECIMALS_MISMATCH",
    );
  }

  if (
    input.requireFixedGenesisSupply &&
    mint.supply !== PWRC_MAX_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_MINT_SUPPLY_MISMATCH",
    );
  }

  if (mint.supply > PWRC_MAX_BASE_UNITS) {
    throw new Error(
      "PWRC_MINT_SUPPLY_EXCEEDS_MAX",
    );
  }

  if (
    (input.requireMintAuthorityRevoked ??
      true) &&
    mint.mintAuthority !== null
  ) {
    throw new Error(
      "PWRC_MINT_AUTHORITY_NOT_REVOKED",
    );
  }

  if (mint.freezeAuthority !== null) {
    throw new Error(
      "PWRC_FREEZE_AUTHORITY_MUST_BE_NULL",
    );
  }

  const feeConfig =
    getTransferFeeConfig(mint);

  if (!feeConfig) {
    throw new Error(
      "PWRC_TRANSFER_FEE_CONFIG_REQUIRED",
    );
  }

  assertFeeSchedule(
    feeConfig.olderTransferFee,
  );
  assertFeeSchedule(
    feeConfig.newerTransferFee,
  );
}
