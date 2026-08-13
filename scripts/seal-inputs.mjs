import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { canonicalJson } from "../packages/protocol/src/canonical-json.js";

const cluster = process.env.PWRC_CLUSTER ?? "devnet";
const files = ["config/token.json", "config/toolchain.json", "metadata/metadata.json"];
const hashes = Object.fromEntries(files.map((file) => [file, crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")]));
const payload = { schema: "powerchain.pwrc.inputs.v1", version: "1.0.0", cluster, hashes };
const sha256 = crypto.createHash("sha256").update(canonicalJson(payload)).digest("hex");
const out = path.join("deployments", cluster);
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "inputs.lock.json"), JSON.stringify({ ...payload, sha256 }, null, 2) + "\n");
console.log(sha256);
