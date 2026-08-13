import fs from "node:fs";
import {
  assertSha256,
  canonicalJsonSha256,
} from "./lib.mjs";
import {
  verifyEd25519DigestSignature,
} from "./signature.mjs";
import {
  atomicWriteJsonSync,
} from "../lib/atomic-json.mjs";

const file =
  process.argv[2] ??
  "config/mainnet/release-authorization.json";

const failures = [];
let authorization = null;

if (!fs.existsSync(file)) {
  failures.push(
    `authorization:missing:${file}`,
  );
} else {
  try {
    authorization =
      JSON.parse(
        fs.readFileSync(
          file,
          "utf8",
        ),
      );
  } catch {
    failures.push(
      "authorization:invalid-json",
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
        : "authorization:validation",
    );
  }
}

if (authorization) {
  if (
    authorization.version !==
      "1.0.0" ||
    authorization.type !==
      "powerchain-mainnet-release-authorization"
  ) {
    failures.push(
      "authorization:identity",
    );
  }

  if (
    authorization.network?.solana !==
      "mainnet-beta" ||
    authorization.network?.sui !==
      "mainnet"
  ) {
    failures.push(
      "authorization:network",
    );
  }

  if (
    authorization.canonicalMint !==
    "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc"
  ) {
    failures.push(
      "authorization:canonical-mint",
    );
  }

  if (
    typeof authorization.nonce !==
      "string" ||
    !/^[a-f0-9]{64}$/i.test(
      authorization.nonce,
    )
  ) {
    failures.push(
      "authorization:nonce",
    );
  }

  const issuedAt =
    Date.parse(
      authorization.issuedAt,
    );
  const expiresAt =
    Date.parse(
      authorization.expiresAt,
    );
  const now = Date.now();
  const maxClockSkewMs =
    5 * 60 * 1000;

  if (
    !Number.isFinite(issuedAt) ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= issuedAt
  ) {
    failures.push(
      "authorization:time-window-invalid",
    );
  } else {
    const lifetimeMs =
      expiresAt - issuedAt;

    if (
      lifetimeMs >
      24 * 60 * 60 * 1000
    ) {
      failures.push(
        "authorization:lifetime-exceeds-24h",
      );
    }

    if (
      now + maxClockSkewMs <
      issuedAt
    ) {
      failures.push(
        "authorization:not-yet-valid",
      );
    }

    if (
      now - maxClockSkewMs >=
      expiresAt
    ) {
      failures.push(
        "authorization:expired",
      );
    }
  }

  for (const [label, value] of [
    [
      "authorization.evidenceSha256",
      authorization.evidenceSha256,
    ],
    [
      "authorization.provenancePayloadSha256",
      authorization.provenancePayloadSha256,
    ],
    [
      "authorization.buildManifestSha256",
      authorization.buildManifestSha256,
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

  if (
    fs.existsSync(
      "reports/mainnet-evidence-verification.json",
    )
  ) {
    const evidence =
      JSON.parse(
        fs.readFileSync(
          "reports/mainnet-evidence-verification.json",
          "utf8",
        ),
      );

    if (
      evidence.ok !== true ||
      evidence.evidenceSha256 !==
        authorization.evidenceSha256
    ) {
      failures.push(
        "authorization:evidence-binding",
      );
    }
  } else {
    failures.push(
      "authorization:evidence-verification-missing",
    );
  }

  if (
    fs.existsSync(
      "reports/release-provenance.json",
    )
  ) {
    const provenance =
      JSON.parse(
        fs.readFileSync(
          "reports/release-provenance.json",
          "utf8",
        ),
      );

    if (
      provenance.payloadSha256 !==
      authorization.provenancePayloadSha256
    ) {
      failures.push(
        "authorization:provenance-binding",
      );
    }
  } else {
    failures.push(
      "authorization:provenance-missing",
    );
  }

  if (
    fs.existsSync(
      "reports/mainnet-build-manifest.json",
    )
  ) {
    const buildSha256 =
      canonicalJsonSha256(
        JSON.parse(
          fs.readFileSync(
            "reports/mainnet-build-manifest.json",
            "utf8",
          ),
        ),
      );

    if (
      buildSha256 !==
      authorization.buildManifestSha256
    ) {
      failures.push(
        "authorization:build-manifest-binding",
      );
    }
  } else {
    failures.push(
      "authorization:build-manifest-missing",
    );
  }

  const payload =
    structuredClone(
      authorization,
    );

  delete payload
    .signedPayloadSha256;
  delete payload
    .signatureBase64;

  check(
    () =>
      verifyEd25519DigestSignature({
        payload,
        expectedPayloadSha256:
          authorization.signedPayloadSha256,
        publicKeySpkiBase64:
          authorization.signerPublicKeySpkiBase64,
        signatureBase64:
          authorization.signatureBase64,
        label:
          "authorization",
      }),
  );
}

const result = {
  ok:
    failures.length === 0,
  version: "1.0.0",
  authorizationFile:
    file,
  authorizationSha256:
    authorization
      ? canonicalJsonSha256(
          authorization,
        )
      : null,
  nonce:
    authorization?.nonce ??
    null,
  expiresAt:
    authorization?.expiresAt ??
    null,
  failures,
};

atomicWriteJsonSync(
  "reports/mainnet-release-authorization-verification.json",
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
