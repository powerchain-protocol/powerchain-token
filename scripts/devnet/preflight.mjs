import fs from "node:fs";
import { spawnSync } from "node:child_process";

const failures = [];

for (const file of [
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
]) {
  const result = spawnSync(command[0], command[1], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    failures.push(`tool:${command[0]}`);
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  network: "devnet",
  failures,
}, null, 2));

if (failures.length) process.exit(2);
