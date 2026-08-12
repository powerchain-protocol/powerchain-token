import { readFileSync } from "node:fs";
const token = JSON.parse(readFileSync("config/token.json", "utf8"));
const profile = JSON.parse(readFileSync("config/security/token2022-profile.json", "utf8"));
if (token.transferFee?.enabled !== false || token.transferFee?.basisPoints !== 0) throw new Error("PWRC_TRANSFER_FEE_MUST_BE_DISABLED");
if (!profile.forbiddenExtensions.includes("TransferFeeConfig")) throw new Error("PWRC_TRANSFER_FEE_EXTENSION_MUST_BE_FORBIDDEN");
console.log(JSON.stringify({ ok: true, version: "1.0.0", transferFeeBps: 0 }, null, 2));
