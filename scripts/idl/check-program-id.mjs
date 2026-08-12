import fs from "node:fs";

const failures = [];

const rust = fs.readFileSync(
  "programs/pwrc-lock/src/lib.rs",
  "utf8",
);

const anchor = fs.readFileSync(
  "Anchor.toml",
  "utf8",
);

const sourceMatch =
  /declare_id!\("([^"]+)"\)/.exec(rust);

const anchorMatch =
  /\[programs\.localnet\][\s\S]*?pwrc_lock\s*=\s*"([^"]+)"/.exec(
    anchor,
  );

const sourceProgramId =
  sourceMatch?.[1] ?? null;
const anchorProgramId =
  anchorMatch?.[1] ?? null;

if (!sourceProgramId) {
  failures.push("source:declare-id-missing");
}
if (!anchorProgramId) {
  failures.push("anchor:localnet-program-id-missing");
}

if (
  sourceProgramId &&
  anchorProgramId &&
  sourceProgramId !== anchorProgramId
) {
  failures.push("program-id:mismatch");
}

if (
  sourceProgramId ===
  "11111111111111111111111111111111"
) {
  failures.push("program-id:system-program");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  sourceProgramId,
  anchorProgramId,
  mainnetProgramIdClaimed: false,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
