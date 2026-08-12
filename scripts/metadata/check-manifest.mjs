import fs from "node:fs";
import crypto from "node:crypto";

const manifest =
  JSON.parse(
    fs.readFileSync(
      "metadata/manifest.sha256.json",
      "utf8",
    ),
  );

const failures = [];
const files =
  manifest.files ?? {};

for (
  const [name, expected]
  of Object.entries(files)
) {
  const file =
    `metadata/${name}`;

  if (!fs.existsSync(file)) {
    failures.push(
      `missing:${file}`,
    );
    continue;
  }

  const actual = crypto
    .createHash("sha256")
    .update(
      fs.readFileSync(file),
    )
    .digest("hex");

  if (actual !== expected) {
    failures.push(
      `hash:${file}`,
    );
  }
}

if (
  manifest.version !== "1.0.0"
) {
  failures.push(
    "manifest:version",
  );
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  algorithm: "sha256",
  files: Object.keys(files).length,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
