import fs from "node:fs";
import crypto from "node:crypto";
import {
  canonicalJsonSha256,
} from "./lib.mjs";
import {
  atomicWriteJsonSync,
} from "../lib/atomic-json.mjs";

const destination =
  process.argv[2] ??
  "config/mainnet/release-authorization.json";

if (fs.existsSync(destination)) {
  throw new Error(
    `PWRC_RELEASE_AUTHORIZATION_EXISTS:${destination}`,
  );
}

for (const file of [
  "reports/mainnet-evidence-verification.json",
  "reports/release-provenance.json",
  "reports/mainnet-build-manifest.json",
]) {
  if (!fs.existsSync(file)) {
    throw new Error(
      `PWRC_RELEASE_AUTHORIZATION_INPUT_MISSING:${file}`,
    );
  }
}

const evidence =
  JSON.parse(
    fs.readFileSync(
      "reports/mainnet-evidence-verification.json",
      "utf8",
    ),
  );

if (evidence.ok !== true) {
  throw new Error(
    "PWRC_DEPLOYMENT_EVIDENCE_NOT_VERIFIED",
  );
}

const provenance =
  JSON.parse(
    fs.readFileSync(
      "reports/release-provenance.json",
      "utf8",
    ),
  );

const buildManifest =
  JSON.parse(
    fs.readFileSync(
      "reports/mainnet-build-manifest.json",
      "utf8",
    ),
  );

const issuedAt =
  new Date();

const expiresAt =
  new Date(
    issuedAt.getTime() +
      60 * 60 * 1000,
  );

const authorization = {
  version: "1.0.0",
  type:
    "powerchain-mainnet-release-authorization",
  network: {
    solana:
      "mainnet-beta",
    sui: "mainnet",
  },
  nonce:
    crypto
      .randomBytes(32)
      .toString("hex"),
  issuedAt:
    issuedAt.toISOString(),
  expiresAt:
    expiresAt.toISOString(),
  evidenceSha256:
    evidence.evidenceSha256,
  provenancePayloadSha256:
    provenance.payloadSha256,
  buildManifestSha256:
    canonicalJsonSha256(
      buildManifest,
    ),
  canonicalMint:
    "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
  signerPublicKeySpkiBase64:
    null,
  signedPayloadSha256:
    null,
  signatureBase64:
    null,
};

const payload =
  structuredClone(
    authorization,
  );

delete payload
  .signedPayloadSha256;
delete payload
  .signatureBase64;

authorization.signedPayloadSha256 =
  canonicalJsonSha256(payload);

atomicWriteJsonSync(
  destination,
  authorization,
);

console.log(
  JSON.stringify({
    ok: true,
    version: "1.0.0",
    authorizationFile:
      destination,
    nonce:
      authorization.nonce,
    expiresAt:
      authorization.expiresAt,
    signedPayloadSha256:
      authorization
        .signedPayloadSha256,
    note:
      "Sign the 32-byte signedPayloadSha256 digest with an approved Ed25519 release key. No private key is handled by this script.",
  }, null, 2),
);
