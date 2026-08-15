import fs from "node:fs";

const failures = [];
const warnings = [];

for (const file of [
  "package.json",
  "pnpm-workspace.yaml",
  "tsconfig.json",
  ".env.example",
  ".gitignore",
  "config/token.json",
  "config/programs.json",
  "config/metaplex.json",
  "packages/protocol/src/constants.ts",
  "packages/metaplex/package.json",
  "packages/metaplex/src/index.ts",
  "apps/api/package.json",
  "apps/client/package.json",
  "apps/docs/package.json",
]) {
  if (!fs.existsSync(file)) {
    failures.push(
      `bootstrap:missing:${file}`,
    );
  }
}

const root =
  JSON.parse(
    fs.readFileSync(
      "package.json",
      "utf8",
    ),
  );

if (
  root.version !==
    "1.0.0" ||
  root.packageManager !==
    "pnpm@11.18.0"
) {
  failures.push(
    "bootstrap:root-package-policy",
  );
}

const metaplex =
  JSON.parse(
    fs.readFileSync(
      "config/metaplex.json",
      "utf8",
    ),
  );

if (
  metaplex
    .tokenMetadataProgramId !==
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
) {
  failures.push(
    "bootstrap:metadata-program-id",
  );
}

for (const stale of [
  "src",
  "utils",
]) {
  if (fs.existsSync(stale)) {
    warnings.push(
      `bootstrap:stale-root-source:${stale}`,
    );
  }
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      monorepo:
        true,
      metaplex:
        true,
      warnings,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
