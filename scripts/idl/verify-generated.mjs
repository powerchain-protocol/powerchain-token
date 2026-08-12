import fs from "node:fs";
import crypto from "node:crypto";

const generated = "idl/generated/pwrc_lock.json";
if (!fs.existsSync(generated)) {
  console.error(
    "PWRC_GENERATED_IDL_MISSING: run `pnpm idl:build && pnpm idl:sync`",
  );
  process.exit(2);
}

const failures = [];
const expected = JSON.parse(
  fs.readFileSync("idl/anchor/pwrc_lock.expected.json", "utf8"),
);
const idl = JSON.parse(fs.readFileSync(generated, "utf8"));

const sorted = (values) => [...values].sort();
const sameSet = (a, b) =>
  JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));

if (idl.metadata?.name !== "pwrc_lock") failures.push("metadata:name");
if (idl.metadata?.version !== "1.0.0") failures.push("metadata:version");

const generatedInstructions = (idl.instructions ?? []).map((i) => i.name);
const expectedInstructions = expected.instructions.map((i) => i.name);
if (!sameSet(generatedInstructions, expectedInstructions)) {
  failures.push("instructions");
}

const byName = new Map((idl.instructions ?? []).map((i) => [i.name, i]));
for (const exp of expected.instructions) {
  const got = byName.get(exp.name);
  if (!got) continue;

  const gotArgs = (got.args ?? []).map((a) => a.name);
  const expArgs = exp.args.map((a) => a.name);
  if (JSON.stringify(gotArgs) !== JSON.stringify(expArgs)) {
    failures.push(`args:${exp.name}`);
  }

  const gotAccounts = (got.accounts ?? []).map((a) => a.name);
  if (JSON.stringify(gotAccounts) !== JSON.stringify(exp.accounts ?? [])) {
    failures.push(`accounts:${exp.name}`);
  }
}

const gotAccountTypes = (idl.accounts ?? []).map((a) => a.name);
if (!sameSet(gotAccountTypes, expected.accounts)) failures.push("account-types");

const gotEvents = (idl.events ?? []).map((e) => e.name);
if (!sameSet(gotEvents, expected.events)) failures.push("events");

const sha256 = crypto
  .createHash("sha256")
  .update(fs.readFileSync(generated))
  .digest("hex");

const result = {
  ok: failures.length === 0,
  version: "1.0.0",
  generated,
  sha256,
  failures,
};
fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync(
  "reports/idl-generated-verification.json",
  `${JSON.stringify(result, null, 2)}\n`,
);
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
