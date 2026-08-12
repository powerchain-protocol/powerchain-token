import fs from "node:fs";
import { PublicKey } from "@solana/web3.js";
import {
  PWRC_FEE_COLLECTOR_OWNER,
  PWRC_PROTOCOL_FEE_BPS,
  PWRC_MIN_FEE_BEARING_BASE_UNITS,
  quoteProtocolFee,
} from "../src/fees.js";

const config = JSON.parse(fs.readFileSync("config/fees.json", "utf8"));
const key = new PublicKey(PWRC_FEE_COLLECTOR_OWNER);

if (key.toBase58() !== "FeeszhrKKEsvxr1kg8LDtPx6BLcEbYHiAThYaxajNhqy") throw new Error("PWRC_FEE_COLLECTOR_INVALID");
if (PWRC_PROTOCOL_FEE_BPS !== 250n) throw new Error("PWRC_FEE_BPS_INVALID");
if (config.protocolFee.feeCollectorOwner !== "FeeszhrKKEsvxr1kg8LDtPx6BLcEbYHiAThYaxajNhqy") throw new Error("PWRC_FEE_CONFIG_OWNER_MISMATCH");
if (config.protocolFee.basisPoints !== 250) throw new Error("PWRC_FEE_CONFIG_BPS_MISMATCH");
if (config.decimals !== 9) throw new Error("PWRC_FEE_DECIMALS_MISMATCH");
if (PWRC_MIN_FEE_BEARING_BASE_UNITS !== 40n) throw new Error("PWRC_FEE_MINIMUM_MISMATCH");

const quote = quoteProtocolFee(100_000_000_000n);
if (quote.feeBaseUnits !== 2_500_000_000n) throw new Error("PWRC_FEE_QUOTE_MISMATCH");
if (quote.netBaseUnits !== 97_500_000_000n) throw new Error("PWRC_NET_QUOTE_MISMATCH");

console.log("PWRC FEE POLICY PASS");
console.log({
  feeCollectorOwner: PWRC_FEE_COLLECTOR_OWNER,
  basisPoints: Number(PWRC_PROTOCOL_FEE_BPS),
  percentage: "2.5%",
  decimals: 9,
});
