import fs from "node:fs"; const failures=[]; const p=JSON.parse(fs.readFileSync("config/security/token2022-profile.json","utf8"));
for(const e of ["MetadataPointer","TokenMetadata"])if(!p.requiredExtensions.includes(e))failures.push(`required:${e}`);
for(const e of ["TransferFeeConfig","PermanentDelegate","MintCloseAuthority","DefaultAccountState","InterestBearingConfig","ScaledUiAmount","Pausable","NonTransferable"])if(!p.forbiddenExtensions.includes(e))failures.push(`forbidden:${e}`);
console.log(JSON.stringify({ok:!failures.length,version:"1.0.0",requiredExtensions:["MetadataPointer","TokenMetadata"],failures},null,2)); if(failures.length)process.exit(1);
