import fs from "node:fs";
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const failures=[];
if(pkg.dependencies?.["@coral-xyz/anchor"])failures.push("legacy-anchor-package");
if(pkg.dependencies?.["@anchor-lang/core"]!=="1.0.2")failures.push("anchor-core");
const workspace=fs.readFileSync("pnpm-workspace.yaml","utf8");
if(workspace.includes("bigint-buffer@1.1.5"))failures.push("vulnerable-bigint-build-approved");
console.log(JSON.stringify({ok:!failures.length,version:"1.0.0",failures},null,2));
if(failures.length)process.exit(1);
