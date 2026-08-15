import fs from "node:fs";

const failures = [];

const base =
  JSON.parse(
    fs.readFileSync(
      "config/typescript/base.json",
      "utf8",
    ),
  );
const root =
  JSON.parse(
    fs.readFileSync(
      "tsconfig.json",
      "utf8",
    ),
  );
const cdp =
  JSON.parse(
    fs.readFileSync(
      "packages/cdp-user-wallet/tsconfig.json",
      "utf8",
    ),
  );

for (const [key, expected] of Object.entries({
  target:
    "ES2022",
  module:
    "NodeNext",
  moduleResolution:
    "NodeNext",
  strict:
    true,
  exactOptionalPropertyTypes:
    true,
  noUncheckedIndexedAccess:
    true,
  noImplicitOverride:
    true,
  noPropertyAccessFromIndexSignature:
    true,
})) {
  if (
    base.compilerOptions?.[
      key
    ] !== expected
  ) {
    failures.push(
      `typescript-config:base:${key}`,
    );
  }
}

if (
  root.extends !==
    "./config/typescript/base.json"
) {
  failures.push(
    "typescript-config:root-extends",
  );
}

if (
  cdp.extends !==
    "../../config/typescript/base.json"
) {
  failures.push(
    "typescript-config:cdp-extends",
  );
}

if (
  !root.compilerOptions
    ?.types
    ?.includes(
      "node",
    )
) {
  failures.push(
    "typescript-config:root-node-types",
  );
}

if (
  cdp.compilerOptions
    ?.types
    ?.includes(
      "node",
    )
) {
  failures.push(
    "typescript-config:cdp-node-types",
  );
}

if (
  !cdp.compilerOptions
    ?.types
    ?.includes(
      "react",
    )
) {
  failures.push(
    "typescript-config:cdp-react-types",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  sharedBase:
    "config/typescript/base.json",
  module:
    base.compilerOptions?.module,
  moduleResolution:
    base.compilerOptions?.moduleResolution,
  browserNodeAmbientTypes:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
