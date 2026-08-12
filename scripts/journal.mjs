import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { canonicalJson } from "../src/canonical-json.js";

const [cluster, stage, operation, signature = ""] = process.argv.slice(2);
if (!cluster || !stage || !operation) throw new Error("cluster, stage and operation required");
const dir = path.join("deployments", cluster);
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, "journal.jsonl");
const rows = fs.existsSync(file)
  ? fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line))
  : [];
const previousSha256 = rows.at(-1)?.entrySha256 ?? null;
const payload = {
  schema: "powerchain.pwrc.journal.v1",
  version: "1.0.0",
  sequence: rows.length + 1,
  cluster,
  stage,
  operation,
  signature: signature || null,
  previousSha256,
  recordedAt: new Date().toISOString(),
};
const entrySha256 = crypto.createHash("sha256").update(canonicalJson(payload)).digest("hex");
fs.appendFileSync(file, JSON.stringify({ ...payload, entrySha256 }) + "\n");
console.log(entrySha256);
