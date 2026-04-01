---
name: yida-create-process
description: 流程表单一体化创建。整合创建表单 → 转流程表单 → 获取 processCode → 配置流程四步为一步。
---

# 流程表单一体化创建

## 严格禁止 (NEVER DO)

- 不要编造 processCode，必须从命令返回的 JSON 中提取
- 不要在流程定义中使用猜测的 fieldId，必须先用 `yida-get-schema` 获取

## 严格要求 (MUST DO)

- 优先使用用法 2（先创建表单获取字段 ID，再 `--formUuid` 转流程）
- 创建成功后，将 formUuid 和 processCode 记录到 `.cache/<项目名>-schema.json`
- 流程定义中字段 ≥ 3 且审批节点 ≥ 2 时，必须自动配置字段权限

## 适用场景

用户需要"创建审批流程"、"新建流程表单"、"搭建审批系统"时使用。

**关键区分**：
- 从零创建流程表单（含表单+流程配置）→ 本技能
- 为已有表单配置/修改审批规则 → `yida-process-rule`

---


## 用法 1：全新创建

```bash
openyida create-process <appType> <formTitle> <fieldsJsonFile> <processDefinitionFile>
```

## 用法 2：复用已有表单（推荐）

```bash
openyida create-process <appType> --formUuid <formUuid> <processDefinitionFile>
```

> **推荐用法 2**：先用 `openyida create-form create` 创建表单获取字段 ID，再用 `--formUuid` 转流程表单。

| 参数 | 必填 | 说明 |
|------|------|------|
| `appType` | 是 | 应用 ID |
| `formTitle` | 用法 1 必填 | 表单名称 |
| `fieldsJsonFile` | 用法 1 必填 | 字段定义文件（格式同 `yida-create-form-page`） |
| `--formUuid` | 用法 2 必填 | 已有表单 UUID |
| `processDefinitionFile` | 是 | 流程定义文件（格式同 `yida-process-rule`） |

## 输出

```json
{"success":true,"formUuid":"FORM-YYY","formTitle":"订单处理表","appType":"APP_XXX","fieldCount":6,"processCode":"TPROC--XXX","url":"{base_url}/APP_XXX/workbench/FORM-YYY"}
```

## 推荐两步流程

```bash
# Step 1: 创建表单获取字段 ID
openyida create-form create "APP_XXX" "订单处理表" fields.json

# Step 2: 将已有表单转为流程表单
openyida create-process "APP_XXX" --formUuid "FORM-YYY" process-definition.json
```

> 流程定义中的 `fieldId` 需在表单创建后确定。如流程不含条件分支，可用用法 1 一步到位。

## AI 自动生成流程特性

生成流程定义 JSON 时，**必须自动分析并生成**：

1. **🔐 字段权限**：当字段 ≥ 3 且审批节点 ≥ 2 时，每个节点只允许编辑相关字段
2. **🔄 跳转规则**：存在回退/循环语义时，自动配置 `routeRules`

详见 `yida-process-rule` 的 SKILL.md。
