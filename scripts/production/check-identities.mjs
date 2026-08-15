import fs from "node:fs";
import path from "node:path";

const failures = [];
const warnings = [];
const canonicalVerifier =
  "PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu";
const forbiddenVerifier =
  "HRrDxwZzuFreRmkC" +
  "LY9oFXNGAy2gjd3diHyyTadxd8s6";

const roots = [
  "apps",
  "packages",
  "env",
  "config",
  "scripts",
  "programs",
  "contracts",
  "tests",
];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  const output = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (["node_modules","target","reports",".git","dist","build",".next"].includes(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...walk(target));
    else output.push(target);
  }
  return output;
}

for (const stale of ["src","utils","dist"]) {
  if (fs.existsSync(stale)) warnings.push(`identity:ignored-legacy-root:${stale}`);
}

for (const root of roots) {
  for (const file of walk(root)) {
    let source;
    try { source = fs.readFileSync(file, "utf8"); } catch { continue; }
    if (source.includes(forbiddenVerifier)) {
      failures.push(`identity:forbidden-verifier:${file}`);
    }
  }
}

const constants =
  fs.readFileSync("packages/protocol/src/constants.ts", "utf8");

if (!constants.includes(canonicalVerifier)) {
  failures.push("identity:canonical-verifier-missing");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  pwrcTokenProgramId: canonicalVerifier,
  forbiddenIdentityPresent: failures.some((failure) => failure.startsWith("identity:forbidden-verifier:")),
  warnings,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
