const {test}=require('node:test'),assert=require('node:assert/strict');const http=require('node:http');const {createServer}=require('../scripts/serve.cjs');
test('HTTP serves app/config, rejects traversal and malformed URLs, returns honest 404',async t=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>server.close());
 const base='http://127.0.0.1:'+server.address().port;
 const home=await fetch(base+'/');assert.equal(home.status,200);assert.match(await home.text(),/统一交通分析平台/);
 const config=await fetch(base+'/config.local.js');assert.equal(config.status,200);assert.match(config.headers.get('content-type'),/javascript/);
 assert.equal((await fetch(base+'/missing')).status,404);assert.equal((await fetch(base+'/%zz')).status,400);
 const status=await new Promise((resolve,reject)=>http.get({hostname:'127.0.0.1',port:server.address().port,path:'/%2e%2e/README.md'},r=>{r.resume();resolve(r.statusCode);}).on('error',reject));assert.equal(status,400);
});
