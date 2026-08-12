import fs from "node:fs";

const expected = JSON.parse(
  fs.readFileSync("config/metadata/official-links.json", "utf8"),
).officialLinks;

const files = [
  "metadata/metadata.json",
  "metadata/metaplex.metadata.json",
  "metadata/token2022.metadata.json",
  "metadata/wpwrc.metadata.json",
];

const failures = [];

for (const file of files) {
  if (!fs.existsSync(file)) {
    failures.push(`${file}:missing`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  if (data.external_url !== expected.website) {
    failures.push(`${file}:external_url`);
  }

  for (const [key, value] of Object.entries(expected)) {
    if (data.official_links?.[key] !== value) {
      failures.push(`${file}:official_links.${key}`);
    }
    if (data.properties?.links?.[key] !== value) {
      failures.push(`${file}:properties.links.${key}`);
    }
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  officialLinks: expected,
  checkedFiles: files,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
