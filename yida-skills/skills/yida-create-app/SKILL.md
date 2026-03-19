---
name: yida-create-app
description: 宜搭应用创建技能，通过调用 registerApp 接口快速创建宜搭应用，支持自定义应用名称、描述和图标。
license: MIT
compatibility:
  - opencode
  - claude-code
metadata:
  audience: developers
  workflow: yida-development
  version: 1.0.0
  tags:
    - yida
    - low-code
    - app
---

# 宜搭应用创建技能

## 概述

本技能描述如何通过 HTTP 请求调用宜搭 `registerApp` 接口创建应用，返回应用 ID（appType）。创建应用是搭建宜搭应用的第一步，后续可在应用下创建表单页面和自定义页面。

## 何时使用

当以下场景发生时使用此技能：
- 用户需要创建新的宜搭应用
- 用户想要通过 AI 一句话生成宜搭应用
- 开始一个新的宜搭项目开发流程

## 使用示例

### 示例 1：基础用法
**场景**：创建一个简单的宜搭应用
**命令**：
```bash
openyida create-app "考勤管理"
```
**输出**：
```json
{"success":true,"appType":"APP_XXX","appName":"考勤管理","url":"{base_url}/APP_XXX/admin"}
```

### 示例 2：完整参数
**场景**：创建带描述和图标的应用
**命令**：
```bash
openyida create-app "考勤管理" "员工考勤打卡系统" "xian-daka" "#00B853"
```

## 使用方式

```bash
openyida create-app <appName> [description] [icon] [iconColor]
```
**参数说明**：

| 参数 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `appName` | 是 | — | 应用名称 |
| `description` | 否 | 同 appName | 应用描述 |
| `icon` | 否 | `xian-yingyong` | 图标标识（见文末图标列表） |
| `iconColor` | 否 | `#0089FF` | 图标背景色（见文末色值列表） |
| `colour` | 否 | `deepBlue` | 主题色（见下方主题色说明） |
| `navTheme` | 否 | `dark` | 导航风格：`dark`（深色）/ `light`（浅色） |
| `layoutDirection` | 否 | `slide` | 导航布局：`slide`（侧边栏）/ `ver`（L 型顶导） |

**主题色（colour）可选值**：

| 值 | 颜色 | 适合场景 |
| --- | --- | --- |
| `deepBlue` | 深蓝 | 政务、金融、法律、企业管理、正式场合 |
| `podBlue` | 蓝色 | 科技、教育、通用办公、SaaS 应用 |
| `royalBlue` | 皇家蓝 | 高端商务、专业服务、企业级应用、信任感强 |
| `lightBlue` | 浅蓝 | 清新简约、云服务、通讯社交、年轻化应用 |
| `teal` | 青色 | 医疗健康、环保、清新简洁类应用 |
| `podGreen` | 绿色 | 农业、环保、健康、生态、可持续发展 |
| `deepPurple` | 深紫 | 创意设计、艺术、高端品牌、奢侈品 |
| `purple` | 紫色 | 女性用户、美妆、时尚、创新科技 |
| `podOrange` | 橙色 | 活力、电商、餐饮、娱乐、社交 |
| `yellow` | 黄色 | 儿童教育、阳光活力、警示提醒类应用 |
| `magenta` | 玫红色 | 时尚、创意、社交、娱乐类应用 |
| `red` | 红色 | 党建、政务、新闻、紧急类应用 |
| `greyBlue` | 灰蓝 | 稳重商务、工业制造、技术工程、专业工具 |
| `coffee` | 咖啡 | 传统行业、文化教育、复古风格、温馨舒适 |
| `black` | 黑色 | 极简设计、奢侈品牌、科技前沿、高端定制 |


**示例**：

```bash
# 最简用法
openyida create-app "考勤管理"

# 自定义图标
openyida create-app "考勤管理" "员工考勤打卡系统" "xian-daka" "#00B853"

# 完整参数（含主题色、导航风格、布局）
openyida create-app "考勤管理" "员工考勤打卡系统" "xian-daka" "#00B853" "deepBlue" "dark" "slide"

# 党建应用示例（红色主题 + 浅色导航）
openyida create-app "党建管理" "党员信息管理系统" "xian-zhengfu" "#FF4D4F" "red" "light" "ver"
```

