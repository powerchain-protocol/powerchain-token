import type { FeeQuote } from "@powerchain/protocol/fees";

export interface TransactionReview {
  version: "1.0.0";
  operation: string;
  principalRecipient: string;
  serviceFeeRecipient: string | null;
  feeQuote: FeeQuote;
  instructions: Array<{
    program: string;
    purpose: string;
    recipient?: string;
    amountBaseUnits?: string;
  }>;
}

export function createTransactionReview(input: {
  operation: string;
  principalRecipient: string;
  feeQuote: FeeQuote;
}): TransactionReview {
  const instructions: TransactionReview["instructions"] = [
    {
      program: "Token-2022",
      purpose: "principal-transfer",
      recipient: input.principalRecipient,
      amountBaseUnits: input.feeQuote.principalGrossBaseUnits.toString(),
    },
  ];

  if (input.feeQuote.serviceFeeEnabled) {
    if (!input.feeQuote.serviceFeeRecipient) {
      throw new Error("PWRC_SERVICE_FEE_RECIPIENT_REQUIRED");
    }
    instructions.push({
      program: "Token-2022",
      purpose: "powerchain-service-fee",
      recipient: input.feeQuote.serviceFeeRecipient,
      amountBaseUnits:
        input.feeQuote.serviceFeeGrossTransferBaseUnits.toString(),
    });
  }

  return {
    version: "1.0.0",
    operation: input.operation,
    principalRecipient: input.principalRecipient,
    serviceFeeRecipient: input.feeQuote.serviceFeeRecipient,
    feeQuote: input.feeQuote,
    instructions,
  };
}
