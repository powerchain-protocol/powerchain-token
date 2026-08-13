import fs from "node:fs";
import crypto from "node:crypto";
import {
  atomicWriteJsonSync,
} from "../lib/atomic-json.mjs";

const statusFile =
  "reports/mainnet-status.json";

if (!fs.existsSync(statusFile)) {
  throw new Error(
    "PWRC_MAINNET_STATUS_REQUIRED",
  );
}

const status =
  JSON.parse(
    fs.readFileSync(
      statusFile,
      "utf8",
    ),
  );

if (
  status.readyForMainnet !==
    true
) {
  throw new Error(
    "PWRC_MAINNET_PREFLIGHT_NOT_READY",
  );
}

const authorizationFile =
  "config/mainnet/release-authorization.json";

if (!fs.existsSync(authorizationFile)) {
  throw new Error(
    "PWRC_MAINNET_AUTHORIZATION_REQUIRED",
  );
}

const authorization =
  JSON.parse(
    fs.readFileSync(
      authorizationFile,
      "utf8",
    ),
  );

const proof = {
  version: "1.0.0",
  type:
    "powerchain-mainnet-preflight-proof",
  readyForMainnet: true,
  releaseState:
    status.releaseState,
  authorizationNonce:
    authorization.nonce,
  authorizationSha256:
    crypto
      .createHash("sha256")
      .update(
        fs.readFileSync(
          authorizationFile,
        ),
      )
      .digest("hex"),
  generatedAt:
    new Date()
      .toISOString(),
};

atomicWriteJsonSync(
  "reports/mainnet-preflight-proof.json",
  proof,
);

console.log(
  JSON.stringify(
    proof,
    null,
    2,
  ),
);
