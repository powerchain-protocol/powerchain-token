import fs from "node:fs";

const pkg =
  JSON.parse(
    fs.readFileSync(
      "package.json",
      "utf8",
    ),
  );
const failures = [];

if (
  pkg.dependencies?.[
    "@coral-xyz/anchor"
  ] !== "0.32.1"
) {
  failures.push(
    "coral-anchor-version",
  );
}

if (
  pkg.dependencies?.[
    "@anchor-lang/core"
  ]
) {
  failures.push(
    "duplicate-anchor-js-client",
  );
}

const workspace =
  fs.readFileSync(
    "pnpm-workspace.yaml",
    "utf8",
  );

if (
  workspace.includes(
    "bigint-buffer@1.1.5",
  )
) {
  failures.push(
    "vulnerable-bigint-build-approved",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      anchorClient:
        "@coral-xyz/anchor@0.32.1",
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
