import fs from "node:fs";
import crypto from "node:crypto";

function sha256(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

const programs = {
  pwrcToken: {
    programId:
      "PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu",
    binary:
      "target/deploy/pwrc_token.so",
    deployLog:
      "deployments/devnet/solana/raw/pwrc-token-deploy.txt",
    showLog:
      "deployments/devnet/solana/raw/pwrc-token-show.txt",
  },
  pwrcLock: {
    programId:
      process.env["PWRC_LOCK_PROGRAM_ID_DEVNET"] ?? null,
    binary:
      "target/deploy/pwrc_lock.so",
    deployLog:
      "deployments/devnet/solana/raw/pwrc-lock-deploy.txt",
    showLog:
      "deployments/devnet/solana/raw/pwrc-lock-show.txt",
  },
};

for (const program of Object.values(programs)) {
  if (!program.programId) {
    throw new Error("PWRC_DEVNET_PROGRAM_ID_REQUIRED");
  }

  for (const file of [
    program.binary,
    program.deployLog,
    program.showLog,
  ]) {
    if (!fs.existsSync(file)) {
      throw new Error(`PWRC_DEVNET_TRACE_FILE_MISSING:${file}`);
    }
  }

  program.binarySha256 =
    sha256(program.binary);
  program.deployLogSha256 =
    sha256(program.deployLog);
  program.showLogSha256 =
    sha256(program.showLog);
}

const record = {
  version: "1.0.0",
  network: "devnet",
  rpc: process.env["PWRC_DEVNET_RPC_URL"] ?? null,
  recordedAt: new Date().toISOString(),
  programs,
  independentlyVerified: false,
  note:
    "CLI output is retained but finalized transaction/slot evidence must be added before using Devnet results as qualification evidence.",
};

fs.writeFileSync(
  "deployments/devnet/solana/evidence.json",
  `${JSON.stringify(record, null, 2)}\n`,
);

console.log(JSON.stringify(record, null, 2));
