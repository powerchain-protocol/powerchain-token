import type {
  PublicKey,
  Signer,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  createTransferCheckedInstruction,
} from "@solana/spl-token";
import {
  PWRC_DECIMALS,
} from "../constants.js";
import {
  assertPwrcBaseUnits,
} from "../amounts.js";

export function createPwrcTransferInstruction(
  input: {
    source: PublicKey;
    mint: PublicKey;
    destination: PublicKey;
    authority: PublicKey;
    amountBaseUnits: bigint;
    multiSigners?: (PublicKey | Signer)[];
  },
) {
  const amount =
    assertPwrcBaseUnits(
      input.amountBaseUnits,
    );

  if (amount <= 0n) {
    throw new Error(
      "PWRC_TRANSFER_AMOUNT_MUST_BE_POSITIVE",
    );
  }

  return createTransferCheckedInstruction(
    input.source,
    input.mint,
    input.destination,
    input.authority,
    amount,
    PWRC_DECIMALS,
    input.multiSigners ?? [],
    TOKEN_2022_PROGRAM_ID,
  );
}
