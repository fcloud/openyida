---
name: yida-get-schema
description: 获取表单的完整 Schema 结构，用于确认字段 ID（fieldId）和组件配置。
---

# 获取表单 Schema

## 严格禁止 (NEVER DO)

- **绝对禁止猜测或编造 fieldId**，宜搭字段 ID 由平台随机生成（格式如 `textField_eftt1aa5m`、`selectField_fix024y92`），无法从字段名称推断，必须通过此命令获取
- 不要在未获取 Schema 的情况下执行任何涉及字段 ID 的操作

## 严格要求 (MUST DO)

- **凡是需要用到字段 ID（fieldId）的操作，必须先执行此命令**，不得跳过
- 将关键字段 ID 映射（字段名 → fieldId）记录到 `.cache/<项目名>-schema.json`，供后续操作复用
- **录入/更新数据后，必须用 `openyida data query --size 1` 抽查一条记录，确认 `formData` 中字段有实际值（非空 `""`），若全部为空说明字段 ID 有误，需重新排查**

## 适用场景

在执行以下操作前**必须**使用：
- **新增/录入表单数据**（`yida-data-management` create）← 最常见的遗漏场景，必须先 get-schema
- 更新表单数据（`yida-data-management` update）
- 配置数据查询条件（`yida-data-management` query searchFieldJson）
- 更新表单字段结构（`yida-create-form-page` update 模式）
- 配置流程字段权限（`yida-process-rule`）
- 自定义页面中引用字段 ID 常量（`yida-custom-page`）

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
