# 访客管理系统 - 需求文档

## 项目概述

访客管理系统是一个完整的企业访客管理解决方案，包含访客登记、审批流程、数据统计和工作台管理功能。

## 应用信息

| 配置项 | 值 |
|--------|-----|
| 应用名称 | 访客管理系统 |
| 应用ID (appType) | `APP_BNCATX2VTVCI8BLZ951A` |
| 组织ID (corpId) | `ding9a0954b4f9d9d40ef5bf40eda33b7ba0` |
| 域名 | https://www.aliwork.com |

## 功能模块

### 1. 访客登记表单（流程表单）

| 配置项 | 值 |
|--------|-----|
| 表单名称 | 访客登记表 |
| 表单ID (formUuid) | `FORM-2151CF26A22840EC9A85A38C40918F840WOP` |
| 流程Code (processCode) | `TPROC--MQD66371RJ34ZK13KVNET8TP864F2GUBE5ZMM4` |
| 访问链接 | https://www.aliwork.com/APP_BNCATX2VTVCI8BLZ951A/submission/FORM-2151CF26A22840EC9A85A38C40918F840WOP |

**表单字段：**

| 字段名称 | 字段类型 | 字段ID | 必填 |
|----------|----------|--------|------|
| 访客编号 | 流水号 | `serialNumberField_clvt1yf11` | 是 |
| 访客姓名 | 单行文本 | `textField_clvt264ze` | 是 |
| 访客手机号 | 单行文本 | `textField_clvt3a8k3` | 是 |
| 访客公司 | 单行文本 | `textField_clvt481lp` | 是 |
| 被访人 | 成员选择 | `employeeField_clvt53nk0` | 是 |
| 被访部门 | 部门选择 | `departmentSelectField_clvt5o0ek` | 是 |
| 来访日期 | 日期 | `dateField_clvt63y6j` | 是 |
| 来访时间 | 级联日期 | `cascadeDateField_clvt6tqf6` | 是 |
| 来访事由 | 下拉单选 | `selectField_clvt7c6f0` | 是 |
| 随行人数 | 数字 | `numberField_clvt82j6b` | 否 |
| 车牌号码 | 单行文本 | `textField_clvt8m3b3` | 否 |
| 访客照片 | 图片上传 | `imageField_clvt98bp3` | 否 |
| 审批状态 | 单选 | `radioField_clvt9o4i4` | 是 |
| 备注说明 | 多行文本 | `textareaField_clvta6n5g` | 否 |

**审批流程：**
```
发起申请 → 被访人确认 → 行政审批 → 结束
```

**来访事由选项：** 商务洽谈、面试应聘、项目合作、设备维护、其他

**审批状态选项：** 待审批（默认）、已通过、已拒绝

### 2. 访客统计报表

| 配置项 | 值 |
|--------|-----|
| 报表名称 | 访客统计报表 |
| 报表ID | `REPORT-3OG66891X6X3VNGTN842TAK6CS4U37HXE5ZMMA` |
| 访问链接 | https://www.aliwork.com/APP_BNCATX2VTVCI8BLZ951A/workbench/REPORT-3OG66891X6X3VNGTN842TAK6CS4U37HXE5ZMMA |

**图表配置：**
1. **今日访客总数**（统计卡片）
2. **待审批数量**（统计卡片）
3. **来访事由分布**（饼图）
4. **各部门访客统计**（柱状图）
5. **访客趋势**（折线图）

**筛选器：** 来访日期筛选（联动所有图表）

### 3. 访客管理工作台

| 配置项 | 值 |
|--------|-----|
| 页面名称 | 访客管理工作台 |
| 页面ID | `FORM-7EA05C985D224F9C9A906B2212C00FABUMYP` |
| 访问链接 | https://www.aliwork.com/APP_BNCATX2VTVCI8BLZ951A/workbench/FORM-7EA05C985D224F9C9A906B2212C00FABUMYP |

**功能特性：**
- 统计卡片：今日访客、待审批、已通过、已拒绝
- Tab切换：今日访客 / 全部访客
- 搜索功能：按姓名、手机号、公司搜索
- 状态筛选：全部/待审批/已通过/已拒绝
- 快捷操作：新增访客、查看报表

## 快速访问链接

| 功能 | 访问链接 |
|------|----------|
| 应用管理后台 | https://www.aliwork.com/APP_BNCATX2VTVCI8BLZ951A/admin |
| 访客登记（提交页面） | https://www.aliwork.com/APP_BNCATX2VTVCI8BLZ951A/submission/FORM-2151CF26A22840EC9A85A38C40918F840WOP |
| 访客管理工作台 | https://www.aliwork.com/APP_BNCATX2VTVCI8BLZ951A/workbench/FORM-7EA05C985D224F9C9A906B2212C00FABUMYP |
| 访客统计报表 | https://www.aliwork.com/APP_BNCATX2VTVCI8BLZ951A/workbench/REPORT-3OG66891X6X3VNGTN842TAK6CS4U37HXE5ZMMA |

## Schema 缓存

字段 ID 详细映射存储在 `.cache/visitor-schema.json` 文件中。
