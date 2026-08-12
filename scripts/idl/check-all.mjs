import { spawnSync } from "node:child_process";

const checks = [
  ["node", "scripts/idl/source-drift.mjs"],
  ["node", "scripts/idl/compatibility.mjs"],
  ["node", "scripts/idl/fingerprint.mjs"],
  ["node", "scripts/idl/check.mjs"],
  ["node", "scripts/idl/hash.mjs"],
];

const failures = [];

for (const command of checks) {
  const result = spawnSync(
    command[0],
    command.slice(1),
    {
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    failures.push(command.join(" "));
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  checks: checks.length,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
