import fs from "node:fs";

const failures = [];
const results = [];

for (const program of [
  "pwrc_lock",
  "pwrc_token",
]) {
  const generated =
    `idl/generated/${program}.json`;

  if (!fs.existsSync(generated)) {
    failures.push(
      `${program}:generated-idl-missing`,
    );
    continue;
  }

  const idl = JSON.parse(
    fs.readFileSync(
      generated,
      "utf8",
    ),
  );

  const seen =
    new Set();

  let checked = 0;

  for (
    const instruction of
    idl.instructions ?? []
  ) {
    const discriminator =
      instruction.discriminator;

    if (
      !Array.isArray(
        discriminator,
      ) ||
      discriminator.length !== 8 ||
      discriminator.some(
        (value) =>
          !Number.isInteger(value) ||
          value < 0 ||
          value > 255,
      )
    ) {
      failures.push(
        `${program}:${instruction.name}:discriminator`,
      );
      continue;
    }

    const key =
      discriminator.join(",");

    if (seen.has(key)) {
      failures.push(
        `${program}:duplicate-discriminator:${instruction.name}`,
      );
    }

    seen.add(key);
    checked += 1;
  }

  results.push({
    program,
    checked,
  });
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  programs: results,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(2);
}
