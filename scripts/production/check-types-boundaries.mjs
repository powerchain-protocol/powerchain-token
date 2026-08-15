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
const baseTs =
  JSON.parse(
    fs.readFileSync(
      "config/typescript/base.json",
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
  ] !== undefined
) {
  failures.push(
    "types:root-node-types-must-be-dev-only",
  );
}

if (
  root.devDependencies?.[
    "@types/node"
  ] !== "26.1.2"
) {
  failures.push(
    "types:root-node-types-dev-dependency",
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
  baseTs.compilerOptions
    ?.moduleResolution !==
    "NodeNext" ||
  baseTs.compilerOptions
    ?.module !==
    "NodeNext"
) {
  failures.push(
    "types:shared-module-resolution",
  );
}

if (
  cdpTs.extends !==
    "../../config/typescript/base.json"
) {
  failures.push(
    "types:cdp-base-config",
  );
}

for (const [
  dependency,
  version,
] of Object.entries({
  "@types/react":
    "19.2.18",
  "typescript":
    "7.0.2",
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
        "@types/node@26.1.2",
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
