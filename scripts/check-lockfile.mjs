import fs from "node:fs";
const mainnet = (process.env.PWRC_CLUSTER ?? "") === "mainnet-beta";
const exists = fs.existsSync("pnpm-lock.yaml");
console.log(JSON.stringify({ lockfile: exists ? "pnpm-lock.yaml" : null, mainnet }, null, 2));
if (mainnet && !exists) {
  console.error("Mainnet release blocked: generate and review pnpm-lock.yaml before deployment.");
  process.exit(2);
}
