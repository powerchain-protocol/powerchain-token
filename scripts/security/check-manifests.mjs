import fs from "node:fs";

const failures = [];
const cargo = fs.readFileSync("Cargo.toml", "utf8");
const anchor = fs.readFileSync("Anchor.toml", "utf8");
const lockCargo = fs.readFileSync(
  "programs/pwrc-lock/Cargo.toml",
  "utf8",
);
const feeCargo = fs.readFileSync(
  "programs/pwrc-fees/Cargo.toml",
  "utf8",
);

if (!cargo.includes('"programs/pwrc-lock"')) {
  failures.push("cargo:pwrc-lock-missing");
}
if (!cargo.includes('"programs/pwrc-fees"')) {
  failures.push("cargo:deprecated-fee-exclude-missing");
}
if (!cargo.includes('anchor-lang = "=0.32.1"')) {
  failures.push("cargo:anchor-lang-pin");
}
if (!cargo.includes('anchor-spl = { version = "=0.32.1"')) {
  failures.push("cargo:anchor-spl-pin");
}
if (!cargo.includes("token_2022_extensions")) {
  failures.push("cargo:token2022-extension-validation-feature");
}
if (!anchor.includes("pwrc_lock =")) {
  failures.push("anchor:pwrc-lock");
}
if (anchor.includes("pwrc_fees =")) {
  failures.push("anchor:deprecated-pwrc-fees-present");
}
if (!lockCargo.includes("version.workspace = true")) {
  failures.push("pwrc-lock:workspace-version");
}
if (!feeCargo.includes('status = "deprecated-disabled"')) {
  failures.push("pwrc-fees:deprecation-metadata");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  cargoWorkspace: ["programs/pwrc-lock"],
  excludedPrograms: ["programs/pwrc-fees"],
  anchorPrograms: ["pwrc_lock"],
  failures,
}, null, 2));

if (failures.length) process.exit(1);
