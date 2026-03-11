# OpenYiDA — AI 驱动的宜搭应用开发框架

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/openyida/openyida)](https://github.com/openyida/openyida/stargazers)

使用 Claude Code 和 AI 编程工具，通过自然语言描述快速构建生产级宜搭应用。从创建到部署全自动完成，支持数据持久化。

## 概述

OpenYiDA 提供了一套完整的基于技能的框架，用于通过 AI 驱动的自动化开发宜搭（Yida）应用。用自然语言描述您的应用需求，系统将自动处理从搭建到部署的全流程。

**核心特性：**

- **全自动** — 分钟级完成从应用到部署
- **数据持久化** — 内置表单和存储支持
- **可自定义** — 完整源码，可二次开发
- **生产就绪** — 企业级宜搭平台集成

## 环境要求

| 依赖 | 版本 | 用途 |
|------|------|------|
| Node.js | 20+ | JSX 编译与发布流水线 |
| Python | 3.12+ | 登录自动化 (Playwright) |
| playwright | 最新版 | 二维码认证与会话管理 |

```bash
# 安装 Python 依赖
pip install playwright && playwright install chromium

# 安装 Node 依赖
cd .claude/skills/yida-publish/scripts && npm install
```

## 快速开始

用自然语言描述您的应用需求：

```
帮我创建一个个人薪资计算器应用
```

AI 将自动执行完整工作流：

```
创建应用 → 验证登录 → 创建页面 → 需求分析 → 代码生成 → 部署发布
```

> **注意：** 阿里集团宜搭环境需要修改 `config.json` 中的域名：`https://yida-group.alibaba-inc.com`

---

## 示例应用

### 💰 个人薪资计算器

功能完整的薪资计算工具，支持税前优化。

- 🔗 [在线体验](https://ding.aliwork.com/APP_ICUBVUPDEJ3MIFJ0701X/custom/FORM-5776BEF941604870A814608C4CE0D23C146W?isRenderNav=false&corpid=ding9a0954b4f9d9d40ef5bf40eda33b7ba0)

![薪资计算器](https://gw.alicdn.com/imgextra/i2/O1CN017TeJuE1reVH2Dj7b7_!!6000000005656-2-tps-5114-2468.png)

---

### 🌐 企业落地页

AI 一键生成响应式产品展示页面。

- 🔗 [在线体验](https://ding.aliwork.com/s/63E1E?isRenderNav=false&corpid=ding8196cd9a2b2405da24f2f5cc6abecb85&ddtab=true)

![智联协同](https://gw.alicdn.com/imgextra/i1/O1CN01EZtvfs1cxXV00UaXi_!!6000000003667-2-tps-5118-2470.png)

---

### 🏮 互动灯谜

AI 驱动的猜灯谜游戏，通过宜搭 × DEAP 集成自动生成谜题图片。

- 🔗 [在线体验](https://ding.aliwork.com/s/93ED6?isRenderNav=false&corpid=ding8196cd9a2b2405da24f2f5cc6abecb85)

![灯谜游戏](https://img.alicdn.com/imgextra/i3/O1CN01dCoscP25jSAtAB9o3_!!6000000007562-2-tps-2144-1156.png)

---

### 🎂 生日祝福

互动庆祝工具，带有彩纸特效和个性化祝福卡片。

- 🔗 [在线体验](https://ding.aliwork.com/s/0D49?corpid=ding8196cd9a2b2405da24f2f5cc6abecb85&isRenderNav=false)

---

## 技能包

框架包含用于宜搭开发不同方面的模块化技能：

| 技能 | 说明 |
|------|------|
| **`yida-app`** | 主协调器 — 编排完整开发流水线 |
| **`yida-login`** | 会话管理，支持二维码登录和 Cookie 持久化 |
| **`yida-logout`** | 清除认证会话 |
| **`yida-create-app`** | 初始化新的宜搭应用 |
| **`yida-create-page`** | 创建自定义展示页面 |
| **`yida-create-form-page`** | 表单页面构建器，支持 18 种字段类型 |
| **`yida-custom-page`** | JSX 开发指南与 API 参考 |
| **`yida-publish`** | 编译并部署到宜搭平台 |
| **`get-schema`** | 提取现有表单 Schema 用于分析 |

### 工作流

```
yida-app (编排器)
  ├── yida-login ─────── 认证与会话处理
  ├── yida-create-app ── 应用初始化
  ├── yida-create-page ─ 页面脚手架
  ├── yida-custom-page ─ 代码生成
  └── yida-publish ───── 构建与部署
```

---

## 项目结构

```
openyida/
├── src/                           # 应用源码
│   ├── salary-calculator.js       # 薪资计算器
│   ├── salary-calculator.compile.js
│   ├── demo.js                   # 灯谜游戏
│   ├── demo.compile.js
│   ├── birthday-game.js          # 生日祝福
│.compile.js
├──   └── birthday-game RD/                            # 需求与规格说明
├── .claude/skills/               # AI 技能包
│   ├── yida-app/
│   ├── yida-login/
│   ├── yida-logout/
│   ├── yida-create-app/
│   ├── yida-create-page/
│   ├── yida-create-form-page/
│   ├── yida-custom-page/
│   ├── yida-publish/
│   └── get-schema/
├── config.json
└── LICENSE
```

## 贡献指南

欢迎贡献！请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解贡献指南。

## 许可证

MIT License — 详见 [LICENSE](LICENSE)。

---

## 贡献者

<a href="https://github.com/openyida/openyida/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=openyida/openyida" />
</a>
