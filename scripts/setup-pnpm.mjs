import {
  spawnSync,
} from "node:child_process";
import {
  isSupportedNode,
  nodePolicyLabel,
  PNPM_VERSION,
} from "./toolchain/node-policy.mjs";

function run(command, args) {
  return spawnSync(
    command,
    args,
    {
      encoding: "utf8",
      stdio: [
        "ignore",
        "pipe",
        "pipe",
      ],
      shell: false,
    },
  );
}

function readVersion(command) {
  const result =
    run(
      command,
      ["--version"],
    );

  if (
    result.error ||
    result.status !== 0
  ) {
    return null;
  }

  return (
    result.stdout.trim() ||
    result.stderr.trim()
  );
}

if (
  !isSupportedNode(
    process.versions.node,
  )
) {
  console.error(
    `PWRC_NODE_VERSION_UNSUPPORTED: ${process.versions.node}; expected ${nodePolicyLabel()}`,
  );
  console.error(
    "Run: bash scripts/bootstrap/platform-preflight.sh",
  );
  process.exit(1);
}

let pnpm =
  readVersion("pnpm");

if (pnpm !== PNPM_VERSION) {
  const corepack =
    readVersion("corepack");

  if (!corepack) {
    console.error(
      "PWRC_COREPACK_UNAVAILABLE",
    );
    console.error(
      "Install/enable Corepack only after a compatible Node binary starts successfully.",
    );
    process.exit(2);
  }

  const prepare =
    spawnSync(
      "corepack",
      [
        "prepare",
        `pnpm@${PNPM_VERSION}`,
        "--activate",
      ],
      {
        stdio:
          "inherit",
        shell:
          false,
      },
    );

  if (
    prepare.status !== 0
  ) {
    process.exit(
      prepare.status ?? 1,
    );
  }

  pnpm =
    readVersion("pnpm");
}

if (pnpm !== PNPM_VERSION) {
  console.error(
    `PWRC_PNPM_VERSION_MISMATCH: expected ${PNPM_VERSION}, got ${pnpm ?? "unavailable"}`,
  );
  process.exit(3);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      version: "1.0.0",
      node:
        process.versions.node,
      nodePolicy:
        nodePolicyLabel(),
      pnpm,
      pnpmForcesNodeDownload:
        false,
      buildApprovalPolicy:
        "pnpm-workspace.yaml:onlyBuiltDependencies",
    },
    null,
    2,
  ),
);
