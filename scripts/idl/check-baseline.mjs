import fs from "node:fs";
import crypto from "node:crypto";

const baseline =
  "idl/baseline/1.0.0.json";
const checksum =
  "idl/baseline/1.0.0.sha256";

const failures = [];

if (!fs.existsSync(baseline)) {
  failures.push("baseline:missing");
}
if (!fs.existsSync(checksum)) {
  failures.push("baseline:checksum-missing");
}

let expected = null;
let actual = null;

if (!failures.length) {
  expected =
    fs.readFileSync(checksum, "utf8")
      .trim()
      .split(/\s+/)[0];

  actual = crypto
    .createHash("sha256")
    .update(fs.readFileSync(baseline))
    .digest("hex");

  if (!/^[a-f0-9]{64}$/i.test(expected)) {
    failures.push("baseline:checksum-invalid");
  }

  if (expected !== actual) {
    failures.push("baseline:checksum-mismatch");
  }

  const data = JSON.parse(
    fs.readFileSync(baseline, "utf8"),
  );

  if (data.version !== "1.0.0") {
    failures.push("baseline:version");
  }

  if (
    data.policy
      ?.breakingChangesAllowedWithoutVersionChange
      !== false
  ) {
    failures.push(
      "baseline:breaking-change-policy",
    );
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  baseline,
  expectedSha256: expected,
  actualSha256: actual,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
