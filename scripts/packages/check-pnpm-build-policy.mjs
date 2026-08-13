import fs from "node:fs";

const failures = [];

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

const expectedNodeEngine =
  ">=22.22.3 <23 || >=24.18.1 <25 || >=26.5.1 <27";

if (
  pkg.packageManager !==
    "pnpm@10.21.0"
) {
  failures.push(
    "packageManager",
  );
}

if (
  pkg.engines?.node !==
    expectedNodeEngine
) {
  failures.push(
    "engines.node",
  );
}

if (
  pkg.engines?.pnpm !==
    "10.21.0"
) {
  failures.push(
    "engines.pnpm",
  );
}

for (const value of [
  "engineStrict: true",
  "strictDepBuilds: true",
]) {
  if (
    !workspace.includes(
      value,
    )
  ) {
    failures.push(
      `workspace:${value}`,
    );
  }
}

if (
  /(^|\n)\s*(useNodeVersion|nodeVersion)\s*:/m.test(
    workspace,
  )
) {
  failures.push(
    "workspace:pnpm-node-download-pin-forbidden",
  );
}

for (
  const dependency of
  [
    "bigint-buffer@1.1.5",
    "bufferutil@4.1.0",
    "esbuild@0.25.12",
    "utf-8-validate@6.0.6",
  ]
) {
  if (
    !workspace.includes(
      `"${dependency}"`,
    )
  ) {
    failures.push(
      `approved-build-missing:${dependency}`,
    );
  }
}

if (
  /dangerouslyAllowAllBuilds:\s*true/.test(
    workspace,
  )
) {
  failures.push(
    "dangerouslyAllowAllBuilds-must-not-be-enabled",
  );
}

if (
  /\ballowBuilds\s*:/.test(
    workspace,
  )
) {
  failures.push(
    "allowBuilds-requires-pnpm-10.26+-not-valid-for-10.21-policy",
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
        expectedNodeEngine,
      localNodeBaseline:
        "22.22.3",
      pnpm:
        "10.21.0",
      pnpmForcesNodeDownload:
        false,
      strictDepBuilds:
        true,
      approvedBuilds: [
        "bigint-buffer@1.1.5",
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
