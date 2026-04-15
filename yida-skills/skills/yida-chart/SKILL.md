---
name: yida-chart
description: "宜搭 ECharts 高级报表技能。通过 ECharts + 自定义页面 JSX 实现高度定制化、更美观的数据可视化报表。本技能不负责创建宜搭原生报表（标准报表由 yida-report 技能负责），但 ECharts 报表必须依赖宜搭原生报表的 getDataAsync.json 或 getCacheData.json 接口获取聚合数据，禁止前端聚合。当用户提到「更美观」「高级」「定制化」「ECharts」「echarts」「Dashboard 大屏」「数据大屏」等关键词，或用户提供了报表 URL 要求优化时，使用此技能。普通的「报表」「统计」等需求默认由 yida-report 技能处理。"
---

# yida-chart — 宜搭 ECharts 高级报表技能

基于宜搭原生报表数据源，用 ECharts + 自定义页面 JSX 实现高度定制化的可视化报表。

## 核心规则

**致命（FATAL）**：
1. **禁止前端聚合**：必须通过宜搭原生报表接口（`getDataAsync.json` / `getCacheData.json`）获取聚合数据
2. **禁止无数据源创建**：没有原生报表时必须先用 `yida-report` 创建原生报表作为数据源
3. **禁止编造 ID**：`reportId`、`datasetId` 必须从报表 URL 或 Schema 中提取，不得编造
4. **禁止 cloudflare CDN**：宜搭环境有安全策略限制，必须使用阿里 CDN
5. **仅支持单表数据源**：不支持多表关联数据源

**重要（IMPORTANT）**：
1. **创建/发布前必须确认**：向用户展示页面配置摘要，获得明确同意后再执行
2. **编写代码前必须读取** [`references/echarts-code-template.md`](references/echarts-code-template.md)，遵循必备代码结构
3. **用户提供报表 URL 时**：必须先解析 URL 提取 `appType` 和 `reportId`，再获取报表 Schema
4. **ECharts 加载方式**：必须通过动态加载 CDN 脚本引入 ECharts（具体方式见[编码模板](references/echarts-code-template.md)），不得 `import`
5. **错误状态必须显示**：数据加载失败时必须显示错误状态，不得静默失败
6. **纯工具函数必须用 `var` 声明**：不能用 `export function`，否则会被 UglifyJS 消除
7. **输出始终是 ECharts 自定义页面**：不要将输出误认为是"优化原生报表"

## 适用场景 / 触发条件

**正向触发**：
- "更美观"、"ECharts"、"大屏"、"Dashboard"、"定制化"
- "数据大屏"、"可视化看板"、"高级报表"
- 用户提供报表 URL 要求优化

**不适用（交由其他技能）**：

| 场景 | 使用技能 |
|------|---------|
| 普通报表/统计需求 | `yida-report`（默认选择） |
| 创建/修改表单字段 | `yida-create-form-page` |
| 查询表单数据 | `yida-data-management` |

## 方案选择

```
场景 A: 用户提供了已有报表 URL（含 REPORT- 前缀）
  → 从 URL 解析 appType 和 formUuid，获取现有 Schema 作为数据源
  → 详细流程见 references/echarts-bindding-guide.md

场景 B: 用户未提供报表 URL，但有数据源表单
  → 先调用 yida-report 创建原生报表作为数据源
  → 再创建 ECharts 自定义页面

场景 C: 用户只需要标准报表（无 ECharts 定制需求）
  → 不使用本技能，直接使用 yida-report 技能
```

## 开发流程

```
Step 1: 执行 openyida env 检测环境和登录态
    ↓
Step 2: 确定数据源
    ↓  有报表 URL → 解析 appType + formUuid，获取 Schema
    ↓  无报表 URL → 先用 yida-report 创建原生报表
    ↓
Step 3: 读取 references/echarts-code-template.md（必须）
    ↓
Step 4: 读取 references/echarts-bindding-guide.md（基于已有报表时必须）
    ↓
Step 5: 编写 ECharts 页面代码
    ↓  遵循代码模板中的必备函数和声明规则
    ↓
Step 6: 创建自定义页面 → openyida create-page <appType> "<pageName>"
    ↓
Step 7: 发布页面 → openyida publish <srcFile> <appType> <formUuid>
    ↓
Step 8: （若有原生报表）隐藏原生报表页面（双端隐藏）
    ↓
Step 9: 输出 ECharts 自定义页面访问链接
```

