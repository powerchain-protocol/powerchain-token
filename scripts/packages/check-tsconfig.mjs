import fs from "node:fs";

const failures = [];

for (const file of [
  "tsconfig.base.json",
  "tsconfig.json",
  "tsconfig.build.json",
  "tsconfig.scripts.json",
  "tsconfig.tests.json",
  "packages/native-token-client/tsconfig.json",
]) {
  if (!fs.existsSync(file)) {
    failures.push(`missing:${file}`);
    continue;
  }
  JSON.parse(fs.readFileSync(file, "utf8"));
}

const base = JSON.parse(fs.readFileSync("tsconfig.base.json", "utf8"));
const root = JSON.parse(fs.readFileSync("tsconfig.json", "utf8"));
const build = JSON.parse(fs.readFileSync("tsconfig.build.json", "utf8"));

const c = base.compilerOptions ?? {};

for (const [name, expected] of Object.entries({
  strict: true,
  noUncheckedIndexedAccess: true,
  exactOptionalPropertyTypes: true,
  noImplicitOverride: true,
  useUnknownInCatchVariables: true,
  isolatedModules: true,
  verbatimModuleSyntax: true,
})) {
  if (c[name] !== expected) failures.push(`base:${name}`);
}

if (c.module !== "NodeNext") failures.push("base:module");
if (c.moduleResolution !== "NodeNext") failures.push("base:moduleResolution");
if (root.compilerOptions?.noEmit !== true) failures.push("root:noEmit");
if (build.compilerOptions?.noEmit !== false) failures.push("build:noEmit");
if (!build.exclude?.includes("tests/**")) failures.push("build:exclude-tests");
if (!build.exclude?.includes("scripts/**")) failures.push("build:exclude-scripts");

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  configs: [
    "tsconfig.base.json",
    "tsconfig.json",
    "tsconfig.build.json",
    "tsconfig.scripts.json",
    "tsconfig.tests.json",
  ],
  failures,
}, null, 2));

if (failures.length) process.exit(1);
