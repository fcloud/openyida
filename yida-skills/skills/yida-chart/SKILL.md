---
name: yida-chart
description: >-
  宜搭 ECharts 高级报表技能。通过 ECharts + 自定义页面 JSX 实现高度定制化、更美观的数据可视化报表。本技能不负责创建宜搭原生报表（标准报表由 yida-report 技能负责），但 ECharts 报表必须依赖宜搭原生报表的 getDataAsync.json 或 getCacheData.json 接口获取聚合数据，禁止前端聚合（当前仅支持单表数据源，暂不支持多表关联）。数据源获取方式：若用户已有原生报表，直接读取其信息作为数据源；若用户没有原生报表，则先调用 yida-report 技能创建原生报表作为数据源。当用户提供了已有报表 URL（如 https://www.aliwork.com/APP_XXX/admin/REPORT-XXX）时，解析现有报表 Schema 提取数据源参数，基于该数据源创建 ECharts 自定义页面（输出始终是 ECharts 自定义页面，而非优化后的原生报表）。当用户提到"更美观"、"高级"、"定制化"、"ECharts"、"echarts"、"Dashboard 大屏"、"数据大屏"等关键词，或用户提供了报表 URL 要求优化时，使用此技能。普通的"报表"、"统计"等需求默认由 yida-report 技能处理。
license: MIT
compatibility:
  - opencode
  - claude-code
  - qoder
  - wukong
metadata:
  audience: developers
  workflow: yida-development
  version: 3.0.0
  tags:
    - yida
    - low-code
    - chart
    - echarts
    - report
    - visualization
    - vc-yida-report
    - table
    - filter
---

# 宜搭 ECharts 高级报表技能

## 概述

本技能负责通过 **ECharts + 自定义页面 JSX** 实现高度定制化的数据可视化报表。本技能**不负责创建宜搭原生报表**（标准报表由 `yida-report` 技能负责），但 ECharts 报表依赖原生报表的 `getDataAsync.json` 接口作为数据源。

| 方案 | 技术栈 | 适用场景 | 数据源 |
|------|--------|---------|--------|
| **方案 B：ECharts 高级报表**（从头创建） | ECharts + 自定义页面 JSX | 高度定制化图表、复杂交互、更美观的视觉效果 | 用户无原生报表 → 调用 `yida-report` 新建；用户已有 → 直接复用 |
| **方案 C：基于已有报表创建 ECharts 页面** | 解析现有报表 Schema + ECharts 自定义页面 | 用户已有原生报表，希望用 ECharts 实现更美观的展示 | 用户提供的报表 URL 中的原生报表作为数据源 |

> 💡 **与 yida-report 的分工**：普通的"报表"、"统计"需求默认由 `yida-report` 技能处理。只有当用户明确要求"更美观"、"高级"、"定制化"、"ECharts"，或提供了报表 URL 要求用 ECharts 优化时，才使用本技能。

---

## ⚠️ 核心规则（必须遵守）

### 1. 方案选择规则

```
场景 A: 用户提供了已有报表 URL（如 https://www.aliwork.com/APP_XXX/admin/REPORT-XXX）
  → 使用【方案 C：基于已有报表创建 ECharts 页面】
  → 从 URL 中解析 appType 和 formUuid，获取现有 Schema 作为数据源
  → 最终输出：ECharts 自定义页面（非优化后的原生报表）

场景 B: 用户未提供报表 URL，从头创建 ECharts 高级报表
  → 使用【方案 B：ECharts 高级报表】
  → 数据源获取：
    - 用户已有原生报表 → 直接读取已有报表信息作为数据源
    - 用户没有原生报表 → 先调用【yida-report 技能】创建原生报表作为数据源
  → 最终输出：ECharts 自定义页面
```

> ⚠️ **注意**：本技能的所有方案最终输出都是 **ECharts 自定义页面**。如果用户只需要标准原生报表（无 ECharts 定制需求），应直接使用 `yida-report` 技能。

### 2. `cid` 与 `fieldId` 的区分（易混淆，必须注意）

报表 Schema 中有两种 ID，**绝对不能混用**：

| 名称 | 格式 | 用途 | 示例 |
|------|------|------|------|
| **`cid`** | `node_xxx` | `getDataAsync.json` 的请求参数 | `node_oc8u7tmwt95z55` |
| **`fieldId`** | `YoushuXxx_xxx` | Schema 中组件的标识符，不能用于 API 请求 | `YoushuSimpleIndicatorCard_5rugy68y` |

**获取 `cid` 的方法**：执行 `openyida get-schema <appType> <reportFormUuid>`，在 `componentsTree` 中找到目标组件节点，其 `id` 字段即为 `cid`（`node_xxx` 格式）。

### 3. ECharts 高级报表必须依赖原生报表

**ECharts 高级报表的数据来源必须是宜搭原生报表的接口**，禁止前端聚合。

```
【ECharts 高级报表创建流程】

Step 1: 分析报表需求，确定需要哪些图表、指标
    ↓
Step 2: 调用【yida-report 技能】创建宜搭原生报表页面
    ↓  （由 yida-report 负责配置图表组件，生成 getDataAsync.json / getCacheData.json 数据接口）
    ↓
Step 3: 从原生报表 Schema 中提取 getDataAsync.json 所需的关键参数
    ↓  （通过 openyida get-schema 获取，解析 cubeCode、cid、componentClassName 等）
    ↓
Step 4: 在宜搭管理后台将原生报表页面设置为【双端隐藏】
    ↓  （PC 端和移动端均不显示在导航中，需手动操作或通过管理接口）
    ↓
Step 5: 创建【ECharts 自定义页面】，通过原生报表接口获取聚合数据
    ↓
Step 6: 记录关联关系到 .cache/<项目名>-report-bindding.json
```

### 4. 原生报表与 ECharts 报表的关联关系

两种报表**高度耦合**，必须记录关联关系并同步更新：

**关联关系存储**：`.cache/<项目名>-report-bindding.json`

```json
{
  "binddings": [
    {
      "echartsPageUuid": "FORM-ECHARTS-XXX",
      "echartsPageName": "销售数据大屏",
      "nativeReportUuid": "REPORT-NATIVE-XXX",
      "nativeReportName": "销售数据报表（数据源）",
      "bindingTime": "2024-01-15T10:30:00Z",
      "components": [
        {
          "echartsChartId": "chart-sales-trend",
          "nativeComponentCid": "node_ocmmwwwhdmg",
          "nativeComponentName": "折线图_销售趋势",
          "nativeComponentType": "YoushuLineChart"
        }
      ]
    }
  ]
}
```

### 5. 报表更新规则

**后续报表需求变化时，必须同步更新两个页面**：

```
【报表更新流程】

Step 1: 读取 .cache/<项目名>-report-bindding.json 获取关联关系
    ↓
Step 2: 调用【yida-report 技能】更新原生报表的 Schema
    ↓  （修改图表配置、字段定义等，由 yida-report 负责）
    ↓
Step 3: 调用 saveFormSchema.json 更新【ECharts 页面】的代码
    ↓  （同步修改图表渲染逻辑）
    ↓
Step 4: 更新 .cache/<项目名>-report-bindding.json 中的组件映射（如有变化）
```

> ⚠️ **禁止**：为新需求创建新的页面关系，必须在已有的关联页面上更新

### 6. 原生报表页面隐藏规则

一旦创建了 ECharts 高级报表，对应的原生报表页面必须**双端隐藏**：

隐藏方式：在宜搭应用管理后台 → 页面导航设置中，将原生报表页面的 PC 端和移动端可见性均设置为隐藏。

或通过 updateFormNavigation.json 接口（需在服务端/CLI 环境中调用，非自定义页面前端代码）：
  - formUuid: 原生报表页面 UUID
  - pcVisible: false
  - mobileVisible: false

