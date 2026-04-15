---
name: yida-app
description: 宜搭完整应用开发技能，描述从零到一搭建一个完整宜搭应用的全流程，包括创建应用、创建页面、需求分析、编写代码、创建表单、发布部署。不适用于：只需修改单个子步骤（如只改表单字段、只发布页面）时，应直接调用对应子技能。
---

# yida-app — 宜搭完整应用开发编排技能

> 本文档是**流程编排层**，描述各子技能的调用时机、决策逻辑和数据流转。
> 各子技能的详细参数和示例请查阅对应的子技能文档（见 [主 SKILL.md 索引表](../../SKILL.md)）。

## 核心规则

**致命（FATAL）**：
1. **不得跳过 `openyida env` 环境检测**直接开始开发
2. **不得编造任何 ID**（appType/formUuid/fieldId），必须从命令返回中提取
3. **不得在未读取各子技能 SKILL.md 的情况下执行对应操作**

**重要（IMPORTANT）**：
1. 按照本文档的流程编排顺序执行，不要跳步
2. 每个关键 ID 创建后立即记录到 `.cache/<项目名>-schema.json`
3. 业务需求记录到 `prd/<项目名>.md`（仅业务语义，不记录 Schema ID）
4. **本技能不读写 memory**：所有关键 ID 通过 `.cache/<项目名>-schema.json` 持久化

## 适用场景 / 触发条件

**正向触发**（从零搭建完整应用）：
- "帮我搭建一个完整应用" / "从零开始创建系统" / "一句话生成应用" / "帮我做一个 XXX 系统/平台/工具"

**不适用（直接调用对应子技能）**：

| 场景 | 子技能 |
|------|--------|
| 只需创建应用 | `yida-create-app` |
| 只需创建/修改表单 | `yida-create-form-page` |
| 只需发布页面 | `yida-publish-page` |
| 只需配置流程 | `yida-process-rule` / `yida-create-process` |
| 只需查询/录入数据 | `yida-data-management` |

## 开发流程概览

| 步骤 | 操作 | 命令 / 子技能 | 产出 | 条件 |
|------|------|--------------|------|------|
| 1 | 创建应用 | `openyida create-app "<名称>" "[描述]"` | `appType` | 必须 |
| 2 | 需求分析 | 写入 `prd/<项目名>.md` | 需求文档 | 必须 |
| 3 | 创建自定义页面 | `openyida create-page <appType> "<页面名>"` | `formUuid` | 必须（先执行 corpId 一致性检查） |
| 4 | 创建表单 | `openyida create-form create <appType> "<表单名>" <fields.json>` | `formUuid` + `fieldId` | 按需（需收集/存储数据时） |
| 5 | 配置流程 | `openyida create-process` / `configure-process` | 流程定义 | 按需（含审批/流程/申请/审核/工单关键词时必须） |
| 6 | 编写页面代码 | `yida-custom-page` 规范 → `pages/src/<项目名>.js` | 源码 | 必须 |
| 7 | 发布页面 | `openyida publish <源文件> <appType> <formUuid>` | 部署上线 | 必须 |
| 8 | 输出访问链接 | 用系统浏览器打开 | 用户可访问 | 必须 |

