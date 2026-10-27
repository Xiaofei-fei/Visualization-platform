(function (root) {
  const api = {
    searchItems(items, keyword = '') {
      const query = String(keyword).trim().toLocaleLowerCase();
      return items.filter(item => String(item.val).toLocaleLowerCase().includes(query));
    },
    animations: Object.freeze({10:'assets/data/10.gif',31:'assets/data/31.gif',63:'assets/data/63.gif',161:'assets/data/161.gif'}),
    mountNavigation() {
      const nav = document.getElementById('navigation');
      if (!nav) return;
      const entries = [['index.html','首页'],['risk.html','风险态势'],['transit.html','原始公交'],['optimization.html','优化线网'],['roads.html','历史路网']];
      const element = document.createElement('nav');element.setAttribute('aria-label','功能导航');
      for (const [url,label] of entries) {
        const a=document.createElement('a');a.href=url;a.textContent=label;
        if(location.pathname.endsWith(url))a.setAttribute('aria-current','page');
        element.append(a);
      }
      nav.append(element);
    }
  };
  if (typeof module !== 'undefined') module.exports=api;
  root.Roadnet=api;
})(typeof window === 'undefined' ? globalThis : window);
