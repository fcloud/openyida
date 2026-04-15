# 报表 Schema 构建参考

> 本文档是 `yida-report` 技能的 Schema 构建详细参考，包含核心工具函数、数据集配置、组件 Schema 示例和关键规则。

## 核心工具函数

Schema 构建脚本提供以下核心函数，使用前需先引入：

```javascript
const {
  buildSchema,           // 各组件 Schema 构建器
  buildDataSetEntry,     // 构建数据集配置
  buildFieldDefinition,  // 构建字段定义
  buildFilterItem,       // 构建过滤条件
  buildOrderByItem,      // 构建排序项
  generateComponentId,   // 生成唯一组件 ID
} = require('./build-yida-report-schema');
```

## 数据集配置（dataSetModelMap）

所有报表组件通过 `dataSetModelMap` 配置数据源，每个数据集由 `buildDataSetEntry` 构建：

```javascript
buildDataSetEntry({
  cubeCode: 'your_cube_code',        // 数据集 cubeCode（必填）
  fieldDefinitionList: [              // 字段定义列表
    buildFieldDefinition({
      alias: 'date',                  // 字段别名（fieldKey）
      aliasName: '日期',              // 字段显示名称
      isDim: true,                    // true=维度，false=度量
      dataType: 'DATE',              // STRING | NUMBER | DATE | BOOLEAN | ARRAY
      aggregateType: 'NONE',         // NONE | SUM | AVG | COUNT | MAX | MIN | COUNT_DISTINCT
      timeGranularityType: 'DAY',    // YEAR | QUARTER | MONTH | WEEK | DAY | HOUR | MINUTE | null
    }),
    buildFieldDefinition({
      alias: 'sales',
      aliasName: '销售额',
      isDim: false,
      dataType: 'NUMBER',
      aggregateType: 'SUM',
    }),
  ],
  fieldList: ['date', 'sales'],       // 查询字段别名列表
  filterList: [],                     // 过滤条件列表
  orderByList: [                      // 排序列表
    buildOrderByItem('date', 'ASC'),  // ASC | DESC
  ],
  limit: 1000,                        // 数据条数限制
  // 以下为筛选器专用参数
  cubeCodes: ['your_cube_code'],      // cubeCode 数组（筛选器使用）
  valueField: ['field_alias'],        // 值字段数组（筛选器使用）
  labelField: ['field_alias'],        // 显示字段数组（筛选器使用）
})
```

## 常用组件 Schema 构建示例

### 指标卡

```javascript
buildSchema.simpleIndicatorCard({
  dataSetModelMap: {
    kpi_dataset: buildDataSetEntry({
      cubeCode: 'your_cube_code',
      fieldDefinitionList: [
        buildFieldDefinition({ alias: 'total_sales', aliasName: '总销售额', isDim: false, dataType: 'NUMBER', aggregateType: 'SUM' }),
        buildFieldDefinition({ alias: 'order_count', aliasName: '订单数', isDim: false, dataType: 'NUMBER', aggregateType: 'COUNT' }),
      ],
      fieldList: ['total_sales', 'order_count'],
    })
  },
  settings: { columnCount: 4, columnCountForH5: 2 }
})
```

### 折线图

```javascript
buildSchema.lineChart({
  dataSetModelMap: {
    line_dataset: buildDataSetEntry({
      cubeCode: 'your_cube_code',
      fieldDefinitionList: [
        buildFieldDefinition({ alias: 'date', aliasName: '日期', isDim: true, dataType: 'DATE', timeGranularityType: 'DAY' }),
        buildFieldDefinition({ alias: 'sales', aliasName: '销售额', isDim: false, dataType: 'NUMBER', aggregateType: 'SUM' }),
      ],
      fieldList: ['date', 'sales'],
      orderByList: [buildOrderByItem('date', 'ASC')],
    })
  },
  settings: {
    titleConfig: { label: '销售趋势' },
    height: 400,
    smooth: true,
    drillDown: false,
  }
})
```

### 饼图（环形图）

```javascript
buildSchema.pieChart({
  dataSetModelMap: {
    pie_dataset: buildDataSetEntry({
      cubeCode: 'your_cube_code',
      fieldDefinitionList: [
        buildFieldDefinition({ alias: 'category', aliasName: '类别', isDim: true, dataType: 'STRING' }),
        buildFieldDefinition({ alias: 'amount', aliasName: '金额', isDim: false, dataType: 'NUMBER', aggregateType: 'SUM' }),
      ],
      fieldList: ['category', 'amount'],
    })
  },
  settings: {
    titleConfig: { label: '销售占比' },
    innerRadius: 0.6,  // >0 为环形图
  }
})
```

