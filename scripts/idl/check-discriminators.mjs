import fs from "node:fs";

const generated =
  "idl/generated/pwrc_lock.json";

if (!fs.existsSync(generated)) {
  console.error(
    "PWRC_GENERATED_IDL_MISSING",
  );
  process.exit(2);
}

const failures = [];
const idl = JSON.parse(
  fs.readFileSync(generated, "utf8"),
);

const seen = new Set();

for (const instruction of idl.instructions ?? []) {
  const discriminator =
    instruction.discriminator;

  if (
    !Array.isArray(discriminator) ||
    discriminator.length !== 8 ||
    discriminator.some(
      (value) =>
        !Number.isInteger(value) ||
        value < 0 ||
        value > 255,
    )
  ) {
    failures.push(
      `instruction:${instruction.name}:discriminator`,
    );
    continue;
  }

  const key = discriminator.join(",");
  if (seen.has(key)) {
    failures.push(
      `duplicate-discriminator:${instruction.name}`,
    );
  }
  seen.add(key);
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  generated,
  checked:
    (idl.instructions ?? []).length,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
