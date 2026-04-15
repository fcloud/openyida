---
name: yida-data-management
description: 宜搭数据管理。表单实例/流程实例/任务中心的查询、新增、更新。表单走 /v1/form/，流程走 /v1/process/，不能混用。
---

# yida-data-management — 宜搭数据管理

## 核心规则

**致命（FATAL）**：
1. **不得混用表单接口和流程接口**：两套接口完全独立，参数和返回结构不同（表单 `/v1/form/`，流程 `/v1/process/`）
2. **不得编造字段 ID / 实例 ID**：宜搭字段 ID 由平台随机生成（如 `textField_eftt1aa5m`），必须通过 `openyida get-schema` 获取；`formInstId` / `processInstanceId` 必须从查询结果中提取
3. **不得用此技能修改表单结构**（字段增删改）→ 使用 `yida-create-form-page`

**重要（IMPORTANT）**：
1. **录入/更新前必须获取 Schema**：执行 `openyida get-schema` 获取真实字段 ID，映射记录到 `.cache/<项目名>-schema.json`
2. **录入后必须抽查验证**：执行 `openyida data query` 抽查至少 1 条记录，确认 `formData` 中字段有实际值（非空），否则字段 ID 有误
3. **操作前先确认目标数据存在**：用 query 命令确认
4. **批量操作单次不超过 30 条**，`pageSize` 最大 100，QPS 约 40 次/秒
5. **删除前必须确认**：展示操作摘要（数量 + 关键字段），等待用户明确确认
6. **本技能不读写 memory**：数据操作通过 CLI 写入宜搭平台，不依赖跨会话状态

## 适用场景 / 触发条件

**正向触发**："查询数据"、"新增记录"、"更新数据"、"查看表单实例"、"发起流程"、"录入数据"、"批量导入"、"查询待办任务"

**不适用**：
- 修改表单结构（字段增删改）→ `yida-create-form-page`
- 配置集成自动化 → `yida-integration`
- 获取字段 ID → `yida-get-schema`

**关键区分**：操作数据记录（增删改查）→ 本技能；修改表单结构 → `yida-create-form-page`

## 命令 & 参数

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

## API 路径规则（表单 vs 流程）

> 表单与流程是两套独立接口，主键、参数、返回结构都不同，不能混用。

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

> 数据格式详见 [data-format-guide.md](references/data-format-guide.md)

关键要点：
- `searchFieldJson` 和 `dynamicOrder` 必须传**字符串**，不直接传对象
- 关联表单字段保存时使用数组对象格式，字段名是 `instanceId`（不是 formInstId），`appType` / `formUuid` / `instanceId` 三字段缺一不可

## 代码示例

> 需要参考表单字段定义和数据插入写法时，执行以下命令获取示例，再用 `read_file` 读取：

```bash
openyida sample yida-data-management form-field-template   # 表单字段定义模板及数据插入示例
```

## 异常处理 & Agent 策略

| 异常场景 | 处理方式 |
|---------|----------|
| 查询返回空结果 | 确认 formUuid 正确，检查查询条件是否过于严格 |
| 新增数据后字段值为空 | 字段 ID 有误，先执行 `openyida get-schema` 获取真实 fieldId |
| formInstId / processInstanceId 不存在 | 先用 query 命令确认记录存在，不要猜测 ID |
| 表单/流程接口混用 | 检查接口路径：表单用 `/v1/form/`，流程用 `/v1/process/` |
| 登录过期（401 / 307） | 执行 `openyida login` 重新登录 |
| QPS 超限（429） | 降低请求频率，批量操作单次不超过 30 条，间隔 1 秒重试 |
| 删除操作 | 执行前必须展示操作摘要并获得用户明确确认（不可逆） |
| 参数缺失 | 主动询问用户补充，或引导使用 `yida-get-schema` 获取 |
| 命令执行失败 | 停止执行，向用户展示错误信息，询问是否重试或调整参数 |
| 网络超时 | 重试 1 次，仍失败则停止并提示用户检查网络 |
| 未知错误 | 停止执行，完整展示错误信息，建议用户反馈问题 |

## 参考文档

| 文档 | 内容 | 阅读时机 |
|------|------|---------|
| [api-matrix.md](references/api-matrix.md) | API 接口矩阵（路径、参数、返回字段） | 选择接口时 |
| [data-format-guide.md](references/data-format-guide.md) | 数据格式详解（查询条件、保存格式、字段类型） | 构造请求参数时 |
| [verified-endpoints.md](references/verified-endpoints.md) | 已验证接口列表 | 确认可用性时 |
