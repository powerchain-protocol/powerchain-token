import {
  PowerChainError,
  PowerChainErrorCode,
} from "../common/errors.js";

export interface WriteExecution<T> {
  signature: string;
  result: T;
}

export type WriteReconciliationState =
  | "finalized"
  | "failed"
  | "unknown";

export async function handleChainWrite<T>(input: {
  simulate: () => Promise<void>;
  submit: () => Promise<WriteExecution<T>>;
  reconcile: (signature: string) => Promise<WriteReconciliationState>;
  signatureFromError?: (error: unknown) => string | undefined;
}): Promise<WriteExecution<T>> {
  try {
    await input.simulate();
  } catch (error) {
    throw new PowerChainError(
      PowerChainErrorCode.SimulationFailed,
      "Chain write simulation failed",
      { cause: error },
    );
  }

  let submitted: WriteExecution<T>;

  try {
    submitted = await input.submit();
  } catch (error) {
    const signature = input.signatureFromError?.(error)?.trim();

    if (signature) {
      const state = await input.reconcile(signature);
      if (state === "finalized") {
        throw new PowerChainError(
          PowerChainErrorCode.AmbiguousWrite,
          `Write finalized but submit result was lost:${signature}`,
          { cause: error },
        );
      }
      if (state === "failed") {
        throw new PowerChainError(
          PowerChainErrorCode.TransactionFailed,
          `Write failed:${signature}`,
          { cause: error },
        );
      }
    }

    throw new PowerChainError(
      PowerChainErrorCode.AmbiguousWrite,
      "Write submission outcome is ambiguous; do not blind retry",
      { cause: error },
    );
  }

  if (!submitted.signature.trim()) {
    throw new PowerChainError(
      PowerChainErrorCode.InvalidState,
      "Submitted write did not return a transaction signature",
    );
  }

  const state = await input.reconcile(submitted.signature);

  if (state === "failed") {
    throw new PowerChainError(
      PowerChainErrorCode.TransactionFailed,
      `Write failed:${submitted.signature}`,
    );
  }

  if (state !== "finalized") {
    throw new PowerChainError(
      PowerChainErrorCode.AmbiguousWrite,
      `Write requires reconciliation:${submitted.signature}`,
    );
  }

  return submitted;
}
