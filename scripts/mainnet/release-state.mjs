export const MAINNET_RELEASE_STATES = [
  "SOURCE_READY",
  "BUILD_READY",
  "EVIDENCE_READY",
  "AUTHORIZED",
  "CONSUMED",
];

export function deriveMainnetReleaseState({
  codeReady,
  buildReady,
  deploymentEvidenceReady,
  releaseAuthorized,
  authorizationConsumed,
}) {
  if (!codeReady) {
    return "SOURCE_READY";
  }

  if (!buildReady) {
    return "SOURCE_READY";
  }

  if (!deploymentEvidenceReady) {
    return "BUILD_READY";
  }

  if (!releaseAuthorized) {
    return "EVIDENCE_READY";
  }

  if (!authorizationConsumed) {
    return "AUTHORIZED";
  }

  return "CONSUMED";
}

export function assertMainnetStateTransition(
  from,
  to,
) {
  const allowed = new Map([
    [
      "SOURCE_READY",
      new Set([
        "SOURCE_READY",
        "BUILD_READY",
      ]),
    ],
    [
      "BUILD_READY",
      new Set([
        "BUILD_READY",
        "EVIDENCE_READY",
      ]),
    ],
    [
      "EVIDENCE_READY",
      new Set([
        "EVIDENCE_READY",
        "AUTHORIZED",
      ]),
    ],
    [
      "AUTHORIZED",
      new Set([
        "AUTHORIZED",
        "CONSUMED",
      ]),
    ],
    [
      "CONSUMED",
      new Set([
        "CONSUMED",
      ]),
    ],
  ]);

  if (
    !allowed
      .get(from)
      ?.has(to)
  ) {
    throw new Error(
      `PWRC_MAINNET_RELEASE_STATE_TRANSITION_INVALID:${from}->${to}`,
    );
  }
}
