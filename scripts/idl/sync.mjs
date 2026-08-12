import fs from "node:fs";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const source = "target/idl/pwrc_lock.json";
const destination = "idl/generated/pwrc_lock.json";

if (!fs.existsSync(source)) {
  throw new Error("PWRC_ANCHOR_IDL_SOURCE_MISSING: run `pnpm idl:build` first");
}

const idl = JSON.parse(fs.readFileSync(source, "utf8"));
if (idl.metadata?.name !== "pwrc_lock") {
  throw new Error("PWRC_ANCHOR_IDL_NAME_INVALID");
}
if (idl.metadata?.version !== "1.0.0") {
  throw new Error("PWRC_ANCHOR_IDL_VERSION_INVALID");
}

fs.mkdirSync("idl/generated", { recursive: true });
const canonical = `${JSON.stringify(idl, null, 2)}\n`;
fs.writeFileSync(destination, canonical);

const sha256 = crypto.createHash("sha256").update(canonical).digest("hex");
fs.writeFileSync("idl/generated/pwrc_lock.sha256", `${sha256}  pwrc_lock.json\n`);

console.log(JSON.stringify({ok:true,version:"1.0.0",destination,sha256},null,2));


const verify = spawnSync(
  process.execPath,
  ["scripts/idl/verify-generated.mjs"],
  { stdio: "inherit" },
);
if (verify.status !== 0) {
  process.exit(verify.status ?? 1);
}
