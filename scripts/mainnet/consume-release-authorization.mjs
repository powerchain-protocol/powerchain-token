import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const authorizationFile =
  process.argv[2] ??
  "config/mainnet/release-authorization.json";

if (!fs.existsSync(authorizationFile)) {
  throw new Error(
    `PWRC_RELEASE_AUTHORIZATION_MISSING:${authorizationFile}`,
  );
}

const verificationFile =
  "reports/mainnet-release-authorization-verification.json";

if (!fs.existsSync(verificationFile)) {
  throw new Error(
    "PWRC_RELEASE_AUTHORIZATION_NOT_VERIFIED",
  );
}

const verification =
  JSON.parse(
    fs.readFileSync(
      verificationFile,
      "utf8",
    ),
  );

if (verification.ok !== true) {
  throw new Error(
    "PWRC_RELEASE_AUTHORIZATION_NOT_VERIFIED",
  );
}


const preflightProofFile =
  "reports/mainnet-preflight-proof.json";

if (!fs.existsSync(preflightProofFile)) {
  throw new Error(
    "PWRC_MAINNET_PREFLIGHT_PROOF_REQUIRED",
  );
}

const preflightProof =
  JSON.parse(
    fs.readFileSync(
      preflightProofFile,
      "utf8",
    ),
  );

const preflightTime =
  Date.parse(
    preflightProof.generatedAt,
  );

if (
  preflightProof.version !==
    "1.0.0" ||
  preflightProof.readyForMainnet !==
    true ||
  preflightProof.releaseState !==
    "AUTHORIZED" ||
  !Number.isFinite(
    preflightTime,
  ) ||
  Date.now() -
      preflightTime >
    5 * 60 * 1000
) {
  throw new Error(
    "PWRC_MAINNET_PREFLIGHT_PROOF_STALE_OR_INVALID",
  );
}

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
  typeof nonce !==
    "string" ||
  !/^[a-f0-9]{64}$/i.test(
    nonce,
  )
) {
  throw new Error(
    "PWRC_RELEASE_AUTHORIZATION_NONCE_INVALID",
  );
}

if (
  preflightProof.authorizationNonce !==
    nonce
) {
  throw new Error(
    "PWRC_MAINNET_PREFLIGHT_PROOF_NONCE_MISMATCH",
  );
}

if (
  verification.nonce !==
    nonce
) {
  throw new Error(
    "PWRC_RELEASE_AUTHORIZATION_VERIFICATION_STALE",
  );
}

const directory =
  "deployments/mainnet/authorizations";

fs.mkdirSync(
  directory,
  {
    recursive: true,
  },
);

const destination =
  path.join(
    directory,
    `${nonce.toLowerCase()}.json`,
  );

let fd;

try {
  fd =
    fs.openSync(
      destination,
      "wx",
      0o600,
    );
} catch (error) {
  if (
    error &&
    typeof error === "object" &&
    error.code === "EEXIST"
  ) {
    throw new Error(
      "PWRC_RELEASE_AUTHORIZATION_ALREADY_CONSUMED",
    );
  }

  throw error;
}

try {
  const record = {
    version: "1.0.0",
    type:
      "powerchain-mainnet-release-authorization-consumption",
    nonce,
    authorizationSha256:
      verification
        .authorizationSha256,
    consumedAt:
      new Date()
        .toISOString(),
    processId:
      process.pid,
  };

  fs.writeFileSync(
    fd,
    `${JSON.stringify(
      record,
      null,
      2,
    )}\n`,
  );

  fs.fsyncSync(fd);
  fs.closeSync(fd);
  fd = undefined;

  try {
    const dirFd =
      fs.openSync(
        directory,
        "r",
      );

    fs.fsyncSync(dirFd);
    fs.closeSync(dirFd);
  } catch {
    // Some filesystems do not permit directory fsync.
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        version: "1.0.0",
        nonce,
        consumedFile:
          destination,
        authorizationSha256:
          verification
            .authorizationSha256,
      },
      null,
      2,
    ),
  );
} catch (error) {
  if (fd !== undefined) {
    try {
      fs.closeSync(fd);
    } catch {}
  }

  try {
    fs.unlinkSync(
      destination,
    );
  } catch {}

  throw error;
}
