import fs from "node:fs";

const failures = [];
const root =
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

const expectedEngine =
  ">=26.5.1 <27";

if (
  root.engines?.node !==
    expectedEngine
) {
  failures.push(
    "pnpm-policy:node-engine",
  );
}

if (
  root.packageManager !==
    "pnpm@11.18.0"
) {
  failures.push(
    "pnpm-policy:package-manager",
  );
}

if (
  root.engines?.pnpm !==
    ">=11.18.0 <12"
) {
  failures.push(
    "pnpm-policy:pnpm-engine",
  );
}

for (const [file, expected] of [
  [".nvmrc", "26.5.1"],
  [".node-version", "26.5.1"],
]) {
  if (
    !fs.existsSync(file) ||
    fs.readFileSync(file, "utf8").trim() !==
      expected
  ) {
    failures.push(
      `pnpm-policy:node-version-file:${file}`,
    );
  }
}

for (const dependency of [
  "bufferutil@4.1.0",
  "esbuild@0.28.1",
]) {
  if (
    !workspace.includes(
      dependency,
    )
  ) {
    failures.push(
      `pnpm-policy:approved-build:${dependency}`,
    );
  }
}

for (const dependency of [
  "bigint-buffer",
  "utf-8-validate",
]) {
  if (
    !workspace.includes(
      dependency,
    )
  ) {
    failures.push(
      `pnpm-policy:ignored-build:${dependency}`,
    );
  }
}

if (
  workspace.includes(
    "dangerouslyAllowAllBuilds",
  )
) {
  failures.push(
    "pnpm-policy:unsafe-build-policy",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      nodeEngine:
        expectedEngine,
      localNodeBaseline:
        "26.5.1",
      pnpm:
        "11.18.0",
      approvedBuilds: [
        "bufferutil@4.1.0",
        "esbuild@0.28.1",
      ],
      ignoredBuilds: [
        "bigint-buffer",
        "utf-8-validate",
      ],
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
