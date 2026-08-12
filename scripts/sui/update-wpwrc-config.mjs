import fs from "node:fs";

const network = process.argv[2];
if (!["testnet", "mainnet"].includes(network)) {
  throw new Error("Usage: node scripts/sui/update-wpwrc-config.mjs <testnet|mainnet>");
}
const manifestPath = `deployments/sui/${network}.json`;
if (!fs.existsSync(manifestPath)) throw new Error(`Deployment manifest missing: ${manifestPath}`);

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const configPath = "config/sui/wpwrc.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

if (manifest.version !== "1.0.0") throw new Error("WPWRC_MANIFEST_VERSION_INVALID");
if (manifest.decimals !== 9 || manifest.canonicalDecimals !== 9) throw new Error("WPWRC_MANIFEST_DECIMALS_INVALID");
if (manifest.canonicalBaseUnitsPerWrappedBaseUnit !== "1") throw new Error("WPWRC_MANIFEST_FACTOR_INVALID");
if (manifest.genesisSupplyBaseUnits !== "0") throw new Error("WPWRC_MANIFEST_GENESIS_SUPPLY_INVALID");
if (manifest.mintPolicy !== "bridge-only") throw new Error("WPWRC_MANIFEST_MINT_POLICY_INVALID");
if (manifest.treasuryCapEncapsulated !== true) throw new Error("WPWRC_MANIFEST_CAPABILITY_INVALID");
if (network === "mainnet" && !/^[a-f0-9]{40}$/i.test(manifest.frameworkRevision ?? "")) throw new Error("WPWRC_MAINNET_FRAMEWORK_REVISION_INVALID");

Object.assign(config.networks[network], {
  packageId: manifest.packageId,
  coinType: manifest.coinType,
  bridgeControllerId: manifest.bridgeControllerId,
  currencyObjectId: manifest.currencyObjectId,
  status: "deployed-unverified",
});
fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, network, configPath, packageId: manifest.packageId, coinType: manifest.coinType }, null, 2));
