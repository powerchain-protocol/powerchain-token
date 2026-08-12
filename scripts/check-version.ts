import fs from "node:fs";
const p = JSON.parse(fs.readFileSync("package.json", "utf8"));
if (p.version !== "1.0.0") throw new Error(`PWRC version must remain 1.0.0, got ${p.version}`);
const cfg = JSON.parse(fs.readFileSync("config/token.json", "utf8"));
if (cfg.version !== "1.0.0") throw new Error(`Config version must remain 1.0.0`);
console.log("PWRC VERSION LOCK PASS: 1.0.0");
