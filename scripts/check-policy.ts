import fs from "node:fs";
import {
  PWRC_DECIMALS,
  PWRC_GENESIS_BASE_UNITS,
  PWRC_GENESIS_SUPPLY,
  TOKEN_2022_PROGRAM_ID,
  U64_MAX,
} from "../src/constants.js";

const config = JSON.parse(fs.readFileSync("config/token.json", "utf8"));
const errors: string[] = [];

if (config.version !== "1.0.0") errors.push("VERSION");
if (config.decimals !== PWRC_DECIMALS) errors.push("DECIMALS");
if (config.genesisSupply !== PWRC_GENESIS_SUPPLY.toString()) errors.push("SUPPLY");
if (config.genesisBaseUnits !== PWRC_GENESIS_BASE_UNITS.toString()) errors.push("BASE_UNITS");
if (config.tokenProgram !== TOKEN_2022_PROGRAM_ID) errors.push("PROGRAM");
if (PWRC_GENESIS_BASE_UNITS > U64_MAX) errors.push("U64_OVERFLOW");
if (JSON.stringify(config.allowedExtensions) !== JSON.stringify(["MetadataPointer","TokenMetadata"])) {
  errors.push("EXTENSIONS");
}
if (errors.length) {
  console.error("PWRC policy FAIL:", errors.join(", "));
  process.exit(1);
}
console.log("PWRC policy PASS");
console.log({
  version: "1.0.0",
  supply: PWRC_GENESIS_SUPPLY.toString(),
  decimals: PWRC_DECIMALS,
  baseUnits: PWRC_GENESIS_BASE_UNITS.toString(),
});
