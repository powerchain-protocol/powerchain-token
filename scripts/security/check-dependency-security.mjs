import assert from "node:assert/strict";
import fs from "node:fs";
import {
  pathToFileURL,
} from "node:url";

const failures = [];

const workspace =
  fs.readFileSync(
    "pnpm-workspace.yaml",
    "utf8",
  );

for (const expected of [
  '"bigint-buffer": "link:packages/bigint-buffer-safe"',
  '"uuid@<11.1.1": "11.1.1"',
  '"uuid@12.0.0": "12.0.1"',
  '"uuid@13.0.0": "13.0.1"',
]) {
  if (!workspace.includes(expected)) {
    failures.push(
      `override-missing:${expected}`,
    );
  }
}

if (
  workspace.includes(
    '"bigint-buffer@1.1.5"',
  )
) {
  failures.push(
    "vulnerable-bigint-buffer-build-approval",
  );
}

const shimPackage =
  JSON.parse(
    fs.readFileSync(
      "packages/bigint-buffer-safe/package.json",
      "utf8",
    ),
  );

if (
  shimPackage.name !==
    "bigint-buffer" ||
  shimPackage.powerchainSafeShim !==
    true
) {
  failures.push(
    "safe-bigint-buffer-package-identity",
  );
}

for (const scriptName of [
  "preinstall",
  "install",
  "postinstall",
]) {
  if (
    shimPackage.scripts?.[
      scriptName
    ]
  ) {
    failures.push(
      `safe-bigint-buffer-lifecycle-script:${scriptName}`,
    );
  }
}

for (const file of [
  "packages/bigint-buffer-safe/index.mjs",
  "packages/bigint-buffer-safe/index.cjs",
]) {
  const source =
    fs.readFileSync(
      file,
      "utf8",
    );

  for (const forbidden of [
    ".node",
    "bindings(",
    "node-gyp",
    "process.dlopen",
  ]) {
    if (
      source.includes(
        forbidden,
      )
    ) {
      failures.push(
        `${file}:native-loader:${forbidden}`,
      );
    }
  }
}

const safeBigint =
  await import(
    pathToFileURL(
      new URL(
        "../../packages/bigint-buffer-safe/index.mjs",
        import.meta.url,
      ).pathname,
    ).href,
  );

assert.equal(
  safeBigint.toBigIntLE(
    Buffer.from(
      "deadbeef",
      "hex",
    ),
  ),
  0xefbeadden,
);

assert.throws(
  () =>
    safeBigint.toBigIntLE(
      Buffer.alloc(
        safeBigint.MAX_BUFFER_BYTES +
          1,
      ),
    ),
  RangeError,
);

const repository =
  JSON.parse(
    fs.readFileSync(
      "config/repository.json",
      "utf8",
    ),
  );

if (
  repository.recommendedSlug !==
    "powerchain-network/powerchain-token"
) {
  failures.push(
    "github-repository-slug",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      repository:
        "powerchain-network/powerchain-token",
      bigintBuffer: {
        advisory:
          "CVE-2025-3194",
        upstreamPatchedVersion:
          null,
        localReplacement:
          "packages/bigint-buffer-safe",
        nativeAddon:
          false,
      },
      uuid: {
        advisory:
          "CVE-2026-41907",
        patchedLines: [
          "11.1.1",
          "12.0.1",
          "13.0.1",
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
