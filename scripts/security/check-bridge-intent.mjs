import fs from "node:fs";

const failures = [];
const bridge = JSON.parse(fs.readFileSync("config/bridge.json", "utf8"));
const sui = JSON.parse(fs.readFileSync("config/sui/wpwrc.json", "utf8"));

if (bridge.canonical.chain !== "solana") failures.push("canonical chain");
if (bridge.canonical.network !== "mainnet-beta") failures.push("canonical network");
if (bridge.canonical.decimals !== 9) failures.push("canonical decimals");
if (bridge.wrapped.chain !== "sui") failures.push("wrapped chain");
if (bridge.wrapped.decimals !== 9) failures.push("wrapped decimals");
if (bridge.wrapped.backingRatio !== "1:1") failures.push("ratio");
if (bridge.policy.canonicalBaseUnitsPerWrappedBaseUnit !== "1") failures.push("base-unit factor");
if (bridge.policy.wrappedSupplyMustNotExceedLockedCanonical !== true) failures.push("backing invariant");
if (sui.wrapped.genesisSupplyBaseUnits !== "0") failures.push("wrapped genesis");
if (sui.wrapped.mintPolicy !== "bridge-only") failures.push("mint policy");

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  bridgeIntent: {
    canonical: "PWRC on Solana mainnet-beta",
    wrapped: "wPWRC on Sui",
    backing: "1:1",
    canonicalDecimals: 9,
    wrappedDecimals: 9,
    baseUnitFactor: 1,
  },
  failures,
}, null, 2));

if (failures.length) process.exit(1);
