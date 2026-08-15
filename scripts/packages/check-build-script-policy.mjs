import fs from "node:fs";

const failures = [];
const workspace =
  fs.readFileSync(
    "pnpm-workspace.yaml",
    "utf8",
  );

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

const expectedApproved = [
  "bufferutil@4.1.0",
  "esbuild@0.28.1",
];

const expectedIgnored = [
  "bigint-buffer",
  "utf-8-validate",
];

for (const dependency of expectedApproved) {
  if (
    !approvedSection.includes(
      dependency,
    )
  ) {
    failures.push(
      `pnpm-build-policy:missing-approved:${dependency}`,
    );
  }
}

for (const dependency of expectedIgnored) {
  if (
    !ignoredSection.includes(
      dependency,
    )
  ) {
    failures.push(
      `pnpm-build-policy:missing-ignored:${dependency}`,
    );
  }

  if (
    approvedSection.includes(
      dependency,
    )
  ) {
    failures.push(
      `pnpm-build-policy:ignored-dependency-approved:${dependency}`,
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
      pnpm:
        "11.18.0",
      approvedBuildScripts:
        expectedApproved,
      ignoredBuildScripts:
        expectedIgnored,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
