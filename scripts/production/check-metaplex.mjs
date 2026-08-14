import fs from "node:fs";

const failures = [];

const expectedPackages = {
  "@metaplex-foundation/mpl-token-metadata":
    "3.4.0",
  "@metaplex-foundation/mpl-toolbox":
    "0.11.4",
  "@metaplex-foundation/umi":
    "1.5.1",
  "@metaplex-foundation/umi-bundle-defaults":
    "1.5.1",
};

const metaplexPackage =
  JSON.parse(
    fs.readFileSync(
      "packages/metaplex/package.json",
      "utf8",
    ),
  );

for (
  const [
    name,
    version,
  ] of
  Object.entries(
    expectedPackages,
  )
) {
  if (
    metaplexPackage.dependencies?.[
      name
    ] !== version
  ) {
    failures.push(
      `metaplex:dependency:${name}`,
    );
  }
}

const sdkPackage =
  JSON.parse(
    fs.readFileSync(
      "packages/sdk/package.json",
      "utf8",
    ),
  );

if (
  sdkPackage.dependencies?.[
    "@powerchain/metaplex"
  ] !== "workspace:*"
) {
  failures.push(
    "metaplex:sdk-workspace-dependency",
  );
}

for (const file of [
  "package.json",
  "packages/sdk/package.json",
]) {
  const pkg =
    JSON.parse(
      fs.readFileSync(
        file,
        "utf8",
      ),
    );

  for (const name of Object.keys(expectedPackages)) {
    if (pkg.dependencies?.[name]) {
      failures.push(
        `metaplex:duplicate-boundary:${file}:${name}`,
      );
    }
  }
}

const constants =
  fs.readFileSync(
    "packages/protocol/src/constants.ts",
    "utf8",
  );

const sdk =
  fs.readFileSync(
    "packages/metaplex/src/index.ts",
    "utf8",
  );

for (const invariant of [
  "METAPLEX_TOKEN_METADATA_PROGRAM_ID",
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
]) {
  if (!constants.includes(invariant)) {
    failures.push(
      `metaplex:constant:${invariant}`,
    );
  }
}

for (const invariant of [
  "mplTokenMetadata",
  "findMetadataPda",
  "fetchMetadata",
  "PWRC_CANONICAL_METADATA_WRITE_DISABLED",
]) {
  if (!sdk.includes(invariant)) {
    failures.push(
      `metaplex:sdk:${invariant}`,
    );
  }
}

const config =
  JSON.parse(
    fs.readFileSync(
      "config/metaplex.json",
      "utf8",
    ),
  );

if (
  config
    .tokenMetadataProgramId !==
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" ||
  config
    .canonicalMint !==
    "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc"
) {
  failures.push(
    "metaplex:config-identity",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      metadataProgramId:
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
      packages:
        expectedPackages,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
