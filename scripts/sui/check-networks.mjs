import fs from "node:fs";

const config = JSON.parse(
  fs.readFileSync("config/sui/networks.json", "utf8"),
);

const expected = {
  testnet: "https://fullnode.testnet.sui.io:443",
  mainnet: "https://fullnode.mainnet.sui.io:443",
  devnet: "https://fullnode.devnet.sui.io:443",
  local: "http://127.0.0.1:9000",
};

const failures = [];

for (const [network, rpcUrl] of Object.entries(expected)) {
  if (config.networks?.[network]?.rpcUrl !== rpcUrl) {
    failures.push(`${network}:rpcUrl`);
  }
}

if (config.production !== "mainnet") {
  failures.push("production-network");
}
if (config.networks.mainnet.production !== true) {
  failures.push("mainnet-production-flag");
}
if (config.networks.testnet.production !== false) {
  failures.push("testnet-production-flag");
}
if (config.identity.alias !== "powerchain") {
  failures.push("identity-alias");
}
if (config.identity.isPackageId !== false) {
  failures.push("identity-package-separation");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  defaultNetwork: config.default,
  productionNetwork: config.production,
  networks: expected,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
