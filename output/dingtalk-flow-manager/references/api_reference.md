# 钉钉待办与审批 API 参考

## 概述

本文档记录调用钉钉待办和审批流程所需的 API 接口信息。实际调用通过 `dws` 技能执行。

## 待办事项 API

### 查询待办列表

**接口功能：** 获取当前用户的待办事项列表

**返回字段：**
- `flow_id`: 流程唯一标识
- `title`: 待办标题
- `initiator`: 发起人姓名
- `create_time`: 创建时间
- `type`: 待办类型
- `status`: 状态（pending/processing/completed）
- `url`: 待办详情页链接

**示例返回：**
```json
[
  {
    "flow_id": "TODO_001",
    "title": "请假申请",
    "initiator": "张三",
    "create_time": "2026-03-23 09:00",
    "type": "leave_request",
    "status": "pending"
  }
]
```

## 审批流程 API

### 查询待审批列表

**接口功能：** 获取当前用户需要审批的流程列表

**返回字段：**
- `flow_id`: 流程唯一标识
- `title`: 审批标题
- `initiator`: 发起人姓名
- `create_time`: 创建时间
- `process_code`: 审批模板编码
- `status`: 审批状态

**示例返回：**
```json
[
  {
    "flow_id": "APPROVAL_001",
    "title": "报销审批",
    "initiator": "王五",
    "create_time": "2026-03-22 18:00",
    "process_code": "EXPENSE_CLAIM",
    "status": "pending_approval"
  }
]
```

### 执行审批操作

**接口功能：** 对指定流程执行同意或拒绝操作

**请求参数：**
- `flow_id`: 流程 ID（必填）
- `action`: 操作类型（必填）
  - `approve`: 同意
  - `reject`: 拒绝
- `comment`: 审批意见/备注（可选）

**返回结果：**
- `success`: 是否成功
- `message`: 结果描述
- `flow_id`: 处理的流程 ID
- `new_status`: 新状态

**示例请求：**
```json
{
  "flow_id": "APPROVAL_001",
  "action": "approve",
  "comment": "同意，票据齐全"
}
```

**示例返回：**
```json
{
  "success": true,
  "message": "审批成功",
  "flow_id": "APPROVAL_001",
  "new_status": "approved"
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 404 | 流程不存在 |
| 403 | 无权限处理该流程 |
| 400 | 请求参数错误 |
| 409 | 流程已被他人处理 |
| 500 | 服务器内部错误 |

## 使用 dws 技能调用

在实际使用中，通过 `use_skill` 调用 `dws` 技能来执行上述 API：

```markdown
1. 查询待办：使用 dws 技能查询待办事项
2. 查询审批：使用 dws 技能查询待审批流程
3. 执行审批：使用 dws 技能执行审批操作，传入 flow_id、action、comment
```
