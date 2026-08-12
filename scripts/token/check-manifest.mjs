import fs from "node:fs";

const failures = [];
const cargo = fs.readFileSync(
  "Cargo.toml",
  "utf8",
);
const programCargo = fs.readFileSync(
  "programs/token/Cargo.toml",
  "utf8",
);
const anchor = fs.readFileSync(
  "Anchor.toml",
  "utf8",
);
const source = fs.readFileSync(
  "programs/token/src/lib.rs",
  "utf8",
);

if (!cargo.includes('"programs/token"')) {
  failures.push("workspace:token-program");
}
if (
  !programCargo.includes(
    'name = "pwrc-token"',
  )
) {
  failures.push("token-cargo:name");
}
if (
  !programCargo.includes(
    '"anchor-lang/idl-build"',
  )
) {
  failures.push("token-cargo:idl-build");
}

const sourceId =
  /declare_id!\("([^"]+)"\)/
    .exec(source)?.[1] ?? null;
const anchorId =
  /pwrc_token\s*=\s*"([^"]+)"/
    .exec(anchor)?.[1] ?? null;

if (!sourceId) {
  failures.push(
    "token-source:program-id",
  );
}
if (!anchorId) {
  failures.push(
    "anchor:pwrc-token",
  );
}
if (
  sourceId &&
  anchorId &&
  sourceId !== anchorId
) {
  failures.push(
    "token-program-id:mismatch",
  );
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  localProgramId: sourceId,
  mainnetProgramIdClaimed: false,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
