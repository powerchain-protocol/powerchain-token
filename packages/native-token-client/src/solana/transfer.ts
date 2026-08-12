import type {
  PublicKey,
  Signer,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  createTransferCheckedWithFeeInstruction,
} from "@solana/spl-token";
import {
  PWRC_DECIMALS,
} from "../constants.js";
import {
  assertPwrcBaseUnits,
} from "../amounts.js";
import {
  calculateTransferFeeBaseUnits,
} from "../fees.js";

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

  const expectedFee =
    calculateTransferFeeBaseUnits(
      amount,
    );

  return createTransferCheckedWithFeeInstruction(
    input.source,
    input.mint,
    input.destination,
    input.authority,
    amount,
    PWRC_DECIMALS,
    expectedFee,
    input.multiSigners ?? [],
    TOKEN_2022_PROGRAM_ID,
  );
}
