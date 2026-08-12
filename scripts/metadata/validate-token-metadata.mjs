import fs from "node:fs";

const failures = [];
const links = JSON.parse(
  fs.readFileSync("config/metadata/official-links.json", "utf8"),
).officialLinks;

for (const file of [
  "metadata/metadata.json",
  "metadata/metaplex.metadata.json",
  "metadata/token2022.metadata.json",
]) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  if (data.name !== "PowerChain") failures.push(`${file}:name`);
  if (data.symbol !== "PWRC") failures.push(`${file}:symbol`);
  if (data.properties?.decimals !== 9) failures.push(`${file}:decimals`);
  if (data.external_url !== links.website) failures.push(`${file}:external_url`);
}

const wrapped = JSON.parse(
  fs.readFileSync("metadata/wpwrc.metadata.json", "utf8"),
);

if (wrapped.name !== "PowerChain") failures.push("wpwrc:name");
if (wrapped.symbol !== "wPWRC") failures.push("wpwrc:symbol");
if (wrapped.properties?.decimals !== 9) failures.push("wpwrc:decimals");
if (wrapped.properties?.canonical_decimals !== 9) failures.push("wpwrc:canonical_decimals");
if (wrapped.properties?.canonical_chain !== "solana") failures.push("wpwrc:canonical_chain");
if (wrapped.properties?.wrapped_chain !== "sui") failures.push("wpwrc:wrapped_chain");
if (wrapped.properties?.bridge_ratio !== "1:1") failures.push("wpwrc:bridge_ratio");
if (
  wrapped.properties?.canonical_base_units_per_wrapped_base_unit !== "1"
) failures.push("wpwrc:base_unit_conversion");
if (wrapped.properties?.genesis_supply !== "0") failures.push("wpwrc:genesis_supply");

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  canonical: { asset: "PWRC", chain: "solana", decimals: 9 },
  wrapped: {
    asset: "wPWRC",
    chain: "sui",
    decimals: 9,
    backing: "1:1 PWRC",
    canonicalBaseUnitsPerWrappedBaseUnit: "1",
  },
  failures,
}, null, 2));

if (failures.length) process.exit(1);
