import fs from "node:fs";

const normalized =
  "idl/generated/wpwrc.modules.json";

if (!fs.existsSync(normalized)) {
  console.error(
    "WPWRC_NORMALIZED_MODULES_MISSING",
  );
  process.exit(2);
}

const failures = [];
const expected = JSON.parse(
  fs.readFileSync(
    "idl/sui/wpwrc.interface.json",
    "utf8",
  ),
);
const actual = JSON.parse(
  fs.readFileSync(normalized, "utf8"),
);

const bridge =
  actual.modules?.bridge ??
  actual.bridge ??
  null;

if (!bridge) {
  failures.push("normalized:bridge-module");
} else {
  const functions =
    bridge.entryFunctions ??
    bridge.functions ??
    [];

  const names = new Set(
    functions.map((item) =>
      typeof item === "string"
        ? item
        : item.name
    ),
  );

  for (
    const name of
    expected.modules.bridge.entryFunctions
  ) {
    if (!names.has(name)) {
      failures.push(
        `normalized:missing-entry:${name}`,
      );
    }
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  normalized,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
