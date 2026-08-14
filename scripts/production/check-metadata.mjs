import fs from "node:fs";

const failures = [];

const token =
  JSON.parse(
    fs.readFileSync(
      "config/token.json",
      "utf8",
    ),
  );
const metaplex =
  JSON.parse(
    fs.readFileSync(
      "config/metaplex.json",
      "utf8",
    ),
  );
const metadata =
  fs.readFileSync(
    "packages/protocol/src/metadata.ts",
    "utf8",
  );

const expected = {
  mint:
    "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
  programId:
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  uri:
    "https://token.powerchain.energy/metadata/metadata.json",
  image:
    "https://token.powerchain.energy/assets/tokens/pwrc-logo.png",
};

for (const [
  label,
  actual,
  wanted,
] of [
  [
    "token.metadata.programId",
    token.metadata?.programId,
    expected.programId,
  ],
  [
    "token.metadata.uri",
    token.metadata?.uri,
    expected.uri,
  ],
  [
    "token.metadata.image",
    token.metadata?.image,
    expected.image,
  ],
  [
    "metaplex.programId",
    metaplex.tokenMetadataProgramId,
    expected.programId,
  ],
  [
    "metaplex.mint",
    metaplex.canonicalMint,
    expected.mint,
  ],
  [
    "metaplex.uri",
    metaplex.metadata?.uri,
    expected.uri,
  ],
  [
    "metaplex.image",
    metaplex.metadata?.image,
    expected.image,
  ],
]) {
  if (actual !== wanted) {
    failures.push(
      `metadata:${label}:expected=${wanted}:actual=${String(actual)}`,
    );
  }
}

for (const invariant of [
  "PWRC_METADATA",
  "assertCanonicalPwrcMetadata",
  "token.powerchain.energy",
  "PWRC_METADATA_IDENTITY_CHANGED",
]) {
  if (!metadata.includes(invariant)) {
    failures.push(
      `metadata:source:${invariant}`,
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
      canonical:
        expected,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
