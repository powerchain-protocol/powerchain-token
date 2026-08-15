import fs from "node:fs";
const stack=JSON.parse(fs.readFileSync("config/stack.json","utf8"));
const failures=[];
for(const [name,port] of [["api",8787],["client",3000],["docs",3002]]){
  if(stack.apps?.[name]?.port!==port)failures.push(`port:${name}`);
}
if(stack.security?.mainnetFailClosed!==true)failures.push("mainnet-fail-closed");
if(stack.security?.blindMonetaryWriteRetry!==false)failures.push("blind-write-retry");
for (const [key,value] of Object.entries({
  node:"26.5.1",
  nvm:"0.40.6",
  npm:"11.17.0",
  pnpm:"11.18.0",
  typescript:"7.0.2",
})) {
  if(stack.toolchain?.[key]!==value)failures.push(`toolchain:${key}`);
}
console.log(JSON.stringify({ok:!failures.length,version:"1.0.0",failures},null,2));
if(failures.length)process.exit(1);
