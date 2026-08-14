import fs from "node:fs";

function safeJsonFile(
  file,
  fallback,
) {
  if (!fs.existsSync(file)) {
    return fallback;
  }

  try {
    return JSON.parse(
      fs.readFileSync(
        file,
        "utf8",
      ),
    );
  } catch {
    return fallback;
  }
}

export function mainnetStatus() {
  const status =
    safeJsonFile(
      "reports/mainnet-status.json",
      {
        ok: true,
        version: "1.0.0",
        codeReady: true,
        buildReady: false,
        buildManifestVerified: false,
        deploymentEvidenceReady: false,
        releaseAuthorized: false,
        authorizationConsumed: false,
        releaseState: "SOURCE_READY",
        readyForMainnet: false,
      },
    );

  return {
    version: "1.0.0",
    codeReady:
      status.codeReady === true,
    buildReady:
      status.buildReady === true,
    buildManifestVerified:
      status.buildManifestVerified === true,
    deploymentEvidenceReady:
      status.deploymentEvidenceReady === true,
    releaseAuthorized:
      status.releaseAuthorized === true,
    authorizationConsumed:
      status.authorizationConsumed === true,
    releaseState:
      typeof status.releaseState === "string"
        ? status.releaseState
        : "SOURCE_READY",
    readyForMainnet:
      status.readyForMainnet === true,
  };
}

export function devnetStatus() {
  const status =
    safeJsonFile(
      "reports/devnet-status.json",
      {
        ok: true,
        version: "1.0.0",
        buildArtifactsReady: false,
        deploymentEvidenceVerified: false,
        qualified: false,
      },
    );

  return {
    version: "1.0.0",
    buildArtifactsReady:
      status.buildArtifactsReady === true,
    deploymentEvidenceVerified:
      status.deploymentEvidenceVerified === true,
    qualified:
      status.qualified === true,
  };
}

export function readinessState({
  cdpConfigured,
} = {}) {
  const release =
    mainnetStatus();

  return {
    ok: true,
    ready: true,
    version: "1.0.0",
    runtime: {
      api: true,
      cdpSqlConfigured:
        cdpConfigured === true,
    },
    release: {
      releaseState:
        release.releaseState,
      readyForMainnet:
        release.readyForMainnet,
    },
  };
}
