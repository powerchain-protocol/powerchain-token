import fs from "node:fs";
import path from "node:path";
const [cluster, status] = process.argv.slice(2);
const p = path.join("deployments", cluster, "deployment.json");
if (!fs.existsSync(p)) process.exit(0);
const doc = JSON.parse(fs.readFileSync(p, "utf8"));
doc.status = status;
doc.updatedAt = new Date().toISOString();
fs.writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
