import fs from "node:fs";
import { spawnSync } from "node:child_process";

const target = process.argv[2] ?? "all";
if (!["all", "ts", "solana", "sui"].includes(target)) {
  throw new Error(
    "Usage: node scripts/toolchain/check-production.mjs [all|ts|solana|sui]",
  );
}

const expected = JSON.parse(
  fs.readFileSync("config/toolchain.json", "utf8"),
);

function version(command, args = ["--version"]) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
  });
  if (result.error || result.status !== 0) {
    return null;
  }
  return (
    result.stdout.trim() ||
    result.stderr.trim()
  );
}

const detected = {
  node: process.version,
  pnpm: version("pnpm"),
  anchor: version("anchor"),
  solana: version("solana"),
  sui: version("sui"),
  cargo: version("cargo"),
};

const blockers = [];
const nodeVersion = process.versions.node;

function requireTool(name, value) {
  if (!value) blockers.push(`${name} unavailable`);
}

if (target === "all" || target === "ts") {
  if (nodeVersion !== expected.node) {
    blockers.push(
      `Node ${nodeVersion} != ${expected.node}`,
    );
  }
  requireTool("pnpm", detected.pnpm);
  if (
    detected.pnpm &&
    !detected.pnpm.includes(expected.pnpm)
  ) {
    blockers.push(
      `pnpm ${detected.pnpm} != ${expected.pnpm}`,
    );
  }
}

if (target === "all" || target === "solana") {
  requireTool("cargo", detected.cargo);
  requireTool("anchor", detected.anchor);
  requireTool("solana", detected.solana);

  if (
    detected.anchor &&
    !detected.anchor.includes(expected.anchor)
  ) {
    blockers.push(
      `Anchor ${detected.anchor} != ${expected.anchor}`,
    );
  }
  if (
    detected.solana &&
    !detected.solana.includes(expected.agave)
  ) {
    blockers.push(
      `Solana/Agave ${detected.solana} != ${expected.agave}`,
    );
  }
}

if (target === "all" || target === "sui") {
  requireTool("sui", detected.sui);
}

const result = {
  ok: blockers.length === 0,
  version: "1.0.0",
  target,
  qualificationTarget: expected,
  detected,
  blockers,
};

console.log(JSON.stringify(result, null, 2));
if (blockers.length) process.exit(1);
