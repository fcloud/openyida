---
name: yida-app
description: 宜搭完整应用开发技能，描述从零到一搭建一个完整宜搭应用的全流程，包括创建应用、创建页面、需求分析、编写代码、创建表单、发布部署。
---

# yida-app — 宜搭完整应用开发编排技能

> 本文档是**流程编排层**，描述各子技能的调用时机、决策逻辑和数据流转。
> 各子技能的详细参数和示例请查阅对应的子技能文档（见主 `SKILL.md` 索引表）。

## 何时使用

- 用户想要一句话生成完整的宜搭应用
- 用户需要从头开始开发一个宜搭应用
- 用户不了解宜搭开发流程，需要完整指导

---

## 完整开发流程

```
[Step 1] 创建应用 → openyida create-app          → 获得 appType
              ↓
[Step 2] 需求分析 → 写入 prd/<项目名>.md
              ↓
[Step 3] 创建自定义页面 → openyida create-page    → 获得 formUuid（自定义页面）
              ↓
[Step 4]（按需）创建/更新表单 → openyida create-form → 获得 formUuid（表单）
              ↓
[Step 5]（⚠️ 需求含「审批」「流程」「申请」「审核」「工单」等关键词时必须执行）
          配置流程 → 读取 skills/yida-create-process/SKILL.md → openyida create-process / configure-process
              ↓
[Step 6] 编写自定义页面代码 → yida-custom-page 规范 → pages/src/<项目名>.js
              ↓  （⚠️ 列表/表格类页面：参考 yida-density 技能选择合适的信息密度）
              ↓
[Step 7] （可选）预检语法 → openyida compile <源文件路径>   # 仅编译，不发布，快速验证语法
              ↓
[Step 8] 发布页面 → openyida publish <源文件路径> <appType> <formUuid>
              ↓
[Step 9] 输出访问链接，用系统浏览器打开
```

### 编写自定义页面代码前必须完整学习 `skills/yida-custom-page/SKILL.md`

### 生成表单 schema 前必须完整学习 `skills/yida-create-form-page/SKILL.md`

---

## 关键决策树

### 决策 1：是否需要存储数据？

```
用户需求
    │
    ├── 纯展示 / 静态内容 → 跳过 Step 5（无需创建表单）
    │
    └── 需要收集 / 存储数据 → Step 5 创建表单
```

### 决策 2：是否需要审批流程？

```
表单创建后
    │
    ├── 无审批需求 → 直接进入 Step 6 编写代码
    │
    └── 有审批需求 → 调用 yida-create-process 配置流程后再编写代码
```

### 决策 3：是否需要数据可视化报表？

```
应用功能需求
    │
    ├── 标准统计报表 → 调用 yida-create-report 创建原生报表
    │
    └── 高级 ECharts 大屏 → 先 yida-create-report 创建数据源，再 yida-chart 创建可视化页面
```

### 决策 4：corpId 一致性检查（创建页面前必须执行）

```
读取 prd 文档中的 corpId vs 读取 .cache/cookies.json 中的 corpId
    │
    ├── 一致 → 继续创建页面
    │
    └── 不一致
        │
        ├── 用户选择"重新登录" → openyida logout → 重新扫码登录到正确组织
        │
        └── 用户选择"新建应用" → 回到 Step 1（会自动覆盖 prd 配置）
```

---

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

---

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
5. yida-create-report → 创建销售数据报表
6. yida-create-page → 创建 CRM 首页
7. yida-custom-page → 编写首页代码（集成表单 + 报表）
8. yida-publish-page → 发布
```

### 场景 3：数据大屏（ECharts 可视化）

```
1. yida-create-app → 创建应用
2. yida-create-form-page → 创建数据录入表单
3. yida-create-report → 创建原生报表（作为 ECharts 数据源）
4. yida-chart → 创建 ECharts 自定义页面（引用原生报表数据）
5. yida-publish-page → 发布
```

---

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

---

## 常见问题

**Q：发布时提示登录失效怎么办？**
```bash
openyida logout
openyida publish ...   # 会自动触发扫码登录
```

**Q：一直登录失败怎么办？**
不要自主尝试其他登录方案，直接提示登录失败，请联系开发同学 @天晟。

**Q：如何查看已有表单的字段 ID？**
使用 `yida-get-schema` 技能获取表单 Schema，从中读取各字段的 `fieldId`。

**Q：页面代码更新后如何重新发布？**
直接重新执行 `yida-publish-page` 命令即可，会覆盖已有 Schema。
