import fs from "node:fs";
import crypto from "node:crypto";
import {
  assertHttpsUrl,
  assertSha256,
  assertSolanaPublicKey,
  assertSuiObjectId,
  canonicalJsonSha256,
} from "./lib.mjs";
import {
  atomicWriteJsonSync,
} from "../lib/atomic-json.mjs";

const file =
  process.argv[2] ??
  "config/mainnet/evidence.json";

const failures = [];

if (!fs.existsSync(file)) {
  failures.push(
    `evidence:missing:${file}`,
  );
}

let evidence = null;

if (!failures.length) {
  try {
    evidence =
      JSON.parse(
        fs.readFileSync(
          file,
          "utf8",
        ),
      );
  } catch {
    failures.push(
      "evidence:invalid-json",
    );
  }
}

function check(fn) {
  try {
    fn();
  } catch (error) {
    failures.push(
      error instanceof Error
        ? error.message
        : "evidence:validation",
    );
  }
}

function signedPayload(
  value,
) {
  const clone =
    structuredClone(value);

  if (clone.release) {
    delete clone.release
      .signedPayloadSha256;
    delete clone.release
      .evidenceSignatureBase64;
  }

  return clone;
}

function verifyEvidenceSignature(
  value,
) {
  const publicKeyBase64 =
    value.release
      ?.evidenceSignerPublicKeySpkiBase64;

  const signatureBase64 =
    value.release
      ?.evidenceSignatureBase64;

  const expectedPayloadSha256 =
    value.release
      ?.signedPayloadSha256;

  if (
    typeof publicKeyBase64 !==
      "string" ||
    typeof signatureBase64 !==
      "string" ||
    typeof expectedPayloadSha256 !==
      "string"
  ) {
    throw new Error(
      "release:cryptographic-signature-required",
    );
  }

  assertSha256(
    expectedPayloadSha256,
    "release.signedPayloadSha256",
  );

  const payloadHash =
    canonicalJsonSha256(
      signedPayload(value),
    );

  if (
    payloadHash !==
      expectedPayloadSha256
  ) {
    throw new Error(
      "release:signed-payload-hash-mismatch",
    );
  }

  let key;
  let signature;

  try {
    key =
      crypto.createPublicKey({
        key:
          Buffer.from(
            publicKeyBase64,
            "base64",
          ),
        format: "der",
        type: "spki",
      });

    signature =
      Buffer.from(
        signatureBase64,
        "base64",
      );
  } catch {
    throw new Error(
      "release:signature-encoding-invalid",
    );
  }

  if (
    key.asymmetricKeyType !==
      "ed25519"
  ) {
    throw new Error(
      "release:signer-key-must-be-ed25519",
    );
  }

  if (
    signature.length !== 64
  ) {
    throw new Error(
      "release:ed25519-signature-length",
    );
  }

  const verified =
    crypto.verify(
      null,
      Buffer.from(
        payloadHash,
        "hex",
      ),
      key,
      signature,
    );

  if (!verified) {
    throw new Error(
      "release:signature-verification-failed",
    );
  }
}