**输出**：日志输出到 stderr，JSON 结果输出到 stdout：

```json
{"success":true,"appType":"APP_XXX","appName":"考勤管理","url":"{base_url}/APP_XXX/admin"}
```

## 前置依赖

- Node.js
- 项目根目录存在 `.cache/cookies.json`（首次运行会自动触发扫码登录）

## 调用流程

1. 读取项目根目录的 `.cache/cookies.json` 获取登录态；若不存在则自动触发扫码登录
2. 构建 `registerApp` 请求参数
3. 发送 POST 请求到 `/query/app/registerApp.json`；根据响应体 `errorCode` 自动处理异常（详见 `yida-login` 技能文档「错误处理机制」章节）
4. 从返回值中获取应用 ID（appType）
5. 将 `appType` 记录到 `prd/<项目名>.md` 备用

## 文件结构

```
yida-create-app/
└── SKILL.md                # 本文档
```

## 接口说明

### registerApp

- **地址**：`POST /query/app/registerApp.json`
- **Content-Type**：`application/x-www-form-urlencoded`
- **核心参数**：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `_csrf_token` | String | 是 | CSRF Token（由 yida-login 获取） |
| `appName` | String (JSON) | 是 | 应用名称，i18n 格式：`{"zh_CN":"名称","en_US":"名称","type":"i18n"}` |
| `description` | String (JSON) | 否 | 应用描述，i18n 格式同上 |
| `icon` | String | 否 | 图标标识，格式：`{iconName}%%{颜色}`，如 `xian-daka%%#00B853` |
| `iconUrl` | String | 否 | 自定义图标 URL（与 icon 二选一） |
| `colour` | String | 否 | 主题颜色，固定 `blue` |

> 其他固定参数：`defaultLanguage=zh_CN`、`openExclusive=n`、`openPhysicColumn=n`、`openIsolationDatabase=n`、`openExclusiveUnit=n`、`group=全部应用`

- **返回值**：

```json
{
  "content": "APP_XXX",
  "success": true
}
```

`content` 即为新创建的应用 ID（appType）。

## 与其他技能配合

1. **创建应用** → 获取 `appType`（本技能）
2. **创建表单页面** → 使用 `yida-create-form-page` 技能在应用下创建表单
3. **创建自定义页面** → 使用 `yida-create-page` 技能在应用下创建展示页面
4. **部署页面代码** → 使用 `yida-publish` 技能将 JSX 代码部署到自定义页面

## 图标列表

| 名称 | 标识 | | 名称 | 标识 |
| --- | --- | --- | --- | --- |
| 新闻 | `xian-xinwen` | | 地球 | `xian-diqiu` |
| 政府 | `xian-zhengfu` | | 汽车 | `xian-qiche` |
| 应用 | `xian-yingyong` | | 飞机 | `xian-feiji` |
| 学术帽 | `xian-xueshimao` | | 电脑 | `xian-diannao` |
| 企业 | `xian-qiye` | | 工作证 | `xian-gongzuozheng` |
| 单据 | `xian-danju` | | 购物车 | `xian-gouwuche` |
| 市场 | `xian-shichang` | | 信用卡 | `xian-xinyongka` |
| 经理 | `xian-jingli` | | 活动 | `xian-huodong` |
| 法律 | `xian-falv` | | 奖杯 | `xian-jiangbei` |
| 报告 | `xian-baogao` | | 流程 | `xian-liucheng` |
| 火车 | `huoche` | | 查询 | `xian-chaxun` |
| 申报 | `xian-shenbao` | | 打卡 | `xian-daka` |

## 图标背景色

`#0089FF` `#00B853` `#FFA200` `#FF7357` `#5C72FF` `#85C700` `#FFC505` `#FF6B7A` `#8F66FF` `#14A9FF`
