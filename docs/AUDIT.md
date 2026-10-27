# 架构与代码审计（2026-10-27）

审计对象为 GitHub 各仓库 master 的完整克隆；前序对话只有合并请求，没有已实施的补丁。

| 仓库 | 固定提交 | 提交数 | 工作树文件/字节 | 入口与特有功能 |
|---|---|---:|---:|---|
| [Roadnetrisk2.0](https://github.com/Xiaofei-fei/Roadnetrisk2.0) | `6e11f3590445ebe9390b575009db2072960f859a` | 7 | 57 / 6,639,374 | index.html；风险排名、雷达、异常解析、Loca、路况 GIF |
| [Roadnetrisk1.0](https://github.com/Xiaofei-fei/Roadnetrisk1.0) | `5f53366467a5c8825fd7405c775a31d77da860e0` | 1 | 57 / 3,342,110 | index.html；风险分析基础版及不同指标数据 |
| [Visualization-platform](https://github.com/Xiaofei-fei/Visualization-platform) | `b88c4d2fc12ee81d7170feef0fb29cdc079c8a1e` | 5 | 45 / 2,852,254 | index.html 原始公交；Supports/优化线网.html；Supports/路网状况.html |

三者是无构建的 HTML/CSS/JS，使用全局变量、内联脚本与静态数据，没有 package.json、自动测试、服务端、数据库或可用后端 API。公交优化中注释掉的 axios 调用是示例，不属于可运行后端。

## 依赖

原仓库文件名 vue.min.js 实际是 **Vue 1.0.26**，本次保留兼容运行行为；未直接升级框架。ECharts 原为外部 CDN 4.3.0，本次下载同一版本、保留许可证并本地固定。其余旧供应商文件含 jQuery 1.11.1、Bootstrap、Vue Router、Underscore、Velocity、日期选择器等，但四个业务脚本不调用它们，已从运行树清理，可从原始历史取回。

地图外部依赖：风险需要 JSAPI 2.0 与 Loca 2.0.0，公交与历史路网沿用 1.4.15。不同页面加载自己的 SDK，完整导航隔离全局 AMap 对象；没有在一页混装。官方说明：[Loca 2.0 适配 JSAPI 2.0](https://lbs.amap.com/api/loca-v2/intro)、[JSAPI 安全配置](https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode)。在线查询、图标与 Loca 纹理仍依赖高德网络。

## 重复与冲突

159 个原始文件中共有 71 个不同内容哈希，51 组跨仓库或仓内重复；简单合并会多存 6,155,722 字节。典型共享内容为路网几何、事件图标、CSS、供应商文件。动态文件 161.gif 与 r192.gif 内容完全相同，只保存同一份字节；未擅自建立事件 192 映射。

风险两版排名均 346 项。去除文字空白后，指标仍有 **185 个事件、361 处字段差异**，涉及 congestionLength/congestionDegree 等，见 data-differences.json。因此通过同页不同数据集保留，不能把 1.0 当作冗余目录删除。1.0 列表第 192 项还带未使用且不正确的 src 字段，原数据保留，当前图片功能只使用已核实清单。

公交页和优化页的 beforeList 完全一致，抽为 bus-metrics.js。线路选择数分别 14 与 13，不强行合并不同的候选列表。优化 geometry 与 afterData 作为单独数据文件保留。

## 已修复的运行缺陷

- 风险重复加载 road_nodes.js；2.0 使用捕获的旧地图 SDK。统一声明每项依赖并从官方按配置加载。
- 风险原来在创建 infoWindow 前调用 close 导致首次选择异常；改为存在时关闭。
- 原始页 currentItem 初值 null，却直接读取 currentItem.val；模板改为空值保护。
- 原始 Vue 1.0.26 配合错误生命周期拼写、缺失 focusEnd；纠正生命周期名称并去掉未实现的事件绑定。
- bootstrap.min.js 在 jQuery 缺席时执行，但业务不需要两者；清理未使用脚本。
- 模糊搜索无结果时回退所有项、模拟定时器及隐式全局 result；共用纯过滤器返回真实空结果。
- 页面导航指向不存在文件、复制的地图 DOM/图层与 logo 图片失效；改为共用导航和干净地图容器。
- 历史路网重复加载两个 Key 的 SDK、引用不存在 axios.min.js、未校验输入；按 profile 加载一次，校验实际数据键。
- 优化页在未选线路时切换开关会读取 null；加入保护。图表显示后再初始化并复用实例。
- 旧地图 Key 分散硬编码；当前运行树使用统一配置，原始 SDK 快照只留在 Git 历史。

## 选择与范围

保持原有业务页面和数据语义，不重新计算优化算法或生成缺失图片。没有凭证时提供首页与配置指引，地图不会假装可离线运行。无实时后端。框架及图表仍是历史版本；本次合并通过测试固定现有行为，依赖大版本升级可另行实施。

## 真实SDK验收后的修复

使用当前有效高德配置复验，发现AMap.Map占位对象可能早于SDK异步callback存在，原onload判断会过早删除callback并使用未就绪插件。现只在callback到达时继续；测试SDK也按callback协议模拟。Loca依赖WebGL，SVG回退会引起读取gl异常，风险页在SDK下载前设置高德支持的forceWebGL。两项均有失败复现与通过后的回归测试，四个真实页面及130路查询已通过。
