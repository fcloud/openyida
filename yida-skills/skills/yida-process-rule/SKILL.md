---
name: yida-process-rule
description: 宜搭流程规则配置技能，通过调用流程设计器 API 实现流程的创建、配置（条件分支、嵌套分支、审批节点、字段权限、抄送节点、跳转规则）、保存和发布。不适用于：从零创建流程表单（应使用 yida-create-process），或配置集成自动化逻辑流（应使用 yida-integration）。
---

# yida-process-rule — 宜搭流程规则配置技能

本技能用于为已有流程表单配置审批流程，支持审批节点、条件分支、嵌套分支、字段权限、抄送节点、跳转规则等完整流程配置能力。

## 核心规则

**致命（FATAL）**：
1. **不得编造 fieldId**：必须先用 `yida-get-schema` 获取，不能手写猜测
2. **未读本 SKILL.md 不得编写流程定义 JSON**：格式复杂且易出错
3. **不得用此技能创建流程表单**：从零创建应使用 `yida-create-process`

**重要（IMPORTANT）**：
1. **发布前必须确认**：向用户展示流程配置摘要（节点数、审批人、条件分支），获得明确同意后再发布
2. **字段权限自动配置**：字段 ≥ 3 且审批节点 ≥ 2 时，必须为每个节点配置 `formConfig.behaviorList`，规范详见 [process-ai-rules.md](references/process-ai-rules.md)
3. **回退/循环场景**：存在回退/循环语义时，必须配置 `routeRules` 跳转规则
4. **配置前先获取字段**：用 `yida-get-schema` 获取所有字段 ID

## 适用场景

| 用户意图 | 触发关键词 |
|---------|---------|
| 配置/修改审批流程 | "配置审批"、"审批节点"、"条件分支"、"字段权限"、"抄送节点"、"跳转规则" |
| 已有流程表单需配置复杂规则 | `yida-create-process` 完成后进一步配置 |
| 从零创建流程表单 | → 改用 `yida-create-process` |
| 配置集成自动化逻辑流 | → 改用 `yida-integration` |

> **简单判断**：有现成流程表单？有 → 本技能；没有 → `yida-create-process`。

## 命令格式

