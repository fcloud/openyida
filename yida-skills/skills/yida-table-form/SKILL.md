---
name: yida-table-form
description: 宜搭自定义页面表格形式批量表单提交技能。支持动态增删行、行内多字段编辑、行内验证、Excel 粘贴导入、草稿暂存（localStorage）、批量调用 saveFormData 提交。不适用于：单条表单提交（应使用 yida-custom-page 普通表单），或查询/展示已有数据（应使用 yida-data-management）。
---

# yida-table-form — 宜搭表格表单批量提交技能

## 核心规则

**致命（FATAL）**：
1. **不得串行提交**：批量提交必须用 `Promise.all` 并发，不得逐条等待
2. **不得跳过行验证**：提交前必须 `validateRow` 验证所有行
3. **不得硬编码 FORM_UUID**：必须从 `project/config.json` 或用户提供的信息中获取
4. **不得忽略失败行**：失败行必须在 UI 上标红，保留可编辑状态，提示用户修正

**重要（IMPORTANT）**：
1. **批量提交前必须确认**：向用户展示待提交数据摘要（行数、关键字段），获得明确同意后再执行
2. **必须在 `COLUMNS` 配置区定义所有列**，字段 ID 从表单 Schema 中提取
3. **必须实现草稿自动保存**（`localStorage`），防止刷新丢失数据
4. **提交成功后必须调用 `clearDraft()` 清除草稿**
5. **提交结果必须区分成功/失败数量**，失败行保留可编辑状态

## 适用场景与触发条件

| 用户意图 | 触发关键词 |
|---------|---------|
| 批量录入同类数据 | "批量添加"、"批量录入"、"Excel 导入" |
| 行内编辑 + 批量保存 | "表格形式填写"、"多行同时编辑" |
| Excel 粘贴导入 | "从 Excel 粘贴"、"复制粘贴数据" |

**不适用场景（应使用其他技能）**：

| 场景 | 应使用技能 |
|------|---------|
| 单条数据录入（标准表单） | `yida-custom-page` |
| 需要审批的流程表单 | `yida-create-process` |
| 数据查询和展示 | `yida-data-management` 或 `yida-report` |
| 批量更新已有记录 | `yida-data-management` 的 update 接口 |
| 移动端页面 | 标准表单（表格表单移动端体验差） |

## 功能概览

- **动态增删行**：末尾新增空行 / 删除行（已提交行不可删），始终保留至少一行
- **行内多字段编辑**：在 `COLUMNS` 中定义列，支持 `text` / `select` / `date` 类型
- **行内验证**：提交前自动验证必填/格式，失败行标红，全部通过才发起提交
- **Excel 粘贴导入**：按 Tab 分隔列、换行分隔行，追加到现有数据后（列顺序需与 `COLUMNS` 一致）
- **草稿暂存**：每次修改自动存 `localStorage`（key: `yida_table_form_draft_{formUuid}`），刷新后自动恢复
- **批量提交**：`Promise.all` 并发调用 `saveFormData`，成功行变绿 ✓，失败行标红可重试

## 核心数据结构

每行数据结构：`{ id, fieldA, fieldB, ..., _status, _errors }`
- `id`：`'temp_' + Date.now()`，提交后替换为 `formInstId`
- `_status`：`'valid'` | `'invalid'` | `'submitting'` | `'submitted'`
- `_errors`：`{ fieldA: '必填', fieldB: '格式错误' }`

## 命令 & 代码示例

获取完整示例代码（含动态增删行、行内验证、Excel 粘贴、草稿暂存、批量提交）：

```bash
openyida sample yida-table-form table-form-batch-submit
```

> 完整配置示例与使用场景见 [examples.md](references/examples.md)。

## 异常处理

| 异常场景 | 处理方式 |
|---------|----------|
| 批量提交部分失败 | 失败行标红，保留可编辑状态，提示修正后重新提交 |
| fieldId 不存在 | 先执行 `yida-get-schema` 获取真实 fieldId |
| 草稿恢复失败 | 提示用户 localStorage 可能被清空，重新录入 |
| 接口超时 | 减少单次提交条数（建议 ≤50 条），分批提交 |
| 数据量过大 | 建议分批录入，每批不超过 100 条 |

## Agent 错误处理策略

当 Agent 执行本技能遇到错误时，必须遵循以下默认行为：

| 错误类型 | 默认处理策略 |
|---------|-------------|
| 代码生成失败 | 停止执行，向用户展示错误信息，询问是否重试或调整需求 |
| 参数缺失（FORM_UUID/字段 ID 等） | 主动询问用户补充，或引导用户使用 `yida-get-schema` 获取 |
| 权限不足 / 登录态失效 | 停止执行，提示用户执行 `openyida auth status` 检查登录态 |
| 批量提交部分失败 | 展示失败行详情，保留可编辑状态，引导用户修正后重试 |
| 字段类型不支持 | 停止执行，提示该字段类型暂不支持，建议调整表单设计 |
| 未知错误 | 停止执行，完整展示错误信息，建议用户反馈问题 |

## 与其他技能配合

| 步骤 | 技能 | 说明 |
| --- | --- | --- |
| 1 | `yida-get-schema` | 获取表单字段 ID，填入 `COLUMNS` 配置 |
| 2 | **本技能** | 编写表格表单页面代码 |
| 3 | `yida-publish-page` | 发布自定义页面 |

## 注意事项

- **本技能不读写 memory**：草稿数据通过 `localStorage` 在浏览器本地持久化，不依赖跨会话 memory

## 参考文档

| 文档 | 内容 | 阅读时机 |
|------|------|---------|
| [examples.md](references/examples.md) | 完整代码示例 + 配置模板 | 开发实现时 |
| sample: `yida-table-form` | 可运行代码示例 | `openyida sample yida-table-form` |
| [宜搭 API](../../references/yida-api.md) | 宜搭平台 API 完整参考 | 需要查阅 API 时 |