### 基础表格（明细表）

```javascript
buildSchema.table({
  dataSetModelMap: {
    table: buildDataSetEntry({
      cubeCode: 'your_cube_code',
      fieldDefinitionList: [
        buildFieldDefinition({ alias: 'name', aliasName: '姓名', isDim: true, dataType: 'STRING' }),
        buildFieldDefinition({ alias: 'dept', aliasName: '部门', isDim: true, dataType: 'STRING' }),
        buildFieldDefinition({ alias: 'sales', aliasName: '销售额', isDim: false, dataType: 'NUMBER', aggregateType: 'SUM' }),
      ],
      fieldList: ['name', 'dept', 'sales'],
      orderByList: [buildOrderByItem('sales', 'DESC')],
    })
  },
  settings: {
    fixedHeader: true,
    theme: 'border',
    maxBodyHeight: 500,
    pagination: {
      pageSize: 20,
      showPageSelect: true,
      pageSizeList: [10, 20, 50, 100],
    }
  }
})
```

### 筛选器（下拉 + 时间 + 区间）

```javascript
// 下拉筛选器
buildSchema.selectFilter({
  dataSetModelMap: {
    selectFilter: buildDataSetEntry({
      cubeCode: 'your_cube_code',
      cubeCodes: ['your_cube_code'],
      fieldDefinitionList: [
        buildFieldDefinition({ alias: 'dept_id', aliasName: '部门ID', isDim: true, dataType: 'STRING' }),
        buildFieldDefinition({ alias: 'dept_name', aliasName: '部门名称', isDim: true, dataType: 'STRING' }),
      ],
      fieldList: ['dept_id', 'dept_name'],
      valueField: ['dept_id'],
      labelField: ['dept_name'],
    })
  },
  settings: { labelConfig: { label: '部门' }, mode: 'multiple', showLabel: true }
})

// 时间筛选器
buildSchema.timeFilter({
  dataSetModelMap: {
    filterData: buildDataSetEntry({
      cubeCode: 'your_cube_code',
      cubeCodes: ['your_cube_code'],
      fieldDefinitionList: [
        buildFieldDefinition({ alias: 'create_date', aliasName: '创建日期', isDim: true, dataType: 'DATE', timeGranularityType: 'DAY' }),
      ],
      fieldList: ['create_date'],
      valueField: ['create_date'],
    })
  },
  settings: { labelConfig: { label: '日期范围' }, mode: 'range', dataConfig: { queryType: 'Between' } }
})
```

### 完整报表页面 Schema 组合示例

```javascript
const {
  buildSchema, buildDataSetEntry, buildFieldDefinition, buildOrderByItem,
} = require('./build-yida-report-schema');

const CUBE_CODE = 'your_cube_code_here';

const reportPageSchema = buildSchema.pageHeader({
  titleContent: '销售数据看板',
  titleTip: '数据每日 08:00 更新',
  children: [
    buildSchema.topFilterContainer({
      showTag: true,
      children: [
        buildSchema.timeFilter({ /* 时间筛选器配置 */ }),
        buildSchema.selectFilter({ /* 下拉筛选器配置 */ }),
      ],
    }),
    buildSchema.simpleIndicatorCard({ /* 指标卡配置 */ }),
    buildSchema.lineChart({ /* 折线图配置 */ }),
    buildSchema.table({ /* 明细表格配置 */ }),
  ],
});

console.log(JSON.stringify(reportPageSchema, null, 2));
```

## 通用 settings 配置参考

| 字段 | 类型 | 说明 |
|------|------|------|
| `titleConfig.label` | `string` | 组件标题 |
| `height` | `number` | 组件高度（默认 300） |
| `colorType` | `string` | 颜色类型，`default` 或 `CUSTOM_COLOR` |
| `customColor` | `string` | 自定义颜色，逗号分隔 |
| `drillDown` | `boolean` | 是否开启下钻（默认 false） |
| `limit` | `number` | 数据条数限制（默认 1000） |

## 各图表组件特有配置

