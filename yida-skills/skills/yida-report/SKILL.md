---
name: yida-report
description: 宜搭原生报表技能，用于创建宜搭平台内置的原生报表页面（vc-yida-report 组件库），支持 16 种开箱即用的图表/表格/筛选器组件，通过 openyida create-report 命令生成报表 Schema 并发布。本技能定位：创建宜搭原生报表（作为数据源），普通的「报表」「统计」需求默认使用本技能。如需更美观的 ECharts 自定义可视化大屏，请使用 yida-chart 技能（依赖本技能创建的原生报表作为数据源）。不适用于：创建 ECharts 自定义可视化大屏（应使用 yida-chart），或直接查询表单数据（应使用 yida-data-management）。
---

# yida-report — 宜搭原生报表技能

本技能用于创建宜搭原生报表页面，支持 16 种图表/表格/筛选器组件，通过 `openyida create-report` 命令生成并发布。

## 核心规则

**致命（FATAL）**：
1. **禁止前端直接聚合表单数据**：必须通过原生报表 `getDataAsync.json` / `getCacheData.json` 获取聚合数据
2. **不得编造 reportId / datasetId / fieldId**：必须从报表 Schema 或 URL 中提取
3. **不得与 yida-chart 混淆**：本技能负责原生报表（数据源），`yida-chart` 负责 ECharts 可视化
4. **禁止无原生报表直接用 ECharts**：ECharts 必须依赖原生报表作为数据源

**重要（IMPORTANT）**：
1. **创建/发布前必须确认**：向用户展示报表配置摘要（图表类型、数据源、字段映射），获得确认后再执行
2. 普通"报表"、"统计"需求默认使用本技能，不要直接跳到 `yida-chart`
3. 调用报表数据 API 前必须确认 `reportId` 和 `datasetId` 来自真实报表
4. 解析报表数据时必须处理 `data.rows` 为空的情况，避免页面崩溃
5. 本技能不读写 memory，配置通过命令写入宜搭平台

## 适用场景

| 用户意图 | 触发条件 |
|---------|---------|
| 普通报表/统计需求 | "报表"、"统计"、"数据分析"（默认使用本技能） |
| 读取报表聚合数据 | 调用 `getDataAsync.json` / `getCacheData.json` |
| 为 ECharts 提供数据源 | 先用本技能创建原生报表，再用 `yida-chart` 可视化 |

**不适用场景**：
- 创建 ECharts 自定义可视化大屏 → `yida-chart`（但必须先有本技能创建的原生报表）
- 直接查询表单数据 → `yida-data-management`

## 核心架构

```
宜搭表单（数据源） → 宜搭原生报表（服务端聚合） → ECharts 自定义页面（前端渲染）
```

> 原生报表 API 服务端聚合 100% 准确，且无需分页拉取。禁止使用 `searchFormDatas` 前端聚合（pageSize 最大 100，数据不完整），见 FATAL 规则 1。

## 16 种组件清单

| 组件名 | 类型 | 构建函数 |
|--------|------|--------|
| `YoushuSimpleIndicatorCard` | KPI | `buildSchema.simpleIndicatorCard()` |
| `YoushuLineChart` | 图表 | `buildSchema.lineChart()` |
| `YoushuPieChart` | 图表 | `buildSchema.pieChart()` |
| `YoushuGroupedBarChart` | 图表 | `buildSchema.groupedBarChart()` |
| `YoushuFunnelChart` | 图表 | `buildSchema.funnelChart()` |
| `YoushuGauge` | 图表 | `buildSchema.gauge()` |
| `YoushuRadarChart` | 图表 | `buildSchema.radarChart()` |
| `YoushuHeatmap` | 图表 | `buildSchema.heatmap()` |
| `YoushuCalendarHeatmap` | 图表 | `buildSchema.calendarHeatmap()` |
| `YoushuComboChart` | 图表 | `buildSchema.comboChart()` |
| `YoushuWordCloud` | 图表 | `buildSchema.wordCloud()` |
| `YoushuMap` | 图表 | `buildSchema.map()` |
| `YoushuCrossPivotTable` | 表格 | `buildSchema.crossPivotTable()` |
| `YoushuTable` | 表格 | `buildSchema.table()` |
| `YoushuPageHeader` | 布局 | `buildSchema.pageHeader()` |
| `YoushuTopFilterContainer` | 筛选 | `buildSchema.topFilterContainer()` |
| `YoushuSelectFilter` | 筛选 | `buildSchema.selectFilter()` |
| `YoushuTimeFilter` | 筛选 | `buildSchema.timeFilter()` |
| `YoushuInputFilter` | 筛选 | `buildSchema.inputFilter()` |

