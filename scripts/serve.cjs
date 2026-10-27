const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const {localConfig}=require('./config.cjs');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
function createServer(root=path.resolve(__dirname,'../public')){
  return http.createServer(async(req,res)=>{
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{Allow:'GET, HEAD'});return res.end();}
    try{
      const pathname=decodeURIComponent(req.url.split('?')[0]);
      if(pathname.includes('\0')||pathname.split(/[\\/]/).some(p=>p==='..')){res.writeHead(400);return res.end();}
      const relative=pathname.endsWith('/')?pathname+'index.html':pathname;
      let bytes;
      if(relative==='/config.local.js')bytes=Buffer.from(localConfig(root));
      else bytes=await fs.readFile(path.join(root,relative));
      res.writeHead(200,{'Content-Type':mime[path.extname(relative)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
      res.end(req.method==='HEAD'?undefined:bytes);
    }catch(error){res.writeHead(error instanceof URIError?400:(['ENOENT','EISDIR','ENOTDIR'].includes(error.code)?404:500));res.end();}
  });
}
if(require.main===module){
 const position=process.argv.indexOf('--port');const port=Number(position>=0?process.argv[position+1]:(process.env.PORT||8080));
 const rootPosition=process.argv.indexOf('--root');const root=rootPosition>=0?path.resolve(process.argv[rootPosition+1]):undefined;
 createServer(root).listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`Roadnet ready: http://${process.env.HOST||'127.0.0.1'}:${port}`));
}
module.exports={createServer};
