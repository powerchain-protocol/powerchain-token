import fs from "node:fs";

const failures = [];

const expected = JSON.parse(
  fs.readFileSync(
    "idl/anchor/pwrc_token.expected.json",
    "utf8",
  ),
);

const source = fs.readFileSync(
  "programs/token/src/lib.rs",
  "utf8",
);

const start = source.indexOf("#[program]");
const accountStart =
  source.indexOf("#[derive(Accounts)]");

const programSource =
  start >= 0 && accountStart > start
    ? source.slice(start, accountStart)
    : "";

const sourceFunctions = [
  ...programSource.matchAll(
    /pub fn\s+([a-zA-Z0-9_]+)\s*\(/g,
  ),
].map((match) => match[1]);

const expectedFunctions =
  expected.instructions.map(
    (instruction) =>
      instruction.sourceName,
  );

if (
  JSON.stringify(sourceFunctions.sort()) !==
  JSON.stringify(expectedFunctions.sort())
) {
  failures.push("token-idl:instruction-drift");
}

for (const event of expected.events) {
  if (
    !source.includes(
      `pub struct ${event}`,
    )
  ) {
    failures.push(
      `token-idl:event:${event}`,
    );
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  program: "pwrc_token",
  failures,
}, null, 2));

if (failures.length) process.exit(1);
