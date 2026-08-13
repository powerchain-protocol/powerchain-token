import {
  assertOperationAmount,
  type PwrcOperationClass,
} from "../operations/policy.js";
import {
  PowerChainError,
  PowerChainErrorCode,
} from "../common/errors.js";

export interface OperationContext {
  operation:
    PwrcOperationClass;
  requestId: string;
  amountBaseUnits?: bigint;
}

const REQUEST_ID_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export function assertOperationContext(
  context: OperationContext,
): void {
  assertOperationAmount(
    context.operation,
    context.amountBaseUnits,
  );

  const requestId =
    context.requestId.trim();

  if (!requestId) {
    throw new PowerChainError(
      PowerChainErrorCode
        .InvalidConfiguration,
      "requestId is required",
    );
  }

  if (
    requestId !==
      context.requestId ||
    !REQUEST_ID_PATTERN.test(
      requestId,
    )
  ) {
    throw new PowerChainError(
      PowerChainErrorCode
        .InvalidConfiguration,
      "requestId must be 1-128 safe ASCII characters",
    );
  }
}

export async function handleOperation<T>(
  context: OperationContext,
  operation: () => Promise<T>,
): Promise<T> {
  assertOperationContext(
    context,
  );

  try {
    return await operation();
  } catch (error) {
    if (
      error instanceof
      PowerChainError
    ) {
      throw error;
    }

    throw new PowerChainError(
      PowerChainErrorCode
        .OperationFailed,
      error instanceof Error
        ? error.message
        : "Unknown operation failure",
      { cause: error },
    );
  }
}
