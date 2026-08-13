import fs from "node:fs";
import {
  canonicalJsonSha256,
} from "./lib.mjs";
import {
  atomicWriteJsonSync,
} from "../lib/atomic-json.mjs";

const source =
  process.argv[2] ??
  "config/mainnet/release-authorization.json";

const destination =
  process.argv[3] ??
  "reports/mainnet-release-signing-payload.json";

if (!fs.existsSync(source)) {
  throw new Error(
    `PWRC_SIGNING_PAYLOAD_SOURCE_MISSING:${source}`,
  );
}

const authorization =
  JSON.parse(
    fs.readFileSync(
      source,
      "utf8",
    ),
  );

const payload =
  structuredClone(
    authorization,
  );

delete payload
  .signedPayloadSha256;
delete payload
  .signatureBase64;

const digest =
  canonicalJsonSha256(
    payload,
  );

if (
  authorization
    .signedPayloadSha256 &&
  authorization
    .signedPayloadSha256 !==
    digest
) {
  throw new Error(
    "PWRC_SIGNING_PAYLOAD_DIGEST_MISMATCH",
  );
}

const result = {
  version: "1.0.0",
  type:
    "powerchain-mainnet-release-signing-payload",
  source,
  algorithm:
    "Ed25519",
  digestAlgorithm:
    "SHA-256",
  digestEncoding:
    "hex",
  signedPayloadSha256:
    digest,
  payload,
  privateKeyIncluded:
    false,
};

atomicWriteJsonSync(
  destination,
  result,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      version: "1.0.0",
      destination,
      signedPayloadSha256:
        digest,
      privateKeyIncluded:
        false,
    },
    null,
    2,
  ),
);
