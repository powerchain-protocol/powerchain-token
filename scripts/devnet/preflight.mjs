import fs from "node:fs";
import { spawnSync } from "node:child_process";
const run = spawnSync(process.execPath, ["scripts/devnet/status.mjs"], { stdio: "inherit" });
if (run.status !== 0) process.exit(run.status ?? 1);
const report = JSON.parse(fs.readFileSync("reports/devnet-status.json", "utf8"));
if (!report.deploymentReady) {
  console.error(`Devnet preflight blocked: ${report.blockers.join(",")}`);
  process.exit(1);
}
