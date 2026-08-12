import fs from "node:fs";
import { spawnSync } from "node:child_process";

const version = spawnSync("anchor", ["--version"], { encoding: "utf8" });
if (version.error || version.status !== 0) {
  throw new Error("IDL_TOOL_UNAVAILABLE:anchor");
}

const result = spawnSync("anchor", ["idl", "build", "-o", "target/idl"], {
  stdio: "inherit",
});
if (result.status !== 0) process.exit(result.status ?? 1);

if (!fs.existsSync("target/idl/pwrc_lock.json")) {
  throw new Error("PWRC_ANCHOR_IDL_NOT_GENERATED");
}
console.log("Generated target/idl/pwrc_lock.json");
