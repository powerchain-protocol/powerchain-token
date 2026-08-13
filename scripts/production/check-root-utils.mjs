import fs from "node:fs";

const failures = [];

const required = [
  "utils/index.mjs",
  "utils/atomic-json.mjs",
  "utils/canonical-json.mjs",
  "utils/crypto.mjs",
  "utils/network.mjs",
  "utils/paths.mjs",
  "utils/redact.mjs",
  "utils/time.mjs",
  "utils/validation.mjs",
  "src/utils/index.ts",
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
    "../../utils/atomic-json.mjs",
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
  "../../utils/network.mjs",
  "../../utils/crypto.mjs",
  "../../utils/validation.mjs",
]) {
  if (!mainnetLib.includes(expected)) {
    failures.push(
      `mainnet-lib:not-shared:${expected}`,
    );
  }
}

const publicUtils =
  fs.readFileSync(
    "src/utils/index.ts",
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
      "utils/",
    typedPublicUtilities:
      "src/utils/",
    runtimeImplementation:
      "src/common/",
    legacyScriptShim:
      "scripts/lib/atomic-json.mjs",
  },
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