if (evidence) {
  if (
    evidence.version !==
      "1.0.0" ||
    evidence.environment !==
      "mainnet"
  ) {
    failures.push(
      "evidence:version-or-environment",
    );
  }

  check(
    () =>
      assertHttpsUrl(
        evidence.solana?.rpcUrl,
        "solana.rpcUrl",
      ),
  );

  for (const [label, value] of [
    [
      "solana.canonicalMint",
      evidence.solana
        ?.canonicalMint,
    ],
    [
      "solana.bridgeProgramId",
      evidence.solana
        ?.bridgeProgramId,
    ],
    [
      "solana.bridgeVault",
      evidence.solana
        ?.bridgeVault,
    ],
    [
      "solana.tokenVerifierProgramId",
      evidence.solana
        ?.tokenVerifierProgramId,
    ],
  ]) {
    check(
      () =>
        assertSolanaPublicKey(
          value,
          label,
        ),
    );
  }

  if (
    evidence.solana
      ?.canonicalMint !==
    "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc"
  ) {
    failures.push(
      "solana.canonicalMint:mismatch",
    );
  }

  for (const [label, value] of [
    [
      "sui.packageId",
      evidence.sui?.packageId,
    ],
    [
      "sui.currencyObjectId",
      evidence.sui
        ?.currencyObjectId,
    ],
    [
      "sui.bridgeControllerId",
      evidence.sui
        ?.bridgeControllerId,
    ],
    [
      "sui.bridgeAuthority",
      evidence.sui
        ?.bridgeAuthority,
    ],
  ]) {
    check(
      () =>
        assertSuiObjectId(
          value,
          label,
        ),
    );
  }

  if (
    typeof evidence.sui
      ?.coinType !==
      "string" ||
    !evidence.sui.coinType
      .startsWith(
        `${evidence.sui.packageId}::`,
      )
  ) {
    failures.push(
      "sui.coinType:package-prefix-mismatch",
    );
  }

  check(
    () =>
      assertHttpsUrl(
        evidence.sui?.rpcUrl,
        "sui.rpcUrl",
      ),
  );

  for (const [label, value] of [
    [
      "sui.moveLockSha256",
      evidence.sui
        ?.moveLockSha256,
    ],
    [
      "release.sourceTreeSha256",
      evidence.release
        ?.sourceTreeSha256,
    ],
    [
      "release.provenancePayloadSha256",
      evidence.release
        ?.provenancePayloadSha256,
    ],
    [
      "release.abiCombinedSha256",
      evidence.release
        ?.abiCombinedSha256,
    ],
    [
      "release.generatedPwrcLockIdlSha256",
      evidence.release
        ?.generatedPwrcLockIdlSha256,
    ],
    [
      "release.generatedPwrcTokenIdlSha256",
      evidence.release
        ?.generatedPwrcTokenIdlSha256,
    ],
    [
      "release.suiNormalizedModulesSha256",
      evidence.release
        ?.suiNormalizedModulesSha256,
    ],
    [
      "release.pnpmLockSha256",
      evidence.release
        ?.pnpmLockSha256,
    ],
    [
      "release.buildManifestSha256",
      evidence.release
        ?.buildManifestSha256,
    ],
  ]) {
    check(
      () =>
        assertSha256(
          value,
          label,
        ),
    );
  }

  const booleans = {
    "solana.mintState.verified":
      evidence.solana
        ?.mintState?.verified,
    "solana.mintState.mintAuthorityRevoked":
      evidence.solana
        ?.mintState
        ?.mintAuthorityRevoked,
    "solana.mintState.freezeAuthorityNull":
      evidence.solana
        ?.mintState
        ?.freezeAuthorityNull,
    "solana.mintState.transferFeeConfigVerified":
      evidence.solana
        ?.mintState
        ?.transferFeeConfigVerified,
    "solana.program.verified":
      evidence.solana
        ?.program?.verified,
    "solana.program.executable":
      evidence.solana
        ?.program?.executable,
    "solana.vault.verified":
      evidence.solana
        ?.vault?.verified,
    "sui.packageVerified":
      evidence.sui
        ?.packageVerified,
    "sui.currencyVerified":
      evidence.sui
        ?.currencyVerified,
    "sui.controllerVerified":
      evidence.sui
        ?.controllerVerified,
    "sui.bridgeAuthorityVerified":
      evidence.sui
        ?.bridgeAuthorityVerified,
    "governance.operatorGovernorSeparated":
      evidence.governance
        ?.operatorGovernorSeparated,
    "governance.custodyPolicyReviewed":
      evidence.governance
        ?.custodyPolicyReviewed,
  };

  for (
    const [label, value]
    of Object.entries(
      booleans,
    )
  ) {
    if (value !== true) {
      failures.push(label);
    }
  }

  if (
    evidence.solana
      ?.mintState
      ?.transferFeeBasisPoints !==
      250
  ) {
    failures.push(
      "solana.transferFeeBasisPoints",
    );
  }

  if (
    evidence.solana
      ?.mintState
      ?.maximumTransferFeeTokens !==
      "1000000"
  ) {
    failures.push(
      "solana.maximumTransferFeeTokens",
    );
  }

  if (
    evidence.sui
      ?.genesisWrappedSupplyBaseUnits !==
      "0"
  ) {
    failures.push(
      "sui.genesisWrappedSupplyBaseUnits",
    );
  }

  if (
    evidence.governance
      ?.operator &&
    evidence.governance
      ?.governor &&
    evidence.governance.operator ===
      evidence.governance.governor
  ) {
    failures.push(
      "governance.roles-must-be-distinct",
    );
  }


  const observations =
    evidence.observations;

  if (!observations) {
    failures.push(
      "observations:required",
    );
  } else {
    const observedAt =
      Date.parse(
        observations.observedAt,
      );

    const maxAgeSeconds =
      observations
        .maxObservationAgeSeconds;

    if (
      !Number.isFinite(observedAt) ||
      !Number.isInteger(
        maxAgeSeconds,
      ) ||
      maxAgeSeconds < 60 ||
      maxAgeSeconds > 86_400 ||
      Date.now() - observedAt >
        maxAgeSeconds * 1000 ||
      observedAt > Date.now()
    ) {
      failures.push(
        "observations:freshness",
      );
    }

    for (const [chain, observation] of [
      [
        "solana",
        observations.solana,
      ],
      [
        "sui",
        observations.sui,
      ],
    ]) {
      if (!observation) {
        failures.push(
          `observations:${chain}:required`,
        );
        continue;
      }

      check(
        () =>
          assertHttpsUrl(
            observation
              .primaryRpcUrl,
            `observations.${chain}.primaryRpcUrl`,
          ),
      );

      check(
        () =>
          assertHttpsUrl(
            observation
              .secondaryRpcUrl,
            `observations.${chain}.secondaryRpcUrl`,
          ),
      );

      try {
        const primaryHost =
          new URL(
            observation
              .primaryRpcUrl,
          ).hostname
            .toLowerCase();

        const secondaryHost =
          new URL(
            observation
              .secondaryRpcUrl,
          ).hostname
            .toLowerCase();

        if (
          primaryHost ===
          secondaryHost
        ) {
          failures.push(
            `observations:${chain}:independent-rpc-hosts-required`,
          );
        }
      } catch {
        // URL validation above records the failure.
      }

      for (const [
        name,
        value,
      ] of [
        [
          "primaryStateSha256",
          observation
            .primaryStateSha256,
        ],
        [
          "secondaryStateSha256",
          observation
            .secondaryStateSha256,
        ],
      ]) {
        check(
          () =>
            assertSha256(
              value,
              `observations.${chain}.${name}`,
            ),
        );
      }

      if (
        observation
          .stateAgreement !==
        true
      ) {
        failures.push(
          `observations:${chain}:state-agreement`,
        );
      }
    }

    const solana =
      observations.solana;

    if (solana) {
      const primary =
        solana.primaryFinalizedSlot;
      const secondary =
        solana.secondaryFinalizedSlot;
      const maxDrift =
        solana.maxSlotDrift;

      if (
        !Number.isSafeInteger(
          primary,
        ) ||
        !Number.isSafeInteger(
          secondary,
        ) ||
        !Number.isSafeInteger(
          maxDrift,
        ) ||
        maxDrift < 0 ||
        Math.abs(
          primary -
          secondary,
        ) > maxDrift
      ) {
        failures.push(
          "observations:solana:slot-drift",
        );
      }
    }

    const sui =
      observations.sui;

    if (sui) {
      const primary =
        sui.primaryCheckpoint;
      const secondary =
        sui.secondaryCheckpoint;
      const maxDrift =
        sui.maxCheckpointDrift;

      if (
        !Number.isSafeInteger(
          primary,
        ) ||
        !Number.isSafeInteger(
          secondary,
        ) ||
        !Number.isSafeInteger(
          maxDrift,
        ) ||
        maxDrift < 0 ||
        Math.abs(
          primary -
          secondary,
        ) > maxDrift
      ) {
        failures.push(
          "observations:sui:checkpoint-drift",
        );
      }
    }
  }

  check(
    () =>
      verifyEvidenceSignature(
        evidence,
      ),
  );
}

const result = {
  ok:
    failures.length === 0,
  version: "1.0.0",
  evidenceFile: file,
  cryptographicSignature:
    evidence
      ? "ed25519"
      : null,
  evidenceSha256:
    evidence
      ? canonicalJsonSha256(
          evidence,
        )
      : null,
  failures,
};

atomicWriteJsonSync(
  "reports/mainnet-evidence-verification.json",
  result,
);

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(2);
}
