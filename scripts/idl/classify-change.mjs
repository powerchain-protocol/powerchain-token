import fs from "node:fs";

const baseline = JSON.parse(
  fs.readFileSync("idl/baseline/1.0.0.json", "utf8"),
);
const anchor = JSON.parse(
  fs.readFileSync("idl/anchor/pwrc_lock.expected.json", "utf8"),
);
const sui = JSON.parse(
  fs.readFileSync("idl/sui/wpwrc.interface.json", "utf8"),
);
const token = JSON.parse(
  fs.readFileSync("idl/anchor/pwrc_token.expected.json", "utf8"),
);

const breaking = [];
const additive = [];

const byName = (items) =>
  new Map(items.map((item) => [
    typeof item === "string" ? item : item.name,
    item,
  ]));

function compareNames(label, before, after) {
  const a = byName(before);
  const b = byName(after);

  for (const name of a.keys()) {
    if (!b.has(name)) breaking.push(`${label}:removed:${name}`);
  }
  for (const name of b.keys()) {
    if (!a.has(name)) additive.push(`${label}:added:${name}`);
  }
}

compareNames(
  "anchor.instructions",
  baseline.anchor.instructions,
  anchor.instructions,
);
compareNames(
  "anchor.accounts",
  baseline.anchor.accounts,
  anchor.accounts,
);
compareNames(
  "anchor.events",
  baseline.anchor.events,
  anchor.events,
);
compareNames(
  "sui.entries",
  baseline.sui.entryFunctions,
  sui.modules.bridge.entryFunctions,
);
compareNames(
  "sui.events",
  baseline.sui.events,
  sui.modules.bridge.events ?? [],
);
compareNames(
  "anchorToken.instructions",
  baseline.anchorTokenVerifier.instructions,
  token.instructions,
);
compareNames(
  "anchorToken.events",
  baseline.anchorTokenVerifier.events,
  token.events,
);

const currentByName = byName(anchor.instructions);
for (const previous of baseline.anchor.instructions) {
  const current = currentByName.get(previous.name);
  if (!current) continue;

  const prevArgs = previous.args.map((arg) => arg.name);
  const curArgs = current.args.map((arg) => arg.name);
  if (JSON.stringify(prevArgs) !== JSON.stringify(curArgs)) {
    breaking.push(`anchor.args:${previous.name}`);
  }

  if (
    JSON.stringify(previous.accounts ?? []) !==
    JSON.stringify(current.accounts ?? [])
  ) {
    breaking.push(`anchor.accounts:${previous.name}`);
  }
}

if (sui.asset.decimals !== baseline.sui.asset.decimals) {
  breaking.push("sui.asset.decimals");
}
if (sui.asset.baseUnitFactor !== baseline.sui.asset.baseUnitFactor) {
  breaking.push("sui.asset.baseUnitFactor");
}
if (sui.asset.ratio !== baseline.sui.asset.ratio) {
  breaking.push("sui.asset.ratio");
}



if (
  token.canonicalRules.canonicalMint !==
  baseline.anchorTokenVerifier.canonicalRules.canonicalMint
) {
  breaking.push("anchorToken.canonicalMint");
}
if (
  token.canonicalRules.transferFeeBps !==
  baseline.anchorTokenVerifier.canonicalRules.transferFeeBps
) {
  breaking.push("anchorToken.transferFeeBps");
}
if (
  token.canonicalRules.maximumTransferFeeTokens !==
  baseline.anchorTokenVerifier.canonicalRules.maximumTransferFeeTokens
) {
  breaking.push("anchorToken.maximumTransferFeeTokens");
}

const classification =
  breaking.length > 0
    ? "breaking"
    : additive.length > 0
      ? "additive"
      : "compatible";

const result = {
  ok: classification !== "breaking",
  version: "1.0.0",
  classification,
  breaking,
  additive,
};

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync(
  "reports/idl-change-classification.json",
  `${JSON.stringify(result, null, 2)}\n`,
);

console.log(JSON.stringify(result, null, 2));
if (classification === "breaking") process.exit(1);
