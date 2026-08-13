import fs from "node:fs";

const rows = [];

for (const parent of ["apps", "packages"]) {
  for (const entry of fs.readdirSync(parent, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const packageFile = `${parent}/${entry.name}/package.json`;
    if (!fs.existsSync(packageFile)) continue;

    const pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));
    rows.push({
      type: parent === "apps" ? "app" : "package",
      name: pkg.name,
      version: pkg.version,
      path: `${parent}/${entry.name}`,
    });
  }
}

rows.sort((a, b) => a.path.localeCompare(b.path));

console.log(JSON.stringify({
  ok: true,
  version: "1.0.0",
  workspaces: rows.length,
  rows,
}, null, 2));
