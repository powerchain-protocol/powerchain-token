import fs from "node:fs";

const failures = [];
const move = fs.readFileSync(
  "contracts/wpwrc/sources/wpwrc.move",
  "utf8",
);
const bridgeMove = fs.readFileSync(
  "contracts/wpwrc/sources/bridge.move",
  "utf8",
);
const config = JSON.parse(
  fs.readFileSync("config/sui/wpwrc.json", "utf8"),
);

const initStart = move.indexOf("fun init(");
const initEnd = move.indexOf("public fun decimals()", initStart);
const initBody =
  initStart >= 0 && initEnd > initStart
    ? move.slice(initStart, initEnd)
    : "";

if (!initBody) failures.push("Move init missing");
if (initBody.includes("coin::mint(")) failures.push("genesis mint detected");
if (!bridgeMove.includes("mint_from_bridge")) failures.push("bridge mint missing");
if (config.wrapped.genesisSupplyBaseUnits !== "0") failures.push("genesis config");
if (config.wrapped.decimals !== 9) failures.push("decimals");
if (config.wrapped.mintPolicy !== "bridge-only") failures.push("mint policy");

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  asset: "wPWRC",
  decimals: 9,
  genesisSupplyBaseUnits: "0",
  issuance: "bridge-only",
  failures,
}, null, 2));

if (failures.length) process.exit(1);
