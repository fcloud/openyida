---
name: yida-create-form-page
description: 宜搭表单页面创建与更新。适用于：创建新表单、新建数据收集页面、设计表单结构、添加/修改/删除表单字段、录入页面搭建。支持 19 种字段类型（文本、选择、日期、子表、关联表单等）。不适用于操作表单数据记录（→ yida-data-management）或创建无字段自定义展示页面（→ yida-create-page）。
---

# 表单页面创建与更新

## 核心规则

### 致命规则（FATAL）

违反会导致功能失败或运行时报错：

1. **不要编造 formUuid** — 必须从命令返回的 JSON 中提取
2. **update 模式禁止猜测 fieldId** — 必须先用 `yida-get-schema` 获取
3. **不要用此命令操作数据记录** — 增删改查应使用 `yida-data-management`

### 重要规则（IMPORTANT）

影响代码质量和用户体验：

1. **create 成功后记录 formUuid** — 写入 `.cache/<项目名>-schema.json`
2. **update 前必须确认字段 ID** — 先用 `openyida get-schema` 确认
3. **本技能不读写 memory** — formUuid 等信息输出到 stdout，通过 `.cache/<项目名>-schema.json` 持久化

## 适用场景

用户需要"创建表单"、"新增字段"、"修改表单结构"时使用。

**关键区分**：
- 修改表单结构（字段增删改）→ 本技能 update 模式
- 操作表单中的数据记录 → `yida-data-management`

## 触发条件

**正向触发**：
- "创建表单"、"新建表单"、"添加表单"
- "新增字段"、"添加字段"、"修改字段"、"删除字段"
- "修改表单结构"、"更新表单"
- 已有 appType，需要在应用下建立数据收集入口

**不适用场景（不要触发）**：
- 操作表单数据记录（增删改查）→ `yida-data-management`
- 创建无字段的自定义展示页面 → `yida-create-page`
- 配置表单字段权限 → `yida-form-permission`

---


## create 模式

