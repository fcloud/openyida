---
name: yida-data-management
description: 宜搭数据管理。表单实例/流程实例/任务中心的查询、新增、更新。表单走 /v1/form/，流程走 /v1/process/，不能混用。
---

# 数据管理

## 严格禁止 (NEVER DO)

- 不要混用表单接口和流程接口，两套接口完全独立，参数和返回结构不同
- 不要编造 formInstId 或 processInstanceId，必须从查询结果中提取
- 不要用此命令修改表单结构（字段增删改），应使用 `yida-create-form-page`

## 严格要求 (MUST DO)

- 操作前先用 query 命令确认目标数据存在
- 批量操作单次不超过 30 条记录
- 删除数据前必须向用户展示操作摘要并获得明确确认

## 适用场景

用户需要"查询数据"、"新增记录"、"更新数据"、"查看表单实例"、"发起流程"时使用。

**关键区分**：
- 操作表单数据记录（增删改查）→ 本技能
- 修改表单结构（字段增删改）→ `yida-create-form-page`
- 表单接口（`/v1/form/`）vs 流程接口（`/v1/process/`）不能混用

## 危险操作确认

删除数据记录为不可逆操作，执行前必须：
1. 展示将删除的记录摘要（数量 + 关键字段）
2. 等待用户明确确认
3. 执行删除

---


> 表单与流程是两套独立接口，主键、参数、返回结构都不同，不能混用。

## 命令

### 表单实例

```bash
openyida data query form <appType> <formUuid> [--page 1 --size 20]
openyida data get form <appType> --inst-id <formInstId>
openyida data create form <appType> <formUuid> --data-json '<json>'
openyida data update form <appType> --inst-id <formInstId> --data-json '<json>'
openyida data query subform <appType> <formUuid> --inst-id <formInstId> --table-field-id <fieldId>
```

### 流程实例

```bash
openyida data query process <appType> <formUuid> [--instance-status RUNNING]
openyida data get process <appType> --process-inst-id <processInstanceId>
openyida data create process <appType> <formUuid> --process-code <processCode> --data-json '<json>'
openyida data update process <appType> --process-inst-id <processInstanceId> --data-json '<json>'
openyida data query operation-records <appType> --process-inst-id <processInstanceId>
openyida data execute task <appType> --task-id <taskId> --process-inst-id <processInstanceId> --out-result AGREE --remark '同意'
```

### 任务中心

```bash
openyida data query tasks <appType> --type todo|done|submitted|cc [--page 1 --size 20]
```

## 接口总览

### 表单实例

| 接口 | 方法 | 说明 |
|------|------|------|
| `searchFormDatas` | GET | 查询列表 |
| `searchFormDataIds` | GET | 查询 ID 列表 |
| `getFormDataById` | GET | 查询详情 |
| `saveFormData` | POST | 新增 |
| `updateFormData` | POST | 更新 |
| `listTableDataByFormInstIdAndTableId` | GET | 查询子表数据 |

### 流程实例

| 接口 | 方法 | 说明 |
|------|------|------|
| `startProcessInstance` | POST | 发起流程 |
| `getInstanceIds` | GET | 查询 ID 列表 |
| `getInstances` | GET | 查询列表 |
| `getInstanceById` | GET | 查询详情 |
| `updateInstance` | POST | 更新 |
| `getOperationRecords` | GET | 审批记录 |
| `executeTask` | POST | 执行任务 |

### 任务中心

| 接口 | 说明 |
|------|------|
| `getTodoTasksInApp` | 待办 |
| `getDoneTasksInApp` | 已完成 |
| `getMySubmitInApp` | 已提交 |
| `getNotifyMeTasksInApp` | 抄送 |

## 数据格式

### 查询条件 `searchFieldJson`

必须传**字符串**：

```json
[{"key":"textField_xxx","value":"测试","type":"TEXT","operator":"eq","componentName":"TextField"}]
```

### 保存/更新数据

```json
{"textField_xxx":"文本","numberField_xxx":10,"employeeField_xxx":["userId"]}
```

### 常见字段格式

| 组件类型 | 查询格式 | 保存格式 |
|---------|---------|----------|
| 文本 | `"文本"` | `"文本"` |
| 数字 | `["1","10"]` 或单值 | `1` |
| 单选 | `"选项一"` | `"选项一"` |
| 多选 | `["选项一"]` | `["选项一","选项二"]` |
| 日期 | `[开始时间戳,结束时间戳]` | `时间戳` |
| 成员 | `["userId"]` | `["userId"]` |
| 部门 | `["deptId"]` | `["deptId"]` |
| 子表 | `"模糊搜索"` | `[{"textField_xxx":"值"}]` |
| 关联表单 | 不支持直接查询 | `[{"appType":"xxx","formUuid":"xxx","instanceId":"xxx"}]` |

### 关联表单字段

关联表单字段保存时必须使用数组对象格式，包含三个必填字段：

```bash
# 示例：创建带关联客户的商机
openyida data create form APP_xxx FORM-商机表 --data-json '{
  "textField_xxx": "商机名称",
  "associationFormField_xxx": [{"appType":"APP_xxx","formUuid":"FORM-客户表","instanceId":"FINST-xxx"}]
}'
```

> 注意：字段名是 `instanceId`（不是 formInstId），三个字段缺一不可

## 注意事项

- `pageSize` 最大 100，QPS 限制约 40 次/秒
- `searchFieldJson` 和 `dynamicOrder` 必须传字符串
- 字段 ID 通过 `openyida get-schema` 获取，不要手写猜测
