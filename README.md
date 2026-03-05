# OpenYida

<p align="center">
  <a href="https://github.com/openyida/openyida/stargazers"><img src="https://img.shields.io/github/stars/openyida/openyida" alt="stars"></a>
  <a href="https://github.com/openyida/openyida/network/members"><img src="https://img.shields.io/github/forks/openyida/openyida" alt="forks"></a>
  <a href="https://github.com/openyida/openyida/blob/main/LICENSE"><img src="https://img.shields.io/github/license/openyida/openyida" alt="license"></a>
</p>

OpenYida 是一个 AI 驱动的宜搭（Yida）应用开发平台。通过集成 OpenClaw 智能体，你可以使用自然语言描述需求，AI 将自动完成应用的创建、页面开发与发布部署。

## 功能特性

| 特性 | 描述 |
|------|------|
| 🤖 AI 智能驱动 | 通过自然语言描述需求，AI 自动完成全流程 |
| ⚡ 端到端自动化 | 从应用创建到发布部署，全程无需手动操作 |
| 🎨 多场景支持 | 表单页面、自定义页面、数据可视化等 |
| 🔧 二次开发 | 生成代码可自由扩展和定制 |

## 快速开始

### 安装 Skill

在 OpenClaw 或 Claude Code 中安装 yida-dev skill：

```
https://clawhub.ai/skills/yida-dev
```

### 本地开发

```bash
# 克隆项目
git clone https://github.com/openyida/openyida.git
cd openyida

# 安装依赖
cd .claude/skills/yida-publish/scripts && npm install

# 安装 Python 依赖（用于登录态管理）
pip install playwright && playwright install chromium
```

### 使用方式

向 AI 描述你的需求即可：

> 帮我创建一个个人薪资计算器应用

AI 将自动执行：创建应用 → 检查登录态 → 创建页面 → 编写代码 → 发布部署

> **注意**：集团宜搭用户需修改 `config.json` 中的访问域名：`https://yida-group.alibaba-inc.com`

## 演示案例

### 💰 个人薪资计算器

简单易用的薪资计算工具，支持税前税后互转。

[在线体验](https://ding.aliwork.com/APP_ICUBVUPDEJ3MIFJ0701X/custom/FORM-5776BEF941604870A814608C4CE0D23C146W?isRenderNav=false&corpid=ding9a0954b4f9d9d40ef5bf40eda33b7ba0)

### 🌐 企业 Landing Page

一句话生成完整的企业产品介绍页。

[在线体验](https://ding.aliwork.com/s/63E1E?isRenderNav=false&corpid=ding8196cd9a2b2405da24f2f5cc6abecb85&ddtab=true)

### 🏮 看图猜灯谜

AI 生成灯谜图片，用户猜答案，猜错了有 AI 幽默提示。

[在线体验](https://ding.aliwork.com/s/93ED6?isRenderNav=false&corpid=ding8196cd9a2b2405da24f2f5cc6abecb85)

### 🎂 生日祝福小游戏

点击蜡烛将其吹灭，许下心愿，送出专属生日祝福卡片。

[在线体验](https://ding.aliwork.com/s/0D49?corpid=ding8196cd9a2b2405da24f2f5cc6abecb85&isRenderNav=false)

## 项目结构

```
openyida/
├── src/                        # 首页源码
│   ├── App.vue                 # Vue 组件
│   └── main.js                 # 入口文件
├── .claude/skills/             # 技能包
│   ├── yida-app/              # 完整流程编排
│   ├── yida-login/             # 登录态管理
│   ├── yida-create-app/        # 创建应用
│   ├── yida-create-page/       # 创建页面
│   ├── yida-custom-page/       # JSX 开发规范
│   └── yida-publish/          # 编译发布
└── worker.mjs                  # Cloudflare Worker
```

## 技术栈

- **前端**: Vue 3 + Vite
- **部署**: Cloudflare Workers
- **登录态**: Playwright
- **AI 集成**: OpenClaw / Claude Code

## 相关链接

- [yida-dev Skill](https://clawhub.ai/skills/yida-dev)
- [Homepage](https://openyida.ai)
- [GitHub](https://github.com/openyida/openyida)

## 许可证

[MIT License](LICENSE)
