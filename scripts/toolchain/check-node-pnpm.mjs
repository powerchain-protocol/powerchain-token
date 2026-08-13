import { spawnSync } from "node:child_process";

const failures = [];

function version(command) {
  const result = spawnSync(
    command,
    ["--version"],
    { encoding: "utf8" },
  );
  if (result.error || result.status !== 0) {
    return null;
  }
  return (
    result.stdout.trim() ||
    result.stderr.trim()
  );
}

const detected = {
  node: process.versions.node,
  pnpm: version("pnpm"),
};

if (detected.node !== "26.7.0") {
  failures.push(
    `node:${detected.node}!=$26.7.0`,
  );
}

if (detected.pnpm !== "10.21.0") {
  failures.push(
    `pnpm:${detected.pnpm ?? "unavailable"}!=10.21.0`,
  );
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  expected: {
    node: "26.7.0",
    pnpm: "10.21.0",
  },
  detected,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
