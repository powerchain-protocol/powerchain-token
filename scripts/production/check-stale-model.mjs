import fs from "node:fs";
import path from "node:path";

const matches = [];
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", "dist", "reports"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx|js|mjs|rs|move|json|md)$/.test(entry.name)) out.push(full);
  }
  return out;
}
const patterns = [
  /WPWRC_DECIMALS\s*=\s*6/,
  /wrappedDecimals["'\s:=>]+6/,
  /canonicalBaseUnitsPerWrappedBaseUnit["'\s:=>]+(?:1000|"1000")/,
  /PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT\s*=\s*1_000/,
  /post\s*\/\s*1_000n/,
  /suiWrappedSupplyBaseUnits\s*\*\s*1_000n/,
  /wrappedSupplyBaseUnits\s*\*\s*1_000n/,
  /pending_Solana_to_Sui\s*-\s*pending_Sui_to_Solana/,
  /pendingSolanaToSuiBaseUnits\s*-\s*(?:input\.)?pendingSuiToSolanaBaseUnits/,
];
for (const file of walk(".")) {
  const n = file.replaceAll("\\", "/");
  if (n.includes("CHANGELOG.md") || n.includes("programs/pwrc-fees/") || n.endsWith("check-stale-model.mjs") || n.endsWith("check-duplicates.mjs")) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const pattern of patterns) {
    if (pattern.test(text)) matches.push(`${n}:${pattern}`);
  }
}
console.log(JSON.stringify({ ok: matches.length === 0, version: "1.0.0", staleModelMatches: matches, failures: matches }, null, 2));
if (matches.length) process.exit(1);
