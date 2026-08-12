import fs from "node:fs";
import crypto from "node:crypto";
import { canonicalJson } from "../src/canonical-json.js";

const file = process.argv[2];
if (!file || !fs.existsSync(file)) throw new Error(`Missing journal: ${file}`);
const rows = fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
let previous = null;
for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const { entrySha256, ...payload } = row;
  if (payload.sequence !== i + 1) throw new Error(`Journal sequence mismatch at ${i + 1}`);
  if (payload.previousSha256 !== previous) throw new Error(`Journal chain mismatch at ${i + 1}`);
  const expected = crypto.createHash("sha256").update(canonicalJson(payload)).digest("hex");
  if (entrySha256 !== expected) throw new Error(`Journal hash mismatch at ${i + 1}`);
  previous = entrySha256;
}
console.log(JSON.stringify({ verified: true, entries: rows.length, headSha256: previous }, null, 2));
