const fs=require("node:fs"),path=require("node:path");
let ts;
for(const c of [
 "/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript",
 "/usr/local/lib/node_modules/typescript",
 "/usr/lib/node_modules/typescript"
]){try{ts=require(c);break}catch{}}
if(!ts){try{ts=require("typescript")}catch{}}
if(!ts){console.log(JSON.stringify({ok:false,reason:"typescript-unavailable"}));process.exit(2)}
const root=process.argv[2],files=[];
(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(["node_modules","target"].includes(e.name))continue;const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(/\.(ts|tsx)$/.test(e.name))files.push(f)}})(root);
const failures=[];
for(const f of files){const text=fs.readFileSync(f,"utf8"),kind=f.endsWith(".tsx")?ts.ScriptKind.TSX:ts.ScriptKind.TS;const sf=ts.createSourceFile(f,text,ts.ScriptTarget.Latest,true,kind);for(const d of sf.parseDiagnostics)failures.push({file:path.relative(root,f),message:ts.flattenDiagnosticMessageText(d.messageText,"\n")})}
console.log(JSON.stringify({ok:!failures.length,files:files.length,failures},null,2));if(failures.length)process.exit(1);