### 7. 开发者态与用户态的展示规则

| 视角 | 原生报表页面 | ECharts 报表页面 | 关联关系 |
|------|-------------|-----------------|---------|
| **用户态**（普通用户） | 隐藏 | 显示 | 隐藏 |
| **管理态**（开发者/管理员） | 显示（标注为"数据源"） | 显示 | 显示在 ECharts 页面配置中 |

**ECharts 页面管理态展示**：
- 在页面配置或代码注释中明确标注数据来源的原生报表
- 格式：`/* 数据源报表: REPORT-NATIVE-XXX (销售数据报表) */`

---

## 核心原则

1. **聚合统计禁止前端聚合**：必须通过 `getDataAsync.json` 或 `getCacheData.json` 接口由服务端完成，详见上方核心规则第 2 节
2. **安全引用**：通过 `this.utils.loadScript()` 从可信 CDN 动态加载 ECharts，禁止内联大段脚本
3. **遵循自定义页面规范**：所有代码必须遵循 `yida-custom-page` 的开发规范

## 何时使用

当用户提出以下需求时使用此技能：
- 创建数据报表、统计图表（柱状图、折线图、饼图等）
- 基于表单数据做数据可视化分析
- 搭建数据看板 / Dashboard
- 需要对表单数据进行聚合统计并图形化展示
- **优化已有报表**（用户提供了报表 URL）

**方案选择**：
- **用户提供了已有报表 URL** → 使用【方案 C：基于已有报表创建 ECharts 页面】，以已有报表为数据源，输出 ECharts 自定义页面
- **用户未提供报表 URL** → 使用【方案 B：ECharts 高级报表】，若用户无原生报表则先调用 yida-report 创建数据源
- **用户只需要标准报表**（无 ECharts 定制需求）→ 不使用本技能，直接使用 `yida-report` 技能

---

## 前置依赖

- 必须先加载 **`yida-custom-page`** 技能，遵循其编码规范
- ECharts 高级报表需要依赖 **`yida-report`** 技能创建原生报表作为数据源（yida-chart 本身不包含原生报表的创建逻辑）
- 需要已创建好数据源表单（通过 `yida-create-form-page` 创建）
- 需要知道数据源表单的 `formUuid` 和字段 `fieldId`（通过 `yida-get-schema` 获取）

---

## ECharts 安全引入方案

### 可信 CDN 地址（按优先级排序）

| CDN | URL | 说明 |
|-----|-----|------|
| **阿里 CDN**（推荐） | `https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js` | 阿里内网外网均可访问，速度最快 |
| **cdnjs** | `https://cdnjs.cloudflare.com/ajax/libs/echarts/5.6.0/echarts.min.js` | 国际通用，Cloudflare 托管 |
| **jsDelivr** | `https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js` | npm 镜像，全球加速 |

### 中国地图 GeoJSON 数据源

ECharts 5 不再内置中国地图数据，需要额外加载 GeoJSON 并通过 `echarts.registerMap('china', geoJson)` 注册。

| 数据源 | URL | 说明 |
|--------|-----|------|
| **阿里云 DataV**（推荐） | `https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json` | 阿里云公开数据服务，地图数据权威合规 |

```javascript
// 加载中国地图 GeoJSON 并注册
fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
  .then(function(response) { return response.json(); })
  .then(function(geoJson) {
    window.echarts.registerMap('china', geoJson);
    // 注册完成后即可使用 type: 'map', map: 'china'
  });
```

> ⚠️ **地图安全要求**：
> - **必须**使用阿里云 DataV 提供的官方 GeoJSON 数据，确保地图边界合规
> - 省份名称需使用全称（如"北京市"、"广东省"、"内蒙古自治区"），与 GeoJSON 中的 `name` 字段匹配
> - 示例中提供了 `normalizeProvinceName()` 函数，自动将简称转换为全称

> ⚠️ **安全要求**：
> - **必须**使用上述可信 CDN 之一，**禁止**使用来源不明的第三方 URL
> - **必须**锁定版本号（如 `5.6.0`），**禁止**使用 `latest` 或不带版本的 URL
> - **推荐**优先使用阿里 CDN（`g.alicdn.com`），在宜搭环境中加载速度最快

### 加载方式

使用宜搭内置的 `this.utils.loadScript()` 动态加载，在 `didMount` 中执行：

```javascript
var ECHARTS_CDN = 'https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js';

export function didMount() {
  this.utils.loadScript(ECHARTS_CDN)
    .then(function() {
      // ECharts 加载完成，初始化图表
      this.bindChartResize();
      this.loadChartData();
    }.bind(this))
    .catch(function(error) {
      this.utils.toast({ title: 'ECharts 加载失败，请刷新重试', type: 'error' });
    }.bind(this));
}
```

### 防重复加载

如果页面有多个图表，ECharts 只需加载一次：

```javascript
export function loadECharts() {
  if (window.echarts) {
    // 已加载，直接初始化
    this.initCharts();
    return;
  }
  this.utils.loadScript(ECHARTS_CDN)
    .then(function() {
      this.initCharts();
    }.bind(this))
    .catch(function(error) {
      this.utils.toast({ title: 'ECharts 加载失败', type: 'error' });
    }.bind(this));
}
```

---

## 数据获取方案

> ⚠️ **核心规则**：
> - **数据明细表**（展示每条记录的详细信息）：使用 `this.utils.yida.searchFormDatas` 获取原始数据
> - **所有聚合统计**（分组计数、求和、平均、趋势等图表数据）：**必须**通过宜搭原生报表接口（`getDataAsync.json` 或 `getCacheData.json`）实现
> - **禁止前端聚合**：禁止在浏览器端对 `searchFormDatas` 返回的数据做分组、计数、求和等聚合计算，所有聚合必须由服务端完成

### 方案一：`this.utils.yida.searchFormDatas`（仅用于数据明细表）

**仅适用于**报表中的数据明细表格，展示每条表单记录的原始字段值。**禁止**用于聚合统计场景。

#### 核心接口

| 接口 | 用途 | 关键参数 |
|------|------|---------|
| `searchFormDatas` | 获取表单数据列表（含字段值），用于数据明细表 | `formUuid`, `pageSize`(≤100), `currentPage`, `searchFieldJson` |
| `getFormDataById` | 获取单条数据详情 | `formInstId` |

#### 分页拉取数据（用于数据明细表）

```javascript
/**
 * 分页拉取表单数据（仅用于数据明细表展示，禁止用于聚合统计）
 * @param {string} formUuid - 表单 UUID
 * @param {Object} [searchCondition] - 可选的搜索条件
 * @param {number} [maxRecords] - 最大拉取条数，默认 2000
 * @returns {Promise<Array>} 数据列表
 */
export function fetchAllFormData(formUuid, searchCondition, maxRecords) {
  var allData = [];
  var pageSize = 100;
  var limit = maxRecords || 2000;

  var fetchPage = function(currentPage) {
    var params = {
      formUuid: formUuid,
      currentPage: currentPage,
      pageSize: pageSize,
    };
    if (searchCondition) {
      params.searchFieldJson = JSON.stringify(searchCondition);
    }
    return this.utils.yida.searchFormDatas(params)
      .then(function(res) {
        allData = allData.concat(res.data || []);
        var totalCount = res.totalCount || 0;

        if (allData.length >= limit) {
          console.warn('数据量(' + totalCount + ')超过上限(' + limit + ')，仅加载前 ' + limit + ' 条');
          return allData.slice(0, limit);
        }

        if (currentPage * pageSize < totalCount) {
          return fetchPage.call(this, currentPage + 1);
        }
        return allData;
      }.bind(this));
  }.bind(this);

  return fetchPage(1);
}
```

### 方案二：宜搭原生报表数据接口（ECharts 高级报表的数据来源）

