# 第三方资源

- Vue 1.0.26：继承自三个源仓库，MIT 许可证声明保留在 public/assets/vendor/vue.min.js 文件头。
- ECharts 4.3.0：固定 npm 包 echarts@4.3.0 的 dist/echarts.min.js；Apache-2.0 许可证保存在 public/assets/vendor/ECHARTS-LICENSE.txt。替代原页面同版本 CDN 链接。
- AMap JSAPI 1.4.15/2.0、Loca 2.0.0：从高德官方地址加载，受高德服务条款与用户 Key 约束，不把捕获的 SDK 快照作为新运行库分发。
- Playwright：仅为开发依赖，通过 package-lock.json 固定；不进入静态站点运行目录。

其余源数据、图像与CSS保留原始来源及SHA256，见source-manifest.json。原仓库未提供整体项目许可证，本次不新增授权范围。
