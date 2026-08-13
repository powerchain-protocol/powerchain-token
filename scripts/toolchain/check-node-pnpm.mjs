import {
  spawnSync,
} from "node:child_process";
import {
  isSupportedNode,
  nodePolicyLabel,
  PNPM_VERSION,
} from "./node-policy.mjs";

const failures = [];

function version(command) {
  const result =
    spawnSync(
      command,
      ["--version"],
      {
        encoding:
          "utf8",
        shell:
          false,
      },
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

const detected = {
  node:
    process.versions.node,
  pnpm:
    version("pnpm"),
};

if (
  !isSupportedNode(
    detected.node,
  )
) {
  failures.push(
    `node:${detected.node}:unsupported`,
  );
}

if (
  detected.pnpm !==
    PNPM_VERSION
) {
  failures.push(
    `pnpm:${detected.pnpm ?? "unavailable"}!=${PNPM_VERSION}`,
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      expected: {
        node:
          nodePolicyLabel(),
        pnpm:
          PNPM_VERSION,
      },
      detected,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
