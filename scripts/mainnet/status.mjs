import fs from "node:fs";
import crypto from "node:crypto";
import {
  atomicWriteJsonSync,
} from "../lib/atomic-json.mjs";
import {
  deriveMainnetReleaseState,
} from "./release-state.mjs";

const config =
  JSON.parse(
    fs.readFileSync(
      "config/mainnet/bridge.json",
      "utf8",
    ),
  );

const staticBlockers = [];
const buildBlockers = [];
const evidenceBlockers = [];
const authorizationBlockers = [];

const requiredStatic = [
  "package.json",
  "config/token.json",
  "config/bridge.json",
  "config/mainnet/bridge.json",
  "contracts/wpwrc/Move.toml",
  "programs/pwrc-lock/src/lib.rs",
  "programs/token/src/lib.rs",
  "idl/abi.fingerprint.json",
];

for (const file of requiredStatic) {
  if (!fs.existsSync(file)) {
    staticBlockers.push(
      `missing:${file}`,
    );
  }
}

if (
  config.version !== "1.0.0"
) {
  staticBlockers.push(
    "mainnet.config.version",
  );
}

if (
  config.solana
    ?.canonicalMint !==
  "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc"
) {
  staticBlockers.push(
    "mainnet.canonicalMint",
  );
}

if (
  config.policy
    ?.canonicalDecimals !== 9 ||
  config.policy
    ?.wrappedDecimals !== 9 ||
  config.policy
    ?.baseUnitFactor !== "1"
) {
  staticBlockers.push(
    "mainnet.bridge-unit-policy",
  );
}

for (const file of [
  "pnpm-lock.yaml",
  "contracts/wpwrc/Move.lock",
  "target/deploy/pwrc_lock.so",
  "target/deploy/pwrc_token.so",
  "idl/generated/pwrc_lock.json",
  "idl/generated/pwrc_token.json",
  "idl/generated/wpwrc.modules.json",
]) {
  if (!fs.existsSync(file)) {
    buildBlockers.push(
      file,
    );
  }
}

const idlRelease =
  "idl/release/1.0.0.json";

if (!fs.existsSync(idlRelease)) {
  buildBlockers.push(
    "idl.releaseManifest",
  );
} else {
  const release =
    JSON.parse(
      fs.readFileSync(
        idlRelease,
        "utf8",
      ),
    );

  if (
    release.status !==
    "release-idl-ready"
  ) {
    buildBlockers.push(
      "idl.releaseManifest:not-ready",
    );
  }
}

const buildManifestVerification =
  "reports/mainnet-build-manifest-verification.json";

if (!fs.existsSync(buildManifestVerification)) {
  buildBlockers.push(
    "mainnet.build-manifest-verification",
  );
} else {
  const report =
    JSON.parse(
      fs.readFileSync(
        buildManifestVerification,
        "utf8",
      ),
    );

  if (!report.ok) {
    buildBlockers.push(
      "mainnet.build-manifest-verification:failed",
    );
  }
}

const provenance =
  "reports/release-provenance-verification.json";

if (!fs.existsSync(provenance)) {
  buildBlockers.push(
    "release.provenance-verification",
  );
} else {
  const report =
    JSON.parse(
      fs.readFileSync(
        provenance,
        "utf8",
      ),
    );

  if (!report.ok) {
    buildBlockers.push(
      "release.provenance-verification:failed",
    );
  }
}

const evidenceReport =
  "reports/mainnet-evidence-verification.json";

if (!fs.existsSync(evidenceReport)) {
  evidenceBlockers.push(
    "mainnet.deployment-evidence",
  );
} else {
  const report =
    JSON.parse(
      fs.readFileSync(
        evidenceReport,
        "utf8",
      ),
    );

  if (!report.ok) {
    evidenceBlockers.push(
      ...report.failures.map(
        (failure) =>
          failure.startsWith(
            "evidence:",
          )
            ? failure
            : `evidence:${failure}`,
      ),
    );
  }
}

const codeReady =
  staticBlockers.length === 0;

