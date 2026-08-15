export function bridgeExecutionPolicy() {
  return {
    version:
      "1.0.0",
    publicWrites:
      false,
    blindRetry:
      false,
    steps: [
      {
        index: 0,
        kind:
          "SOURCE_PREPARE",
        monetaryWrite:
          false,
        idempotent:
          true,
      },
      {
        index: 1,
        kind:
          "SOURCE_SUBMIT",
        monetaryWrite:
          true,
        idempotent:
          false,
      },
      {
        index: 2,
        kind:
          "SOURCE_FINALITY",
        monetaryWrite:
          false,
        idempotent:
          true,
      },
      {
        index: 3,
        kind:
          "DESTINATION_PREPARE",
        monetaryWrite:
          false,
        idempotent:
          true,
      },
      {
        index: 4,
        kind:
          "DESTINATION_SUBMIT",
        monetaryWrite:
          true,
        idempotent:
          false,
      },
      {
        index: 5,
        kind:
          "DESTINATION_FINALITY",
        monetaryWrite:
          false,
        idempotent:
          true,
      },
      {
        index: 6,
        kind:
          "RECONCILE",
        monetaryWrite:
          false,
        idempotent:
          true,
      },
    ],
    retryPolicy: {
      monetaryWrites:
        "never-blind",
      readOnly:
        "safe-read-only",
    },
  };
}
