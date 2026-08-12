import fs from "node:fs";

const network = process.argv[2];
if (!["testnet", "mainnet"].includes(network)) {
  throw new Error("Usage: node scripts/sui/update-wpwrc-config.mjs <testnet|mainnet>");
}

const manifestPath = `deployments/sui/${network}.json`;
if (!fs.existsSync(manifestPath)) {
  throw new Error(`Deployment manifest missing: ${manifestPath}`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const configPath = "config/sui/wpwrc.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

if (manifest.version !== "1.0.0") throw new Error("WPWRC_MANIFEST_VERSION_INVALID");
if (manifest.decimals !== 9 || manifest.canonicalDecimals !== 9) {
  throw new Error("WPWRC_MANIFEST_DECIMALS_INVALID");
}
if (manifest.canonicalBaseUnitsPerWrappedBaseUnit !== "1") {
  throw new Error("WPWRC_MANIFEST_FACTOR_INVALID");
}
if (manifest.genesisSupplyBaseUnits !== "0") {
  throw new Error("WPWRC_MANIFEST_GENESIS_SUPPLY_INVALID");
}
if (manifest.mintPolicy !== "bridge-only") {
  throw new Error("WPWRC_MANIFEST_MINT_POLICY_INVALID");
}
if (manifest.treasuryCapEncapsulated !== true) {
  throw new Error("WPWRC_MANIFEST_CAPABILITY_INVALID");
}
if (manifest.moveEdition !== "2024") {
  throw new Error("WPWRC_MOVE_EDITION_INVALID");
}
if (!/^[a-f0-9]{64}$/i.test(manifest.moveLockSha256 ?? "")) {
  throw new Error("WPWRC_MOVE_LOCK_SHA256_INVALID");
}
if (!manifest.suiCliVersion?.trim()) {
  throw new Error("WPWRC_SUI_CLI_VERSION_MISSING");
}

Object.assign(config.networks[network], {
  packageId: manifest.packageId,
  coinType: manifest.coinType,
  bridgeControllerId: manifest.bridgeControllerId,
  currencyObjectId: manifest.currencyObjectId,
  status: "deployed-unverified",
});
fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

if (network === "mainnet") {
  const mainnetPath = "config/mainnet/bridge.json";
  const mainnet = JSON.parse(fs.readFileSync(mainnetPath, "utf8"));
  Object.assign(mainnet.sui, {
    packageId: manifest.packageId,
    coinType: manifest.coinType,
    currencyObjectId: manifest.currencyObjectId,
    bridgeControllerId: manifest.bridgeControllerId,
    moveLockSha256: manifest.moveLockSha256,
    suiCliVersion: manifest.suiCliVersion,
  });
  fs.writeFileSync(mainnetPath, `${JSON.stringify(mainnet, null, 2)}\n`);
}

console.log(JSON.stringify({
  ok: true,
  network,
  configPath,
  packageId: manifest.packageId,
  coinType: manifest.coinType,
  moveLockSha256: manifest.moveLockSha256,
}, null, 2));
