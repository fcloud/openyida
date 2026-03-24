# 芯片任务管理系统 需求文档

## 应用配置

| 配置项 | 值 |
| --- | --- |
| appType | APP_VYEAFZJ3KY5PIWNIWC1I |
| corpId | ding8196cd9a2b2405da24f2f5cc6abecb85 |
| baseUrl | https://ding.aliwork.com |

### 表单配置

| 表单名称 | formUuid | 字段数 |
| --- | --- | --- |
| 项目管理 | FORM-C7DD9D17149147B1A4ABE31470A94F138B36 | 12 |
| 任务管理 | FORM-B99CCB1284774999A94BE95E990E3A71T8HJ | 14 |
| BOM物料清单 | FORM-44BF80BFC27C40098A3212442B6CF1C6XYJX | 13 |

### 自定义页面配置

| 页面名称 | formUuid |
| --- | --- |
| 任务看板 | FORM-D10E6ABF4B9F4C168F2A378D1CF81F58DOV7 |

## 系统概述

IPD（Integrated Product Development，集成产品开发）系统，用于管理芯片生产全流程，从需求分析到量产发布的完整生命周期管理。

## 核心流程

```
需求管理 → 项目立项 → 版本规划 → 任务分解 → 开发执行 → 验证测试 → 评审决策 → 发布量产
```

## 功能模块

### 1. 需求管理

| 字段名称 | 字段类型 | 说明 |
| --- | --- | --- |
| 需求编号 | SerialNumberField / 流水号 | 自动生成，如 REQ-2024-0001 |
| 需求标题 | TextField / 单行文本 | 必填 |
| 需求类型 | SelectField / 下拉单选 | 功能需求、性能需求、工艺需求、良率需求 |
| 需求来源 | SelectField / 下拉单选 | 客户需求、市场分析、技术演进、内部优化 |
| 优先级 | SelectField / 下拉单选 | P0-紧急、P1-高、P2-中、P3-低 |
| 需求状态 | SelectField / 下拉单选 | 待评审、评审中、已通过、已拒绝、开发中、已完成、已关闭 |
| 芯片产品 | TextField / 单行文本 | 关联的芯片产品名称 |
| 详细描述 | TextareaField / 多行文本 | 需求详细说明 |
| 验收标准 | TextareaField / 多行文本 | 验收标准说明 |
| 提出日期 | DateField / 日期 | 需求提出日期 |
| 期望完成日期 | DateField / 日期 | 期望完成时间 |
| 提出人 | EmployeeField / 成员 | 需求提出人 |
| 负责人 | EmployeeField / 成员 | 需求负责人 |

### 2. 项目管理

| 字段名称 | 字段类型 | 说明 |
| --- | --- | --- |
| 项目编号 | SerialNumberField / 流水号 | 自动生成，如 PRJ-2024-0001 |
| 项目名称 | TextField / 单行文本 | 必填 |
| 项目类型 | SelectField / 下拉单选 | 新品开发、版本迭代、工艺优化、良率提升 |
| 项目状态 | SelectField / 下拉单选 | 立项中、进行中、已暂停、已完成、已取消 |
| 项目阶段 | SelectField / 下拉单选 | 概念阶段、计划阶段、开发阶段、验证阶段、发布阶段、量产阶段 |
| 关联需求 | AssociationFormField / 关联表单 | 关联需求管理表单 |
| 芯片产品 | TextField / 单行文本 | 芯片产品名称 |
| 流程节点 | SelectField / 下拉单选 | 28nm、14nm、7nm、5nm 等 |
| 开始日期 | DateField / 日期 | 项目开始日期 |
| 计划完成日期 | DateField / 日期 | 计划完成时间 |
| 实际完成日期 | DateField / 日期 | 实际完成时间 |
| 项目经理 | EmployeeField / 成员 | 项目经理 |
| 项目成员 | EmployeeField / 成员（多人） | 项目团队成员 |
| 项目预算 | NumberField / 数字 | 项目预算（万元） |
| 项目描述 | TextareaField / 多行文本 | 项目详细描述 |

### 3. 版本管理

| 字段名称 | 字段类型 | 说明 |
| --- | --- | --- |
| 版本编号 | TextField / 单行文本 | 如 v1.0.0、v1.1.0 |
| 版本名称 | TextField / 单行文本 | 版本名称 |
| 关联项目 | AssociationFormField / 关联表单 | 关联项目管理表单 |
| 芯片产品 | TextField / 单行文本 | 芯片产品名称 |
| 版本类型 | SelectField / 下拉单选 | 大版本、小版本、补丁版本 |
| 版本状态 | SelectField / 下拉单选 | 规划中、开发中、测试中、已发布、已归档 |
| 发布日期 | DateField / 日期 | 发布日期 |
| 版本说明 | TextareaField / 多行文本 | 版本更新说明 |
| 变更内容 | TextareaField / 多行文本 | 主要变更内容 |
| 负责人 | EmployeeField / 成员 | 版本负责人 |

