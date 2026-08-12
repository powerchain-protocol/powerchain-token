import fs from "node:fs";
import path from "node:path";

const failures = [];
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", "reports"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx|js|mjs|move|rs)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const staleSixDecimalWpwrc = [];
for (const file of walk(".")) {
  const normalized = file.replaceAll("\\", "/");
  if (normalized.endsWith("scripts/maintenance/check-duplicates.mjs")) continue;
  if (!normalized.toLowerCase().includes("wpwrc")) continue;
  const text = fs.readFileSync(file, "utf8");
  if (
    text.includes("WPWRC_DECIMALS = 6") ||
    text.includes("const DECIMALS: u8 = 6;")
  ) {
    staleSixDecimalWpwrc.push(normalized);
  }
}
if (staleSixDecimalWpwrc.length) {
  failures.push(
    `stale 6-decimal wPWRC declarations: ${staleSixDecimalWpwrc.join(",")}`,
  );
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  staleSixDecimalWpwrc,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
