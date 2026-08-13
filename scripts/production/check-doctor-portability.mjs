import fs from "node:fs";

const failures = [];
const doctor =
  fs.readFileSync(
    "scripts/doctor.sh",
    "utf8",
  );
const lib =
  fs.readFileSync(
    "scripts/lib.sh",
    "utf8",
  );

if (
  doctor.includes("need sha256sum") ||
  doctor.includes("pnpm sha256sum")
) {
  failures.push(
    "doctor:gnu-sha256sum-hard-requirement",
  );
}

for (const fallback of [
  "sha256sum",
  "shasum",
  "openssl",
]) {
  if (!lib.includes(fallback)) {
    failures.push(
      `lib:missing-fallback:${fallback}`,
    );
  }
}

if (!doctor.includes("need_sha256")) {
  failures.push("doctor:need_sha256");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  platforms: ["macOS", "Linux"],
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