| 组件 | 特有配置 | 说明 |
|------|---------|------|
| **折线图** | `smooth`, `isStack`, `isPercent` | 平滑曲线、堆叠、百分比堆叠 |
| **饼图** | `innerRadius` | 内半径（>0 为环形图） |
| **条形图** | `isStack`, `isPercent` | 堆叠、百分比堆叠 |
| **仪表盘** | `min`, `max`, `range` | 最小值、最大值、区间配置 |
| **基础表格** | `fixedHeader`, `theme`, `pagination` | 固定表头、风格、分页 |

---

## 报表 Schema 构建关键规则（chart-builder.js）

### cubeCode 格式规则

报表引擎的 `cubeCode` 使用**下划线**分隔，而 `formUuid` 使用**连字符**分隔。代码中 `normalizeCubeCode()` 会自动转换，但配置文件中建议直接使用下划线格式：

```
formUuid:  FORM-AB4ACB9DD12C470D82047E05CDC19166CJSU
cubeCode:  FORM_AB4ACB9DD12C470D82047E05CDC19166CJSU  ← 连字符替换为下划线
```

### 配置文件字段格式

推荐使用**结构化格式**（`xField`/`yField`），而非简化的 `fields` 数组格式：

```json
{
  "reportName": "任务管理数据报表",
  "formUuid": "FORM-xxx",
  "charts": [
    {
      "title": "按优先级分布",
      "type": "pie",
      "cubeCode": "FORM_xxx",
      "xField": {
        "fieldCode": "selectField_xxx_value",
        "aliasName": "优先级",
        "dataType": "STRING",
        "aggregateType": "NONE"
      },
      "yField": [
        {
          "fieldCode": "pid",
          "aliasName": "数量",
          "dataType": "STRING",
          "aggregateType": "COUNT"
        }
      ]
    }
  ]
}
```

### 各图表类型的字段配置

| 图表类型 | 必填字段 | 说明 |
|---------|---------|------|
| `indicator` | `kpi`（数组） | 每个 kpi 字段需要 `fieldCode`、`aliasName`、`aggregateType` |
| `pie` | `xField`（单个）+ `yField`（数组） | xField 为分类维度，yField 为数值度量 |
| `bar`/`line`/`area` | `xField`（单个）+ `yField`（数组） | 可选 `groupField` 分组 |
| `table` | `columnFields`（数组） | 每列一个字段对象 |
| `combo` | `xField` + `leftYFields` + `rightYFields` | 柱线混合图 |
| `gauge` | `valueField`（单个） | 可选 `assitValueField` |
| `pivot` | `columnList`（数组） | 交叉透视表 |

### fieldCode 后缀规则

| 字段组件类型 | 报表中的 fieldCode | 示例 |
|------------|-------------------|------|
| `SelectField` | 加 `_value` 后缀 | `selectField_xxx` → `selectField_xxx_value` |
| `EmployeeField` | 加 `_value` 后缀 | `employeeField_xxx` → `employeeField_xxx_value` |
| `TextField` | 原样使用 | `textField_xxx` |
| `NumberField` | 原样使用 | `numberField_xxx` |
| `DateField` | 原样使用 | `dateField_xxx` |
| 内置字段 `pid` | 原样使用 | `pid`（用于 COUNT 计数） |

### dataSetModelMap 结构要点

报表引擎要求 `dataSetModelMap` 中每个数据集包含**两层字段定义**：

1. **`dataViewQueryModel.fieldDefinitionList`**：查询模型层，定义字段的 `alias`、`fieldCode`、`aggregateType` 等
2. **外层字段数组**（`xField`/`yField`/`fieldList`/`columnFields` 等）：展示层，每个字段对象包含 20+ 属性（`visible`、`isDimension`、`fieldKey`、`cubeCode`、`title`、`format`、`link`、`drillList`、`orderBy`、`measureType` 等）

两层都必须正确填充，否则报表图表会显示为空。

### userConfig 格式

报表引擎期望 `userConfig` 为**数组格式**（带 `ColumnFieldSetter` 配置器定义），而非简单对象格式：

```json
[
  {
    "name": "chartData",
    "title": "配置数据",
    "items": [
      {
        "setterName": "ColumnFieldSetter",
        "name": "xField",
        "title": "横轴",
        "setterProps": { "single": true, "showFormatTab": true }
      },
      {
        "setterName": "ColumnFieldSetter",
        "name": "yField",
        "title": "纵轴",
        "setterProps": { "showFormatTab": true, "showDataLink": true }
      }
    ]
  }
]
```

指标卡（`indicator`）的 `userConfig` 也是数组格式，`name` 为 `youshuData`。
