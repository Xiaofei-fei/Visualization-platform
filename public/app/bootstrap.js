(async function () {
  Roadnet.mountNavigation();
  const status=document.getElementById('startup-status');
  const page=document.body.dataset.page;
  window.ROADNET_READY=false;
  function showError(message) {status.hidden=false;status.textContent=message;}
  function script(src, callbackName) {
    return new Promise((resolve,reject)=>{
      const element=document.createElement('script');
      const timer=setTimeout(()=>done(new Error('加载超时')),window.ROADNET_CONFIG.sdkTimeoutMs);
      function done(error) {
        clearTimeout(timer);element.onload=element.onerror=null;
        if(callbackName)delete window[callbackName];
        error?reject(error):resolve();
      }
      if(callbackName)window[callbackName]=()=>done();
      element.src=src;
      element.onerror=()=>done(new Error('加载失败'));
      element.onload=()=>{if(!callbackName)done();};
      document.head.append(element);
    });
  }
  try {
    const config=window.ROADNET_CONFIG;
    if(!config.amapKey || config.amapKey==='YOUR_AMAP_WEB_KEY') {
      showError('请先将 config.local.example.js 复制为 public/config.local.js，填写高德 Web Key 后刷新。首页可查看数据概况。');return;
    }
    const response=await fetch('app/profiles.json');
    if(!response.ok)throw new Error('无法读取功能配置');
    const profile=(await response.json())[page];
    // Loca requires WebGL; prevent the SDK from selecting its SVG fallback.
    if(profile.loca)window.forceWebGL=true;
    window._AMapSecurityConfig=config.serviceHost?{serviceHost:config.serviceHost}:{securityJsCode:config.securityJsCode};
    await script('assets/vendor/vue.min.js');
    await script('assets/vendor/echarts-4.3.0.min.js');
    const params=new URLSearchParams({v:profile.version,key:config.amapKey,callback:'__roadnet_amap_ready'});
    if(page==='transit'||page==='optimization')params.set('plugin','AMap.Transfer,AMap.LineSearch');
    try {
      await script('https://webapi.amap.com/maps?'+params,'__roadnet_amap_ready');
      if(typeof window.AMap?.Map!=='function')throw new Error('地图 API 未就绪');
      if((page==='transit'||page==='optimization')&&typeof window.AMap.LineSearch!=='function')throw new Error('公交查询 API 未就绪');
      if(profile.loca)await script('https://webapi.amap.com/loca?v=2.0.0&key='+encodeURIComponent(config.amapKey));
      if(profile.loca&&['Container','GeoJSONSource','ScatterLayer'].some(name=>typeof window.Loca?.[name]!=='function'))throw new Error('Loca API 未就绪');
    }catch(error){throw new Error('地图服务加载失败，请检查网络、Key、域名白名单和安全配置。');}
    const data=[...profile.data];
    if(profile.datasets){
      const requested=new URLSearchParams(location.search).get('dataset');
      const dataset=requested==='v1'?'v1':'v2';
      data.push(...profile.datasets[dataset]);
      const select=document.getElementById('dataset-version');select.value=dataset;
      select.addEventListener('change',()=>{const url=new URL(location.href);url.searchParams.set('dataset',select.value);location.assign(url);});
    }
    for(const url of data)await script(url);
    document.getElementById('module').hidden=false;
    await script('app/'+page+'.js');
    if(typeof window.RoadnetModules?.[page]!=='function')throw new Error('业务模块未能加载');
    await window.RoadnetModules[page]();
    window.ROADNET_READY=true;
    window.addEventListener('resize',()=>{
      document.querySelectorAll('#radarChart,#firstPie,#twoPie,#threePie').forEach(el=>window.echarts?.getInstanceByDom(el)?.resize());
    });
  }catch(error){document.getElementById('module').hidden=true;showError(error.message+' 请检查配置并刷新页面。');}
})();
