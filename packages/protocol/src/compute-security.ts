export interface ComputeAdmissionPolicy {
  maxRequestsPerWindow:
    number;
  maxConcurrentJobs:
    number;
  maxPayloadBytes:
    number;
  maxWorkUnits:
    bigint;
  rejectDuplicateRequests:
    boolean;
}

export interface ComputeAdmissionInput {
  requestsInWindow:
    number;
  concurrentJobs:
    number;
  payloadBytes:
    number;
  requestedWorkUnits:
    bigint;
  duplicateRequest:
    boolean;
}

export interface ComputeAdmissionDecision {
  version:
    "1.0.0";
  allowed:
    boolean;
  reasons:
    readonly string[];
}

function assertSafeNonNegative(
  value:
    number,
  code:
    string,
): void {
  if (
    !Number.isSafeInteger(
      value,
    ) ||
    value <
      0
  ) {
    throw new Error(
      code,
    );
  }
}


function assertSafePositive(
  value:
    number,
  code:
    string,
): void {
  if (
    !Number.isSafeInteger(
      value,
    ) ||
    value <=
      0
  ) {
    throw new Error(
      code,
    );
  }
}

export function evaluateComputeAdmission(
  policy:
    ComputeAdmissionPolicy,
  input:
    ComputeAdmissionInput,
): ComputeAdmissionDecision {
  assertSafePositive(
    policy.maxRequestsPerWindow,
    "PWRC_COMPUTE_POLICY_REQUEST_LIMIT_INVALID",
  );
  assertSafePositive(
    policy.maxConcurrentJobs,
    "PWRC_COMPUTE_POLICY_CONCURRENCY_INVALID",
  );
  assertSafePositive(
    policy.maxPayloadBytes,
    "PWRC_COMPUTE_POLICY_PAYLOAD_INVALID",
  );
  assertSafeNonNegative(
    input.requestsInWindow,
    "PWRC_COMPUTE_REQUEST_COUNT_INVALID",
  );
  assertSafeNonNegative(
    input.concurrentJobs,
    "PWRC_COMPUTE_CONCURRENCY_INVALID",
  );
  assertSafeNonNegative(
    input.payloadBytes,
    "PWRC_COMPUTE_PAYLOAD_INVALID",
  );

  if (
    policy.maxWorkUnits <=
      0n ||
    input.requestedWorkUnits <=
      0n
  ) {
    throw new Error(
      "PWRC_COMPUTE_WORK_UNITS_INVALID",
    );
  }

  const reasons:
    string[] =
    [];

  if (
    input.requestsInWindow >=
      policy.maxRequestsPerWindow
  ) {
    reasons.push(
      "PWRC_COMPUTE_RATE_LIMITED",
    );
  }

  if (
    input.concurrentJobs >=
      policy.maxConcurrentJobs
  ) {
    reasons.push(
      "PWRC_COMPUTE_CONCURRENCY_LIMITED",
    );
  }

  if (
    input.payloadBytes >
      policy.maxPayloadBytes
  ) {
    reasons.push(
      "PWRC_COMPUTE_PAYLOAD_TOO_LARGE",
    );
  }

  if (
    input.requestedWorkUnits >
      policy.maxWorkUnits
  ) {
    reasons.push(
      "PWRC_COMPUTE_BUDGET_EXCEEDED",
    );
  }

  if (
    policy.rejectDuplicateRequests &&
    input.duplicateRequest
  ) {
    reasons.push(
      "PWRC_COMPUTE_DUPLICATE_REQUEST",
    );
  }

  return {
    version:
      "1.0.0",
    allowed:
      reasons.length ===
      0,
    reasons,
  };
}
