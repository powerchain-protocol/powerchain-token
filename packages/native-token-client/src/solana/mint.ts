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
  PWRC_DECIMALS,
  PWRC_MAX_BASE_UNITS,
} from "../constants.js";

export async function assertPwrcMint(
  input: {
    connection: Connection;
    mint: PublicKey;
    commitment?: Commitment;
    requireFixedGenesisSupply?: boolean;
    requireMintAuthorityRevoked?: boolean;
  },
): Promise<void> {
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

  if (
    mint.supply > PWRC_MAX_BASE_UNITS
  ) {
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

  if (getTransferFeeConfig(mint)) {
    throw new Error(
      "PWRC_TRANSFER_FEE_CONFIG_MUST_BE_ABSENT",
    );
  }
}