**所有聚合统计需求**（分组计数、求和、平均值、趋势分析、占比分布等）**必须**通过宜搭原生报表的数据接口实现。

> ⚠️ **ECharts 高级报表必须依赖原生报表**
>
> ECharts 高级报表的数据来源**必须**是宜搭原生报表的查询接口，禁止前端聚合。
> 因此，创建 ECharts 高级报表前，**必须先创建对应的宜搭原生报表页面**，配置好所需的图表组件，然后通过以下接口获取聚合数据。

#### 可用接口

| 接口 | 用途 | 特点 |
|------|------|------|
| `getDataAsync.json` | 实时获取报表组件数据 | 每次请求实时计算，数据最新 |
| `getCacheData.json` | 获取缓存的报表数据 | 性能更好，适合大数据量场景 |

#### 适用场景

- 所有需要聚合统计的图表（柱状图、折线图、饼图、指标卡等）
- 分组计数、求和、平均值等聚合计算
- 跨多个表单做关联统计
- 任意数据量的聚合分析（服务端计算，无性能瓶颈）

#### 接口说明：`getDataAsync.json`

宜搭报表页面在渲染时会调用 `getDataAsync.json` 接口获取各个报表组件的数据。该接口是报表数据的核心接口。

- **地址**：`POST /alibaba/web/{appType}/visual/visualizationDataRpc/getDataAsync.json`
- **Query 参数**：`?_api=EDataService.getDataAsync&_mock=false`
- **Content-Type**：`application/x-www-form-urlencoded`

**Body 参数**：

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `pageId` | String | 是 | 报表页面 UUID | `REPORT-YRD66CC1P4W34O3FKNPP8BKM5SNV3VIE6WWMMC` |
| `cid` | String | 是 | 组件节点 ID（从 Network 面板获取） | `node_ocmmwwwhdmg` |
| `cname` | String | 是 | 组件显示名称 | `基础表格_1` |
| `componentClassName` | String | 是 | 组件类型（见下表） | `YoushuTable` |
| `queryContext` | String (JSON) | 是 | 查询上下文，包含筛选、排序、分页等 | 见下方说明 |
| `dataSetKey` | String | 是 | 数据集标识 | `table` |
| `_csrf_token` | String | 是 | CSRF Token | `window.g_config._csrf_token` |
| `_tb_token_` | String | 是 | 同 CSRF Token | 同上 |
| `_csrf` | String | 是 | 同 CSRF Token | 同上 |
| `timezone` | String | 否 | 时区 | `GMT+8` |
| `pageName` | String | 否 | 固定值 | `report` |
| `enabledCache` | String | 否 | 是否启用缓存 | `true` |

**常见组件类型（`componentClassName`）**：

| 类型 | 说明 |
|------|------|
| `YoushuTable` | 基础表格 |
| `YoushuBar` | 柱状图 |
| `YoushuLine` | 折线图 |
| `YoushuPie` | 饼图 |
| `YoushuNumber` | 数字指标卡 |
| `YoushuFunnel` | 漏斗图 |

**`queryContext` 结构**：

```json
{
  "aliasList": [],
  "filterValueMap": {
    "filter-xxx": ["筛选值"]
  },
  "dim2table": true,
  "orderByList": [],
  "needTotalCount": false,
  "variableParams": {},
  "paging": {
    "start": 0,
    "limit": 10
  }
}
```

| 字段 | 说明 |
|------|------|
| `filterValueMap` | 筛选条件，key 为筛选器 ID，value 为筛选值数组 |
| `paging.start` | 分页起始位置（从 0 开始） |
| `paging.limit` | 每页数据量 |
| `orderByList` | 排序规则数组 |
| `needTotalCount` | 是否返回总数 |

#### 如何获取接口参数

`getDataAsync.json` 的参数（特别是 `cid`、`componentClassName`）需要从已创建的报表页面中获取：

**方式一：从报表 Schema 解析（推荐，AI 友好）**

执行 `openyida get-schema <appType> <reportFormUuid>` 获取报表 Schema，从 Schema 的组件树中提取各组件的 `cid` 和 `componentClassName`。Schema 中每个报表组件节点包含这些信息。

**方式二：从浏览器 Network 面板抓取**

1. 在浏览器中打开报表页面，如：`https://www.aliwork.com/{appType}/preview/{reportUuid}`
2. 打开 DevTools → Network 面板
3. 筛选 `getDataAsync` 关键词
4. 查看请求的 Form Data，获取 `pageId`、`cid`、`componentClassName` 等参数
5. 查看 Response，了解返回数据的结构
6. 报表页面中每个组件（表格、图表、指标卡）都会发起独立的 `getDataAsync` 请求，可按 `cname` 区分

#### 报表数据接口调用

```javascript
/**
 * 调用宜搭报表 getDataAsync 接口
 * @param {string} appType - 应用 ID
 * @param {string} reportPageId - 报表页面 UUID（如 REPORT-xxx）
 * @param {string} componentNodeId - 组件节点 ID（如 node_xxx，从 Network 面板获取）
 * @param {string} componentName - 组件显示名称（如 "基础表格_1"）
 * @param {string} componentClassName - 组件类型（如 YoushuTable / YoushuBar）
 * @param {Object} [options] - 可选参数
 * @param {Object} [options.filterValueMap] - 筛选条件
 * @param {number} [options.start] - 分页起始位置（默认 0）
 * @param {number} [options.limit] - 每页数据量（默认 100）
 * @param {string} [options.dataSetKey] - 数据集标识（默认 "table"）
 */
export function fetchReportData(appType, reportPageId, componentNodeId, componentName, componentClassName, options) {
  var csrfToken = window.g_config._csrf_token;
  var baseUrl = window.location.origin;
  options = options || {};

  var queryContext = {
    aliasList: [],
    filterValueMap: options.filterValueMap || {},
    dim2table: true,
    orderByList: [],
    needTotalCount: false,
    variableParams: {},
    paging: {
      start: options.start || 0,
      limit: options.limit || 100,
    },
  };

  var params = {
    timezone: 'GMT+8',
    _tb_token_: csrfToken,
    _csrf_token: csrfToken,
    _csrf: csrfToken,
    pageId: reportPageId,
    pageName: 'report',
    cid: componentNodeId,
    cname: componentName,
    componentClassName: componentClassName,
    queryContext: JSON.stringify(queryContext),
    dataSetKey: options.dataSetKey || 'table',
    enabledCache: 'true',
    queryTimestamp: String(new Date().getTime()),
    appendTraceId: 'true',
  };

  var apiUrl = baseUrl + '/alibaba/web/' + appType
    + '/visual/visualizationDataRpc/getDataAsync.json'
    + '?_api=EDataService.getDataAsync&_mock=false&_stamp=' + new Date().getTime();

  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'accept': 'application/json, text/json',
      'x-requested-with': 'XMLHttpRequest',
    },
    credentials: 'include',
    body: Object.keys(params).map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&'),
  })
  .then(function(response) { return response.json(); })
  .then(function(result) {
    if (!result.success) {
      throw new Error(result.errorMsg || '报表数据获取失败');
    }
    return result.content;
  });
}
```

#### 使用示例

```javascript
export function loadReportChart() {
  var appType = window.pageConfig.appType;
  // 以下参数从浏览器 Network 面板的 getDataAsync 请求中获取
  this.fetchReportData(
    appType,
    'REPORT-YRD66CC1P4W34O3FKNPP8BKM5SNV3VIE6WWMMC',  // pageId
    'node_ocmmwwwhdmg',                                  // cid
    '基础表格_1',                                         // cname
    'YoushuTable',                                        // componentClassName
    {
      start: 0,
      limit: 100,
      filterValueMap: {
        'filter-xxx': ['筛选值'],
      },
    }
  )
  .then(function(content) {
    // content 中包含报表组件的聚合数据
    // 具体数据结构取决于组件类型（YoushuTable / YoushuBar / YoushuPie 等）
    console.log('报表数据:', content);
    this.renderChartFromReportData(content);
  }.bind(this))
  .catch(function(error) {
    this.utils.toast({ title: '报表数据获取失败: ' + error.message, type: 'error' });
  }.bind(this));
}
```

