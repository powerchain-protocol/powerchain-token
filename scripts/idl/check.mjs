import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];
const manifest = JSON.parse(fs.readFileSync("idl/manifest.json","utf8"));
const expected = JSON.parse(fs.readFileSync("idl/anchor/pwrc_lock.expected.json","utf8"));
const sui = JSON.parse(fs.readFileSync("idl/sui/wpwrc.interface.json","utf8"));

if (manifest.version !== "1.0.0") failures.push("manifest:version");
if (expected.version !== "1.0.0") failures.push("anchor:version");
if (sui.version !== "1.0.0") failures.push("sui:version");

if (expected.canonicalRules.pwrcDecimals !== 9) failures.push("anchor:pwrc-decimals");
if (expected.canonicalRules.wpwrcDecimals !== 9) failures.push("anchor:wpwrc-decimals");
if (expected.canonicalRules.baseUnitFactor !== "1") failures.push("anchor:factor");
if (expected.canonicalRules.transferFeeBps !== 0) failures.push("anchor:fee");

const expectedNames = new Set(expected.instructions.map((i)=>i.name));
for (const name of [
  "initialize","lockToSui","releaseFromSui","setPaused",
  "proposeOperator","cancelOperatorRotation","acceptOperator",
  "proposeGovernor","cancelGovernorRotation","acceptGovernor"
]) {
  if (!expectedNames.has(name)) failures.push(`anchor:instruction:${name}`);
}

if (sui.asset.decimals !== 9) failures.push("sui:decimals");
if (sui.asset.genesisSupplyBaseUnits !== "0") failures.push("sui:genesis");
if (sui.asset.baseUnitFactor !== "1") failures.push("sui:factor");
if (sui.identity.isPackageId !== false) failures.push("sui:alias-package");
if (sui.deployment.packageId !== null) failures.push("sui:invented-package-id");

let generatedStatus = "not-generated";
let generatedSha256 = null;
const generated = "idl/generated/pwrc_lock.json";
if (fs.existsSync(generated)) {
  const idl = JSON.parse(fs.readFileSync(generated,"utf8"));
  generatedStatus = "present";
  if (idl.metadata?.name !== "pwrc_lock") failures.push("generated:name");
  if (idl.metadata?.version !== "1.0.0") failures.push("generated:version");
  const names = new Set((idl.instructions ?? []).map((i)=>i.name));
  for (const name of expectedNames) {
    if (!names.has(name)) failures.push(`generated:missing:${name}`);
  }
  generatedSha256 = crypto.createHash("sha256").update(fs.readFileSync(generated)).digest("hex");
  generatedStatus = failures.some((x)=>x.startsWith("generated:")) ? "invalid" : "validated";
}

console.log(JSON.stringify({
  ok: failures.length===0,
  version:"1.0.0",
  anchorGeneratedIdl:{status:generatedStatus,path:generated,sha256:generatedSha256},
  suiSourceInterface:{status:"validated",path:"idl/sui/wpwrc.interface.json"},
  failures
},null,2));

if (failures.length) process.exit(1);
