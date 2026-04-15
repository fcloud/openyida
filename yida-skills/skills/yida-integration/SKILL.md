---
name: yida-integration
description: 宜搭集成&自动化配置技能。支持创建/查询/开启/关闭集成自动化，包括消息通知、新增数据、获取数据、更新数据、条件分支等节点。不适用于：配置审批流程（应使用 yida-process-rule），或直接操作表单数据（应使用 yida-data-management）。
---

# yida-integration — 宜搭集成&自动化（逻辑流）技能

本技能用于在宜搭平台创建「集成&自动化」（逻辑流），支持场景：**表单事件触发 → 多节点组合处理 → 钉钉工作通知 / 数据操作**。

## 核心规则

**致命（FATAL）**：
1. **不得编造 formUuid / fieldId**：必须从已有记录或 `yida-get-schema` 获取
2. **不得用此技能配置审批流程**：审批流程使用 `yida-process-rule`
3. **未读本 SKILL.md 不得编写逻辑流定义**：节点格式复杂且易出错

**重要（IMPORTANT）**：
1. **创建/发布前必须确认**：向用户展示逻辑流配置摘要（触发条件、节点列表、通知对象），获得确认后再执行
2. **创建前先确认** 触发表单的 formUuid 和相关字段 ID
3. **创建成功后** 记录逻辑流 ID 到 `.cache/<项目名>-schema.json`

## 适用场景

| 用户意图 | 触发关键词 |
|---------|---------|
| 表单提交后自动通知 | "自动通知"、"数据变更触发"、"集成&自动化" |
| 数据操作自动化 | "自动新增"、"自动更新"、"逻辑流" |
| 人工审批流程 | → 改用 `yida-process-rule` |

## 功能概述

- 监听指定表单的新增 / 更新 / 删除 / 评论事件
- 可选：从另一张表单获取单条数据（按触发表单字段值过滤）
- 可选：向指定表单新增数据（含公式赋值）
- 可选：更新指定表单数据
- 可选：条件分支（根据上游节点数据走不同分支）
- 通知内容支持引用表单字段变量
- 支持保存为草稿或直接发布

### 变量引用格式（统一定义）

| 使用场景 | 格式 | 示例 |
|---------|------|------|
| 通知标题/内容中引用字段 | `#{fieldId-ComponentType}#` | `#{textField_name-TextField}#` |
| 公式中引用触发表单字段 | `#{fieldId}` | `#{textField_abc}` |
| 赋值中引用触发表单字段 | `processVar` + `fieldId` | `valueType: "processVar", value: "textField_abc"` |
| 赋值中引用上游节点字段 | `column` + `${nodeId}.fieldId` | `"${node_xxx}.numberField_abc"` |
| 赋值固定值 | `literal` + 值 | `valueType: "literal", value: "已处理"` |

> ⚠️ 公式中引用字段变量格式为 `#{fieldId}`（不带组件类型），与消息通知中的 `#{fieldId-ComponentType}#` 不同。

## 命令格式

```bash
openyida integration create <appType> <formUuid> <flowName> [选项]
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `appType` | 是 | 应用 ID，如 `APP_XXXX` |
| `formUuid` | 是 | 触发表单 UUID，如 `FORM-XXXX` |
| `flowName` | 是 | 逻辑流名称 |

常用选项：`--receivers`、`--title`、`--content`、`--events`、`--publish`、`--data-form-uuid`、`--add-data-form-uuid`

```bash
# 最简用法：表单新增时通知指定用户，保存并发布
openyida integration create APP_XXX FORM-XXX "新增记录通知" \
  --receivers user123 --title "有新记录提交" --publish
