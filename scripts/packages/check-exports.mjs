import fs from "node:fs";
const failures = [];
for (const manifest of ["package.json","packages/native-token-client/package.json","packages/bridge-integration/package.json"]) {
  const pkg = JSON.parse(fs.readFileSync(manifest, "utf8"));
  const base = manifest === "package.json" ? "." : manifest.replace(/\/package\.json$/, "");
  for (const [key, target] of Object.entries(pkg.exports ?? {})) {
    if (typeof target !== "string") continue;
    const normalized = target.replace(/^\.\//, "");
    const file = `${base}/${normalized}`.replace(/^\.\//, "");
    if (!fs.existsSync(file)) failures.push(`${manifest}:${key}->${target}`);
  }
}
console.log(JSON.stringify({ ok: failures.length === 0, version: "1.0.0", failures }, null, 2));
if (failures.length) process.exit(1);