```bash
openyida create-form create <appType> <formTitle> <fieldsJsonOrFile> [--layout double|card] [--theme compact|comfortable] [--label-align top|left]
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `appType` | 是 | 应用 ID |
| `formTitle` | 是 | 表单名称 |
| `fieldsJsonOrFile` | 是 | 字段定义 JSON 字符串（以 `[` 开头）或文件路径 |

### 输出

```json
{"success":true,"formUuid":"FORM-XXX","formTitle":"用户信息表","appType":"APP_xxx","fieldCount":4,"url":"{base_url}/APP_xxx/workbench/FORM-XXX"}
```

## update 模式

```bash
openyida create-form update <appType> <formUuid> <changesJsonOrFile>
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `appType` | 是 | 应用 ID |
| `formUuid` | 是 | 表单 UUID |
| `changesJsonOrFile` | 是 | 修改定义 JSON 字符串或文件路径 |

### 输出

```json
{"success":true,"formUuid":"FORM-YYY","appType":"APP_XXX","changesApplied":3,"url":"{base_url}/APP_XXX/workbench/FORM-YYY"}
```

## 字段定义 JSON 格式

```json
[
  { "type": "TextField", "label": "姓名", "required": true },
  { "type": "SelectField", "label": "部门", "dataSource": [{"text":{"zh_CN":"技术部","en_US":"技术部","type":"i18n"},"value":"技术部"}] },
  { "type": "DateField", "label": "入职日期" },
  { "type": "TableField", "label": "费用明细", "children": [
    { "type": "TextField", "label": "项目" },
    { "type": "NumberField", "label": "金额" }
  ]}
]
```

> **国际化格式说明**：`dataSource` 中的 `text.zh_CN` / `text.en_US` 为必填，即使只用中文也需同时填写两个语言字段。

### 字段属性

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | String | 是 | 字段类型（见下方类型表） |
| `label` | String | 是 | 字段标签 |
| `required` | Boolean | 否 | 是否必填，默认 `false` |
| `placeholder` | String | 否 | 占位提示 |
| `behavior` | String | 否 | `NORMAL`（默认）/ `READONLY` / `HIDDEN` |
| `visibility` | String[] | 否 | `["PC", "MOBILE"]`（默认） |
| `dataSource` | Array | 条件必填 | 选项类字段必填 |
| `multiple` | Boolean | 否 | 是否多选 |
| `children` | Object[] | 条件必填 | `TableField` 必填 |
| `associationForm` | Object | 条件必填 | `AssociationFormField` 必填 |

各字段类型默认属性参考 [表单字段属性参考](references/form-field-properties.md)。

## 修改定义 JSON 格式（update 模式）

```json
[
  { "action": "add", "field": { "type": "TextField", "label": "姓名", "required": true }, "after": "部门" },
  { "action": "delete", "label": "备注" },
  { "action": "update", "label": "年龄", "changes": { "required": true, "placeholder": "请输入年龄" } }
]
```

| 操作 | 必填属性 | 说明 |
|------|---------|------|
| `add` | `field.type`, `field.label` | 新增字段，`after`/`before` 指定位置 |
| `delete` | `label` | 删除字段 |
| `update` | `label`, `changes` | 修改字段属性，子表内字段需 `tableLabel` |

### update changes 支持的属性

`label`、`required`、`placeholder`、`dataSource`、`multiple`、`behavior`、`visibility`、`innerAfter`（字段后缀单位，仅 NumberField 支持）

## 支持的字段类型

| 字段类型 | 说明 | 特殊属性 |
|---------|------|----------|
| `TextField` | 单行文本 | — |
| `TextareaField` | 多行文本 | — |
| `RadioField` | 单选 | `dataSource` |
| `SelectField` | 下拉单选 | `dataSource` |
| `CheckboxField` | 多选 | `dataSource` |
| `MultiSelectField` | 下拉多选 | `dataSource` |
| `NumberField` | 数字 | — |
| `RateField` | 评分 | — |
| `DateField` | 日期 | — |
| `CascadeDateField` | 级联日期 | — |
| `EmployeeField` | 成员 | `multiple` |
| `DepartmentSelectField` | 部门 | `multiple` |
| `CountrySelectField` | 国家 | `multiple` |
| `AddressField` | 地址 | — |
| `AttachmentField` | 附件 | — |
| `ImageField` | 图片 | — |
| `TableField` | 子表 | `children` |
| `AssociationFormField` | 关联表单 | `associationForm` |
| `SerialNumberField` | 流水号 | 自动生成 |

## 注意事项

- 临时文件写在 `.cache/` 目录中
- update 模式操作按顺序执行，注意依赖关系
- 字段匹配基于中文标签（`label.zh_CN`）
- 如需创建自定义展示页面（无字段），请使用 `yida-create-page`

## 异常处理

| 异常场景 | 处理方式 |
|---------|----------|
| create 返回失败 | 检查 appType 是否正确，确认登录态有效 |
| update 模式找不到字段 | 先用 `openyida get-schema` 确认字段标签（label）拼写正确 |
| 字段类型不支持 | 检查字段类型是否在支持的 19 种类型列表中 |
| 子表字段创建失败 | 确认 `children` 数组格式正确，子表字段不能嵌套子表 |
| 返回 JSON 中无 formUuid | 不要猜测 formUuid，重新执行命令获取 |

## 参考文档

| 文档 | 内容 | 阅读时机 |
|------|------|----------|
| [form-field-properties.md](references/form-field-properties.md) | 各字段类型默认属性参考 | 创建/修改字段时必读 |
| [association-form-field.md](references/association-form-field.md) | 关联表单字段配置 | 使用 AssociationFormField 时必读 |
| [employee-field.md](references/employee-field.md) | 成员字段配置 | 使用 EmployeeField 时参考 |
| [serial-number-field.md](references/serial-number-field.md) | 流水号字段配置 | 使用 SerialNumberField 时参考 |