```bash
openyida configure-process <appType> <formUuid> <processDefinitionFile> [processCode]
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `appType` | 是 | 应用 ID，如 `APP_XXX` |
| `formUuid` | 是 | 表单 UUID，如 `FORM-XXX` |
| `processDefinitionFile` | 是 | 流程定义 JSON 文件路径 |
| `processCode` | 否 | 流程 Code（`TPROC--XXX`），不传则自动获取 |

```bash
openyida configure-process "APP_XXX" "FORM-YYY" process-definition.json
```

输出 JSON 到 stdout：

```json
{
  "success": true,
  "processCode": "TPROC--XXX",
  "processId": "83145794990",
  "processVersion": 2,
  "appType": "APP_XXX",
  "formUuid": "FORM-YYY"
}
```

## 流程定义 JSON 格式

流程定义文件描述审批流程的节点结构，脚本自动转换为宜搭平台需要的 `processJson` 和 `viewJson`。

### 节点类型

| 类型 | 说明 | 必填属性 |
| --- | --- | --- |
| `approval` | 审批节点 | `name`, `approver` |
| `route` | 条件分支路由 | `conditions` |
| `carbon` | 抄送节点 | `name`, `approver` |

### 条件定义

条件分支 `conditions` 数组中每个条件：

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 条件名称 |
| `rules` | Array | 是 | 条件规则列表 |
| `logic` | String | 否 | `"AND"`（默认）或 `"OR"` |
| `childNodes` | Array | 否 | 条件满足时执行的子节点 |

### 条件规则

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `fieldId` | String | 是 | 字段 ID，如 `selectField_xxx` |
| `fieldName` | String | 是 | 字段名称 |
| `op` | String | 是 | 操作符（见下表） |
| `value` | String/Array | 是 | 比较值 |
| `componentType` | String | 是 | 字段组件类型 |

### 支持的操作符

| 操作符 | 说明 | 适用类型 |
| --- | --- | --- |
| `Equal` / `NotEqual` | 等于 / 不等于 | 所有类型 |
| `Contains` / `NotContain` | 包含 / 不包含 | TextField |
| `IsEmpty` / `IsNotEmpty` | 为空 / 不为空 | 所有类型 |
| `GreaterThan` / `GreaterThanOrEqual` | 大于 / 大于等于 | NumberField |
| `LessThan` / `LessThanOrEqual` | 小于 / 小于等于 | NumberField |
| `In` / `NotIn` | 属于 / 不属于 | SelectField, RadioField |

### 字段权限（formConfig）

审批节点可通过 `formConfig.behaviorList` 配置每个字段的行为：

| fieldBehavior | 说明 |
| --- | --- |
| `NORMAL` | 可编辑 |
| `READONLY` | 只读 |
| `HIDDEN` | 隐藏 |

> 📖 字段权限自动生成的完整规范（判断规则、生成时机、检查清单）详见 [process-ai-rules.md](references/process-ai-rules.md)。

### 跳转规则（routeRules）

> 📖 回退/循环场景的识别规则、`routeRules` 格式和跳转目标判断详见 [process-ai-rules.md](references/process-ai-rules.md#回退规则)。

## 注意事项

- 条件分支的 `conditionNodes` 最后一个必须是 `else`（`conditionType: "else"`）
- 嵌套分支不超过 3 层
- 流程发布前必须先保存
- 本技能不读写 memory，processCode 等信息输出到 stdout

## 异常处理

| 异常场景 | 处理方式 |
|---------|----------|
| 流程保存失败 | 检查 processCode 是否正确，确认登录态有效 |
| 条件分支报错 | 确认最后一个 conditionNode 的 `conditionType` 为 `"else"` |
| fieldId 不存在 | 先执行 `openyida get-schema` 获取真实 fieldId |
| 流程发布后未生效 | 确认已执行发布步骤（save 后还需 publish），检查流程版本 |
| 嵌套分支超过 3 层 | 重新设计流程结构，将复杂条件拆分为多个节点 |

## Agent 错误处理策略

| 错误类型 | 默认处理策略 |
|---------|-------------|
| 命令执行失败 | 停止执行，向用户展示完整错误信息，询问是否重试或调整参数 |
| 参数格式错误 | 停止执行，提示正确的参数格式，引导用户修正 |
| 登录态失效 | 提示用户执行 `openyida login` 重新登录（脚本通常自动处理） |
| processCode 缺失 | 停止执行，不得编造，提示用户重新执行命令 |
| fieldId 不存在 | 停止执行，提示用户先执行 `yida-get-schema` 获取真实 ID |
| 用户拒绝确认 | 停止执行，询问用户是否需要调整配置 |
| 未知错误 | 停止执行，完整展示错误信息，建议用户反馈问题 |

## 与其他技能配合

| 步骤 | 技能 | 说明 |
| --- | --- | --- |
| 1 | `yida-create-app` | 创建应用，获取 `appType` |
| 2 | `yida-create-form-page` | 创建表单，获取 `formUuid` 和字段 ID |
| 3 | **本技能** | 配置表单的流程规则 |
| 4 | `yida-custom-page` / `yida-publish-page` | 编写并发布自定义页面 |

> **快捷方式**：`yida-create-process` 可一键完成步骤 2-3（创建表单 + 配置流程）。

## 参考文档

| 文档 | 内容 | 阅读时机 |
|------|------|---------|
| [examples.md](references/examples.md) | 4 个场景化完整示例（条件分支、回退规则、嵌套分支、自定义详情页） | 首次使用参考 |
| [process-ai-rules.md](references/process-ai-rules.md) | 字段权限自动生成规范、回退规则识别、完整检查清单 | 配置权限时必读 |
| [宜搭 API](../../references/yida-api.md) | 宜搭平台 API 完整参考 | 需要查阅 API 时 |