> ⚠️ **注意事项**：
> - 报表接口需要先通过 `yida-report` 技能创建原生报表页面并配置好报表组件
> - `cid`（组件节点 ID）和 `componentClassName`（组件类型）可通过以下方式获取：
>   1. **从报表 Schema 解析**（推荐）：执行 `openyida get-schema <appType> <reportFormUuid>` 获取报表 Schema，从 Schema 的组件树中提取各组件的 `cid`（即 `componentName` 或 `id` 字段）和组件类型
>   2. **从浏览器 Network 面板抓取**：打开报表页面，在 DevTools Network 中筛选 `getDataAsync` 请求，查看请求参数
> - 每个报表组件都有独立的 `cid`，一个报表页面可能包含多个组件，每个组件发起独立的请求
> - 如果尚未创建报表页面，**必须先通过 yida-report 技能创建**，而非退回使用前端聚合方案

#### 接口路径说明：`/dingtalk/web/` vs `/alibaba/web/`

宜搭报表数据接口有两种路径前缀，**必须使用正确的路径**，否则会返回 404 或鉴权失败：

| 路径前缀 | 适用场景 | 示例 |
|---------|---------|------|
| `/dingtalk/web/{appType}/` | **自定义页面前端代码中调用**（推荐） | ECharts 页面的 `fetch` 请求 |
| `/alibaba/web/{appType}/` | CLI 工具、Node.js 服务端调用 | `openyida` 命令行工具内部 |

> ⚠️ **重要**：在宜搭自定义页面的 JSX 代码中，**必须使用 `/dingtalk/web/`** 路径，使用 `/alibaba/web/` 会导致请求失败。

```javascript
// ✅ 正确：自定义页面前端代码使用 /dingtalk/web/
var url = "/dingtalk/web/" + appType + "/visual/visualizationDataRpc/getDataAsync.json";

// ❌ 错误：自定义页面前端代码不能用 /alibaba/web/
var url = "/alibaba/web/" + appType + "/visual/visualizationDataRpc/getDataAsync.json";
```

#### 接口说明：`getCacheData.json`

`getCacheData.json` 是 `getDataAsync.json` 的缓存版本，适用于大数据量场景，性能更好。

- **地址**：`POST /dingtalk/web/{appType}/visual/visualizationDataRpc/getCacheData.json`
- **Query 参数**：`?_api=EDataService.getCacheData&_mock=false`
- **参数**：与 `getDataAsync.json` 完全相同

**选择建议**：
- 数据实时性要求高 → 使用 `getDataAsync.json`
- 数据量大、性能优先 → 使用 `getCacheData.json`

---

### 隐藏原生报表页面

> 详见上方「核心规则 → 第 5 节：原生报表页面隐藏规则」。

---

### 更新报表 Schema：`saveFormSchema.json`

当报表需求变化时，需要同步更新原生报表和 ECharts 页面的 Schema。

#### 接口说明

- **地址**：`POST /dingtalk/web/{appType}/_view/query/formdesign/saveFormSchema.json`
- **Content-Type**：`application/x-www-form-urlencoded`

**Body 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `formUuid` | String | 是 | 页面 UUID |
| `content` | String (JSON) | 是 | 页面 Schema JSON |
| `schemaVersion` | String | 是 | 固定 `V5` |
| `importSchema` | String | 是 | 固定 `"true"` |
| `_csrf_token` | String | 是 | CSRF Token |

> ⚠️ **同步更新规则**：
> - 修改原生报表的图表配置后，需要同步更新 ECharts 页面的数据获取逻辑
> - 修改 ECharts 页面的展示需求后，如需新的聚合数据，需要先更新原生报表添加对应组件
> - 两个页面的更新必须在同一次操作中完成，保持一致性

---

## 图表渲染规范

### DOM 容器约定

每个图表需要一个固定 `id` 的 DOM 容器，在 `renderJsx` 中声明：

```javascript
export function renderJsx() {
  var timestamp = this.state.timestamp;
  var isMobile = this.utils.isMobile();

  return (
    <div>
      <div style={{ display: 'none' }}>{timestamp}</div>
      <div style={styles.container}>
        <div style={styles.chartTitle}>销售数据统计</div>
        <div
          id="chart-bar"
          style={{
            width: '100%',
            height: isMobile ? '300px' : '400px',
          }}
        />
      </div>
    </div>
  );
}
```

### 图表初始化与销毁

```javascript
/**
 * 初始化 ECharts 实例
 * @param {string} domId - 容器 DOM 的 id
 * @returns {Object|null} ECharts 实例
 */
export function createChart(domId) {
  var container = document.getElementById(domId);
  if (!container) {
    console.warn('图表容器不存在: ' + domId);
    return null;
  }
  // 如果已有实例先销毁，避免内存泄漏
  var existingInstance = window.echarts.getInstanceByDom(container);
  if (existingInstance) {
    existingInstance.dispose();
  }
  return window.echarts.init(container);
}

/**
 * 页面卸载时销毁所有图表实例，释放内存
 */
export function didUnmount() {
  var chartIds = this.getCustomState('chartIds') || [];
  chartIds.forEach(function(domId) {
    var container = document.getElementById(domId);
    if (container) {
      var instance = window.echarts.getInstanceByDom(container);
      if (instance) {
        instance.dispose();
      }
    }
  });
  // 移除 resize 监听
  if (this._resizeHandler) {
    window.removeEventListener('resize', this._resizeHandler);
  }
}
```

### 窗口 resize 自适应

```javascript
/**
 * 绑定窗口 resize 事件，自动调整图表尺寸
 */
export function bindChartResize() {
  this._resizeHandler = function() {
    var chartIds = this.getCustomState('chartIds') || [];
    chartIds.forEach(function(domId) {
      var container = document.getElementById(domId);
      if (container) {
        var instance = window.echarts.getInstanceByDom(container);
        if (instance) {
          instance.resize();
        }
      }
    });
  }.bind(this);
  window.addEventListener('resize', this._resizeHandler);
}
```

---

## 常用图表配置模板

### 柱状图

```javascript
export function renderBarChart(categories, values, title) {
  var chart = this.createChart('chart-bar');
  if (!chart) return;

  chart.setOption({
    title: { text: title || '', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: categories.length > 8 ? 30 : 0,
        fontSize: this.utils.isMobile() ? 10 : 12,
      },
    },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: values,
      itemStyle: { color: '#0089FF' },
      barMaxWidth: 40,
    }],
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
  });
}
```

> 更多图表模板（折线图、饼图、仪表盘等）请参考 `examples/` 目录下的完整示例文件。

---


## 多端适配

ECharts 图表需要适配 PC 和移动端：

```javascript
export function getChartHeight(chartType) {
  var isMobile = this.utils.isMobile();
  var heightMap = {
    bar: isMobile ? '280px' : '400px',
    line: isMobile ? '280px' : '400px',
    pie: isMobile ? '300px' : '380px',
    gauge: isMobile ? '250px' : '300px',
  };
  return heightMap[chartType] || (isMobile ? '280px' : '400px');
}
```

布局建议：
- **PC 端**：使用 `flexWrap: 'wrap'` 实现多图表网格布局，每个图表占 `48%` 宽度
- **移动端**：单列布局，每个图表占 `100%` 宽度

---

## 编码注意事项

