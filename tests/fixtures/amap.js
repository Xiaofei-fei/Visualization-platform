// External SDK boundary double only. Vue, ECharts and all app data/scripts remain real.
(()=>{
  class Shape {
    constructor(options={}) {this.options=options;this.position=options.position;this.handlers={};}
    setMap(){} getPosition(){return this.position;} on(event,fn){this.handlers[event]=fn;}
    clearOverlays(){} addOverlays(){}
  }
  class Map extends Shape {add(){}remove(){}clearMap(){}setFitView(){}clearInfoWindow(){document.querySelector('#test-info')?.remove();}}
  class InfoWindow extends Shape {
    open(){document.querySelector('#test-info')?.remove();const div=document.createElement('div');div.id='test-info';div.style.cssText='position:fixed;left:0;bottom:0;z-index:999999;background:white;color:black';if(this.options.content instanceof Node)div.append(this.options.content);else div.innerHTML=String(this.options.content);document.body.append(div);}
    close(){document.querySelector('#test-info')?.remove();}
  }
  class LineSearch {search(name,callback){
    if(name!=='130路')return callback('no_data',{info:'NO_DATA',lineInfo:[]});
    callback('complete',{info:'OK',lineInfo:[{start_stop:'北官厅',end_stop:'东湖',path:[[116.38,39.99],[116.39,40]],via_stops:[{location:[116.38,39.99]},{location:[116.39,40]}]}]});
  }}
  window.AMap={Map,InfoWindow,LineSearch,Polygon:Shape,Polyline:Shape,CircleMarker:Shape,Marker:Shape,Icon:Shape,Size:Shape,Pixel:Shape,OverlayGroup:Shape,TransferPolicy:{LEAST_TIME:0},event:{addListener(target,event,fn){target.on(event,fn);}}};
  window.__roadnet_amap_ready?.();
})();
