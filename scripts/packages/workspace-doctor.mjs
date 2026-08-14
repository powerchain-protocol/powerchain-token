import fs from "node:fs";

const failures = [];
const warnings = [];

for (const stale of [
  "src",
  "utils",
]) {
  if (fs.existsSync(stale)) {
    failures.push(
      `stale-root-source:${stale}`,
    );
  }
}

const binding =
  "packages/protocol/src/idl/bindings.ts";

if (!fs.existsSync(binding)) {
  failures.push(
    `missing:${binding}`,
  );
} else {
  const source =
    fs.readFileSync(
      binding,
      "utf8",
    );

  const supported =
    source.includes(
      '../../../../idl/bindings/interface.js',
    ) ||
    source.includes(
      '../../idl/bindings/interface.js',
    );

  if (!supported) {
    failures.push(
      "idl-binding:unsupported-path",
    );
  }
}

if (
  !fs.existsSync(
    "packages/protocol/idl/bindings/interface.ts",
  )
) {
  failures.push(
    "idl-binding:compatibility-shim-missing",
  );
}

const metaplexPackage =
  JSON.parse(
    fs.readFileSync(
      "packages/metaplex/package.json",
      "utf8",
    ),
  );

for (const dependency of [
  "@metaplex-foundation/mpl-token-metadata",
  "@metaplex-foundation/mpl-toolbox",
  "@metaplex-foundation/umi",
  "@metaplex-foundation/umi-bundle-defaults",
]) {
  if (
    !metaplexPackage.dependencies?.[
      dependency
    ]
  ) {
    failures.push(
      `metaplex:missing-dependency:${dependency}`,
    );
  }
}

if (
  !fs.existsSync(
    "node_modules",
  )
) {
  warnings.push(
    "node_modules:missing:run-pnpm-install",
  );
}

if (
  !fs.existsSync(
    "pnpm-lock.yaml",
  )
) {
  warnings.push(
    "pnpm-lock.yaml:missing:generated-by-pnpm-install",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      failures,
      warnings,
      nextCommands: [
        "pnpm monorepo:clean",
        "pnpm install",
        "pnpm typecheck",
        "pnpm test",
        "pnpm production:check",
      ],
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