1. **必须遵循 `yida-custom-page` 规范**：`export function` 定义方法、事件绑定用箭头函数包裹、禁止 React Hooks
2. **JSX 事件绑定必须用箭头函数**：宜搭 lint 检查会强制要求 JSX 中的事件处理器使用箭头函数，否则发布会失败
   ```jsx
   // ✅ 正确：箭头函数
   <select onChange={(e) => { _customState.filters.status = e.target.value; self.forceUpdate(); }}>
   <button onClick={() => { self.loadTablePage(page - 1); }}>上一页</button>

   // ❌ 错误：function 关键字（会被 lint 拦截，无法发布）
   <select onChange={function(e) { ... }}>
   <button onClick={function() { ... }}>
   ```
   > ⚠️ **注意**：只有 JSX 事件绑定需要箭头函数，模块级变量函数（如 `var _fetchData = function() {}`）仍然使用 `function` 关键字
3. **ECharts 加载时序**：所有图表操作必须在 `loadScript` 的 `.then()` 回调中执行，确保 `window.echarts` 已就绪
4. **DOM 就绪**：`echarts.init()` 必须在 `didMount` 之后调用，确保 DOM 已渲染
5. **内存管理**：`didUnmount` 中必须调用 `dispose()` 销毁所有图表实例，并移除 `resize` 监听
6. **pageSize 上限**：`searchFormDatas` 的 `pageSize` 最大 100，数据量超过时必须分页拉取
7. **loading 状态**：数据加载期间应展示 loading 提示，使用 ECharts 内置的 `chart.showLoading()` / `chart.hideLoading()`
8. **错误处理**：所有 API 调用和 ECharts 操作都必须有 `.catch()` 错误处理
9. **样式内联**：所有样式通过 JS 对象定义，不使用外部 CSS

---

## 常见陷阱与最佳实践（必须遵守）

> 以下经验来自实际开发中的高频踩坑，**生成 ECharts 页面代码时必须遵循**。

### 1. `getDataAsync.json` 返回数据结构解析

`result.content` 的数据结构因组件类型而异，**不能假设固定结构**：

```javascript
// ✅ 正确：直接使用 result.content，由 _normalizeData 自动适配
if (result.success) {
  return result.content;
}

// ❌ 错误：硬编码解析层级
return result.content.data[component.dataSetKey];
```

**`_normalizeData` 函数**（必须包含）：自动探测 `content` 中的 `{data: [], meta: []}` 结构，无论它在顶层还是嵌套在某个 key 下。

### 2. `meta` 中字段名属性不固定

报表接口返回的 `meta` 数组中，字段名属性可能是 `fieldName`、`name`、`field`、`alias`、`key` 等，**不能硬编码 `meta[i].fieldName`**：

```javascript
// ✅ 正确：自动探测字段名属性
var _getMetaFieldKey = function(metaItem) {
  return metaItem.fieldName || metaItem.name || metaItem.field
    || metaItem.alias || metaItem.key || null;
};
```

### 3. `meta` 中分类字段与数值字段顺序不固定

报表接口返回的 `meta[0]` 可能是数值字段、`meta[1]` 才是分类字段，**不能假设 meta[0] 是分类、meta[1] 是数值**。必须通过数据值类型自动检测：

```javascript
// ✅ 正确：根据实际数据值判断哪个是分类、哪个是数值
var _detectCatAndValKeys = function(data) {
  var keys = data.meta.map(function(m) { return _getMetaFieldKey(m); });
  var firstVal = data.data[0][keys[0]];
  var secondVal = data.data[0][keys[1]];
  // 数值字段 vs 分类字段的判断
  if (_isNumericValue(firstVal) && !_isNumericValue(secondVal)) {
    return { catKey: keys[1], valKey: keys[0] };  // 反转
  }
  return { catKey: keys[0], valKey: keys[1] };
};
```

### 4. 日期值不能被误判为数字

日期格式（`YYYYMMDD`、`YYYYMM`、`YYYY-MM-DD`、`YYYY-MM` 等）在 `Number()` 转换时可能被误判为数字。**必须先检测日期格式**：

```javascript
var _isDateLike = function(val) {
  var str = String(val).trim();
  if (/^\d{4}[-\/]/.test(str)) return true;       // YYYY-MM-DD, YYYY-MM, YYYY/MM/DD
  if (/^\d{8}$/.test(str)) {                       // YYYYMMDD
    var y = parseInt(str.substring(0, 4), 10);
    var m = parseInt(str.substring(4, 6), 10);
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12) return true;
  }
  if (/^\d{6}$/.test(str)) {                       // YYYYMM
    var y2 = parseInt(str.substring(0, 4), 10);
    var m2 = parseInt(str.substring(4, 6), 10);
    if (y2 >= 1900 && y2 <= 2100 && m2 >= 1 && m2 <= 12) return true;
  }
  return false;
};

// 日期格式化（将 YYYYMMDD → YYYY-MM-DD，YYYYMM → YYYY-MM）
var _formatDateLabel = function(val) {
  var str = String(val).trim();
  if (/^\d{8}$/.test(str)) return str.substring(0, 4) + "-" + str.substring(4, 6) + "-" + str.substring(6, 8);
  if (/^\d{6}$/.test(str)) return str.substring(0, 4) + "-" + str.substring(4, 6);
  return str;
};
```

### 5. 指标卡的平均值需手动计算

指标卡组件（`YoushuSimpleIndicatorCard`）可能只返回 2 个 meta（如总数、总预算），**平均值需要手动计算**：

```javascript
// ✅ 正确：如果 meta 不足 3 个，手动计算平均值
avgBudget = numericValues.length >= 3
  ? numericValues[2]
  : (totalCount > 0 ? Math.round(totalBudget / totalCount) : 0);
```

### 6. 字段 ID 必须从 Schema 获取，禁止编造

**所有字段 ID（如 `textField_xxx`、`selectField_xxx`）必须通过 `openyida get-schema` 获取真实值**，禁止凭猜测编造。常见错误：

- 表单字段类型搞错（如 `radioField_xxx` 实际是 `selectField_xxx`）
- 字段 ID 后缀编造（如 `textField_m6z9c8vp` 实际是 `textField_j2xehece`）

### 7. 筛选器必须局部刷新，禁止全局 loading

筛选器变化时**禁止设置全局 `loading=true` 导致整个页面白屏重渲染**。应拆分为：

```javascript
// ✅ 正确：筛选只刷新数据，不触发全局 loading
export function onFilterChange(filterType, value) {
  _customState.filters[filterType] = value;
  _customState.pagination.currentPage = 1;
  this.refreshChartsAndTable();  // 只刷新数据和图表，不设 loading=true
}

// ✅ 正确：初始加载才设 loading
export function loadAllData() {
  _customState.loading = true;
  this.forceUpdate();
  this.refreshChartsAndTable();
}
```

### 8. 筛选器必须提供重置按钮

当有任何筛选条件被选中时，**必须显示重置按钮**，允许用户一键清除所有筛选：

```jsx
{(filters.status || filters.priority) && (
  <button onClick={() => { self.onFilterReset(); }}>✕ 重置</button>
)}
```

### 9. ECharts 渲染前必须检查 DOM 元素存在性

`echarts.init(document.getElementById(domId))` 前**必须检查 DOM 元素是否存在**，否则会报错：

```javascript
// ✅ 正确
var domElement = document.getElementById(domId);
if (!domElement) return;
var chart = window.echarts.init(domElement);
```

### 10. `prdId` 获取方式

`getDataAsync.json` 需要 `prdId` 参数，通过 `getFormNavigationListByOrder.json` 接口获取：

```javascript
var url = baseUrl + "/dingtalk/web/" + appType
  + "/query/formnav/getFormNavigationListByOrder.json"
  + "?_api=Nav.queryList&_mock=false&_csrf_token=" + csrfToken;
// 在返回的 content 数组中找到 formUuid 匹配的项，取其 topicId 作为 prdId
```