- **组件库地址**：`//g.alicdn.com/code/npm/@ali/vc-yida-report/1.0.101/pc.js`
- **全局挂载**：`window.YidaReport`
- **Schema 构建脚本**：[`build-yida-report-schema.js`](./build-yida-report-schema.js)
- **字段配置参考**：[`report-field-config-guide.md`](../../references/report-field-config-guide.md)

## 命令 & 参数

```bash
openyida create-report <appType> "<报表名称>" <配置JSON文件路径>
```

⚠️ 第二个参数是报表名称，**必须使用业务含义的中文名称**（如"任务管理数据报表"），不要传 formUuid。

> 📖 各图表的完整字段配置规则详见 [schema-guide.md](references/schema-guide.md)。

### fieldCode 后缀规则

| 字段组件类型 | 报表中的 fieldCode | 示例 |
|------------|-------------------|------|
| `SelectField` / `EmployeeField` | 加 `_value` 后缀 | `selectField_xxx` → `selectField_xxx_value` |
| `TextField` / `NumberField` / `DateField` | 原样使用 | `textField_xxx` |
| 内置字段 `pid` | 原样使用 | `pid`（用于 COUNT 计数） |

### cubeCode 格式

将 `formUuid` 中的连字符 `-` 替换为下划线 `_` 即为 `cubeCode`（代码中 `normalizeCubeCode()` 自动转换）。

## API 概览

报表数据通过 `getDataAsync.json` 接口获取（服务端聚合，100% 准确）：

```
POST /alibaba/web/{appType}/visual/visualizationDataRpc/getDataAsync.json
```

关键参数包括 `pageName`、`prdId`、`cid`、`cname`、`className`、`dataSetKey`。

> 📖 完整参数说明、请求示例、返回结构、数据解析、踩坑记录（8 条）、聚合函数详见 [report-api-guide.md](references/report-api-guide.md)。

## 开发流程概述

1. 获取表单 Schema → 确认字段 ID 和类型
2. 编写配置 JSON（使用结构化 `xField`/`yField` 格式）
3. 注意 `fieldCode` 后缀规则（SelectField / EmployeeField 加 `_value`）
4. `cubeCode` = `formUuid` 连字符替换为下划线
5. 执行 `openyida create-report` 命令
6. **dataSetModelMap 两层字段定义必须都填充**（查询模型层 + 展示层），否则图表显示为空
7. **userConfig 必须为数组格式**（带 `ColumnFieldSetter`），非简单对象

> 📖 Schema 构建函数、数据集配置、组件示例、详细规则见 [schema-guide.md](references/schema-guide.md)。

## 异常处理

| 异常场景 | 处理方式 |
|---------|----------|
| reportId/datasetId 不存在 | 不得编造，必须从报表 URL 或 Schema 中提取 |
| 报表数据 rows 为空 | 处理空数据，显示"暂无数据" |
| 前端直接聚合表单数据 | 严禁，必须通过报表 API 获取聚合数据 |
| 命令执行失败 | 检查登录态（`openyida env`），确认 appType 和 formUuid 正确 |
| 图表显示为空 | 确保 `dataSetModelMap` 两层字段定义都正确填充 |
| SelectField 数据不显示 | 检查是否加了 `_value` 后缀 |

## Agent 错误处理策略

| 错误类型 | 默认处理策略 |
|---------|-------------|
| 命令执行失败 | 停止执行，展示完整错误信息，询问是否重试 |
| 参数格式错误 | 停止执行，提示正确格式，引导用户修正 |
| 登录态失效 | 提示执行 `openyida login` 重新登录 |
| ID 缺失/不存在 | 停止执行，不得编造，提示获取真实 ID |
| 用户拒绝确认 | 停止执行，询问是否调整配置 |
| 未知错误 | 停止执行，完整展示错误信息 |

## 参考文档

| 文档 | 覆盖范围 | 何时阅读 |
|------|---------|---------|
| [Schema 构建参考](references/schema-guide.md) | 工具函数、数据集配置、组件 Schema 示例、构建规则 | 构建报表 Schema 前必读 |
| [报表 API 详解](references/report-api-guide.md) | API 调用、数据解析、踩坑记录、聚合函数 | 调用报表数据 API 时 |
| [使用示例](references/examples.md) | 完整创建流程、fieldCode 规则、常见错误 | 首次使用参考 |
| [字段配置参考](../../references/report-field-config-guide.md) | 报表字段配置规则与属性说明 | 配置组件属性时 |
| [宜搭 API](../../references/yida-api.md) | 表单/流程 API 完整参数 | 需要查询数据时 |
