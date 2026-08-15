import fs from "node:fs";

const pkg =
  JSON.parse(
    fs.readFileSync(
      "package.json",
      "utf8",
    ),
  );
const workspace =
  fs.readFileSync(
    "pnpm-workspace.yaml",
    "utf8",
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

if (
  pkg.pnpm?.overrides?.[
    "utf-8-validate"
  ] !== "5.0.10"
) {
  failures.push(
    "utf-8-validate-override",
  );
}

const approvedSection =
  workspace
    .split(
      "onlyBuiltDependencies:",
    )[1]
    ?.split(
      "ignoredBuiltDependencies:",
    )[0] ??
  "";

const ignoredSection =
  workspace
    .split(
      "ignoredBuiltDependencies:",
    )[1]
    ?.split(
      "\n#",
    )[0] ??
  "";

for (const dependency of [
  "bufferutil@4.1.0",
  "esbuild@0.28.1",
]) {
  if (
    !approvedSection.includes(
      dependency,
    )
  ) {
    failures.push(
      `dependency-build-approved:${dependency}`,
    );
  }
}

for (const dependency of [
  "bigint-buffer",
  "utf-8-validate",
]) {
  if (
    !ignoredSection.includes(
      dependency,
    )
  ) {
    failures.push(
      `dependency-build-not-ignored:${dependency}`,
    );
  }

  if (
    approvedSection.includes(
      dependency,
    )
  ) {
    failures.push(
      `dependency-build-must-not-be-approved:${dependency}`,
    );
  }
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
      dependencyBuildPolicy: {
        approved: [
          "bufferutil@4.1.0",
          "esbuild@0.28.1",
        ],
        explicitlyIgnored: [
          "bigint-buffer",
          "utf-8-validate",
        ],
      },
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
