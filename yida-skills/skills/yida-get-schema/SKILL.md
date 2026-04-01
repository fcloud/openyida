---
name: yida-get-schema
description: 获取表单的完整 Schema 结构，用于确认字段 ID（fieldId）和组件配置。
---

# 获取表单 Schema

## 严格禁止 (NEVER DO)

- 不要猜测或编造 fieldId，必须通过此命令获取后再使用
- 不要在未获取 Schema 的情况下执行字段更新操作

## 严格要求 (MUST DO)

- 需要使用字段 ID（fieldId）前，必须先执行此命令确认
- 将关键字段 ID 记录到 `.cache/<项目名>-schema.json`

## 适用场景

在执行以下操作前使用：
- 更新表单字段（`yida-create-form-page` update 模式）
- 配置数据查询条件（`yida-data-management`）
- 配置流程字段权限（`yida-process-rule`）

---


## 命令

```bash
openyida get-schema <appType> <formUuid>
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `appType` | 是 | 应用 ID |
| `formUuid` | 是 | 表单 UUID |

## 输出

完整的 Schema JSON 输出到 stdout，包含 `pages`、`componentsMap` 等字段结构。

> 编码前可用此命令确认表单中各字段的 `fieldId`。
