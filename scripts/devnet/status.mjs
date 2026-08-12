import fs from "node:fs";
const cfg = JSON.parse(fs.readFileSync("config/devnet/bridge.json", "utf8"));
const blockers = [];
if (!cfg.solana.canonicalMint) blockers.push("solana.canonicalMint");
if (!cfg.solana.bridgeProgramId) blockers.push("solana.bridgeProgramId");
if (!cfg.solana.bridgeVault) blockers.push("solana.bridgeVault");
if (!cfg.solana.tokenVerifierProgramId) blockers.push("solana.tokenVerifierProgramId");
if (!cfg.sui.packageId) blockers.push("sui.packageId");
if (!cfg.sui.coinType) blockers.push("sui.coinType");
if (!cfg.sui.bridgeControllerId) blockers.push("sui.bridgeControllerId");
const result = {
  ok: true,
  version: "1.0.0",
  configurationReady: true,
  deploymentReady: blockers.length === 0,
  blockers,
};
fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync("reports/devnet-status.json", `${JSON.stringify(result, null, 2)}
`);
console.log(JSON.stringify(result, null, 2));