## 前置依赖

- 必须先加载 **`yida-custom-page`** 技能，遵循其编码规范
- 需要 **`yida-report`** 技能创建原生报表作为数据源
- 需要数据源表单的 `formUuid` 和字段 `fieldId`（通过 `yida-get-schema` 获取）

**ECharts CDN（必须使用）**：`https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js`，加载方式见 [编码模板](references/echarts-code-template.md#加载脚本)

> ⚠️ 禁止使用 `cdnjs.cloudflare.com`，宜搭环境对 cloudflare CDN 有安全策略限制。

## 异常处理

| 异常场景 | 处理方式 |
|---------|----------|
| 没有原生报表就要创建 ECharts | 必须先调用 `yida-report` 创建原生报表，再基于其数据源创建 ECharts 页面 |
| reportId/datasetId 不存在 | 不得编造，必须从报表 URL 或 Schema 中提取 |
| ECharts CDN 加载失败 | 使用阿里 CDN 动态加载脚本（具体方式见编码模板），失败时显示错误状态 |
| 数据 rows 为空 | 必须处理空数据情况，显示"暂无数据"而非页面崩溃 |
| 多表关联数据源 | 当前仅支持单表数据源，提示用户调整需求 |
| `forceUpdate is not a function` | 缺少必需的 `forceUpdate` 函数定义，读取代码模板 |
| 页面数据更新后不刷新 | `renderJsx` 每个 return 分支需含 `<div style={{ display: 'none' }}>{this.state.timestamp}</div>` |
| 图表不显示 | 确认 DOM 容器有明确 height，`echarts.init()` 在 DOM 渲染后调用 |

## Agent 错误处理策略

| 错误类型 | 默认处理策略 |
|---------|-------------|
| 命令执行失败 | 停止执行，向用户展示错误信息，询问是否重试或调整参数 |
| 参数缺失（appType/reportId 等） | 主动询问用户补充，不得猜测或编造 |
| 权限不足 / 登录态失效 | 停止执行，提示用户执行 `openyida auth status` 检查登录态 |
| 原生报表不存在 | 停止当前流程，引导用户先使用 `yida-report` 创建原生报表 |
| 未知错误 | 停止执行，完整展示错误信息，建议用户反馈问题 |

## JS 示例文件索引

> 执行 `openyida sample yida-chart <name>` 将示例输出到 `.cache/samples/<name>.js`，再用 `read_file` 读取。

| name | 图表类型 | 说明 |
|------|---------|------|
| `line-trend` | 折线图 | 趋势分析 |
| `multi-bar-compare` | 柱状图 | 多维度对比 |
| `radar-chart` | 雷达图 | 多维度评估 |
| `stacked-area` | 堆叠面积图 | 占比趋势 |
| `china-map` | 中国地图 | 地域分布 |
| `dashboard-bindform` | 综合看板 | 多图表组合 |
| `scatter-bindform` | 散点图 | 相关性分析 |

## 参考文档

> ⚠️ 编写 ECharts 页面代码前，必须先读取相关参考文档，不要凭记忆编写代码。

| 文档 | 路径 | 何时读取 |
|------|------|---------|
| **代码模板（必读）** | [`references/echarts-code-template.md`](references/echarts-code-template.md) | 编写任何 ECharts 页面代码前必须读取 |
<!-- 注意：文件名 echarts-bindding-guide.md 中的 bindding 为历史命名（正确拼写为 binding），为避免断链保持不变 -->
| **数据绑定指南** | [`references/echarts-bindding-guide.md`](references/echarts-bindding-guide.md) | 基于已有报表创建 ECharts 页面时必须读取 |
| **设计规范** | [`references/echarts-design-spec.md`](references/echarts-design-spec.md) | 需要设计图表布局、配色时读取 |
| **完整示例** | [`references/examples.md`](references/examples.md) | 需要参考完整页面代码时读取 |

## Memory 策略

本技能不读写 memory。ECharts 页面代码通过 `yida-publish-page` 发布到宜搭平台，报表关联信息写入 `.cache/<项目名>-report-bindding.json`，不依赖跨会话的 memory 状态。
