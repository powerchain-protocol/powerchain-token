export interface RetryDecision {
  retry: boolean;
  deadLetter: boolean;
  nextAttempt: number;
}

export function decideRelayerRetry(input: {
  currentAttempt: number;
  maxAttempts?: number;
  writeMayHaveLanded: boolean;
  idempotencyConfirmed: boolean;
}): RetryDecision {
  const maxAttempts = input.maxAttempts ?? 3;

  if (
    !Number.isInteger(input.currentAttempt) ||
    input.currentAttempt < 0
  ) {
    throw new Error("PWRC_RELAYER_ATTEMPT_INVALID");
  }

  const nextAttempt = input.currentAttempt + 1;

  if (
    input.writeMayHaveLanded &&
    !input.idempotencyConfirmed
  ) {
    return {
      retry: false,
      deadLetter: false,
      nextAttempt,
    };
  }

  if (nextAttempt > maxAttempts) {
    return {
      retry: false,
      deadLetter: true,
      nextAttempt,
    };
  }

  return {
    retry: true,
    deadLetter: false,
    nextAttempt,
  };
}
