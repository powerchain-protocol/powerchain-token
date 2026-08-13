import {
  assertSolanaAddress,
  assertSuiAddress,
} from "../../../utils/addresses.mjs";

const SAFE_FINGERPRINT =
  /^[a-f0-9]{64}$/i;

export function validateExecutionRequest(
  body,
  quote,
) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    const error =
      new Error(
        "PWRC_EXECUTION_INPUT_INVALID",
      );
    error.statusCode =
      400;
    throw error;
  }

  if (
    typeof body
      .quoteFingerprint !==
      "string" ||
    !SAFE_FINGERPRINT.test(
      body.quoteFingerprint,
    )
  ) {
    const error =
      new Error(
        "PWRC_BRIDGE_QUOTE_FINGERPRINT_REQUIRED",
      );
    error.statusCode =
      400;
    throw error;
  }

  if (
    body.quoteFingerprint !==
      quote.fingerprint
  ) {
    const error =
      new Error(
        "PWRC_BRIDGE_QUOTE_FINGERPRINT_MISMATCH",
      );
    error.statusCode =
      409;
    throw error;
  }

  const destination =
    body.destinationAddress;

  if (
    quote.direction ===
      "solana-to-sui"
  ) {
    try {
      assertSuiAddress(
        destination,
        "destinationAddress",
      );
    } catch {
      const error =
        new Error(
          "PWRC_DESTINATION_SUI_ADDRESS_INVALID",
        );
      error.statusCode =
        400;
      throw error;
    }
  } else {
    try {
      assertSolanaAddress(
        destination,
        "destinationAddress",
      );
    } catch {
      const error =
        new Error(
          "PWRC_DESTINATION_SOLANA_ADDRESS_INVALID",
        );
      error.statusCode =
        400;
      throw error;
    }
  }

  return {
    version:
      "1.0.0",
    direction:
      quote.direction,
    amountBaseUnits:
      quote.grossAmountBaseUnits,
    destinationAddress:
      destination,
    quoteFingerprint:
      quote.fingerprint,
  };
}
