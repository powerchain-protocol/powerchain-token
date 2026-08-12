import fs from "node:fs";
import crypto from "node:crypto";

const [network, packageId, controllerId, currencyId] = process.argv.slice(2);
if (!["testnet", "mainnet"].includes(network)) {
  throw new Error("Usage: node write-deployment-manifest.mjs <testnet|mainnet> <packageId> <controllerId> <currencyId>");
}
for (const [name, value] of [["packageId", packageId], ["controllerId", controllerId], ["currencyId", currencyId]]) {
  if (!value || !/^0x[a-fA-F0-9]{1,64}$/.test(value)) throw new Error(`${name} invalid`);
}

const coinType = `${packageId}::wpwrc::WPWRC`;
const manifest = {
  version: "1.0.0",
  network,
  packageId,
  coinType,
  bridgeControllerId: controllerId,
  currencyObjectId: currencyId,
  generatedAt: new Date().toISOString(),
};
const canonical = JSON.stringify(manifest, Object.keys(manifest).sort());
manifest.sha256 = crypto.createHash("sha256").update(canonical).digest("hex");

fs.mkdirSync("deployments/sui", { recursive: true });
const path = `deployments/sui/${network}.json`;
fs.writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(path);
console.log(JSON.stringify(manifest, null, 2));
