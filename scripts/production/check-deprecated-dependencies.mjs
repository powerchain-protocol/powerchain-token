import fs from "node:fs";

const failures = [];
const root = JSON.parse(fs.readFileSync("package.json","utf8"));
const override = root.pnpm?.overrides?.uuid;

if (override !== "11.1.1") {
  failures.push(`dependency-hygiene:uuid-override:${String(override)}`);
}

let lockfileChecked = false;
let deprecatedResolved = false;

if (fs.existsSync("pnpm-lock.yaml")) {
  lockfileChecked = true;
  const lock = fs.readFileSync("pnpm-lock.yaml","utf8");
  deprecatedResolved =
    /(?:^|\n)\s{2,}uuid@8\.3\.2(?=:\s*$|\()/m.test(lock) ||
    /\/uuid@8\.3\.2(?:\([^)]*\))?:/m.test(lock);

  if (deprecatedResolved) {
    failures.push("dependency-hygiene:lockfile-resolves-uuid-8.3.2");
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  deprecated: "uuid@8.3.2",
  override: "uuid@11.1.1",
  lockfileChecked,
  deprecatedResolved,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
