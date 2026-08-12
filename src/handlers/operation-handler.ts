import {
  assertOperationAmount,
  type PwrcOperationClass,
} from "../operations/policy.js";
import {
  PowerChainError,
  PowerChainErrorCode,
} from "../common/errors.js";

export interface OperationContext {
  operation: PwrcOperationClass;
  requestId: string;
  amountBaseUnits?: bigint;
}

export function assertOperationContext(context: OperationContext): void {
  assertOperationAmount(context.operation, context.amountBaseUnits);

  const requestId = context.requestId.trim();
  if (!requestId) {
    throw new PowerChainError(
      PowerChainErrorCode.InvalidConfiguration,
      "requestId is required",
    );
  }

  if (requestId.length > 128) {
    throw new PowerChainError(
      PowerChainErrorCode.InvalidConfiguration,
      "requestId exceeds 128 characters",
    );
  }
}

export async function handleOperation<T>(
  context: OperationContext,
  operation: () => Promise<T>,
): Promise<T> {
  assertOperationContext(context);

  try {
    return await operation();
  } catch (error) {
    if (error instanceof PowerChainError) throw error;

    throw new PowerChainError(
      PowerChainErrorCode.OperationFailed,
      error instanceof Error ? error.message : "Unknown operation failure",
      { cause: error },
    );
  }
}
