import fs from "node:fs";

const failures = [];
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const scripts = pkg.scripts ?? {};

const required = [
  "typecheck",
  "build:ts",
  "packages:check",
  "pwrc:packages:check",
  "pwrc:config:check",
  "pwrc:scripts:check",
  "pwrc:static",
  "verify",
  "ci",
  "ci:solana",
  "ci:sui",
  "program:build",
  "program:test",
];

for (const name of required) {
  if (!scripts[name]) failures.push(`missing:${name}`);
}

if (scripts["program:test"]?.includes("pwrc-fees")) {
  failures.push("program:test targets deprecated pwrc-fees");
}
if (scripts["program:build"] === "anchor build") {
  failures.push("program:build should target pwrc_lock explicitly");
}
if (!scripts["pwrc:fees"]?.includes("check-no-transfer-fee.mjs")) {
  failures.push("pwrc:fees must validate no-fee canonical policy");
}
if (scripts.ci?.includes("test:anchor")) {
  failures.push("default ci should not require optional Anchor toolchain");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  scriptCount: Object.keys(scripts).length,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
