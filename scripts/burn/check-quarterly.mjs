import fs from "node:fs";

const burn = JSON.parse(
  fs.readFileSync("config/burn/quarterly.json", "utf8"),
);
const identity = JSON.parse(
  fs.readFileSync("config/sui/powerchain.identity.json", "utf8"),
);

const failures = [];

if (burn.version !== "1.0.0") failures.push("version");
if (burn.burnBasisPoints !== 200) failures.push("burnBasisPoints");
if (burn.frequency !== "quarterly") failures.push("frequency");
if (burn.sourcePolicy.userBalancesNeverDebited !== true) failures.push("userBalances");
if (burn.crossChain.independentWpwrcQuarterlyBurn !== false) failures.push("independentWpwrcBurn");
if (burn.crossChain.liveCanonicalCeilingMayNeverIncrease !== true) failures.push("ceilingMonotonic");

if (identity.alias !== "powerchain") failures.push("suiAlias");
if (identity.address !== "0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1") failures.push("suiAddress");
if (!/^0x[a-f0-9]{64}$/.test(identity.address)) failures.push("suiAddressFormat");

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  version: "1.0.0",
  burn: "2% quarterly",
  suiAlias: identity.alias,
  suiAddress: identity.address,
  firstQuarterIllustration: burn.firstQuarterIllustration,
}, null, 2));
