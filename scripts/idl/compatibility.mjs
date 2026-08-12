import fs from "node:fs";

const failures = [];
const breaking = [];
const additive = [];

const baseline = JSON.parse(
  fs.readFileSync("idl/baseline/1.0.0.json", "utf8"),
);
const currentAnchor = JSON.parse(
  fs.readFileSync("idl/anchor/pwrc_lock.expected.json", "utf8"),
);
const currentSui = JSON.parse(
  fs.readFileSync("idl/sui/wpwrc.interface.json", "utf8"),
);

const names = (items) =>
  new Set(items.map((item) =>
    typeof item === "string" ? item : item.name
  ));

function compareSet(label, previous, current) {
  const prev = names(previous);
  const now = names(current);

  for (const value of prev) {
    if (!now.has(value)) {
      breaking.push(`${label}:removed:${value}`);
    }
  }

  for (const value of now) {
    if (!prev.has(value)) {
      additive.push(`${label}:added:${value}`);
    }
  }
}

compareSet(
  "anchor.instructions",
  baseline.anchor.instructions,
  currentAnchor.instructions,
);
compareSet(
  "anchor.accounts",
  baseline.anchor.accounts,
  currentAnchor.accounts,
);
compareSet(
  "anchor.accountContexts",
  baseline.anchor.accountContexts,
  currentAnchor.accountContexts ?? [],
);
compareSet(
  "anchor.events",
  baseline.anchor.events,
  currentAnchor.events,
);
compareSet(
  "sui.entryFunctions",
  baseline.sui.entryFunctions,
  currentSui.modules.bridge.entryFunctions,
);
compareSet(
  "sui.events",
  baseline.sui.events,
  currentSui.modules.bridge.events ?? [],
);

// Compare existing Anchor instruction argument/account order exactly.
const currentByName = new Map(
  currentAnchor.instructions.map((item) => [item.name, item]),
);

for (const previous of baseline.anchor.instructions) {
  const current = currentByName.get(previous.name);
  if (!current) continue;

  const previousArgs =
    previous.args.map((arg) => arg.name);
  const currentArgs =
    current.args.map((arg) => arg.name);

  if (
    JSON.stringify(previousArgs) !==
    JSON.stringify(currentArgs)
  ) {
    breaking.push(
      `anchor.args-changed:${previous.name}`,
    );
  }

  if (
    JSON.stringify(previous.accounts ?? []) !==
    JSON.stringify(current.accounts ?? [])
  ) {
    breaking.push(
      `anchor.accounts-changed:${previous.name}`,
    );
  }
}

if (
  currentSui.asset.decimals !==
  baseline.sui.asset.decimals
) {
  breaking.push("sui.asset.decimals");
}
if (
  currentSui.asset.baseUnitFactor !==
  baseline.sui.asset.baseUnitFactor
) {
  breaking.push("sui.asset.baseUnitFactor");
}
if (
  currentSui.asset.ratio !==
  baseline.sui.asset.ratio
) {
  breaking.push("sui.asset.ratio");
}

if (
  baseline.version === "1.0.0" &&
  breaking.length &&
  baseline.policy
    .breakingChangesAllowedWithoutVersionChange === false
) {
  failures.push(
    "breaking IDL change detected without version change",
  );
}

const result = {
  ok: failures.length === 0,
  version: "1.0.0",
  baseline: "idl/baseline/1.0.0.json",
  breaking,
  additive,
  failures,
};

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync(
  "reports/idl-compatibility.json",
  `${JSON.stringify(result, null, 2)}\n`,
);

console.log(JSON.stringify(result, null, 2));

if (failures.length) process.exit(1);
