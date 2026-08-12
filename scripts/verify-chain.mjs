import { execFileSync } from "node:child_process";
import fs from "node:fs";

const mint = process.argv[2];
const expectedStatus = process.argv[3] ?? "genesis";
if (!mint) throw new Error("mint required");

const display = execFileSync("spl-token", ["display", mint], { encoding: "utf8" });
const accountRaw = execFileSync("solana", ["account", mint, "--output", "json"], { encoding: "utf8" });
const account = JSON.parse(accountRaw);

function field(name) {
  const m = display.match(new RegExp(`^\\s*${name}:\\s*(.+)$`, "mi"));
  return m?.[1]?.trim() ?? null;
}
const supply = field("Supply");
const decimals = field("Decimals");
const program = field("Program");
const mintAuthority = field("Mint authority");
const freezeAuthority = field("Freeze authority");
const errors = [];
if (program !== "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb") errors.push(`PROGRAM:${program}`);
if (account.account?.owner !== "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb") errors.push(`RAW_OWNER:${account.account?.owner}`);
if (supply !== "18446000000000000000") errors.push(`RAW_SUPPLY:${supply}`);
if (decimals !== "9") errors.push(`DECIMALS:${decimals}`);
if (freezeAuthority && freezeAuthority !== "(not set)") errors.push(`FREEZE_AUTHORITY:${freezeAuthority}`);
if (expectedStatus === "finalized" && mintAuthority && mintAuthority !== "(not set)") errors.push(`MINT_AUTHORITY:${mintAuthority}`);
if (expectedStatus === "genesis" && (!mintAuthority || mintAuthority === "(not set)")) errors.push("MINT_AUTHORITY_ALREADY_REVOKED");

const result = { mint, expectedStatus, program, rawOwner: account.account?.owner ?? null, supplyBaseUnits: supply, decimals, mintAuthority, freezeAuthority, errors, verified: errors.length === 0 };
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(2);