### 11. ECharts CDN 防重复加载

`didMount` 中加载 ECharts 时，**必须先检查 `window.echarts` 是否已存在**，避免重复加载导致数据获取链路中断：

```javascript
export function didMount() {
  var onReady = function() { /* 获取数据并渲染 */ };
  if (window.echarts) {
    onReady();  // 已加载，直接执行
    return;
  }
  var script = document.createElement("script");
  script.src = "https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js";
  script.onload = onReady;
  document.head.appendChild(script);
}
```

---

## 与其他技能配合

| 技能 | 配合方式 |
|------|----------|
| `yida-custom-page` | **必须先加载**，遵循其编码规范编写图表页面 |
| `yida-report` | **ECharts 报表的数据源依赖**。yida-chart 不包含原生报表创建逻辑，需调用 yida-report 创建原生报表，获取 getDataAsync.json 接口所需参数 |
| `yida-create-form-page` | 创建数据源表单 |
| `yida-get-schema` | 获取表单/报表字段 ID 和 Schema，用于解析 getDataAsync.json 所需的 cubeCode、cid 等参数 |
| `yida-create-page` | 创建自定义页面容器 |
| `yida-publish-page` | 编译并发布图表页面 |

---

## 报表设计规范

### 默认风格：白底简洁商务风

除非用户明确指定了其他风格偏好（如大屏科技风、暗色主题等），报表**默认使用白底简洁商务风**。

**配色方案**：

```javascript
var PALETTE = {
  primary: '#1e40af',       // 主色（深蓝）
  primaryLight: '#3b82f6',  // 主色浅
  accent: '#0ea5e9',        // 强调色（天蓝）
  success: '#059669',       // 成功（绿）
  warning: '#d97706',       // 警告（橙）
  danger: '#dc2626',        // 危险（红）
  neutral: '#64748b',       // 中性灰
  bg: '#f8fafc',            // 页面背景（极浅灰）
  cardBg: '#ffffff',        // 卡片背景（白）
  border: '#e2e8f0',        // 边框（浅灰）
  textPrimary: '#0f172a',   // 主文字（近黑）
  textSecondary: '#475569', // 次文字
  textMuted: '#94a3b8',     // 辅助文字
};
```

**设计要素**：

| 要素 | 规范 |
|------|------|
| 页面背景 | `#f8fafc`（极浅灰），避免纯白 |
| 卡片 | 白底 + `border-radius: 10px` + `1px solid #e2e8f0` 细边框，无阴影或极淡阴影 |
| 字体 | `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif` |
| KPI 数字 | `font-size: 26px` + `font-weight: 700` + `font-feature-settings: "tnum"`（等宽数字） |
| 图表 tooltip | 深色半透明背景 `rgba(15, 23, 42, 0.92)` + 圆角 8px + 柔和阴影 |
| 分割线 | `#f1f5f9` 虚线（`type: [4, 4]`），不使用实线 |
| 标签文字 | `12-13px`，颜色用 `textSecondary` 或 `textMuted` |

### 报表必备组件

一个完整的数据报表应包含以下组件：

| 组件 | 作用 | 必要性 |
|------|------|--------|
| **KPI 指标卡** | 展示核心数字（总数、完成率、预算等） | ✅ 必须 |
| **图表区域** | 展示趋势和分布（饼图、柱状图、折线图等） | ✅ 必须 |
| **数据明细表格** | 展示每条数据的详细信息，支持排序和分页 | ✅ 必须 |
| **全局筛选栏** | 按维度筛选数据，联动所有图表和表格 | ✅ 推荐 |
| **局部筛选** | 单个图表卡片内的维度切换 | 可选 |

### 全局筛选 + 图表联动

报表应支持全局筛选，筛选条件变化时联动刷新所有图表和表格：

```javascript
// 状态中定义筛选字段
var _customState = {
  filterStatus: '全部',
  filterPriority: '全部',
  // ...
};

// 筛选变化时重新渲染所有图表
export function onFilterChange(filterKey, value) {
  _customState[filterKey] = value;
  this.forceUpdate();
  setTimeout(function() {
    this.renderAllCharts();
  }.bind(this), 50);
}

// 获取筛选后的数据
export function getFilteredData() {
  var data = _customState.allData;
  if (_customState.filterStatus !== '全部') {
    data = data.filter(function(item) {
      return (item.formData || {})[FIELD.status] === _customState.filterStatus;
    });
  }
  // ... 其他筛选条件
  return data;
}
```

---

## 数据明细表格

报表中**必须包含数据明细表格**，用于展示每条数据的详细信息。表格使用纯 JSX 实现（非 ECharts），支持分页、排序和详情跳转。

### 表单详情页跳转

`searchFormDatas` 返回的每条记录包含 `formInstId` 字段，可拼接表单详情页 URL：

```
https://www.aliwork.com/{appType}/formDetail/{formUuid}?formInstId={formInstId}
```

```javascript
export function getDetailUrl(formInstId) {
  var appType = window.pageConfig && window.pageConfig.appType;
  if (!appType || !formInstId) return '';
  return 'https://www.aliwork.com/' + appType + '/formDetail/' + FORM_UUID + '?formInstId=' + formInstId;
}
```

### 表格功能要求

| 功能 | 说明 |
|------|------|
| **列排序** | 点击表头切换升序/降序，支持数值和文本排序 |
| **分页** | 每页 10 条，底部显示分页器（上/下一页 + 页码按钮） |
| **详情链接** | 项目名称和"详情"列可点击，跳转到表单详情页（新窗口打开） |
| **状态标签** | 状态、优先级等字段使用彩色标签（badge）展示 |
| **进度条** | 进度字段使用迷你进度条 + 百分比数字展示 |
| **斑马纹** | 奇偶行交替背景色，提升可读性 |
| **筛选联动** | 表格数据跟随全局筛选器实时过滤 |

### 表格样式规范

```javascript
// 表头样式
var thStyle = {
  padding: '10px 12px', textAlign: 'left', fontWeight: 600,
  color: '#475569', fontSize: 12,
  borderBottom: '2px solid #e2e8f0',
  background: '#f8fafc', whiteSpace: 'nowrap', cursor: 'pointer',
};

// 单元格样式
var tdStyle = {
  padding: '10px 12px', borderBottom: '1px solid #e2e8f0',
  color: '#475569', fontSize: 13,
};

// 状态标签样式（根据状态值动态设置颜色）
var statusBadgeStyle = {
  display: 'inline-block', padding: '2px 8px', borderRadius: 4,
  fontSize: 11, fontWeight: 600, lineHeight: '18px',
  color: statusColor, background: statusColor + '14',
  border: '1px solid ' + statusColor + '30',
};

// 详情链接样式
var detailLinkStyle = {
  color: '#3b82f6', fontSize: 12, textDecoration: 'none',
  cursor: 'pointer', fontWeight: 500,
};
```

### 日期格式化

```javascript
export function formatDate(timestamp) {
  if (!timestamp) return '-';
  var date = new Date(Number(timestamp));
  if (isNaN(date.getTime())) return '-';
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}
```

---

## 原生报表 Schema 构建

原生报表的 Schema 构建（vc-yida-report 组件库、`build-yida-report-schema.js` 构建脚本）已迁移至 **`yida-report`** 技能文档中。

如需创建或更新原生报表，请调用 `yida-report` 技能。相关参考：
- **Schema 构建脚本**：[`build-yida-report-schema.js`](./build-yida-report-schema.js)
- **组件详细文档**：[`reference/vc-yida-report-components-doc.md`](../../reference/vc-yida-report-components-doc.md)

---

## 方案 C：基于已有报表创建 ECharts 页面

### 概述

