# yida-app 参考文档

## 典型场景示例

### 场景 1：一句话生成应用（如"生日祝福小游戏"）

```
1. yida-create-app → 创建应用，获取 appType
2. 需求分析 → 写入 prd/birthday-game.md
3. yida-create-page → 创建自定义页面，获取 pageId
4. yida-create-form-page → 创建祝福记录表单，获取 formUuid + fieldId
5. yida-custom-page → 编写游戏页面代码
6. yida-publish-page → 发布，输出访问链接
```

### 场景 2：带审批的 CRM 系统

```
1. yida-create-app → 创建 CRM 应用
2. 需求分析 → 写入 prd/crm.md
3. yida-create-form-page → 创建客户信息表、跟进记录表
4. yida-create-process → 配置客户审批流程
5. yida-report → 创建销售数据报表
6. yida-create-page → 创建 CRM 首页
7. yida-custom-page → 编写首页代码（集成表单 + 报表）
8. yida-publish-page → 发布
```

### 场景 3：数据大屏（ECharts 可视化）

```
1. yida-create-app → 创建应用
2. yida-create-form-page → 创建数据录入表单
3. yida-report → 创建原生报表（作为 ECharts 数据源）
4. yida-chart → 创建 ECharts 自定义页面（引用原生报表数据）
5. yida-publish-page → 发布
```

## 数据流转说明

各步骤产出的关键数据，是后续步骤的输入：

| 步骤 | 产出 | 用途 |
|------|------|------|
| create-app | `appType` | 所有后续命令的必填参数 |
| create-page | `pageId` (即 `formUuid`) | 发布自定义页面时指定目标页面 |
| create-form | `formUuid` + `fieldId` | 自定义页面代码中调用表单 API |
| get-schema | `fieldId` 列表 | 公式字段、权限配置、数据查询时引用 |

**存储约定**：
- **业务语义信息**（应用名、页面名、字段名、字段类型）→ `prd/<项目名>.md`
- **Schema ID**（`appType`、`formUuid`、`fieldId`）→ `.cache/<项目名>-schema.json`

## 宜搭应用 URL 规则

| 页面类型 | URL 格式 |
|---------|---------|
| 应用首页 | `{base_url}/{appType}/workbench` |
| 表单提交页 | `{base_url}/{appType}/submission/{formUuid}` |
| 自定义页面 | `{base_url}/{appType}/custom/{formUuid}` |
| 自定义页面（隐藏导航） | `{base_url}/{appType}/custom/{formUuid}?isRenderNav=false` |
| 表单详情页 | `{base_url}/{appType}/formDetail/{formUuid}?formInstId={formInstId}` |
| 表单详情页（编辑模式） | `{base_url}/{appType}/formDetail/{formUuid}?formInstId={formInstId}&mode=edit` |

> 💡 所有地址拼接 `&corpid={corpId}` 后可自动切换到对应组织，建议首页加上。

## 删除应用（危险操作）

> ⚠️ **删除应用不可逆**，将永久清除该应用下的所有表单、页面、数据记录，无法恢复。

**执行前必须完成以下确认流程，缺一不可：**

1. 向用户展示操作摘要：
   ```
   ⚠️ 即将删除应用
   应用名称：<appName>
   应用 ID：<appType>
   影响范围：该应用下的所有表单、页面、数据将被永久删除，不可恢复。
   请回复「确认删除」继续，或回复「取消」中止操作。
   ```
2. **等待用户明确回复**（必须包含"确认"或"确认删除"等明确同意词）
3. 用户确认后才可执行删除命令

**若用户未明确确认，或回复模糊（如"好的"、"嗯"、"可以"），必须再次询问确认，不得执行删除。**

## 关键决策树

### 决策 1：是否需要存储数据？

- 纯展示 / 静态内容 → 跳过表单创建步骤
- 需要收集 / 存储数据 → 执行 Step 4 创建表单

### 决策 2：是否需要审批流程？

- 无审批需求 → 直接进入 Step 6 编写代码
- 有审批需求（含「审批」「流程」「申请」「审核」「工单」等关键词）→ 调用 yida-create-process 配置流程

### 决策 3：是否需要数据可视化报表？

- 标准统计报表 → 调用 yida-report 创建原生报表
- 高级 ECharts 大屏 → 先 yida-report 创建数据源，再 yida-chart 创建可视化页面

### 决策 4：corpId 一致性检查（创建页面前必须执行）

读取 prd 文档中的 corpId vs 读取 `.cache/cookies.json` 中的 corpId：
- 一致 → 继续创建页面
- 不一致 → 询问用户选择"重新登录"（`openyida logout` → 重新扫码）或"新建应用"（回到 Step 1）

## prd 文档模板

```markdown
# <项目名> 需求文档

## 应用配置

| 配置项 | 值 |
|--------|-----|
| appType | APP_XXXXXX |
| corpId | dingXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX |
| baseUrl | https://www.aliwork.com |

## 功能需求

（描述页面的核心功能、交互逻辑、业务规则）

## 页面与表单配置

### 用户信息表（表单页面）

| 字段名称 | 字段类型 | 说明 |
|---------|---------|------|
| 姓名 | TextField / 单行文本 | 必填 |
| 部门 | SelectField / 下拉单选 | 必填，选项：技术部、产品部、运营部 |
| 备注 | TextareaField / 多行文本 | 选填 |

### 首页（自定义页面）

展示用户信息列表，支持搜索和分页。

## UI 设计

（描述页面风格、布局、响应式要求）
```

> ⚠️ **重要约定**：
> - prd 文档只记录**业务语义信息**（字段名称、类型、说明），**不记录** `formUuid`、`fieldId` 等 Schema ID
> - Schema ID 统一写入 `.cache/<项目名>-schema.json`，供编码时读取
> - 每次创建或修改表单/页面后，必须同步更新 prd 文档
