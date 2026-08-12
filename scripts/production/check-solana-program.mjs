import fs from "node:fs";
const failures=[]; const s=fs.readFileSync("programs/pwrc-lock/src/lib.rs","utf8");
for(const x of ["pub const PWRC_DECIMALS: u8 = 9;","pub const WPWRC_DECIMALS: u8 = 9;","pub const PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT: u64 = 1;","MintAuthorityMustBeRevoked","FreezeAuthorityMustBeNull","VaultMustStartEmpty","SourceCannotBeVault","DestinationCannotBeVault","RecipientOwnerMismatch","sui_tx_digest","sui_checkpoint","cancel_operator_rotation","cancel_governor_rotation"]) if(!s.includes(x)) failures.push(`missing:${x}`);
if(s.includes("AmountNotRepresentableOnSui")) failures.push("stale-6-decimal-error");
if(s.includes("/ PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT")) failures.push("stale-amount-conversion");
console.log(JSON.stringify({ok:!failures.length,version:"1.0.0",activeProgram:"pwrc-lock",failures},null,2)); if(failures.length)process.exit(1);
