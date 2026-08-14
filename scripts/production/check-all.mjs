import { spawnSync } from "node:child_process";
const checks=[
  "scripts/production/check-config.mjs",
  "scripts/production/check-fees.mjs",
  "scripts/production/check-stack.mjs",
  "scripts/production/check-env.mjs",
  "scripts/production/check-integrations.mjs",
  "scripts/production/check-scripts.mjs",
  "scripts/production/check-canonical-drift.mjs",
  "scripts/production/check-source-identities.mjs",
  "scripts/production/check-wpwrc-source.mjs",
  "scripts/production/check-release-bindings.mjs",
  "scripts/production/check-mainnet-state-machine.mjs",
  "scripts/production/test-api-hardening.mjs",
  "scripts/production/test-bridge-trace.mjs",
  "scripts/production/check-cdp-solana-data.mjs",
  "scripts/production/test-cdp-solana-sql.mjs",
  "scripts/production/check-openapi.mjs",
  "scripts/production/test-api-endpoints.mjs",
  "scripts/security/check-dependencies.mjs"
];
const failures=[];
for(const script of checks){
  const r=spawnSync(process.execPath,[script],{encoding:"utf8"});
  if(r.stdout)process.stdout.write(r.stdout);
  if(r.stderr)process.stderr.write(r.stderr);
  if(r.status!==0)failures.push(script);
}
console.log(JSON.stringify({
  ok:failures.length===0,
  version:"1.0.0",
  checks:checks.length,
  passed:checks.length-failures.length,
  failed:failures.length,
  failures
},null,2));
if(failures.length)process.exit(1);
