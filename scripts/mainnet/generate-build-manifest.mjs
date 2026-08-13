import fs from "node:fs";
import crypto from "node:crypto";
import {
  atomicWriteJsonSync,
} from "../lib/atomic-json.mjs";

const required = {
  pnpmLock:
    "pnpm-lock.yaml",
  moveLock:
    "contracts/wpwrc/Move.lock",
  pwrcLockBinary:
    "target/deploy/pwrc_lock.so",
  pwrcTokenBinary:
    "target/deploy/pwrc_token.so",
  pwrcLockIdl:
    "idl/generated/pwrc_lock.json",
  pwrcTokenIdl:
    "idl/generated/pwrc_token.json",
  suiNormalizedModules:
    "idl/generated/wpwrc.modules.json",
  abiFingerprint:
    "idl/abi.fingerprint.json",
  idlReleaseManifest:
    "idl/release/1.0.0.json",
};

const missing =
  Object.values(required)
    .filter(
      (file) =>
        !fs.existsSync(file),
    );

if (missing.length) {
  console.error(
    JSON.stringify({
      ok: false,
      version: "1.0.0",
      error:
        "PWRC_BUILD_MANIFEST_INPUTS_MISSING",
      missing,
    }, null, 2),
  );
  process.exit(2);
}

function sha256(file) {
  return crypto
    .createHash("sha256")
    .update(
      fs.readFileSync(file),
    )
    .digest("hex");
}

const files =
  Object.fromEntries(
    Object.entries(required)
      .map(
        ([key, file]) => [
          key,
          {
            path: file,
            sha256:
              sha256(file),
            bytes:
              fs.statSync(file)
                .size,
          },
        ],
      ),
  );

const payload = {
  version: "1.0.0",
  type:
    "powerchain-mainnet-build-manifest",
  files,
};

const payloadSha256 =
  crypto
    .createHash("sha256")
    .update(
      JSON.stringify(payload),
    )
    .digest("hex");

const manifest = {
  ...payload,
  payloadSha256,
};

atomicWriteJsonSync(
  "reports/mainnet-build-manifest.json",
  manifest,
);

console.log(
  JSON.stringify(
    manifest,
    null,
    2,
  ),
);