当用户提供了一个已有的宜搭原生报表 URL（如 `https://www.aliwork.com/APP_XXX/admin/REPORT-XXX`），应以该原生报表作为数据源，创建 ECharts 自定义页面实现更美观的展示效果。**最终输出是 ECharts 自定义页面，而非优化后的原生报表**。

### 触发条件

用户消息中包含符合以下格式的报表 URL：
```
https://www.aliwork.com/{appType}/admin/{formUuid}
```

其中 `formUuid` 以 `REPORT-` 开头，表明这是一个宜搭原生报表页面。

### 执行流程

```
Step 1: 从 URL 中解析 appType 和 formUuid
    ↓
Step 2: 执行 openyida env 检测环境和登录态
    ↓
Step 3: 执行 openyida get-schema <appType> <formUuid> 获取现有报表 Schema
    ↓  （将完整输出重定向到文件，避免终端截断）
    ↓  命令：openyida get-schema <appType> <formUuid> > .cache/report-schema-output.txt 2>&1
    ↓
Step 4: 解析现有 Schema，提取关键信息：
    ↓  - cubeCode（数据集编码）
    ↓  - cubeTenantId（租户 ID）
    ↓  - 各组件的 fieldDefinitionList（字段定义）
    ↓  - 各组件的 settings（配置项）
    ↓  - 组件结构和层级关系
    ↓
Step 5: 基于提取的数据源参数，创建 ECharts 自定义页面
    ↓  - 复用原有的 cubeCode、cubeTenantId、cid、componentClassName 等数据源配置
    ↓  - 通过 getDataAsync.json 接口获取聚合数据
    ↓  - 使用 ECharts 实现更美观的图表展示
    ↓
Step 6: 隐藏原生报表页面（双端隐藏）
    ↓  - 在宜搭管理后台设置原生报表页面 PC 端和移动端均不可见
    ↓
Step 7: 记录关联关系到 .cache/<项目名>-report-bindding.json
    ↓
Step 8: 输出 ECharts 自定义页面访问链接
```

### URL 解析规则

```javascript
// 从报表 URL 中解析 appType 和 formUuid
// URL 格式: https://www.aliwork.com/{appType}/admin/{formUuid}
// 示例: https://www.aliwork.com/APP_KNILKT41DC5XXR5D4QEC/admin/REPORT-QA666SC1J3U3TFO9GM9MJ5400RIW3W83SUYMM5
// 解析结果:
//   appType  = APP_KNILKT41DC5XXR5D4QEC
//   formUuid = REPORT-QA666SC1J3U3TFO9GM9MJ5400RIW3W83SUYMM5
```

### Schema 获取注意事项

1. **必须将输出重定向到文件**：报表 Schema 通常非常大（数千行），终端输出会被截断
   ```bash
   openyida get-schema <appType> <formUuid> > .cache/report-schema-output.txt 2>&1
   ```

2. **提取 JSON 部分**：输出文件包含前缀日志信息，需要从 `{` 开始的行提取纯 JSON
   ```bash
   # 找到 JSON 起始行
   grep -n "^{" .cache/report-schema-output.txt
   # 从该行开始提取
   tail -n +<行号> .cache/report-schema-output.txt > .cache/report-schema.json
   ```

3. **使用 Node.js 脚本解析**：将以下标准脚本保存为 `.cache/parse-schema.js`，直接运行即可提取所有关键信息

```javascript
// 标准 Schema 解析脚本：node .cache/parse-schema.js
const fs = require('fs');
const raw = fs.readFileSync('.cache/report-schema.json', 'utf8');
const schema = JSON.parse(raw);
const page = schema.content.pages[0];
const root = page.componentsTree[0];

function findAllComponents(node, result) {
  if (!node) return result;
  var skipNames = ['Page', 'RootHeader', 'RootContent', 'RootFooter', 'PageHeaderContent', 'PageHeaderTab'];
  if (node.componentName && !skipNames.includes(node.componentName)) {
    result.push(node);
  }
  if (node.children) {
    node.children.forEach(function(child) { findAllComponents(child, result); });
  }
  return result;
}

var allComps = findAllComponents(root, []);
console.log('找到组件数量:', allComps.length);

allComps.forEach(function(comp, i) {
  console.log('\n--- 组件[' + i + '] ---');
  console.log('componentName:', comp.componentName);
  console.log('cid:', comp.id);
  if (!comp.props) return;
  var p = comp.props;
  console.log('filterKey:', p.filterKey);

  if (p.settings && p.settings.title) {
    console.log('title:', JSON.stringify(p.settings.title));
  }

  if (p.dataSetModelMap) {
    Object.keys(p.dataSetModelMap).forEach(function(key) {
      var ds = p.dataSetModelMap[key];
      console.log('dataSetKey:', key);
      var dvm = ds.dataViewQueryModel || (ds.selectFilter && ds.selectFilter.dataViewQueryModel);
      if (dvm) {
        console.log('  cubeCode:', dvm.cubeCode);
        console.log('  cubeTenantId:', dvm.cubeTenantId);
        if (dvm.fieldDefinitionList) {
          dvm.fieldDefinitionList.forEach(function(f) {
            var name = f.aliasName && (f.aliasName.zh_CN || f.aliasName);
            console.log('  field alias:', f.alias, '| fieldCode:', f.fieldCode, '| name:', name);
          });
        }
      }
    });
  }
});
```

### ECharts 页面设计策略

基于原生报表的数据源参数创建 ECharts 自定义页面时，遵循以下策略：

| 设计维度 | 具体操作 |
|---------|---------|
| **布局设计** | 指标卡在上、图表居中、数据明细表在下 |
| **图表选择** | 根据原报表中的组件类型选择对应的 ECharts 图表（如柱状图→bar、折线图→line、饼图→pie） |
| **筛选交互** | 通过 getDataAsync.json 的 filterValueMap 参数实现筛选联动 |
| **样式定制** | 使用 ECharts 主题、渐变色、动画等实现更美观的视觉效果 |
| **响应式** | 监听 window resize 事件，调用 `chart.resize()` 适配不同屏幕 |

### 关键约束

1. **必须复用原有数据源**：`cubeCode`、`cubeTenantId`、`cid`、`componentClassName` 等必须从原报表 Schema 中提取，保持一致
2. **不要修改原生报表和数据源表单**：只基于原报表的数据接口创建 ECharts 展示层
3. **数据获取必须通过 getDataAsync.json**：禁止前端聚合，所有聚合统计由服务端完成
4. **隐藏原生报表页面**：创建 ECharts 页面后，将原生报表设置为双端隐藏，避免用户看到两个入口
5. **getDataAsync.json 接口参数必须从 Schema 中提取，禁止猜测**：
   - `prdId`：必须从报表 Schema 的 `prdId` 字段提取，不能用 cubeCode 或其他值替代
   - `pageName`：固定为 `'report'`，不能用 `'custom'` 或其他值
   - `pageId`：使用报表的 `REPORT-xxx` formUuid，不能用自定义页面的 formUuid
   - `cid`、`componentClassName`、`dataSetKey`：必须从报表 Schema 中各组件的配置提取
6. **报表接口返回的是聚合数据，不含 `formInstId`**：
   - 报表 `getDataAsync` 接口返回的 `data` 是聚合/展示数据，**没有 `formInstId`**
   - **明细表场景必须用 `searchFormDatas` 接口**（`this.utils.yida.searchFormDatas`），它返回完整的 `formInstId` 和 `formData`
   - 详情链接必须用**数据源表单的 formUuid**（`FORM-xxx`），不能用报表的 `REPORT-xxx`
