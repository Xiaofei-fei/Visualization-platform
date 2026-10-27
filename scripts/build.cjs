const fs=require('node:fs'),path=require('node:path');const {localConfig}=require('./config.cjs');
const root=path.resolve(__dirname,'..'),source=path.join(root,'public'),dist=path.join(root,'dist');
fs.rmSync(dist,{recursive:true,force:true});fs.cpSync(source,dist,{recursive:true});
fs.writeFileSync(path.join(dist,'config.local.js'),localConfig(source));
console.log('Static site built in dist/');
