import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];

const sorted = (values) => [...values].sort();
const sameSet = (a, b) =>
  JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));
const snakeToCamel = (value) =>
  value.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const sha256 = (file) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

const expected = JSON.parse(
  fs.readFileSync("idl/anchor/pwrc_lock.expected.json", "utf8"),
);
const sui = JSON.parse(
  fs.readFileSync("idl/sui/wpwrc.interface.json", "utf8"),
);

const rust = fs.readFileSync("programs/pwrc-lock/src/lib.rs", "utf8");
const moveBridge = fs.readFileSync(
  "contracts/wpwrc/sources/bridge.move",
  "utf8",
);
const moveCoin = fs.readFileSync(
  "contracts/wpwrc/sources/wpwrc.move",
  "utf8",
);

const programStart = rust.indexOf("#[program]");
const accountsStart = rust.indexOf("#[derive(Accounts)]");
if (programStart < 0 || accountsStart <= programStart) {
  failures.push("anchor-source:program-boundary");
}
const programSource =
  programStart >= 0 && accountsStart > programStart
    ? rust.slice(programStart, accountsStart)
    : "";

const rustSourceNames = [
  ...programSource.matchAll(/pub fn\s+([a-zA-Z0-9_]+)\s*\(/g),
].map((m) => m[1]);
const rustIdlNames = rustSourceNames.map(snakeToCamel);
const expectedIdlNames = expected.instructions.map((i) => i.name);
const expectedSourceNames = expected.instructions.map((i) => i.sourceName);

if (!sameSet(rustSourceNames, expectedSourceNames)) {
  failures.push("anchor-source:instruction-drift");
}
if (!sameSet(rustIdlNames, expectedIdlNames)) {
  failures.push("anchor-source:idl-name-drift");
}

const accountContexts = [
  ...rust.matchAll(
    /#\[derive\(Accounts\)\][\s\S]*?pub struct\s+([A-Z][A-Za-z0-9_]+)\s*<'info>/g,
  ),
].map((m) => m[1]);
if (!sameSet(accountContexts, expected.accountContexts ?? [])) {
  failures.push("anchor-source:account-context-drift");
}

const accountTypes = [
  ...rust.matchAll(
    /#\[account\]\s*#\[derive\(InitSpace\)\]\s*pub struct\s+([A-Z][A-Za-z0-9_]+)/g,
  ),
].map((m) => m[1]);
if (!sameSet(accountTypes, expected.accounts)) {
  failures.push("anchor-source:account-type-drift");
}

const eventTypes = [
  ...rust.matchAll(/#\[event\]\s*pub struct\s+([A-Z][A-Za-z0-9_]+)/g),
].map((m) => m[1]);
if (!sameSet(eventTypes, expected.events)) {
  failures.push("anchor-source:event-drift");
}

for (const token of [
  "PWRC_DECIMALS: u8 = 9",
  "WPWRC_DECIMALS: u8 = 9",
  "PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT: u64 = 1",
]) {
  if (!rust.includes(token)) failures.push(`anchor-source:rule:${token}`);
}

const moveEntries = [
  ...moveBridge.matchAll(/public entry fun\s+([a-zA-Z0-9_]+)\s*\(/g),
].map((m) => m[1]);
if (!sameSet(moveEntries, sui.modules.bridge.entryFunctions)) {
  failures.push("sui-source:entry-drift");
}

const moveEvents = [
  ...moveBridge.matchAll(
    /public struct\s+([A-Z][A-Za-z0-9_]+)\s+has\s+copy,\s*drop/g,
  ),
].map((m) => m[1]);
if (!sameSet(moveEvents, sui.modules.bridge.events ?? [])) {
  failures.push("sui-source:event-drift");
}

if (!moveCoin.includes("public const DECIMALS: u8 = 9;")) {
  failures.push("sui-source:decimals");
}
if (!moveCoin.includes("treasury_cap: TreasuryCap<WPWRC>")) {
  failures.push("sui-source:treasury-cap-encapsulation");
}

const result = {
  ok: failures.length === 0,
  version: "1.0.0",
  anchor: {
    instructions: sorted(rustIdlNames),
    accountContexts: sorted(accountContexts),
    accountTypes: sorted(accountTypes),
    events: sorted(eventTypes),
  },
  sui: {
    entries: sorted(moveEntries),
    events: sorted(moveEvents),
  },
  sourceHashes: {
    "programs/pwrc-lock/src/lib.rs": sha256("programs/pwrc-lock/src/lib.rs"),
    "contracts/wpwrc/sources/wpwrc.move":
      sha256("contracts/wpwrc/sources/wpwrc.move"),
    "contracts/wpwrc/sources/bridge.move":
      sha256("contracts/wpwrc/sources/bridge.move"),
  },
  failures,
};

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync(
  "reports/idl-source-drift.json",
  `${JSON.stringify(result, null, 2)}\n`,
);

console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