7. **筛选器的 `filterValueMap` key 必须用 `filterKey`**：
   - 报表筛选器的 key 格式是 `filter-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`（UUID 格式）
   - ⚠️ **`filterKey` 在图表组件（非筛选器组件）的 `filterList` 里**，正确提取路径：
     ```
     图表组件.props.dataSetModelMap.<dataSetKey>.dataViewQueryModel.filterList[i].filterKey
     ```
   - ⚠️ **筛选器组件自身的 `props.filterKey` 字段通常为 `undefined`，不能用它**
   - ⚠️ **不能用 `fieldId`（如 `YoushuSelectFilter_xxx`）或 `cid`（如 `node_xxx`）作为 key**
   - ⚠️ **每个图表组件有独立的 filterKey，绝对不能共用同一套 filterKey 请求所有图表**
     - 同一个筛选器在不同图表中的 filterKey 是不同的 UUID
     - 必须为每个图表组件单独提取并使用各自的 filterKey
   - **筛选值必须是数组格式**，如 `{ 'filter-xxx': ['已完成'] }`，字符串格式 `'已完成'` 无效
   - 正确的代码模式：
     ```javascript
     // 每个图表有独立的 filterKey，必须分别提取
     var FILTER_KEYS = {
       indicator: { status: 'filter-aaa-...', priority: 'filter-bbb-...' },
       pie:       { status: 'filter-ccc-...', priority: 'filter-ddd-...' },
       barChart:  { status: 'filter-eee-...', priority: 'filter-fff-...' }
     };
     var _buildFilterValueMap = function(filters, keys) {
       var filterValueMap = {};
       if (filters.status)   filterValueMap[keys.status]   = [filters.status];   // 数组！
       if (filters.priority) filterValueMap[keys.priority] = [filters.priority]; // 数组！
       return filterValueMap;
     };
     // 每个图表请求时传各自的 filterKey
     _fetchReportData(cid, className, dataSetKey, _buildFilterValueMap(filters, FILTER_KEYS.pie));
     ```
8. **纯工具函数必须用 `var` 声明，不能用 `export function`**：
   - 宜搭 Babel 编译器会把 `export function` 转成组件方法，但纯工具函数（如 `fetchReportData`）不在白名单中，会被 UglifyJS 消除
   - 正确做法：`var _fetchReportData = function(...) { ... };`，在 `loadAllData` 等 `export function` 中直接调用 `_fetchReportData(...)`
   - 错误做法：`export function fetchReportData(...)` + `this.fetchReportData(...)` → 运行时报 `is not a function`

---

## 常见问题

**Q：ECharts 加载失败怎么办？**

检查网络环境，尝试切换 CDN 地址。阿里内网优先使用 `g.alicdn.com`，外网使用 `cdnjs.cloudflare.com`。

**Q：图表不显示？**

1. 确认 DOM 容器有明确的 `height`（ECharts 要求容器有高度）
2. 确认 `echarts.init()` 在 DOM 渲染完成后调用（在 `didMount` 中）
3. 打开浏览器控制台查看是否有报错

**Q：数据量很大，页面卡顿？**

1. 使用 `chart.showLoading()` 展示加载状态
2. 考虑只展示最近 N 条数据或按时间范围筛选
3. 所有聚合统计必须使用方案二（宜搭报表 `getDataAsync.json` 接口），由服务端完成聚合计算

**Q：如何实现图表联动筛选？**

在筛选条件变化时，重新调用数据获取函数并更新图表。

**注意**：数据请求函数必须用 `var` 声明为模块级变量（避免被 UglifyJS 消除），筛选 key 必须用报表 Schema 中的 `filterKey`（`filter-xxx` 格式）：

```javascript
// 模块级变量：动态获取 prdId（topicId）
var _prdId = null;

// 方案一（推荐）：通过 getFormNavigationListByOrder 接口获取 topicId
// 优势：从应用导航菜单中获取，无论当前页面是报表还是自定义页面都能拿到
// 原理：遍历应用导航菜单，找到 formType=report 的条目，取其 topicId
var _fetchPrdId = function() {
  var appType = window.pageConfig && window.pageConfig.appType;
  var csrfToken = window.g_config && window.g_config._csrf_token;
  var baseUrl = window.location.origin;
  var url = baseUrl + '/dingtalk/web/' + appType
    + '/query/formnav/getFormNavigationListByOrder.json'
    + '?_api=Nav.queryList&_mock=false&_csrf_token=' + encodeURIComponent(csrfToken);

  console.log('[报表] 正在通过导航菜单获取 prdId(topicId)');

  return fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'accept': 'application/json, text/json',
      'x-requested-with': 'XMLHttpRequest',
    },
  })
    .then(function(resp) { return resp.json(); })
    .then(function(res) {
      if (res.success && Array.isArray(res.content)) {
        // 优先匹配指定的 REPORT_FORM_UUID
        var targetNav = res.content.find(function(item) {
          return item.formUuid === REPORT_FORM_UUID;
        });
        if (targetNav && targetNav.topicId) {
          _prdId = targetNav.topicId;
          console.log('[报表] prdId(topicId) 获取成功（精确匹配）:', _prdId);
          return _prdId;
        }
        // 兜底：取第一个 formType=report 且有 topicId 的条目
        var reportNav = res.content.find(function(item) {
          return item.formType === 'report' && item.topicId;
        });
        if (reportNav) {
          _prdId = reportNav.topicId;
          console.log('[报表] prdId(topicId) 获取成功（兜底匹配）:', _prdId, '来自:', reportNav.formUuid);
          return _prdId;
        }
        throw new Error('应用导航菜单中未找到包含 topicId 的报表');
      }
      throw new Error(res.errorMsg || '获取应用导航菜单失败');
    });
};

// 模块级变量：数据请求函数（不能用 export function，否则会被编译器消除）
var _fetchReportData = function(cid, cname, componentClassName, dataSetKey, filterValueMap) {
  var appType = window.pageConfig && window.pageConfig.appType;
  var csrfToken = window.g_config && window.g_config._csrf_token;
  var body = new URLSearchParams({
    timezone: 'GMT+8',
    _tb_token_: csrfToken, _csrf_token: csrfToken, _csrf: csrfToken,
    prdId: _prdId,                // 通过 getFormNavigationListByOrder 动态获取的 topicId
    pageId: 'REPORT-XXX',         // 必须用报表的 REPORT-xxx formUuid
    pageName: 'report',           // 固定为 'report'，不能用 'custom'
    cid: cid, cname: cname || '',
    componentClassName: componentClassName,
    queryContext: JSON.stringify({ filterValueMap: filterValueMap || {}, dim2table: true }),
    dataSetKey: dataSetKey,
  });
  var url = '/dingtalk/web/' + appType + '/visual/visualizationDataRpc/getDataAsync.json';
  return fetch(url, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: body.toString(), credentials: 'include' })
    .then(function(r) { return r.json(); })
    .then(function(result) { if (result.success) return result.content; throw new Error(result.errorMsg); });
};

// 组件方法：筛选变化时重新加载（用 export function，可通过 this 访问组件实例）
export function onFilterChange(filterValue) {
  this.setCustomState({ loading: true });
  var self = this;
  // filterValueMap 的 key 必须用报表 Schema 中的 filterKey（filter-xxx 格式），不能用字段 ID
  var filterValueMap = { 'filter-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx': [filterValue] };
  _fetchReportData('YoushuBar_xxx', '柱状图_1', 'YoushuBar', 'chartData', filterValueMap)
  .then(function(content) {
    var data = content.data || [];
    var meta = content.meta || [];
    var dimField = meta[0] && meta[0].alias;
    var measureField = meta[1] && meta[1].alias;
    var categories = data.map(function(row) { return row[dimField]; });
    var values = data.map(function(row) { return row[measureField]; });
    self.renderBarChart(categories, values, '筛选结果');
    self.setCustomState({ loading: false });
  })
  .catch(function(error) {
    self.utils.toast({ title: error.message, type: 'error' });
    self.setCustomState({ loading: false });
  });
}
```
