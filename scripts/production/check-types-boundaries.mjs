import fs from "node:fs";

const failures = [];

const root =
  JSON.parse(
    fs.readFileSync(
      "package.json",
      "utf8",
    ),
  );
const rootTs =
  JSON.parse(
    fs.readFileSync(
      "tsconfig.json",
      "utf8",
    ),
  );
const cdp =
  JSON.parse(
    fs.readFileSync(
      "packages/cdp-user-wallet/package.json",
      "utf8",
    ),
  );
const cdpTs =
  JSON.parse(
    fs.readFileSync(
      "packages/cdp-user-wallet/tsconfig.json",
      "utf8",
    ),
  );

if (
  root.dependencies?.[
    "@types/node"
  ] !== "24.13.3"
) {
  failures.push(
    "types:root-node-types-not-direct",
  );
}

if (
  !rootTs.compilerOptions
    ?.types
    ?.includes(
      "node",
    )
) {
  failures.push(
    "types:root-node-types-not-enabled",
  );
}

if (
  !rootTs.exclude
    ?.includes(
      "packages/cdp-user-wallet/**",
    )
) {
  failures.push(
    "types:cdp-not-isolated-from-root",
  );
}

for (const required of [
  "react",
]) {
  if (
    !cdpTs.compilerOptions
      ?.types
      ?.includes(
        required,
      )
  ) {
    failures.push(
      `types:cdp-missing:${required}`,
    );
  }
}

if (
  cdpTs.compilerOptions
    ?.types
    ?.includes(
      "node",
    )
) {
  failures.push(
    "types:cdp-browser-package-must-not-load-node-ambient-types",
  );
}

for (const lib of [
  "ES2022",
  "DOM",
  "DOM.Iterable",
]) {
  if (
    !cdpTs.compilerOptions
      ?.lib
      ?.includes(
        lib,
      )
  ) {
    failures.push(
      `types:cdp-lib:${lib}`,
    );
  }
}

if (
  cdpTs.compilerOptions
    ?.moduleResolution !==
    "NodeNext"
) {
  failures.push(
    "types:cdp-module-resolution",
  );
}

for (const [
  dependency,
  version,
] of Object.entries({
  "@types/react":
    "19.2.17",
  "typescript":
    "5.9.3",
})) {
  if (
    cdp.devDependencies?.[
      dependency
    ] !== version
  ) {
    failures.push(
      `types:cdp-dev-dependency:${dependency}`,
    );
  }
}

if (
  cdp.scripts
    ?.typecheck !==
    "tsc -p tsconfig.json --noEmit"
) {
  failures.push(
    "types:cdp-typecheck-script",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      rootNodeTypes:
        "@types/node@24.13.3",
      cdpAmbientTypes: [
        "react",
      ],
      cdpNodeAmbientTypes:
        false,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
