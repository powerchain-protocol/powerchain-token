import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { canonicalJson } from "../packages/protocol/src/canonical-json.js";

const cluster = process.env["PWRC_CLUSTER"] ?? "devnet";
const dir = path.join("deployments", cluster);
const deploymentPath = path.join(dir, "deployment.json");
if (!fs.existsSync(deploymentPath)) throw new Error(`Missing ${deploymentPath}`);
const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
if (deployment.status !== "FINALIZED") throw new Error("Release proof requires FINALIZED deployment");

function sha256File(file: string) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}
const candidates = [
  "config/token.json",
  "metadata/metadata.json",
  "config/toolchain.json",
  path.join(dir, "inputs.lock.json"),
  path.join(dir, "journal.jsonl"),
  deploymentPath,
  path.join(dir, "evidence", "genesis-verification.json"),
  path.join(dir, "evidence", "final-verification.json"),
  path.join(dir, "evidence", "final-journal-verification.json"),
  path.join(dir, "evidence", "revoke-mint-confirmation.json"),
  path.join(dir, "final-state.txt"),
].filter(fs.existsSync);
const files = Object.fromEntries(candidates.map((f) => [f, sha256File(f)]));
const payload = {
  schema: "powerchain.pwrc.release.v1",
  version: "1.0.0",
  cluster,
  status: "FINALIZED",
  mint: deployment.mint,
  tokenProgram: deployment.tokenProgram,
  decimals: 9,
  genesisSupply: "18446000000",
  genesisBaseUnits: "18446000000000000000",
  finalAuthorities: { mint: null, freeze: null },
  files,
};
const canonical = canonicalJson(payload);
const releaseSha256 = crypto.createHash("sha256").update(canonical).digest("hex");
const out = { ...payload, releaseSha256, generatedAt: new Date().toISOString() };
fs.mkdirSync("releases/1.0.0", { recursive: true });
const output = `releases/1.0.0/pwrc-${cluster}.release.json`;
fs.writeFileSync(output, JSON.stringify(out, null, 2) + "\n");
console.log(output);
console.log(releaseSha256);
