import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  type Commitment,
  type TransactionSignature,
} from "@solana/web3.js";
import {
  getAccount,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import {
  buildPwrcFeeTransferInstruction,
  derivePwrcFeeVault,
  findPwrcFeeConfigPda,
  findPwrcFeeReceiptPda,
  type BuildPwrcFeeTransferInstructionInput,
} from "./programs.js";
import { derivePwrcTransferId, quoteProtocolFee } from "../src/fees.js";

export interface SendPwrcProtocolTransferInput
  extends Omit<
    BuildPwrcFeeTransferInstructionInput,
    "owner" | "transferId" | "transferReference" | "feeVault"
  > {
  feeVault?: PublicKey;
  connection: Connection;
  signer: Keypair;
  transferReference: string;
  commitment?: Commitment;
  maxRetries?: number;
}

export interface PwrcProtocolTransferResult {
  signature: TransactionSignature | null;
  transferId: Uint8Array;
  receipt: PublicKey;
  config: PublicKey;
  feeVault: PublicKey;
  quote: ReturnType<typeof quoteProtocolFee>;
  alreadyProcessed: boolean;
}

export interface PwrcTransferAccountValidation {
  sourceAmount: bigint;
  destinationAmount: bigint;
  feeVaultAmount: bigint;
}

async function recoverReceiptSignature(
  connection: Connection,
  receipt: PublicKey,
): Promise<TransactionSignature | null> {
  const signatures = await connection.getSignaturesForAddress(
    receipt,
    { limit: 1 },
    "finalized",
  );
  return signatures[0]?.signature ?? null;
}

export async function validatePwrcProtocolTransferAccounts(input: {
  connection: Connection;
  owner: PublicKey;
  mint: PublicKey;
  source: PublicKey;
  destination: PublicKey;
  feeVault: PublicKey;
  grossAmountBaseUnits: bigint;
}): Promise<PwrcTransferAccountValidation> {
  if (input.source.equals(input.destination)) {
    throw new Error("PWRC_SOURCE_DESTINATION_MUST_DIFFER");
  }

  const [source, destination, feeVault] = await Promise.all([
    getAccount(
      input.connection,
      input.source,
      "confirmed",
      TOKEN_2022_PROGRAM_ID,
    ),
    getAccount(
      input.connection,
      input.destination,
      "confirmed",
      TOKEN_2022_PROGRAM_ID,
    ),
    getAccount(
      input.connection,
      input.feeVault,
      "confirmed",
      TOKEN_2022_PROGRAM_ID,
    ),
  ]);

  if (!source.mint.equals(input.mint)) {
    throw new Error("PWRC_SOURCE_MINT_MISMATCH");
  }
  if (!destination.mint.equals(input.mint)) {
    throw new Error("PWRC_DESTINATION_MINT_MISMATCH");
  }
  if (!feeVault.mint.equals(input.mint)) {
    throw new Error("PWRC_FEE_VAULT_MINT_MISMATCH");
  }
  if (!source.owner.equals(input.owner)) {
    throw new Error("PWRC_SOURCE_OWNER_MISMATCH");
  }
  if (source.amount < input.grossAmountBaseUnits) {
    throw new Error("PWRC_INSUFFICIENT_SOURCE_BALANCE");
  }

  return {
    sourceAmount: source.amount,
    destinationAmount: destination.amount,
    feeVaultAmount: feeVault.amount,
  };
}

export async function sendPwrcProtocolTransfer(
  input: SendPwrcProtocolTransferInput,
): Promise<PwrcProtocolTransferResult> {
  const commitment = input.commitment ?? "finalized";
  if (commitment !== "finalized") {
    throw new Error("PWRC_PRODUCTION_COMMITMENT_MUST_BE_FINALIZED");
  }
  if (!input.tokenProgram.equals(TOKEN_2022_PROGRAM_ID)) {
    throw new Error("PWRC_TOKEN_2022_REQUIRED");
  }

  const transferId = derivePwrcTransferId(input.transferReference);
  const quote = quoteProtocolFee(input.grossAmountBaseUnits);
  const programId = input.programId;
  const owner = input.signer.publicKey;

  const expectedFeeVault = derivePwrcFeeVault(input.mint);
  if (input.feeVault && !input.feeVault.equals(expectedFeeVault)) {
    throw new Error("PWRC_FEE_VAULT_MISMATCH");
  }
  const feeVault = input.feeVault ?? expectedFeeVault;

  const [config] = findPwrcFeeConfigPda(input.mint, programId);
  const [receipt] = findPwrcFeeReceiptPda(
    config,
    owner,
    transferId,
    programId,
  );

  // Idempotent recovery: an existing receipt means the logical transfer
  // already succeeded. Return the original receipt/signature when discoverable.
  const existingReceipt = await input.connection.getAccountInfo(
    receipt,
    "finalized",
  );
  if (existingReceipt) {
    return {
      signature: await recoverReceiptSignature(input.connection, receipt),
      transferId,
      receipt,
      config,
      feeVault,
      quote,
      alreadyProcessed: true,
    };
  }

  await validatePwrcProtocolTransferAccounts({
    connection: input.connection,
    owner,
    mint: input.mint,
    source: input.source,
    destination: input.destination,
    feeVault,
    grossAmountBaseUnits: input.grossAmountBaseUnits,
  });

  const instruction = buildPwrcFeeTransferInstruction({
    owner,
    source: input.source,
    destination: input.destination,
    feeVault,
    mint: input.mint,
    tokenProgram: TOKEN_2022_PROGRAM_ID,
    grossAmountBaseUnits: input.grossAmountBaseUnits,
    transferId,
    ...(programId ? { programId } : {}),
  });

  const latest = await input.connection.getLatestBlockhash("finalized");
  const transaction = new Transaction({
    feePayer: owner,
    recentBlockhash: latest.blockhash,
  }).add(instruction);

  transaction.sign(input.signer);

  const simulation = await input.connection.simulateTransaction(
    transaction,
    {
      sigVerify: true,
      commitment: "confirmed",
    },
  );
  if (simulation.value.err) {
    const logs = simulation.value.logs?.join("\n") ?? "no logs";
    throw new Error(
      `PWRC_TRANSACTION_SIMULATION_FAILED:${JSON.stringify(simulation.value.err)}\n${logs}`,
    );
  }

  // Submit the exact bytes that were simulated. Retries of the same blockhash
  // therefore retain the same transaction signature and cannot create a second
  // logically distinct transfer.
  const serialized = transaction.serialize();
  const signature = await input.connection.sendRawTransaction(
    serialized,
    {
      skipPreflight: false,
      preflightCommitment: "confirmed",
      maxRetries: input.maxRetries ?? 3,
    },
  );

  const confirmation = await input.connection.confirmTransaction(
    {
      signature,
      blockhash: latest.blockhash,
      lastValidBlockHeight: latest.lastValidBlockHeight,
    },
    "finalized",
  );
  if (confirmation.value.err) {
    throw new Error(
      `PWRC_TRANSACTION_FINALIZATION_FAILED:${JSON.stringify(confirmation.value.err)}`,
    );
  }

  const transactionEvidence = await input.connection.getTransaction(
    signature,
    {
      commitment: "finalized",
      maxSupportedTransactionVersion: 0,
    },
  );
  if (!transactionEvidence || transactionEvidence.meta?.err) {
    throw new Error("PWRC_FINALIZED_TRANSACTION_EVIDENCE_INVALID");
  }

  const receiptAccount = await input.connection.getAccountInfo(
    receipt,
    "finalized",
  );
  if (!receiptAccount) {
    throw new Error("PWRC_TRANSFER_RECEIPT_MISSING_AFTER_FINALIZATION");
  }

  return {
    signature,
    transferId,
    receipt,
    config,
    feeVault,
    quote,
    alreadyProcessed: false,
  };
}
