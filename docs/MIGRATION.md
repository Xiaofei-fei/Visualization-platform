# 迁移对照与历史恢复

| 原位置/功能 | 新位置 | 处理 |
|---|---|---|
| Roadnetrisk2.0/index.html | public/risk.html + app/risk.js/css | 提取业务代码，修复首次点击与图表复用 |
| Roadnetrisk1.0/index.html | risk.html?dataset=v1 | 共用风险代码，保留独立指标/排名数据 |
| Visualization-platform/index.html | public/transit.html + app/transit.js | 保留方向线路查询与雷达 |
| Supports/优化线网.html | public/optimization.html + app/optimization.js | 保留13条候选、优化 geometry、前后指标及开关 |
| Supports/路网状况.html | public/roads.html + app/roads.js | 保留历史事件编号查询，加入非法输入处理 |
| 两个公交页内嵌 beforeList | assets/data/bus-metrics.js | 完全相同，合为一份 |
| Supports/data/road_nodes.js 等共享数据 | public/assets/data/ | 同哈希只留一份 |
| 1.0 与 2.0 的 liList/beforeList1023.js | 两组版本文件 + app/profiles.json | 共用加载器，通过 dataset 查询参数选择 |
| Supports/css/index.css 不同版本 | assets/css/index.css / index-Visualization-platform.css | 按页面保留不同样式 |
| 图片和 GIF | public/assets/data 或 image | 按哈希复用；161 与 r192 内容相同 |
| 各页面旧菜单 | app/common.js | 统一首页/四功能导航，替换不存在的链接 |
| Supports/data/maps.js、loca.js | 不进入运行目录 | 捕获的 SDK 只留历史，使用官方 SDK+统一配置 |
| 未使用供应商库、公交大数据.html 模板 | 原始 Git 提交 | 退休，manifest 记录恢复路径 |
| 原 README | 原始 Git 提交；新 README 汇总 | 原文可按 commit/path 取回 |

`source-manifest.json` 覆盖全部159个源文件：repository、commit、path、sha256、target、reason。target 非空时指向字节完全相同的共享文件；target 为空表示已提取为新业务模块，或不再作为运行资源，需要从该原始提交恢复。测试逐项验证哈希，防止静默丢失。

`data-differences.json` 忽略描述中的空白，记录每个有实质差异的 rank/field/v1/v2；原始字节仍被保留。没有混用某版排名与另一版指标。

动态图片的实际可验证编号为 **10、31、63、161**。r192.gif 与161.gif同哈希，未确认192业务映射，不能从 README 中的10、37、61、163推断映射。点击无图片的事件显示“暂无动态图片”。新增确认映射请更新 app/common.js 并补测试。

三个源 master 提交分别为：

```
Roadnetrisk2.0       6e11f3590445ebe9390b575009db2072960f859a
Roadnetrisk1.0       5f53366467a5c8825fd7405c775a31d77da860e0
Visualization       b88c4d2fc12ee81d7170feef0fb29cdc079c8a1e
```

从新分支运行 `git log --graph --all --oneline` 可看到两个 merge parent 连接历史。使用 `git show <commit>:<原路径>` 恢复指定原始文件。没有旧页面路径兼容重定向；旧部署可以继续服务，迁移书签时使用上表的新入口。

本次未连接用户远程服务器、未改任何 SSH 节点，也未部署或改变旧站点。
