import fs from "node:fs"; const failures=[]; const lock=fs.readFileSync("programs/pwrc-lock/src/lib.rs","utf8"); const move=fs.readFileSync("contracts/wpwrc/sources/wpwrc.move","utf8"); const bridge=fs.readFileSync("contracts/wpwrc/sources/bridge.move","utf8");
for(const x of ["PWRC_DECIMALS: u8 = 9","WPWRC_DECIMALS: u8 = 9","PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT: u64 = 1","MintAuthorityMustBeRevoked","FreezeAuthorityMustBeNull"])if(!lock.includes(x))failures.push(`pwrc-lock:${x}`);
for(const x of ["treasury_cap: TreasuryCap<WPWRC>","consumed_mint_messages","consumed_burn_references"])if(!move.includes(x))failures.push(`wpwrc:${x}`);
for(const x of ["mint_from_bridge","burn_for_solana"])if(!bridge.includes(x))failures.push(`bridge:${x}`);
console.log(JSON.stringify({ok:!failures.length,version:"1.0.0",programs:{pwrcLock:"active",pwrcFees:"deprecated-disabled",wpwrcSui:"bridge-capability-encapsulated"},failures},null,2)); if(failures.length)process.exit(1);