```

> 📖 完整选项说明及更多场景示例（跨表同步、跨表查询通知、引用字段变量）见 [examples.md](references/examples.md)。

## 输出结果

命令执行成功后，向 stdout 输出 JSON：

```json
{
  "success": true,
  "published": false,
  "processCode": "LPROC-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "flowName": "新增记录通知",
  "appType": "APP_XXX",
  "formUuid": "FORM-XXX",
  "formEventTypes": ["insert"]
}
```

加 `--publish` 后 `published` 为 `true`。若发布失败，`published` 为 `false` 并附带 `warning` 字段说明原因。

## 逻辑流节点结构

支持 8 种节点：trigger、sendMessage、dataCreate、dataRetrieve、dataUpdate、route、condition、finish。

> 📖 节点类型速查、典型链路示例、各节点 JSON 结构详解、字段赋值 valueType 规律、变量引用格式对照见 [integration-node-schemas.md](references/integration-node-schemas.md)。

## 调用流程

1. 读取 `.cache/cookies.json` 获取登录态（不存在则触发扫码登录）
2. 若未传入 `--process-code`，调用 `createLogicflow.json` 新建绑定关系，获取 `processCode`
3. 根据节点配置构建 `json`（节点定义）和 `viewJson`（画布 Schema）
4. 调用 `saveProcess`（`isOnline=false`）保存草稿
5. 若指定 `--publish`，再次调用 `saveProcess`（`isOnline=true`）发布

> ⚠️ 必须先 `createLogicflow.json` 新建绑定关系，再 `saveProcess` 写入。直接调用 `saveProcess` 无法创建新逻辑流。

## 与其他技能配合

| 步骤 | 技能 | 产出 |
|------|------|------|
| 创建应用 | `yida-create-app` | appType |
| 创建表单 | `yida-create-form-page` | formUuid |
| 查询字段 | `yida-get-schema` | fieldId + ComponentType |
| 创建逻辑流 | 本技能 | processCode |
| 公式计算 | `yida-formula` | CONCATENATE、IF 等 |

## 注意事项

- `--receivers` 填写宜搭/钉钉用户 ID（`userId`），不是姓名
- 触发事件：`insert`（新增）、`update`（更新）、`delete`（删除）、`comment`（评论），也支持别名 `create`
- `processCode` 格式为 `LPROC-` 加 38 位大写字母数字，不传则自动生成
- 保存和发布使用同一接口 `saveProcess`，通过 `isOnline` 参数区分
- 本技能不读写 memory，processCode 等信息输出到 stdout

## 异常处理

| 异常场景 | 处理方式 |
|---------|----------|
| 创建集成失败 | 检查 appType 和 formUuid 是否正确，确认登录态有效 |
| fieldId 不存在 | 先执行 `openyida get-schema` 获取真实 fieldId |
| 开启/关闭失败 | 先查询获取 integrationId，不能手写猜测 |
| 消息通知未发送 | 确认触发条件已在宜搭管理后台配置，检查接收人 userId 格式 |
| CSRF 校验失败（TIANSHU_000030） | 脚本自动刷新 token 后重试，无需手动干预 |
| 登录过期（307） | 脚本自动重新登录后重试，无需手动干预 |
| userId 格式错误 | 确认使用宜搭/钉钉用户 ID（数字字符串），非姓名 |
| 发布失败但保存成功 | 检查 `published` 字段，可能是权限问题，建议在宜搭后台手动发布 |
| 网络超时 | 检查网络连接，等待后重试 |

## Agent 错误处理策略

当 Agent 执行本技能遇到错误时，必须遵循以下默认行为：

| 错误类型 | 默认处理策略 |
|---------|-------------|
| 命令执行失败 | 停止执行，向用户展示完整错误信息，询问是否重试或调整参数 |
| 参数格式错误 | 停止执行，提示正确的参数格式，引导用户修正 |
| 登录态失效 | 提示用户执行 `openyida login` 重新登录（脚本通常自动处理） |
| processCode 缺失 | 停止执行，不得编造，提示用户重新执行命令 |
| fieldId 不存在 | 停止执行，提示用户先执行 `yida-get-schema` 获取真实 ID |
| userId 格式错误 | 停止执行，提示用户提供正确的宜搭/钉钉用户 ID |
| 用户拒绝确认 | 停止执行，询问用户是否需要调整配置 |
| 发布失败 | 展示错误信息，建议用户在宜搭后台手动发布或检查权限 |
| 未知错误 | 停止执行，完整展示错误信息，建议用户反馈问题 |

## 参考文档

| 文档 | 覆盖范围 | 何时阅读 |
|------|---------|---------|
| [节点结构参考](references/integration-node-schemas.md) | 8 种节点 JSON 结构、接口参数、变量引用格式 | 构建复杂逻辑流前必读 |
| [使用示例](references/examples.md) | 3 个场景化完整示例、常见错误 | 首次使用参考 |
| [宜搭 API](../../references/yida-api.md) | 表单/流程 API 完整参数 | 需要查询数据时 |