const buildReady =
  codeReady &&
  buildBlockers.length === 0;


const evidenceBindingsReport =
  "reports/mainnet-evidence-bindings-verification.json";

if (
  !fs.existsSync(
    evidenceBindingsReport,
  )
) {
  evidenceBlockers.push(
    "mainnet.evidence-bindings-verification",
  );
} else {
  const report =
    JSON.parse(
      fs.readFileSync(
        evidenceBindingsReport,
        "utf8",
      ),
    );

  if (!report.ok) {
    evidenceBlockers.push(
      ...report.failures.map(
        (failure) =>
          failure.startsWith(
            "evidence-bindings:",
          )
            ? failure
            : `evidence-bindings:${failure}`,
      ),
    );
  }
}

const deploymentEvidenceReady =
  evidenceBlockers.length === 0;

const authorizationReport =
  "reports/mainnet-release-authorization-verification.json";

if (
  !fs.existsSync(
    authorizationReport,
  )
) {
  authorizationBlockers.push(
    "mainnet.release-authorization",
  );
} else {
  const report =
    JSON.parse(
      fs.readFileSync(
        authorizationReport,
        "utf8",
      ),
    );

  if (!report.ok) {
    authorizationBlockers.push(
      ...report.failures.map(
        (failure) =>
          failure.startsWith(
            "authorization:",
          )
            ? failure
            : `authorization:${failure}`,
      ),
    );
  }
}


const authorizationUnusedReport =
  "reports/mainnet-release-authorization-unused.json";

if (
  !fs.existsSync(
    authorizationUnusedReport,
  )
) {
  authorizationBlockers.push(
    "mainnet.release-authorization-unused-check",
  );
} else {
  const report =
    JSON.parse(
      fs.readFileSync(
        authorizationUnusedReport,
        "utf8",
      ),
    );

  if (!report.ok) {
    authorizationBlockers.push(
      ...report.failures.map(
        (failure) =>
          failure.startsWith(
            "authorization-unused:",
          )
            ? failure
            : `authorization-unused:${failure}`,
      ),
    );
  }
}

const releaseAuthorized =
  authorizationBlockers.length ===
  0;

const readyForMainnet =
  buildReady &&
  deploymentEvidenceReady &&
  releaseAuthorized;

let authorizationConsumed =
  false;

const authorizationFile =
  "config/mainnet/release-authorization.json";

if (
  fs.existsSync(
    authorizationFile,
  )
) {
  try {
    const authorization =
      JSON.parse(
        fs.readFileSync(
          authorizationFile,
          "utf8",
        ),
      );

    const nonce =
      authorization.nonce;

    if (
      typeof nonce ===
        "string" &&
      /^[a-f0-9]{64}$/i.test(
        nonce,
      )
    ) {
      authorizationConsumed =
        fs.existsSync(
          `deployments/mainnet/authorizations/${nonce.toLowerCase()}.json`,
        );
    }
  } catch {
    authorizationConsumed =
      false;
  }
}

const releaseState =
  deriveMainnetReleaseState({
    codeReady,
    buildReady,
    deploymentEvidenceReady,
    releaseAuthorized,
    authorizationConsumed,
  });

const result = {
  ok: readyForMainnet,
  version: "1.0.0",
  codeReady,
  buildReady,
  deploymentEvidenceReady,
  releaseAuthorized,
  authorizationConsumed,
  releaseState,
  readyForMainnet,
  phases: {
    static: {
      ready: codeReady,
      blockers:
        staticBlockers,
    },
    build: {
      ready: buildReady,
      blockers:
        buildBlockers,
    },
    evidence: {
      ready:
        deploymentEvidenceReady,
      blockers:
        evidenceBlockers,
    },
    authorization: {
      ready:
        releaseAuthorized,
      blockers:
        authorizationBlockers,
    },
  },
  blockers: [
    ...staticBlockers,
    ...buildBlockers,
    ...evidenceBlockers,
    ...authorizationBlockers,
  ],
};

atomicWriteJsonSync(
  "reports/mainnet-status.json",
  result,
);

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);
