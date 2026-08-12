import fs from "node:fs";
import path from "node:path";
const [cluster, mint, treasury] = process.argv.slice(2);
if (!cluster || !mint || !treasury) throw new Error("cluster, mint and treasury required");
const out = path.join("deployments", cluster);
const summary = {
  schema: "powerchain.pwrc.deployment.v1",
  version: "1.0.0",
  status: "GENESIS_MINTED",
  cluster,
  mint,
  treasury,
  tokenProgram: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
  decimals: 9,
  genesisSupply: "18446000000",
  genesisBaseUnits: "18446000000000000000",
  createdAt: new Date().toISOString()
};
fs.writeFileSync(path.join(out, "deployment.json"), JSON.stringify(summary, null, 2) + "\n");
