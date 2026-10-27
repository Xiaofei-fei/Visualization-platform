# 统一交通分析平台

整合 **Roadnetrisk2.0、Roadnetrisk1.0、Visualization-platform**。一个静态项目、统一导航和配置、四个业务模块；同内容资产只存一份。原仓库和默认分支未修改，三个原始提交历史均是整合分支的祖先。

## 运行

需要 Node.js 22 或更新版本。运行本身没有 npm 生产依赖。

```bash
npm start
```

打开 http://127.0.0.1:8080 。首页可直接展示本地数据概况。启用业务地图前：

```bash
cp config.local.example.js public/config.local.js
```

在 `public/config.local.js` 填写自己的高德 Web Key；开发环境填写 `securityJsCode`，生产环境推荐配置自己的 `serviceHost` 安全代理。配置必须先于 SDK 生效，启动器已处理顺序。该文件不进 Git；配置会发送给浏览器，不能放服务端凭证。

也支持环境变量 `AMAP_KEY`、`AMAP_SECURITY_JS_CODE`、`AMAP_SERVICE_HOST`。优先级：环境变量 > config.local.js > config.js。本地服务在请求时读取环境变量；静态构建在构建时注入。修改配置后刷新页面。请在高德控制台设置部署域名、Key 权限与安全配置。

Windows PowerShell 可用 `Copy-Item config.local.example.js public/config.local.js`；环境变量用 `$env:AMAP_KEY="..."` 设置。

| 功能 | 入口 | 保留行为 |
|---|---|---|
| 风险态势 | `risk.html` | 风险排名、雷达指标、异常事件解析、路段速度、Loca 呼吸点、已有动态图片 |
| 1.0 数据 | `risk.html?dataset=v1` | 使用原始 1.0 排名与指标，复用风险页面 |
| 2.0 数据 | `risk.html?dataset=v2` | 默认版本，保留 2.0 指标 |
| 原始公交 | `transit.html` | 14 条方向明确的线路查询与原始指标 |
| 优化线网 | `optimization.html` | 13 条优化线路、原始/优化开关、雷达和三项前后对比 |
| 历史路网 | `roads.html` | 按历史事件编号查询关联路段和事件信息 |

所有风险/事件数据均来自原仓库历史样例，不是实时交通数据。原始公交使用高德当前线路服务，可能与历史优化方案对应不上。地图与在线公交查询需要有效凭证和网络；无凭证时业务页面显示配置提示。

## 验证

```bash
npm ci
npm test
npx playwright install chromium
npm run test:e2e
```

已安装 Chrome 时可设置 `CHROME_PATH` 后跑浏览器测试，例如 Linux 的 `CHROME_PATH=/opt/google/chrome/chrome npm run test:e2e`。浏览器测试会先自动构建。测试使用真实 Vue、ECharts 与数据；只替换高德外部 SDK 边界。它们不验证真实高德 Key、瓦片、Loca GPU 呈现或在线公交返回。范围见 [验证记录](docs/VALIDATION.md)。

历史完整性测试需要从 Git bundle 或带完整历史的仓库克隆运行，浅克隆或不含 `.git` 的源码包不能完成历史核验。

## 部署

`npm run build` 生成 `dist/`，可部署到任意静态托管服务。构建会写入 `config.local.js`，所有资源采用相对路径，可部署到站点子目录。静态主机要保留真实文件和 404，无需 SPA 回退。

本地检查构建：

```bash
node scripts/serve.cjs --root dist --port 8081
```

Netlify：构建命令 `npm run build`，发布目录 `dist`；通过环境变量设置高德配置。GitHub Pages：将 `dist/` 内容发布为站点，保留文件层次。

容器方案不需要构建依赖：

```bash
docker build -t roadnet-unified .
docker run --rm -p 8080:8080 -e AMAP_KEY -e AMAP_SECURITY_JS_CODE roadnet-unified
```

可改用 `AMAP_SERVICE_HOST` 传入生产安全代理。容器默认不会复制本地配置文件。部署前应使用实际域名、有效 Key 和浏览器验证四个页面及实际公交查询。

## 项目结构与维护

- `public/`：实际静态站点；`app/` 为共用启动器及独立业务脚本，`assets/` 为去重资源。
- `public/app/profiles.json`：各页面 SDK 版本、顺序数据依赖及 v1/v2 映射。
- `scripts/`：无第三方依赖的本地服务、配置注入和静态构建。
- `tests/`：历史/数据/资源/HTTP 测试和浏览器集成测试。
- `docs/`：架构审计、迁移对照、源文件哈希、数据差异和验证范围。

新增数据时更新相应数据文件和 profile；新增动态图片须确认事件编号后再加入 `public/app/common.js` 的显式清单。不要把文件名 `r192.gif` 自动解释为事件 192；原仓库没有可核实的映射。风险页用事件编号关联指标，避免两版说明文本中的空格影响选择。

## Git 历史与交付

整合分支：`codex/unify-roadnet-platform-20261027`。以 Roadnetrisk2.0/master 为基线，使用两次保留父提交的合并连接其余历史，再提交统一工作树，没有 squash、rebase 或覆盖默认分支。

```bash
git clone roadnet-unified.bundle roadnet-unified
git -C roadnet-unified switch codex/unify-roadnet-platform-20261027
```

bundle 是完整历史交付物；zip 是便于浏览/运行的源码。原文件可按 manifest 内的 commit/path 取回：

```bash
git show 5f53366467a5c8825fd7405c775a31d77da860e0:index.html
```

统一项目现已提交到现有仓库 [Xiaofei-fei/Visualization-platform](https://github.com/Xiaofei-fei/Visualization-platform) 的整合分支。整合分支为 `codex/unify-roadnet-platform-20261027`，审查时以该仓库 `master` 为基线，不直接覆盖默认分支。建议使用 **merge commit** 合入，以保留三个仓库的完整历史，避免 squash。PR 说明见 `docs/PR_DESCRIPTION.md`。

旧目录中与当前功能无关的内容已从运行树退休。本次额外移除了8个没有被入口、业务脚本或配置引用的旧数据/图片/SCSS文件；其源文件SHA256和历史恢复位置仍记录在source-manifest.json中。

在验收完成前保留旧站点部署地址；回滚时重新部署原始 Roadnetrisk2.0 提交即可，无需重写任何历史。源仓库没有独立项目许可证；原有第三方许可证保留，未擅自添加新的开源授权。

## 真实高德验收补充

已使用用户本地配置加载四个真实地图页面，并在原始公交、优化页实际查询130路，两处均得到OK结果并绘制线路。风险页启用WebGL以支持Loca；启动器等待SDK的异步就绪回调后再初始化。完整自动测试为9项Node检查与16项浏览器检查。实际配置只在本机public/config.local.js中，不包含在Git、源码包或历史包中；其他机器需自行配置。
