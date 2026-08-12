import fs from "node:fs";
import crypto from "node:crypto";

const [network, packageIdRaw, controllerIdRaw, currencyIdRaw, frameworkRevision] = process.argv.slice(2);
if (!["testnet", "mainnet"].includes(network)) {
  throw new Error("Usage: node write-deployment-manifest.mjs <testnet|mainnet> <packageId> <controllerId> <currencyId> [frameworkRevision]");
}

function normalizeObjectId(value, name) {
  if (!value || !/^0x[a-fA-F0-9]{1,64}$/.test(value)) throw new Error(`${name} invalid`);
  return `0x${value.slice(2).toLowerCase().padStart(64, "0")}`;
}

const packageId = normalizeObjectId(packageIdRaw, "packageId");
const controllerId = normalizeObjectId(controllerIdRaw, "controllerId");
const currencyId = normalizeObjectId(currencyIdRaw, "currencyId");
if (network === "mainnet" && !/^[a-f0-9]{40}$/i.test(frameworkRevision ?? "")) {
  throw new Error("Mainnet manifest requires immutable 40-hex Sui framework revision");
}

const coinType = `${packageId}::wpwrc::WPWRC`;
const manifest = {
  version: "1.0.0",
  network,
  packageId,
  coinType,
  bridgeControllerId: controllerId,
  currencyObjectId: currencyId,
  symbol: "wPWRC",
  decimals: 9,
  genesisSupplyBaseUnits: "0",
  mintPolicy: "bridge-only",
  treasuryCapEncapsulated: true,
  canonicalAsset: "PWRC on Solana mainnet-beta",
  canonicalDecimals: 9,
  canonicalBaseUnitsPerWrappedBaseUnit: "1",
  frameworkRevision: frameworkRevision ?? null,
  generatedAt: new Date().toISOString(),
};
const canonical = JSON.stringify(manifest, Object.keys(manifest).sort());
manifest.sha256 = crypto.createHash("sha256").update(canonical).digest("hex");

fs.mkdirSync("deployments/sui", { recursive: true });
const path = `deployments/sui/${network}.json`;
fs.writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, path, manifest }, null, 2));
