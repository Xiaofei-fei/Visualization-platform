const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve('public');
function data(files,expression){return JSON.parse(vm.runInNewContext(files.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n')+';JSON.stringify('+expression+')'));}
test('all active entry links and configured scripts resolve within the site',()=>{
 const profiles=JSON.parse(fs.readFileSync(path.join(root,'app/profiles.json')));
 for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  for(const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
   if(url==='config.local.js')continue;
   assert.ok(!url.startsWith('/')&&!url.includes('..'),`${file}: portable path ${url}`);
   assert.ok(fs.existsSync(path.join(root,url)),`${file}: missing ${url}`);
  }
 }
 for(const profile of Object.values(profiles))for(const file of [...profile.data,...Object.values(profile.datasets||{}).flat()])assert.ok(fs.existsSync(path.join(root,file)),file);
});
test('both risk datasets retain their original distinct metrics and valid graph references',()=>{
 const profile=JSON.parse(fs.readFileSync(path.join(root,'app/profiles.json'))).risk;
 for(const [version,expected] of [['v1',1234],['v2',1702]]){
  const value=data([...profile.data,...profile.datasets[version]],'{list:liList,metrics:beforeList,trees:nrc_trees,events:incid_info,speeds:sp_evolve,nodes}');
  assert.equal(value.list.length,346);assert.equal(value.metrics[9].congestionLength,expected);
  for(const item of value.list){
   assert.ok(value.metrics.some(metric=>String(metric.rank_no)===String(item.id)));
   assert.ok(value.events[item.id]);assert.equal(value.trees[item.id].length,value.speeds[item.id].length);
   for(const node of value.trees[item.id])assert.ok(value.nodes[node],`missing geometry ${node}`);
  }
 }
});
test('all optimization choices have real geometry and before/after metrics',()=>{
 const p=JSON.parse(fs.readFileSync(path.join(root,'app/profiles.json'))).optimization;
 const value=data(p.data,'{liList,beforeList,route,afterData}');assert.equal(value.liList.length,13);
 for(const item of value.liList){assert.ok(value.route[item.val].length>=2);assert.ok(value.beforeList.some(x=>x.line_name===item.val));assert.ok(value.afterData.some(x=>x.line_name===item.val));}
});
test('shared asset directory contains no identical binary copies',()=>{
 const hashes=new Map();function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())walk(p);else{const hash=crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');assert.ok(!hashes.has(hash),`${p} duplicates ${hashes.get(hash)}`);hashes.set(hash,p);}}}walk(path.join(root,'assets'));
});
