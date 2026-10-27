# 验证记录与验收边界

日期：2026-10-27。环境：WSL/Linux、Node 22.22.1、Chrome、Playwright 1.64.1。Browser插件未提供，使用Playwright验证。

## 自动化检查

- npm test：9/9通过。验证三个源提交的祖先关系、159项源文件SHA256/恢复位置、入口与数据引用、两版346项风险数据的图结构、13条优化线路、资源去重、搜索、配置覆盖与HTTP错误边界。
- npm run build：通过，生成dist；生产运行不依赖node_modules。
- 浏览器集成：16/16通过。真实Vue1.0.26、ECharts4.3.0与数据运行；仅高德外部边界使用测试替身。覆盖首次及重复风险选择、v1/v2差异、动态图片有/无、路网非法输入、公交/优化开关、异步乱序返回、SDK失败/缺失、初始化异常、子路径部署、延后callback和加载前选择WebGL。

移除8个运行无关文件后，完整套件已再次通过。19项受影响来源记录改为原始Git历史恢复，未丢失原文件。

## 真实高德验收

用户配置只保存在Git忽略的public/config.local.js，不进入Git或交付归档。四个页面均成功加载真实高德SDK与底图，无pageerror；风险页Loca图层、风险项选择和雷达通过。原始公交与优化页各实际查询130路，两处均返回complete/OK、两条方向结果，并绘制匹配线路。

使用Chrome软件WebGL，浏览器仅有Canvas2D读取性能提示，不影响功能。实际SDK复验发现并修复了两项原测试替身没有模拟的行为：script.onload早于地图就绪callback；SVG回退没有Loca所需的GL上下文。现等待callback，风险页加载前设置forceWebGL。参考：[高德官方FAQ](https://lbs.amap.com/faq/js-api/map-js-api/layer/43621)。

## GitHub交付

目标为Visualization-platform，整合分支codex/unify-roadnet-platform-20261027。通过已授权GitHub应用与一次性GitHub执行环境导入完整bundle；包SHA256、三个源提交祖先关系和目标master值在导入前后均校验。默认master始终为b88c4d2，临时导入分支已经自动删除。

[历史导入任务已成功](https://github.com/Xiaofei-fei/Visualization-platform/actions/runs/40486162576)。正式CI结果以PR检查项为准；合入应使用merge commit以保留三个源仓库历史。

## 尚未覆盖

- 部署域名白名单、不同硬件GPU和全部14条历史公交的当前结果。
- Docker镜像：当前环境未提供Docker，未实际构建。
- 生产部署、旧站点切换、默认分支合入：本次没有执行。

首页与导航验证了1440×1000桌面和390×844移动布局；完整业务面板仍适合桌面。保留历史Vue/ECharts版本，未新增后端或实时风险推断。
