import { createHash } from "node:crypto";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  type AccountMeta,
} from "@solana/web3.js";
import { PWRC_MAX_BASE_UNITS } from "../src/constants.js";
import {
  PWRC_FEE_COLLECTOR_OWNER,
  PWRC_MIN_FEE_BEARING_BASE_UNITS,
  derivePwrcTransferId,
} from "../src/fees.js";

export const PWRC_FEES_PROGRAM_ID = new PublicKey(
  "9Ty7dY7pLmMAdH9nJHD4FSZxkRCAGbce12fs7AJV4pW7",
);

export const PWRC_PROTOCOL_FEE_BPS = 250;
export const PWRC_DECIMALS = 9;

export const PWRC_FEE_COLLECTOR = new PublicKey(PWRC_FEE_COLLECTOR_OWNER);

export function derivePwrcFeeVault(
  mint: PublicKey,
  feeCollector: PublicKey = PWRC_FEE_COLLECTOR,
): PublicKey {
  return getAssociatedTokenAddressSync(
    mint,
    feeCollector,
    false,
    TOKEN_2022_PROGRAM_ID,
  );
}

function anchorDiscriminator(name: string): Buffer {
  return createHash("sha256")
    .update(`global:${name}`)
    .digest()
    .subarray(0, 8);
}

function u64Le(value: bigint): Buffer {
  if (value < 0n || value > 0xffff_ffff_ffff_ffffn) {
    throw new Error("PWRC_U64_OUT_OF_RANGE");
  }
  const out = Buffer.alloc(8);
  out.writeBigUInt64LE(value);
  return out;
}

function transferIdBuffer(value: Uint8Array): Buffer {
  if (value.length !== 32) throw new Error("PWRC_TRANSFER_ID_INVALID_LENGTH");
  return Buffer.from(value);
}

export function findPwrcFeeConfigPda(
  mint: PublicKey,
  programId: PublicKey = PWRC_FEES_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("fee-config"), mint.toBuffer()],
    programId,
  );
}

export function findPwrcFeeReceiptPda(
  config: PublicKey,
  owner: PublicKey,
  transferId: Uint8Array,
  programId: PublicKey = PWRC_FEES_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("fee-receipt"),
      config.toBuffer(),
      owner.toBuffer(),
      transferIdBuffer(transferId),
    ],
    programId,
  );
}

export interface BuildPwrcFeeTransferInstructionInput {
  owner: PublicKey;
  source: PublicKey;
  destination: PublicKey;
  feeVault: PublicKey;
  mint: PublicKey;
  tokenProgram: PublicKey;
  grossAmountBaseUnits: bigint;
  transferId?: Uint8Array;
  transferReference?: string;
  programId?: PublicKey;
}

export function buildPwrcFeeTransferInstruction(
  input: BuildPwrcFeeTransferInstructionInput,
): TransactionInstruction {
  if (input.grossAmountBaseUnits < PWRC_MIN_FEE_BEARING_BASE_UNITS) {
    throw new Error("PWRC_FEE_AMOUNT_BELOW_MINIMUM");
  }
  if (input.grossAmountBaseUnits > PWRC_MAX_BASE_UNITS) {
    throw new Error("PWRC_FEE_AMOUNT_EXCEEDS_MAX");
  }
  if (!input.tokenProgram.equals(TOKEN_2022_PROGRAM_ID)) {
    throw new Error("PWRC_TOKEN_2022_REQUIRED");
  }
  if (input.source.equals(input.destination)) {
    throw new Error("PWRC_SOURCE_DESTINATION_MUST_DIFFER");
  }
  if (input.destination.equals(input.feeVault)) {
    throw new Error("PWRC_FEE_VAULT_CANNOT_BE_DESTINATION");
  }
  if (input.source.equals(input.feeVault)) {
    throw new Error("PWRC_FEE_VAULT_CANNOT_BE_SOURCE");
  }

  const programId = input.programId ?? PWRC_FEES_PROGRAM_ID;
  const [config] = findPwrcFeeConfigPda(input.mint, programId);
  const transferId = input.transferId ?? (
    input.transferReference
      ? derivePwrcTransferId(input.transferReference)
      : undefined
  );
  if (!transferId) throw new Error("PWRC_TRANSFER_ID_REQUIRED");
  const [receipt] = findPwrcFeeReceiptPda(config, input.owner, transferId, programId);

  const keys: AccountMeta[] = [
    { pubkey: input.owner, isSigner: true, isWritable: true },
    { pubkey: input.source, isSigner: false, isWritable: true },
    { pubkey: input.destination, isSigner: false, isWritable: true },
    { pubkey: input.feeVault, isSigner: false, isWritable: true },
    { pubkey: input.mint, isSigner: false, isWritable: false },
    { pubkey: config, isSigner: false, isWritable: true },
    { pubkey: receipt, isSigner: false, isWritable: true },
    { pubkey: input.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  const data = Buffer.concat([
    anchorDiscriminator("transfer_with_fee"),
    u64Le(input.grossAmountBaseUnits),
    transferIdBuffer(transferId),
  ]);

  return new TransactionInstruction({
    programId,
    keys,
    data,
  });
}
