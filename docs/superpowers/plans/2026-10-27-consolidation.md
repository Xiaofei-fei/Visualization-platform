# Roadnet consolidation Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task.

**Goal:** 整合三个仓库，交付可运行、可审查且保留历史的统一项目。
**Architecture:** 四个业务页面共用导航、资源与顺序加载器；风险页复用代码选择 v1/v2 数据。用带 merge parents 的新分支保留完整历史。
**Tech Stack:** 静态 HTML/CSS/JS、Vue 1.0.26、ECharts 4、AMap、Node 22、Playwright。
**Spec:** docs/superpowers/specs/2026-10-27-consolidation-design.md

## Global Constraints
- 不覆盖默认分支、不改原仓库内容、不改写历史。
- 两版指标保留；未找到的动态图片明确说明，不做猜测映射。
- 生产依赖本地化，地图 SDK 从官方加载，凭证可配置。

## Review Focus
- 空查询/无结果查询不能回退为全部结果。
- SDK 失败和凭证缺失应显示操作提示。
- 首次点击、重复切换和未选路线先切开关均不能异常。
- 子路径下的 CSS、数据、图片及导航均可用。
- 所有原始 commit 可从新分支到达。

### Task 1: 历史、审计与资产迁移
**Files:** docs/AUDIT.md, docs/MIGRATION.md, docs/source-manifest.json, public/assets/**
**Interfaces:** source SHAs -> provenance manifest and shared assets.
- [ ] 写历史祖先与资产可达性测试，确认缺失时失败。
- [ ] 保留源历史、计算重复组，迁移资源并记录每个文件去向。
- [ ] 测试与提交。

### Task 2: 统一启动和业务模块
**Files:** public/*.html, public/app/*.js, public/config.js, scripts/{serve,build}.cjs
**Interfaces:** config -> load SDK/profile -> ordered data/scripts -> module UI.
- [ ] 写浏览器测试：导航、配置错误、风险选择/雷达、v1/v2、图片、路网输入、公交与优化。
- [ ] 运行确认旧项目无法满足统一入口契约。
- [ ] 抽离页面脚本，修复明确运行缺陷，统一资源与导航。
- [ ] 运行完整测试，提交。

### Task 3: 部署、复核和交付
**Files:** README.md, Dockerfile, .github/workflows/ci.yml, docs/VALIDATION.md
**Interfaces:** public -> dist -> 静态部署；HEAD -> bundle/zip/PR。
- [ ] 验证构建可从子路径运行、HTTP 错误边界与配置覆盖。
- [ ] 补齐运行、部署、回滚、数据更新和迁移对照说明。
- [ ] 独立代码审查、修复重要问题，重跑完整测试。
- [ ] 保留历史打包，尝试新分支推送并创建草稿 PR，或交付完整 bundle。
