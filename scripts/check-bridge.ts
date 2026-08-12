import fs from "node:fs";

const bridge = JSON.parse(fs.readFileSync("config/bridge.json", "utf8"));
const errors: string[] = [];

if (bridge.version !== "1.0.0") errors.push("version");
if (bridge.canonical?.symbol !== "PWRC") errors.push("canonical.symbol");
if (bridge.canonical?.chain !== "solana") errors.push("canonical.chain");
if (bridge.canonical?.decimals !== 9) errors.push("canonical.decimals");
if (bridge.wrapped?.symbol !== "wPWRC") errors.push("wrapped.symbol");
if (bridge.wrapped?.chain !== "sui") errors.push("wrapped.chain");
if (bridge.wrapped?.decimals !== 9) errors.push("wrapped.decimals");
if (bridge.wrapped?.backingRatio !== "1:1") errors.push("wrapped.backingRatio");
if (bridge.policy?.canonicalMaxBaseUnits !== "18446000000000000000") {
  errors.push("policy.canonicalMaxBaseUnits");
}
if (bridge.policy?.genesisWrappedSupply !== "0") errors.push("policy.genesisWrappedSupply");
if (bridge.policy?.wrappedMintingRequiresLockedPWRC !== true) {
  errors.push("policy.wrappedMintingRequiresLockedPWRC");
}
if (bridge.policy?.wrappedBurnRequiredBeforeCanonicalRelease !== true) {
  errors.push("policy.wrappedBurnRequiredBeforeCanonicalRelease");
}
if (bridge.policy?.wrappedSupplyMustNotExceedLockedCanonical !== true) {
  errors.push("policy.wrappedSupplyMustNotExceedLockedCanonical");
}

if (errors.length) {
  throw new Error(`PWRC bridge config invalid: ${errors.join(", ")}`);
}

console.log("PWRC / wPWRC BRIDGE POLICY PASS");
