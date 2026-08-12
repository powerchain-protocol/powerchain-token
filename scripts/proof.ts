import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const cluster = process.env.PWRC_CLUSTER ?? "devnet";
const dir = path.join("deployments", cluster);
const manifestPath = path.join(dir, "deployment.env");

if (!fs.existsSync(manifestPath)) {
  throw new Error(`Missing ${manifestPath}`);
}

const files = [
  "config/token.json",
  "metadata/metadata.json",
  manifestPath,
  path.join(dir, "final-state.txt"),
].filter(fs.existsSync);

const hashes = Object.fromEntries(
  files.map((file) => [
    file,
    crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"),
  ]),
);

const proof = {
  schema: "powerchain.pwrc.release.v1",
  version: "1.0.0",
  cluster,
  generatedAt: new Date().toISOString(),
  hashes,
};

const canonical = JSON.stringify(proof);
const releaseSha256 = crypto.createHash("sha256").update(canonical).digest("hex");
const output = { ...proof, releaseSha256 };

fs.mkdirSync("proofs", { recursive: true });
fs.writeFileSync(`proofs/${cluster}.release.json`, JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
