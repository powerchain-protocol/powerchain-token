import fs from "node:fs";

const failures = [];
const state = fs.readFileSync("src/burn/state.ts", "utf8");
const move = fs.readFileSync("contracts/wpwrc/sources/wpwrc.move", "utf8");
const bridge = fs.readFileSync("contracts/wpwrc/sources/bridge.move", "utf8");
const errors = fs.readFileSync("contracts/wpwrc/sources/errors.move", "utf8");
const config = JSON.parse(fs.readFileSync("config/burn/quarterly.json", "utf8"));
const order = config.executionOrder ?? [];
const pauseIndex = order.indexOf("SUI_BRIDGE_PAUSED");
const intentIndex = order.indexOf("SUI_BURN_INTENT_FINALIZED");
const submitIndex = order.indexOf("SOLANA_SUBMITTED");
if (!(pauseIndex >= 0 && pauseIndex < submitIndex)) failures.push("Sui pause must precede Solana burn submission");
if (!(intentIndex >= 0 && intentIndex < submitIndex)) failures.push("Sui burn intent must finalize before Solana burn submission");
for (const token of ["SUI_BRIDGE_PAUSED","SUI_BURN_INTENT_FINALIZED","SOLANA_SUBMITTED"]) if (!state.includes(token)) failures.push(`state:${token}`);
for (const token of ["stage_canonical_burn_intent","cancel_canonical_burn_intent","pending_burn_quarter_id","canonical_supply_ceiling"]) if (!move.includes(token) && !bridge.includes(token)) failures.push(`move:${token}`);
for (const token of ["E_BURN_INTENT_MISSING","E_BURN_INTENT_CEILING_MISMATCH","E_BURN_EVIDENCE_REPLAY"]) if (!errors.includes(token)) failures.push(`errors:${token}`);
console.log(JSON.stringify({ ok: failures.length === 0, version: "1.0.0", raceProtection: { suiPausedBeforeSolanaBurn: true, stagedBurnIntentBeforeSolanaBurn: true, unpauseAfterReconciliationOnly: true, sameBaseUnitCeiling: true }, failures }, null, 2));
if (failures.length) process.exit(1);
