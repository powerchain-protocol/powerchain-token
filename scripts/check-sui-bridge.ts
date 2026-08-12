import fs from "node:fs";

const cfg = JSON.parse(fs.readFileSync("config/sui/wpwrc.json", "utf8"));
const errors: string[] = [];

if (cfg.version !== "1.0.0") errors.push("version");
if (cfg.canonical.asset !== "PWRC") errors.push("canonical.asset");
if (cfg.canonical.chain !== "solana") errors.push("canonical.chain");
if (cfg.canonical.decimals !== 9) errors.push("canonical.decimals");
if (cfg.wrapped.asset !== "wPWRC") errors.push("wrapped.asset");
if (cfg.wrapped.chain !== "sui") errors.push("wrapped.chain");
if (cfg.wrapped.decimals !== 9) errors.push("wrapped.decimals");
if (cfg.wrapped.genesisSupply !== "0") errors.push("wrapped.genesisSupply");
if (cfg.wrapped.maxSupplyBaseUnits !== "18446000000000000000") errors.push("wrapped.maxSupply");
if (cfg.security.zeroGenesisSupply !== true) errors.push("zeroGenesisSupply");
if (cfg.security.normalTransfersUnrestricted !== true) errors.push("normalTransfers");
if (cfg.security.supplyCanNeverExceedCanonicalMax !== true) errors.push("supplyCap");

if (errors.length) throw new Error(`wPWRC Sui bridge config invalid: ${errors.join(", ")}`);
console.log("wPWRC SUI BRIDGE POLICY PASS");
