import fs from "node:fs";
import {
  execFileSync,
} from "node:child_process";
import {
  isSupportedNode,
  nodePolicyLabel,
} from "./toolchain/node-policy.mjs";

const expected = JSON.parse(
  fs.readFileSync(
    "config/toolchain.json",
    "utf8",
  ),
);

function run(
  cmd,
  args = ["--version"],
) {
  try {
    return execFileSync(
      cmd,
      args,
      {
        encoding: "utf8",
      },
    ).trim();
  } catch {
    return null;
  }
}

const actual = {
  solana: run("solana"),
  splToken: run("spl-token"),
  node: process.versions.node,
  pnpm: run("pnpm"),
};

const errors = [];

if (
  !actual.solana?.includes(
    expected.agave,
  )
) {
  errors.push(
    `AGAVE_EXPECTED_${expected.agave}`,
  );
}

if (
  !actual.splToken?.includes(
    expected.splTokenCli,
  )
) {
  errors.push(
    `SPL_TOKEN_EXPECTED_${expected.splTokenCli}`,
  );
}

if (
  !isSupportedNode(
    actual.node,
  )
) {
  errors.push(
    `NODE_EXPECTED_${nodePolicyLabel()}`,
  );
}

if (
  actual.pnpm !== expected.pnpm
) {
  errors.push(
    `PNPM_EXPECTED_${expected.pnpm}`,
  );
}

console.log(JSON.stringify({
  expected,
  actual,
  verified:
    errors.length === 0,
  errors,
}, null, 2));

if (errors.length) {
  process.exit(2);
}
