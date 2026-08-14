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
  ">=22.22.3 <23 || >=24.18.1 <25 || >=26.5.1 <27";

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
    "pnpm@10.21.0"
) {
  failures.push(
    "pnpm-policy:package-manager",
  );
}

for (const dependency of [
  "bufferutil@4.1.0",
  "esbuild@0.25.12",
  "utf-8-validate@6.0.6",
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

if (
  workspace.includes(
    "dangerouslyAllowAllBuilds"
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
        "22.22.3",
      pnpm:
        "10.21.0",
      pnpmForcesNodeDownload:
        false,
      strictDepBuilds:
        true,
      approvedBuilds: [
        "bufferutil@4.1.0",
        "esbuild@0.25.12",
        "utf-8-validate@6.0.6",
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
