import fs from "node:fs";
import { spawnSync } from "node:child_process";

const failures = [];

for (const file of [
  "pnpm-lock.yaml",
  "Cargo.lock",
  "contracts/wpwrc/Move.lock",
  "target/deploy/pwrc_lock.so",
  "target/deploy/pwrc_token.so",
]) {
  if (!fs.existsSync(file)) {
    failures.push(`missing:${file}`);
  }
}

for (const command of [
  ["solana", ["--version"]],
  ["solana-keygen", ["--version"]],
  ["anchor", ["--version"]],
]) {
  const result = spawnSync(
    command[0],
    command[1],
    { encoding: "utf8" },
  );

  if (result.status !== 0) {
    failures.push(`tool:${command[0]}`);
  }
}

const env = process.env;

for (const name of [
  "PWRC_MAINNET_RPC_URL",
  "PWRC_MAINNET_DEPLOYER_KEYPAIR",
  "PWRC_TOKEN_PROGRAM_KEYPAIR",
  "PWRC_LOCK_PROGRAM_KEYPAIR",
  "PWRC_TOKEN_PROGRAM_ID_MAINNET",
  "PWRC_LOCK_PROGRAM_ID_MAINNET",
]) {
  if (!env[name]?.trim()) {
    failures.push(`env:${name}`);
  }
}

if (
  env["PWRC_TOKEN_PROGRAM_ID_MAINNET"] &&
  env["PWRC_TOKEN_PROGRAM_ID_MAINNET"] !==
    "PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu"
) {
  failures.push("pwrc-token-mainnet-id:mismatch-source-identity");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  network: "mainnet-beta",
  failures,
}, null, 2));

if (failures.length) process.exit(2);
