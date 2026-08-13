import crypto from "node:crypto";
import {
  assertSha256,
  canonicalJsonSha256,
} from "./lib.mjs";

export function verifyEd25519DigestSignature({
  payload,
  expectedPayloadSha256,
  publicKeySpkiBase64,
  signatureBase64,
  label,
}) {
  assertSha256(
    expectedPayloadSha256,
    `${label}.signedPayloadSha256`,
  );

  const actualPayloadSha256 =
    canonicalJsonSha256(payload);

  if (
    actualPayloadSha256 !==
    expectedPayloadSha256
  ) {
    throw new Error(
      `${label}:signed-payload-hash-mismatch`,
    );
  }

  if (
    typeof publicKeySpkiBase64 !==
      "string" ||
    !publicKeySpkiBase64.trim() ||
    typeof signatureBase64 !==
      "string" ||
    !signatureBase64.trim()
  ) {
    throw new Error(
      `${label}:cryptographic-signature-required`,
    );
  }

  let key;
  let signature;

  try {
    key =
      crypto.createPublicKey({
        key:
          Buffer.from(
            publicKeySpkiBase64,
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
      `${label}:signature-encoding-invalid`,
    );
  }

  if (
    key.asymmetricKeyType !==
      "ed25519"
  ) {
    throw new Error(
      `${label}:signer-key-must-be-ed25519`,
    );
  }

  if (
    signature.length !== 64
  ) {
    throw new Error(
      `${label}:ed25519-signature-length`,
    );
  }

  if (
    !crypto.verify(
      null,
      Buffer.from(
        actualPayloadSha256,
        "hex",
      ),
      key,
      signature,
    )
  ) {
    throw new Error(
      `${label}:signature-verification-failed`,
    );
  }

  return actualPayloadSha256;
}
