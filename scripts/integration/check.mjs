import fs from "node:fs";
const failures=[]; const p=JSON.parse(fs.readFileSync("packages/bridge-integration/package.json","utf8")); if(p.name!=="@powerchain/bridge-integration")failures.push("package:name"); if(p.version!=="1.0.0")failures.push("package:version");
for(const f of ["packages/bridge-integration/src/config.ts","packages/bridge-integration/src/finality.ts","packages/bridge-integration/src/reconcile.ts","packages/bridge-integration/src/mainnet.ts"]) if(!fs.existsSync(f)) failures.push(`missing:${f}`);
const rec=fs.readFileSync("packages/bridge-integration/src/reconcile.ts","utf8"); if(rec.includes("* 1_000n"))failures.push("stale-unit-conversion");
console.log(JSON.stringify({ok:!failures.length,version:"1.0.0",integrationPackage:"@powerchain/bridge-integration",failures},null,2)); if(failures.length)process.exit(1);
