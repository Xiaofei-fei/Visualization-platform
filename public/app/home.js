Roadnet.mountNavigation();
document.getElementById('dataset-summary').textContent = `风险数据：每版 ${liList.length} 条；历史路网：${Object.keys(nrc_trees).length} 个事件。地图尚未启用时，可先查看运行和数据说明。`;
