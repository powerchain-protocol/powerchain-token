import fs from "node:fs";

const source = fs.readFileSync("programs/pwrc-fees/src/lib.rs", "utf8");
const programs = JSON.parse(fs.readFileSync("config/programs.json", "utf8"));
const fees = JSON.parse(fs.readFileSync("config/fees.json", "utf8"));

const required = [
  "PWRC_PROTOCOL_FEE_BPS: u16 = 250",
  "PWRC_DECIMALS: u8 = 9",
  "MIN_GROSS_AMOUNT_BASE_UNITS: u64 = 40",
  "transfer_with_fee",
  "fee-receipt",
  "pending_authority",
  "total_fee_base_units",
  "Token2022Required",
];
const missing = required.filter((item) => !source.includes(item));
if (missing.length) throw new Error(`PWRC program static policy missing: ${missing.join(", ")}`);
if (fees.protocolFee.basisPoints !== 250) throw new Error("PWRC fee bps mismatch");
if (fees.protocolFee.decimals !== 9) throw new Error("PWRC fee decimals mismatch");
if (fees.protocolFee.minimumGrossBaseUnits !== "40") throw new Error("PWRC min fee amount mismatch");
if (programs.powerchain.pwrcFees.devnetProgramId !== null) throw new Error("Unexpected claimed devnet program id");
if (programs.powerchain.pwrcFees.mainnetProgramId !== null) throw new Error("Unexpected claimed mainnet program id");
console.log("PWRC PROGRAM STATIC POLICY PASS");
