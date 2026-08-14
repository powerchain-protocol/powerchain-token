import fs from "node:fs";
const stack=JSON.parse(fs.readFileSync("config/stack.json","utf8"));
const failures=[];
for(const [name,port] of [["api",8787],["client",3000],["docs",3002]]){
  if(stack.apps?.[name]?.port!==port)failures.push(`port:${name}`);
}
if(stack.security?.mainnetFailClosed!==true)failures.push("mainnet-fail-closed");
if(stack.security?.blindMonetaryWriteRetry!==false)failures.push("blind-write-retry");
console.log(JSON.stringify({ok:!failures.length,version:"1.0.0",failures},null,2));
if(failures.length)process.exit(1);
