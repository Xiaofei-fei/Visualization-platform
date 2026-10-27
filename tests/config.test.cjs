const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm');const {localConfig}=require('../scripts/config.cjs');
test('configuration preserves defaults and local values, with environment overrides last',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'roadnet-config-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.writeFileSync(path.join(root,'config.local.js'),'window.ROADNET_CONFIG.amapKey="local-key"; window.ROADNET_CONFIG.serviceHost="/local/_AMapService";');
 const context={window:{ROADNET_CONFIG:{amapKey:'default',sdkTimeoutMs:15000}}};
 vm.runInNewContext(localConfig(root,{AMAP_KEY:'env-key',AMAP_SECURITY_JS_CODE:'quote"newline\nvalue'}),context);
 assert.equal(context.window.ROADNET_CONFIG.amapKey,'env-key');assert.equal(context.window.ROADNET_CONFIG.serviceHost,'/local/_AMapService');assert.equal(context.window.ROADNET_CONFIG.sdkTimeoutMs,15000);assert.equal(context.window.ROADNET_CONFIG.securityJsCode,'quote"newline\nvalue');
});
