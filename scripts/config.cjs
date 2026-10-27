const fs=require('node:fs');
function localConfig(publicRoot,env=process.env){
  const filename=require('node:path').join(publicRoot,'config.local.js');
  const local=fs.existsSync(filename)?fs.readFileSync(filename,'utf8'):'// No local overrides.\n';
  const overrides={};
  for(const [key,name] of [['amapKey','AMAP_KEY'],['securityJsCode','AMAP_SECURITY_JS_CODE'],['serviceHost','AMAP_SERVICE_HOST']])if(env[name])overrides[key]=env[name];
  return local+'\nwindow.ROADNET_CONFIG = Object.assign(window.ROADNET_CONFIG || {}, '+JSON.stringify(overrides)+');\n';
}
module.exports={localConfig};
