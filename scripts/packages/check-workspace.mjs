import fs from "node:fs";
import path from "node:path";

const failures = [];
const root = JSON.parse(fs.readFileSync("package.json", "utf8"));

if (root.version !== "1.0.0") failures.push("root:version");
if (root.packageManager !== "pnpm@10.21.0") {
  failures.push("root:packageManager");
}
if (!Array.isArray(root.workspaces) || !root.workspaces.includes("packages/*")) {
  failures.push("root:workspaces");
}
if (!fs.existsSync("pnpm-workspace.yaml")) {
  failures.push("pnpm-workspace.yaml");
}

const packageRoot = "packages";
const packages = [];

if (fs.existsSync(packageRoot)) {
  for (const entry of fs.readdirSync(packageRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(packageRoot, entry.name, "package.json");
    if (!fs.existsSync(file)) continue;

    const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
    packages.push(pkg.name ?? entry.name);

    if (pkg.version !== "1.0.0") {
      failures.push(`${pkg.name ?? entry.name}:version`);
    }
    if (pkg.type !== "module") {
      failures.push(`${pkg.name ?? entry.name}:type`);
    }
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  packages,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
