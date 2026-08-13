import fs from "node:fs";

const failures = [];

const required = [
  "packages/runtime/src/index.mjs",
  "packages/runtime/src/atomic-json.mjs",
  "packages/runtime/src/canonical-json.mjs",
  "packages/runtime/src/crypto.mjs",
  "packages/runtime/src/network.mjs",
  "packages/runtime/src/paths.mjs",
  "packages/runtime/src/redact.mjs",
  "packages/runtime/src/time.mjs",
  "packages/runtime/src/validation.mjs",
  "packages/protocol/src/utils/index.ts",
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    failures.push(
      `missing:${file}`,
    );
  }
}

const atomicShim =
  fs.readFileSync(
    "scripts/lib/atomic-json.mjs",
    "utf8",
  );

if (
  !atomicShim.includes(
    "../../packages/runtime/src/atomic-json.mjs",
  )
) {
  failures.push(
    "atomic-json:legacy-shim-not-delegated",
  );
}

const mainnetLib =
  fs.readFileSync(
    "scripts/mainnet/lib.mjs",
    "utf8",
  );

for (const expected of [
  "../../packages/runtime/src/network.mjs",
  "../../packages/runtime/src/crypto.mjs",
  "../../packages/runtime/src/validation.mjs",
]) {
  if (!mainnetLib.includes(expected)) {
    failures.push(
      `mainnet-lib:not-shared:${expected}`,
    );
  }
}

const publicUtils =
  fs.readFileSync(
    "packages/protocol/src/utils/index.ts",
    "utf8",
  );

for (const moduleName of [
  "atomic-file",
  "env",
  "hash",
  "retry",
  "timeout",
  "urls",
  "validation",
]) {
  if (
    !publicUtils.includes(
      `../common/${moduleName}.js`,
    )
  ) {
    failures.push(
      `src-utils:missing:${moduleName}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version: "1.0.0",
  architecture: {
    rootUtilities:
      "packages/runtime/src/",
    typedPublicUtilities:
      "packages/protocol/src/utils/",
    runtimeImplementation:
      "packages/protocol/src/common/",
    legacyScriptShim:
      "scripts/lib/atomic-json.mjs",
  },
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
