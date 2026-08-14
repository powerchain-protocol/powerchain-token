import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const host=process.env.PWRC_CLIENT_HOST??"127.0.0.1";
const port=Number(process.env.PWRC_CLIENT_PORT??"3000");
const apiTarget=process.env.PWRC_CLIENT_API_URL??"http://127.0.0.1:8787";
const publicDir=path.resolve("apps/client/public");

const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url??"/",`http://${host}:${port}`);
  if(url.pathname.startsWith("/api/")){
    const target=new URL(url.pathname+url.search,apiTarget);
    const response=await fetch(target);
    res.writeHead(response.status,Object.fromEntries(response.headers.entries()));
    res.end(Buffer.from(await response.arrayBuffer()));
    return;
  }
  const file=url.pathname==="/"?"index.html":url.pathname.replace(/^\//,"");
  const resolved=path.join(publicDir,file);
  if(!resolved.startsWith(publicDir)||!fs.existsSync(resolved)){
    res.writeHead(404);res.end("Not found");return;
  }
  const type=resolved.endsWith(".js")?"text/javascript":"text/html";
  res.writeHead(200,{"content-type":type});
  fs.createReadStream(resolved).pipe(res);
});

server.on("error",(error)=>{
  process.stderr.write(`PWRC_CLIENT_LISTEN_ERROR:${error.code??"UNKNOWN"}:${host}:${port}\n`);
  process.exitCode=1;
});

server.listen(port,host,()=>{
  process.stderr.write(JSON.stringify({timestamp:new Date().toISOString(),level:"info",component:"@powerchain/client",message:"client_started",host,port,apiTarget,version:"1.0.0"})+"\n");
});