### 4. 任务/工单管理

| 字段名称 | 字段类型 | 说明 |
| --- | --- | --- |
| 任务编号 | SerialNumberField / 流水号 | 自动生成，如 TASK-2024-0001 |
| 任务标题 | TextField / 单行文本 | 必填 |
| 关联项目 | AssociationFormField / 关联表单 | 关联项目管理表单 |
| 关联需求 | AssociationFormField / 关联表单 | 关联需求管理表单 |
| 任务类型 | SelectField / 下拉单选 | 设计任务、开发任务、验证任务、测试任务、文档任务 |
| 任务状态 | SelectField / 下拉单选 | 待开始、进行中、已完成、已取消 |
| 优先级 | SelectField / 下拉单选 | P0-紧急、P1-高、P2-中、P3-低 |
| 工时预估 | NumberField / 数字 | 预估工时（小时） |
| 实际工时 | NumberField / 数字 | 实际工时（小时） |
| 开始日期 | DateField / 日期 | 任务开始日期 |
| 截止日期 | DateField / 日期 | 任务截止日期 |
| 完成日期 | DateField / 日期 | 实际完成日期 |
| 执行人 | EmployeeField / 成员 | 任务执行人 |
| 任务描述 | TextareaField / 多行文本 | 任务详细描述 |
| 完成说明 | TextareaField / 多行文本 | 完成情况说明 |

### 5. 缺陷管理

| 字段名称 | 字段类型 | 说明 |
| --- | --- | --- |
| 缺陷编号 | SerialNumberField / 流水号 | 自动生成，如 BUG-2024-0001 |
| 缺陷标题 | TextField / 单行文本 | 必填 |
| 关联项目 | AssociationFormField / 关联表单 | 关联项目管理表单 |
| 关联版本 | AssociationFormField / 关联表单 | 关联版本管理表单 |
| 缺陷类型 | SelectField / 下拉单选 | 功能缺陷、性能缺陷、工艺缺陷、良率问题 |
| 严重程度 | SelectField / 下拉单选 | 致命、严重、一般、轻微 |
| 缺陷状态 | SelectField / 下拉单选 | 新建、确认中、处理中、已解决、已验证、已关闭、重新打开 |
| 发现阶段 | SelectField / 下拉单选 | 设计阶段、开发阶段、测试阶段、量产阶段 |
| 发现日期 | DateField / 日期 | 缺陷发现日期 |
| 解决日期 | DateField / 日期 | 缺陷解决日期 |
| 发现人 | EmployeeField / 成员 | 缺陷发现人 |
| 处理人 | EmployeeField / 成员 | 缺陷处理人 |
| 缺陷描述 | TextareaField / 多行文本 | 缺陷详细描述 |
| 解决方案 | TextareaField / 多行文本 | 解决方案说明 |

### 6. 评审决策管理

| 字段名称 | 字段类型 | 说明 |
| --- | --- | --- |
| 评审编号 | SerialNumberField / 流水号 | 自动生成，如 REV-2024-0001 |
| 评审标题 | TextField / 单行文本 | 必填 |
| 关联项目 | AssociationFormField / 关联表单 | 关联项目管理表单 |
| 评审类型 | SelectField / 下拉单选 | 需求评审、设计评审、技术评审、发布评审、里程碑评审 |
| 评审阶段 | SelectField / 下拉单选 | 概念阶段评审、计划阶段评审、开发阶段评审、验证阶段评审、发布评审 |
| 评审状态 | SelectField / 下拉单选 | 待评审、评审中、已通过、有条件通过、未通过 |
| 评审结果 | SelectField / 下拉单选 | 通过、有条件通过、不通过、延期评审 |
| 评审日期 | DateField / 日期 | 评审日期 |
| 评审主持人 | EmployeeField / 成员 | 评审主持人 |
| 评审参与人 | EmployeeField / 成员（多人） | 评审参与人 |
| 评审意见 | TextareaField / 多行文本 | 评审意见和建议 |
| 待办事项 | TextareaField / 多行文本 | 评审待办事项 |

## 关联关系

```
需求管理 ←→ 项目管理 (一对多)
项目管理 ←→ 版本管理 (一对多)
项目管理 ←→ 任务管理 (一对多)
需求管理 ←→ 任务管理 (一对多)
版本管理 ←→ 缺陷管理 (一对多)
项目管理 ←→ 评审管理 (一对多)
```

## UI 设计

- 风格：简洁专业，适合芯片研发团队使用
- 布局：顶部导航 + 左侧菜单 + 主内容区
- 颜色：科技蓝色调，体现专业感