> 📖 决策树（数据存储、审批流程、报表可视化、corpId 一致性检查）详见 [examples.md](references/examples.md#关键决策树)

## 各步骤关键要求

### Step 1-2：创建应用 & 需求分析

- 调用 `yida-create-app` 技能，产出 `appType` 自动写入 prd。详见 [`yida-create-app/SKILL.md`](../yida-create-app/SKILL.md)
- 深度分析需求，写入 `prd/<项目名>.md`。模板见 [examples.md](references/examples.md#prd-文档模板)

### Step 3：创建自定义页面

- 创建前必须执行 corpId 一致性检查（详见 [examples.md](references/examples.md#决策-4corpid-一致性检查创建页面前必须执行)）
- 详见 [`yida-create-page/SKILL.md`](../yida-create-page/SKILL.md)

### Step 4：创建表单（按需）

- 先定义字段写入 `.cache/xxx-fields.json`，再执行 `create-form`
- 产出的 `formUuid` + `fieldId` 写入 `.cache/<项目名>-schema.json`
- 详见 [`yida-create-form-page/SKILL.md`](../yida-create-form-page/SKILL.md)

### Step 5：配置流程（按需）

- 详见 [`yida-create-process/SKILL.md`](../yida-create-process/SKILL.md)

### Step 6：编写自定义页面代码

**编写前必须**：
1. 完整读取 [`yida-custom-page/SKILL.md`](../yida-custom-page/SKILL.md)
2. 执行 `openyida sample yida-custom-page custom-page-template` 获取模板，再读取 `.cache/samples/custom-page-template.js`
3. 读取 prd 文档和 `.cache/<项目名>-schema.json` 获取所有 ID

**核心规范**：
- `export function` 导出（`didMount`、`didUnmount`、`renderJsx` 三个必须导出）
- 状态管理使用 `_customState` + `setCustomState`
- 输入框使用非受控组件（`defaultValue` 而非 `value`）
- 所有样式通过内联 `style` 对象定义
- 列表/表格类页面：参考 `yida-density` 技能选择合适的信息密度

### Step 7：发布页面

- 发布流程：Babel 编译 JSX → ES5 → UglifyJS 压缩 → `saveFormSchema` 保存
- 详见 [`yida-publish-page/SKILL.md`](../yida-publish-page/SKILL.md)

### Step 8：输出访问链接

- URL 规则见 [examples.md](references/examples.md#宜搭应用-url-规则)

## 使用模板文件确保一次性成功

| 技能 | 模板文件 | 用途 |
|------|---------|------|
| yida-custom-page | 通过 `openyida sample yida-custom-page custom-page-template` 获取 | 自定义页面完整模板 |
| yida-data-management | [form-field-template.js](../yida-data-management/templates/form-field-template.js) | 表单字段定义和数据插入 |
| yida-create-app | [ipd-app-template.js](../yida-create-app/templates/ipd-app-template.js) | 完整应用创建示例 |

**代码生成前必须**：读取对应模板文件 → 以模板为基础扩展 → 验证参数名称与 CLI 一致

## 异常处理

| 异常场景 | 处理方式 |
|---------|----------|
| 用户要求删除应用 | 必须先展示操作摘要并等待用户明确确认（详见 [examples.md](references/examples.md#删除应用危险操作)） |
| 发布时登录失效 | 执行 `openyida logout`，再重新执行 `openyida publish`（自动触发扫码登录） |
| 一直登录失败 | 不要自主尝试其他登录方案，提示登录失败，联系 @天晟 |
| corpId 不一致 | 询问用户选择"重新登录"或"新建应用"，不得强行发布 |
| 字段 ID 未知 | 使用 `yida-get-schema` 获取表单 Schema 读取 `fieldId` |
| 页面代码更新后重新发布 | 直接重新执行 `yida-publish-page`，会覆盖已有 Schema |
| Babel 编译失败 | 检查 JSX 语法，确认未使用 React Hooks，参考 `yida-custom-page` 规范 |
| 创建应用/表单返回错误 | 检查 `appType` 是否有效，确认登录态（`openyida env`），不要编造 ID |

## Agent 错误处理策略

| 错误类型 | 默认处理策略 |
|---------|-------------|
| 命令执行失败 | 停止执行，展示完整错误信息，询问是否重试或调整参数 |
| 参数格式错误 | 停止执行，提示正确格式，引导用户修正 |
| 登录态失效 | 提示执行 `openyida login` 重新登录 |
| ID 缺失/不存在 | 停止执行，不得编造，提示用户通过对应命令获取 |
| 用户拒绝确认 | 停止执行，询问是否调整配置 |
| 未知错误 | 停止执行，完整展示错误信息，建议反馈问题 |

## 参考文档

| 文档 | 覆盖范围 | 何时阅读 |
|------|---------|---------|
| [使用示例与参考](references/examples.md) | 典型场景示例、决策树、URL 规则、删除流程、prd 模板、数据流转 | 首次使用或遇到分支决策时 |
| [宜搭 API](../../references/yida-api.md) | 表单/流程 API 完整参数 | 需要查询数据时 |
