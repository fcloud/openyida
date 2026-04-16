/**
 * create-report.js - 宜搭原生报表创建命令
 *
 * 用法：openyida create-report <appType> "<报表名>" <数据源formUuid> <报表定义JSON>
 *
 * 参数：
 *   appType          - 应用 ID（必填），如 APP_XXX
 *   reportTitle      - 报表名称（必填）
 *   sourceFormUuid   - 数据源表单的 formUuid（必填），如 FORM-XXX
 *   reportJsonOrFile - 报表定义 JSON 文件路径或 JSON 字符串（必填）
 *
 * 报表定义 JSON 格式：
 *   {
 *     "filters": [
 *       { "type": "select", "label": "任务状态", "fieldId": "selectField_xxx", "dataType": "STRING" },
 *       { "type": "time", "label": "截止日期", "fieldId": "dateField_xxx", "dataType": "DATE" }
 *     ],
 *     "indicators": [
 *       // 单字段模式（向后兼容）
 *       { "label": "总任务数", "aggregation": "COUNT", "fieldId": "pid", "dataType": "STRING" },
 *       // 多字段模式（新增）
 *       {
 *         "kpis": [
 *           { "label": "总任务数", "aggregation": "COUNT", "fieldId": "textField_xxx" },
 *           { "label": "总项目数", "aggregation": "COUNT_DISTINCT", "fieldId": "textField_yyy" },
 *           // 公式字段
 *           {
 *             "label": "高优任务数",
 *             "dataType": "INTEGER",
 *             "expression": "COUNTDISTINCT(FORM_XXX.pid,FORM_XXX.selectField_xxx_value=\"高\")",
 *             "expressionWrap": {
 *               "source": "COUNTDISTINCT(#{FORM_XXX.pid},#{FORM_XXX.selectField_xxx_value}=\"高\")",
 *               "display": "COUNTDISTINCT(实例ID,优先级_值=\"高\")"
 *             }
 *           }
 *         ],
 *         "settings": {
 *           "bgColorType": "multiple",      // 背景色类型：single | multiple
 *           "themeType": "dark",            // 主题类型：dark | light
 *           "showSideStyle": "BGTC",        // 显示样式：NONE | BGTC | BORDER
 *           "sideBarColor": "#0089FF",      // 侧边栏颜色
 *           "columnCount": 4,               // 每行显示的指标数量
 *           "customColor": "#0089FF,#FF9200,#11AB4F,#FFD100,#7263EE,#67C5EB,#6B748C,#FF755A,#007E99,#FFA8A8"
 *         }
 *       }
 *     ],
 *     "charts": [
 *       {
 *         "type": "pie",
 *         "title": "状态分布",
 *         "dimension": { "fieldId": "selectField_xxx", "label": "状态", "fieldType": "SelectField" },
 *         "measure": { "fieldId": "pid", "label": "数量", "aggregation": "COUNT" }
 *       },
 *       {
 *         "type": "bar",
 *         "title": "优先级统计",
 *         "dimension": { "fieldId": "selectField_xxx", "label": "优先级", "fieldType": "SelectField" },
 *         "measure": { "fieldId": "pid", "label": "数量", "aggregation": "COUNT" }
 *       },
 *       {
 *         "type": "line",
 *         "title": "趋势分析",
 *         "dimension": { "fieldId": "dateField_xxx", "label": "日期", "fieldType": "DateField" },
 *         "measure": { "fieldId": "numberField_xxx", "label": "金额", "aggregation": "SUM", "dataType": "DOUBLE" }
 *       }
 *     ],
 *     "tables": [...]
 *   }
 *
 * 支持的图表类型（charts[].type）：
 *   - pie:    饼图（YoushuPieChart），可设 innerRadius > 0 变为环形图
 *   - bar:    分组条形图（YoushuGroupedBarChart），可设 isStack: true 变为堆叠图
 *   - line:   折线图（YoushuLineChart），可设 smooth: true 变为平滑曲线
 *   - funnel: 漏斗图（YoushuFunnelChart）
 *   - radar:  雷达图（YoushuRadarChart）
 *   - gauge:  仪表盘（YoushuGauge）
 *
 * 指标卡 settings 配置项：
 *   - bgColorType:    "single" | "multiple" - 背景色类型（单色/多色）
 *   - themeType:      "dark" | "light" - 主题类型
 *   - showSideStyle:  "NONE" | "BGTC" | "BORDER" - 显示样式（无/背景色+顶部色条/边框）
 *   - sideBarColor:   string - 侧边栏颜色（如 "#0089FF"）
 *   - columnCount:    number - 每行显示的指标数量（默认 4）
 *   - customColor:    string - 自定义颜色列表（逗号分隔的十六进制颜色）
 *   - singleBgColor:  string - 单色模式下的背景色
 *   - size:           "normal" | "small" | "large" - 尺寸
 *
 * 前置条件：
 *   - 项目根目录下需存在 .cache/cookies.json（由 yida-login 生成）
 *   - 数据源表单必须已存在
 */

"use strict";

const querystring = require("querystring");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
  findProjectRoot,
  extractInfoFromCookies,
  loadCookieData,
  triggerLogin,
  resolveBaseUrl,
  httpPost,
  httpGet,
  requestWithAutoLogin,
} = require("./utils");
const { t } = require("./i18n");

// ── 报表组件包信息 ───────────────────────────────────

const REPORT_PACKAGE = "@/components/vc-yida-report";
const REPORT_VERSION = "1.0.6";

// ── i18n 辅助 ────────────────────────────────────────

function i18nText(zhText, enText) {
  return { zh_CN: zhText, en_US: enText || zhText, type: "i18n" };
}

// ── ID 生成 ──────────────────────────────────────────

let nodeIdCounter = 1;

function nextNodeId() {
  return "node_oc" + Date.now().toString(36) + (nodeIdCounter++).toString(36);
}

function nextFieldAlias() {
  return "field_" + Date.now().toString(36) + (nodeIdCounter++).toString(36);
}

function nextFilterKey() {
  return "filter-" + crypto.randomUUID();
}

function nextComponentSuffix() {
  return Date.now().toString(36) + (nodeIdCounter++).toString(36);
}

// ── cubeCode 推导 ────────────────────────────────────

function deriveCubeCode(formUuid) {
  // cubeCode 格式：FORM_ + UUID（去掉横线并大写）
  // 示例：FORM-5FE501D9-6DDA-42BD-ABA8-AA33323CC431 -> FORM_5FE501D96DDA42BDABA8AA33323CC4319LIC
  if (formUuid.startsWith("FORM-")) {
    // 去掉 "FORM-" 前缀，移除所有横线，转大写
    const uuidPart = formUuid.substring(5).replace(/-/g, "").toUpperCase();
    return "FORM_" + uuidPart;
  }
  // 如果不是 FORM- 开头，尝试移除横线
  return formUuid.replace(/-/g, "").toUpperCase();
}

// ── 参数解析 ─────────────────────────────────────────

function parseArgs(args) {
  if (args.length < 4) {
    console.error("用法: openyida create-report <appType> \"<报表名>\" <数据源formUuid> <报表定义JSON>");
    console.error("示例: openyida create-report APP_XXX \"任务管理报表\" FORM-XXX report.json");
    process.exit(1);
  }

  return {
    appType: args[0],
    reportTitle: args[1],
    sourceFormUuid: args[2],
    reportJsonOrFile: args[3],
  };
}

// ── 读取报表定义 ─────────────────────────────────────

function readReportDefinition(reportJsonOrFile) {
  let rawContent;

  if (reportJsonOrFile.trimStart().startsWith("{") || reportJsonOrFile.trimStart().startsWith("[")) {
    rawContent = reportJsonOrFile;
  } else {
    const resolvedPath = path.resolve(reportJsonOrFile);
    if (!fs.existsSync(resolvedPath)) {
      console.error("报表定义文件不存在: " + resolvedPath);
      process.exit(1);
    }
    rawContent = fs.readFileSync(resolvedPath, "utf-8");
  }

  try {
    return JSON.parse(rawContent);
  } catch (parseError) {
    console.error("报表定义 JSON 解析失败: " + parseError.message);
    process.exit(1);
  }
}

// ── 构建字段信息对象（报表数据模型通用） ─────────────

function buildFieldInfo(fieldCode, alias, label, dataType, cubeCode, aggregateType) {
  const fieldInfo = {
    visible: true,
    isDimension: "false",
    fieldKey: alias,
    fieldCode: fieldCode,
    classifiedCode: cubeCode,
    dataType: dataType || "STRING",
    format: { type: "NONE" },
    link: [{ type: "NONE" }],
    drillList: [],
    orderBy: { reference: alias, type: "NONE" },
    isVisible: "y",
    title: i18nText(label),
    aggregateType: aggregateType || "NONE",
    cubeCode: cubeCode,
    beUsedTimes: 1,
    id: fieldCode,
    text: label,
    measureType: "MEASURE_ATTRIBUTE",
  };

  if (dataType === "DATE") {
    fieldInfo.timeGranularityType = "DAY";
    fieldInfo.timeFormat = "yyyy-MM-dd";
    fieldInfo.id = fieldCode + "5";
    // 日期字段的 text 应该是时间粒度描述（如 "日"），而不是字段标签
    fieldInfo.text = "日";
  }

  return fieldInfo;
}

function buildFieldDefinition(fieldCode, alias, label, dataType, cubeCode, aggregateType) {
  const fieldDef = {
    aliasName: i18nText(label),
    isDim: false,
    cubeCode: cubeCode,
    fieldCode: fieldCode,
    classifiedCode: cubeCode,
    dataType: dataType || "STRING",
    alias: alias,
    aggregateType: aggregateType || "NONE",
  };

  if (dataType === "DATE") {
    fieldDef.timeGranularityType = "DAY";
    // 日期字段的 aliasName 保持使用用户定义的标签，不要改成 "日"
  }

  return fieldDef;
}

/**
 * 根据字段类型推断正确的 dataType。
 * 
 * @param {string} fieldType - 字段类型，如 SelectField、EmployeeField 等
 * @param {string} [explicitDataType] - 显式指定的 dataType，如果提供则优先使用
 * @returns {string} 推断出的 dataType
 */
function inferDataType(fieldType, explicitDataType) {
  // 如果显式指定了 dataType，优先使用
  if (explicitDataType) {
    return explicitDataType;
  }
  
  // 根据字段类型推断 dataType
  switch (fieldType) {
    // 数组类型（多值字段）
    case "EmployeeField":
    case "DepartmentSelectField":
    case "MultiSelectField":
    case "CheckboxField":
      return "ARRAY";
    
    // 日期类型
    case "DateField":
    case "CascadeDateField":
      return "DATE";
    
    // 数值类型
    case "NumberField":
    case "RateField":
      return "DOUBLE";
    
    // 字符串类型（默认）
    case "TextField":
    case "TextareaField":
    case "SelectField":
    case "RadioField":
    default:
      return "STRING";
  }
}

// ── 构建筛选项组件（完整结构） ───────────────────────

/**
 * 推导筛选项实际使用的 fieldCode。
 * 
 * 需要加 _value 后缀的字段类型（数组格式存储值的组件）：
 * - SelectField / MultiSelectField / RadioField / CheckboxField
 * - EmployeeField / DepartmentSelectField（成员/部门选择器）
 * 
 * 不需要加后缀的字段类型：
 * - TextField / TextareaField / NumberField / DateField / RateField 等
 * 
 * @param {string} fieldId - 字段 ID，如 selectField_xxx
 * @param {string} [fieldType] - 可选的字段类型，如 SelectField、TextField 等
 *                               如果提供了 fieldType，优先根据 fieldType 判断
 *                               如果未提供，则根据 fieldId 前缀推断
 * @returns {string} 实际使用的 fieldCode
 */
function deriveFilterFieldCode(fieldId, fieldType) {
  // 需要加 _value 后缀的字段类型（数组格式存储值的组件）
  const valueFieldTypes = [
    "SelectField", "MultiSelectField", "RadioField", "CheckboxField",
    "EmployeeField", "DepartmentSelectField"
  ];
  
  // 如果提供了 fieldType，优先根据 fieldType 判断
  if (fieldType) {
    if (valueFieldTypes.includes(fieldType)) {
      return fieldId + "_value";
    }
    return fieldId;
  }
  
  // 未提供 fieldType 时，根据 fieldId 前缀推断
  if (fieldId.startsWith("selectField_") || fieldId.startsWith("multiSelectField_") ||
      fieldId.startsWith("radioField_") || fieldId.startsWith("checkboxField_") ||
      fieldId.startsWith("employeeField_") || fieldId.startsWith("departmentSelectField_")) {
    return fieldId + "_value";
  }
  return fieldId;
}

function buildSelectFilterComponent(filter, cubeCode, cubeTenantId) {
  const nodeId = nextNodeId();
  const fieldListAlias = nextFieldAlias();
  const valueFieldAlias = nextFieldAlias();
  const filterKey = nextFilterKey();
  const fieldIdSuffix = "YoushuSelectFilter_" + nextComponentSuffix();

  const actualFieldCode = deriveFilterFieldCode(filter.fieldId);
  const displayLabel = filter.label + (actualFieldCode !== filter.fieldId ? "_值" : "");

  const fieldListFieldInfo = buildFieldInfo(actualFieldCode, fieldListAlias, displayLabel, filter.dataType || "STRING", cubeCode, "NONE");
  const valueFieldInfo = buildFieldInfo(actualFieldCode, valueFieldAlias, displayLabel, filter.dataType || "STRING", cubeCode, "NONE");

  const fieldListFieldDef = buildFieldDefinition(actualFieldCode, fieldListAlias, displayLabel, filter.dataType || "STRING", cubeCode);
  const valueFieldDef = buildFieldDefinition(actualFieldCode, valueFieldAlias, displayLabel, filter.dataType || "STRING", cubeCode);

  return {
    nodeId,
    alias: valueFieldAlias,
    filterKey,
    fieldCode: actualFieldCode,
    component: {
      componentName: "YoushuSelectFilter",
      id: nodeId,
      props: {
        settings: {
          mode: filter.mode || "single",
          container: { height: -88 },
          hasSelectAll: false,
          isMultiLine: true,
          dataConfig: { tagMode: false, showTitle: true, required: false },
          labelConfig: {
            labelAlign: "top",
            labelTips: i18nText("", ""),
            labelTipIcon: "prompt-filling",
            label: i18nText(filter.label, "Filter Title"),
            labelColSpan: 4,
            showLabel: true,
          },
          contentConfig: {
            notFoundContent: i18nText("暂无数据", "No data"),
            placeholder: i18nText("请选择", "Please select"),
          },
          overallStyle: {
            size: "medium",
            hasClear: true,
            autoWidth: true,
            behavior: "NORMAL",
          },
        },
        openRefresh: true,
        link: {
          hasLink: false,
          onlyIcon: true,
          content: i18nText("更多", "More"),
        },
        dataSetModelMap: {
          selectFilter: {
            cubeCodes: [cubeCode],
            mockData: [],
            dataViewQueryModel: {
              orderByList: [],
              fieldDefinitionList: [fieldListFieldDef, valueFieldDef],
              cubeCode: cubeCode,
              cubeTenantId: cubeTenantId,
              filterList: [],
              fieldList: [fieldListAlias, valueFieldAlias],
            },
            defaultValue: { conditionType: "EqualTo" },
            limit: "",
            valueField: [valueFieldInfo],
            filterList: [],
            fieldList: [fieldListFieldInfo, valueFieldInfo],
            youshuDataType: "real",
          },
        },
        cid: nodeId,
        fieldId: fieldIdSuffix,
      },
    },
  };
}

function buildTimeFilterComponent(filter, cubeCode, cubeTenantId) {
  const nodeId = nextNodeId();
  const alias = nextFieldAlias();
  const filterKey = nextFilterKey();
  const fieldIdSuffix = "YoushuTimeFilter_" + nextComponentSuffix();

  // 日期字段不需要加 _value 后缀，直接使用原始 fieldId
  const dateFieldCode = filter.fieldId;
  const fieldInfo = buildFieldInfo(dateFieldCode, alias, filter.label, "DATE", cubeCode, "NONE");
  const fieldDef = buildFieldDefinition(dateFieldCode, alias, filter.label, "DATE", cubeCode);

  return {
    nodeId,
    alias,
    filterKey,
    fieldCode: dateFieldCode,
    component: {
      componentName: "YoushuTimeFilter",
      id: nodeId,
      props: {
        settings: {
          container: { height: -88 },
          titleConfig: {
            labelAlign: "top",
            showTitle: true,
            labelTips: i18nText("", ""),
            labelTipIcon: "prompt-filling",
            label: i18nText(filter.label || "日期选择", "date select"),
            labelColSpan: 4,
          },
          styleConfig: {
            size: "medium",
            hasClear: true,
            behavior: "NORMAL",
          },
          dataConfig: {
            required: false,
            isRange: true,
          },
          contentConfig: {
            placeholder: i18nText("选择日期", "Select date"),
          },
        },
        openRefresh: true,
        link: {
          hasLink: false,
          onlyIcon: true,
          content: i18nText("更多", "More"),
        },
        dataSetModelMap: {
          filterData: {
            cubeCodes: [cubeCode],
            mockData: [],
            dataViewQueryModel: {
              orderByList: [],
              fieldDefinitionList: [fieldDef],
              cubeCode: cubeCode,
              cubeTenantId: cubeTenantId,
              filterList: [],
              fieldList: [alias],
            },
            defaultValue: { conditionType: "Between" },
            limit: "",
            valueField: [fieldInfo],
            filterList: [],
            fieldList: [fieldInfo],
            youshuDataType: "real",
          },
        },
        copyAsImg: false,
        exportData: {
          ignoreSwitch: true,
          passType: "NO_PASS",
          exportType: "BROWSER",
          supportExport: false,
        },
        hasFullscreen: false,
        mockData: [
          {
            data: {
              data: [{ date: "2020-12-24" }],
              meta: [
                { aliasName: "日期", dataType: "DATE", alias: "date", category: "valueField" },
              ],
              currentPage: 1,
              totalCount: 3,
            },
            name: "filterData",
          },
        ],
        autoLink: true,
        afterFetch: "/**\n* 对返回的数据做一些自定义处理\n* 返回数据文档： https://www.yuque.com/yida/support/xgg4ps\n* data: 返回的数据 \n* extraInfo: { meta: [], cardParams: {} }，meta 代表数据元信息，cardParams 代表卡片参数信息\n*/\nfunction afterFetch(data, extraInfo) {\n  return data;\n}",
        isHeightAuto: false,
        enabledCache: true,
        userConfig: [
          {
            name: "filterData",
            title: "数据源展示名称",
            items: [
              {
                setterName: "ColumnFieldSetter",
                name: "valueField",
                setterProps: { single: true, showFormatTab: true, showEditTab: true, dataType: "DATE" },
                title: "查询字段",
              },
              {
                setterName: "DefaultValueSetter",
                name: "defaultValue",
                setterProps: { isConditionFilter: false },
                title: "默认值",
              },
            ],
          },
        ],
        __style__: {},
        cid: nodeId,
        fieldId: fieldIdSuffix,
      },
    },
  };
}

// ── 构建指标卡组件（完整结构） ───────────────────────

/**
 * 构建指标卡的 settings 配置
 * 
 * 支持的配置项：
 * - bgColorType: "single" | "multiple" - 背景色类型
 * - themeType: "dark" | "light" - 主题类型
 * - customColor: string - 自定义颜色列表（逗号分隔）
 * - sideBarColor: string - 侧边栏颜色
 * - showSideStyle: "NONE" | "BGTC" | "BORDER" - 显示样式
 * - columnCount: number - 每行显示的指标数量
 * - size: "normal" | "small" | "large" - 尺寸
 * 
 * @param {Object} indicator - 指标卡定义
 * @returns {Object} settings 配置对象
 */
function buildIndicatorCardSettings(indicator) {
  // 默认配置
  const defaultSettings = {
    container: { height: 104 },
    titleMaxRow: 0,
    bgColorType: "single",
    sideBarColor: "#0089FF",
    valueSize: "20px",
    themeType: "dark",
    columnCount: 4,
    showSideStyle: "NONE",
    showSideBorder: true,
    colorType: "SCHEMA_COLOR",
    followTheme: false,
    customColor: "#0089FF,#FF9200,#11AB4F,#FFD100,#7263EE,#67C5EB,#6B748C,#FF755A,#007E99,#FFA8A8",
    singleBgColor: "#F1F2F3",
    size: "normal",
    multipleBgColor: "defaultColorsMode",
    columnCountForH5: 2,
    popoverAlign: "b",
  };

  // 如果没有 settings 配置，返回默认配置
  if (!indicator.settings) {
    return defaultSettings;
  }

  const userSettings = indicator.settings;

  // 合并用户配置
  return {
    container: { height: userSettings.height || 104 },
    titleMaxRow: userSettings.titleMaxRow || 0,
    bgColorType: userSettings.bgColorType || "single",
    sideBarColor: userSettings.sideBarColor || "#0089FF",
    valueSize: userSettings.valueSize || "20px",
    themeType: userSettings.themeType || "dark",
    columnCount: userSettings.columnCount || 4,
    showSideStyle: userSettings.showSideStyle || (userSettings.bgColorType === "multiple" ? "BGTC" : "NONE"),
    showSideBorder: userSettings.showSideBorder !== undefined ? userSettings.showSideBorder : true,
    colorType: userSettings.colorType || "SCHEMA_COLOR",
    followTheme: userSettings.followTheme !== undefined ? userSettings.followTheme : false,
    customColor: userSettings.customColor || "#0089FF,#FF9200,#11AB4F,#FFD100,#7263EE,#67C5EB,#6B748C,#FF755A,#007E99,#FFA8A8",
    singleBgColor: userSettings.singleBgColor || "#F1F2F3",
    size: userSettings.size || "normal",
    multipleBgColor: userSettings.multipleBgColor || "defaultColorsMode",
    columnCountForH5: userSettings.columnCountForH5 || 2,
    popoverAlign: userSettings.popoverAlign || "b",
  };
}

/**
 * 构建单个 KPI 字段配置
 * 
 * 参考宜搭原生报表的字段结构，确保生成的配置与宜搭保存接口兼容。
 * 
 * @param {Object} kpiDef - KPI 定义
 * @param {string} kpiDef.fieldId - 字段 ID（普通字段必填，公式字段可选）
 * @param {string} kpiDef.label - 显示标签
 * @param {string} [kpiDef.dataType] - 数据类型，默认 STRING
 * @param {string} [kpiDef.aggregation] - 聚合类型，如 COUNT、COUNT_DISTINCT、SUM 等
 * @param {string} [kpiDef.expression] - 公式表达式（公式字段必填）
 * @param {Object} [kpiDef.expressionWrap] - 公式包装信息
 * @param {string} cubeCode - 数据源 cubeCode
 * @returns {Object} { fieldInfo, fieldDef, fieldKey }
 */
function buildKpiField(kpiDef, cubeCode) {
  const alias = nextFieldAlias();
  
  // 判断是否为公式字段
  const isFormulaField = !!kpiDef.expression;
  
  if (isFormulaField) {
    // 公式字段配置 - 完整结构，参考宜搭原生报表
    const fieldInfo = {
      visible: true,
      isDimension: false,
      fieldKey: alias,
      format: { type: "NONE" },
      link: [{ type: "NONE" }],
      drillList: [],
      orderBy: { reference: alias, type: "NONE" },
      isVisible: "y",
      title: i18nText(kpiDef.label, kpiDef.label || ""),
      aggregateType: "NONE",
      beUsedTimes: 1,
      text: "公式字段_" + alias,
      measureType: "MEASURE_ATTRIBUTE",
      expression: kpiDef.expression,
      expressionWrap: kpiDef.expressionWrap || {
        source: kpiDef.expression,
        display: kpiDef.label,
      },
      dataType: kpiDef.dataType || "INTEGER",
      fieldCode: "",
      cubeCode: "",
      classifiedCode: "",
    };

    const fieldDef = {
      alias: alias,
      aliasName: i18nText(kpiDef.label, kpiDef.label || ""),
      expression: kpiDef.expression,
      dataType: kpiDef.dataType || "INTEGER",
      aggregateType: "NONE",
      isDim: false,
      cubeCode: "",
      classifiedCode: "",
      fieldCode: "",
      timeGranularityType: null,
    };

    return { fieldInfo, fieldDef, fieldKey: alias };
  } else {
    // 普通聚合字段配置 - 完整结构，参考宜搭原生报表
    const fieldCode = kpiDef.fieldId;
    const dataType = kpiDef.dataType || "STRING";
    const aggregateType = kpiDef.aggregation || "COUNT";

    const fieldInfo = {
      visible: true,
      isDimension: "false",
      fieldKey: alias,
      fieldCode: fieldCode,
      classifiedCode: cubeCode,
      dataType: dataType,
      format: { type: "NONE" },
      link: [{ type: "NONE" }],
      drillList: [],
      orderBy: { reference: alias, type: "NONE" },
      isVisible: "y",
      title: i18nText(kpiDef.label, kpiDef.label || ""),
      aggregateType: aggregateType,
      cubeCode: cubeCode,
      beUsedTimes: 1,
      id: fieldCode,
      text: kpiDef.label,
      measureType: "MEASURE_ATTRIBUTE",
    };

    const fieldDef = {
      alias: alias,
      aliasName: i18nText(kpiDef.label, kpiDef.label || ""),
      cubeCode: cubeCode,
      fieldCode: fieldCode,
      classifiedCode: cubeCode,
      dataType: dataType,
      aggregateType: aggregateType,
      isDim: false,
    };

    return { fieldInfo, fieldDef, fieldKey: alias };
  }
}

function buildIndicatorCardComponent(indicator, cubeCode, cubeTenantId, filterRefs) {
  const nodeId = nextNodeId();
  const componentSuffix = nextComponentSuffix();

  const measureFields = [];
  const measureFieldDefs = [];
  const measureFieldKeys = [];
  const kpiList = [];

  // 支持多字段指标卡：如果 indicator.kpis 存在，则使用多字段模式
  // 否则使用单字段模式（向后兼容）
  const kpiDefinitions = indicator.kpis && Array.isArray(indicator.kpis) 
    ? indicator.kpis 
    : [{ fieldId: indicator.fieldId, label: indicator.label, dataType: indicator.dataType, aggregation: indicator.aggregation }];

  for (const kpiDef of kpiDefinitions) {
    const { fieldInfo, fieldDef, fieldKey } = buildKpiField(kpiDef, cubeCode);
    measureFields.push(fieldInfo);
    measureFieldDefs.push(fieldDef);
    measureFieldKeys.push(fieldKey);
    kpiList.push(fieldInfo);
  }

  // 构建关联筛选项的 filterList（filterType: "relate"）
  const indicatorFilterList = [];
  const indicatorFilterDefs = [];

  // 1. 先添加指标卡内部固定筛选条件（filterType: "inside"）
  // 这些是指标卡自身的预设筛选，如"进行中任务"只统计状态为"进行中"的数据
  const insideFilterFieldDefs = []; // 用于存储内部筛选条件的字段定义
  
  if (indicator.filters && Array.isArray(indicator.filters)) {
    for (const insideFilter of indicator.filters) {
      const insideFilterKey = "filter_" + nextComponentSuffix();
      const insideAlias = nextFieldAlias();
      const insideFieldCode = deriveFilterFieldCode(insideFilter.fieldId, insideFilter.fieldType || "SelectField");

      // 构建 fieldInfo
      const insideFieldInfo = buildFieldInfo(
        insideFieldCode,
        insideAlias,
        insideFilter.label || "",
        insideFilter.dataType || "STRING",
        cubeCode,
        "NONE"
      );

      // 构建 value 结构
      const filterValue = {
        valueType: "ASSIGN_VALUE",
        value: Array.isArray(insideFilter.value) ? insideFilter.value : [insideFilter.value],
      };

      indicatorFilterList.push({
        filterKey: insideFilterKey,
        filterType: "inside",
        conditionType: insideFilter.conditionType || "EqualTo",
        fieldInfo: insideFieldInfo,
        value: filterValue,
      });

      indicatorFilterDefs.push({
        filterKey: insideFilterKey,
        alias: insideAlias,
        filterType: "inside",
        conditionType: insideFilter.conditionType || "EqualTo",
        value: filterValue,
      });

      // ★ 关键：将内部筛选条件的字段定义也加入 fieldDefinitionList
      insideFilterFieldDefs.push(buildFieldDefinition(
        insideFieldCode,
        insideAlias,
        insideFilter.label || "",
        insideFilter.dataType || "STRING",
        cubeCode
      ));
    }
  }

  // 2. 再添加关联外部筛选项的 filterList（filterType: "relate"）
  for (const filterRef of filterRefs) {
    const conditionType = filterRef.dataType === "DATE" ? "Between" : "EqualTo";
    const paramSuffix = filterRef.componentName === "YoushuTimeFilter" ? "filterData" : "selectFilter";

    indicatorFilterList.push({
      filterKey: filterRef.filterKey,
      conditionType: conditionType,
      paramId: filterRef.nodeId + "-" + paramSuffix,
      fieldInfo: buildFieldInfo(filterRef.fieldId, filterRef.alias, filterRef.label, filterRef.dataType, cubeCode, "NONE"),
      filterType: "relate",
    });

    indicatorFilterDefs.push({
      filterKey: filterRef.filterKey,
      alias: filterRef.alias,
      conditionType: conditionType,
      paramId: filterRef.nodeId + "-" + paramSuffix,
      filterType: "relate",
    });
  }

  const indicatorCardId = "YoushuSimpleIndicatorCard_" + componentSuffix;

  return {
    componentName: "YoushuSimpleIndicatorCard",
    id: indicatorCardId,
    props: {
      enableFieldSelect: false,
      auth: [],
      openRefresh: true,
      link: {
        hasLink: false,
        onlyIcon: true,
        content: i18nText("更多", "More"),
      },
      titleTipIconName: "help",
      exportData: {
        ignoreSwitch: true,
        passType: "NO_PASS",
        exportType: "BROWSER",
        supportExport: false,
        filterList: "",
        exportPromptFilter: "",
      },
      componentTitleTextAlign: "LEFT",
      hasFullscreen: false,
      componentTitle: i18nText("", ""),
      titleTipContent: i18nText("", ""),
      __style__: {},
      fieldId: indicatorCardId,
      settings: buildIndicatorCardSettings(indicator),
      showComponentTitle: true,
      dataSetModelMap: {
        youshuData: {
          cubeCodes: [cubeCode],
          mockData: [],
          dataViewQueryModel: {
            orderByList: [],
            fieldDefinitionList: [
              ...measureFieldDefs,
              ...insideFilterFieldDefs,
              ...filterRefs.map((ref) =>
                buildFieldDefinition(ref.fieldId, ref.alias, ref.label, ref.dataType, cubeCode)
              ),
            ],
            cubeCode: cubeCode,
            cubeTenantId: cubeTenantId,
            filterList: indicatorFilterDefs,
            fieldList: measureFieldKeys,
          },
          limit: "",
          filterList: indicatorFilterList,
          fieldList: measureFields,
          kpi: kpiList,
          helpKpi: [],
          youshuDataType: "real",
        },
      },
      titleTip: false,
      copyAsImg: false,
      headerSize: "medium",
      datasetModel: { filterList: [] },
      mockData: [
        {
          data: {
            data: [{ randomKey1: 23123, randomKey2: 7712 }],
            meta: [
              { fieldKey: "randomKey1", dataType: "STRING", title: "指标1", category: "kpi" },
              { fieldKey: "randomKey2", dataType: "STRING", title: "指标2", category: "kpi" },
            ],
            currentPage: 1,
            totalCount: 3,
          },
          name: "youshuData",
        },
      ],
      afterFetch: '/**\n* 对返回的数据做一些自定义处理\n* 返回数据文档： https://www.yuque.com/yida/support/xgg4ps\n* data: 返回的数据 \n* extraInfo: { meta: [], cardParams: {} }，meta 代表数据元信息，cardParams 代表卡片参数信息\n*/\nfunction afterFetch(data, extraInfo) {\n  return data;\n}',
      isHeightAuto: true,
      showFieldSelectIcon: true,
      enabledCache: true,
      userConfig: [
        {
          name: "youshuData",
          title: "指标数据",
          items: [
            {
              setterName: "ColumnFieldSetter",
              name: "kpi",
              setterProps: {
                single: false,
                showFormatTab: true,
                showDataLink: true,
                customTabs: [{ tabName: "指标配置" }],
                batchSetFields: ["text", "title", "titleTip", "aggregateType", "format_type", "format_decimalDigit", "unit"],
                supportDynamicAlias: true,
                showBatchSet: true,
                showSortTab: false,
              },
              title: "指标",
              required: true,
            },
            {
              setterName: "ColumnFieldSetter",
              name: "helpKpi",
              setterProps: {
                single: false,
                showFormatTab: true,
                showDataLink: true,
                showSortTab: false,
              },
              title: "辅助指标",
            },
          ],
        },
      ],
      cid: indicatorCardId,
    },
  };
}

// ── 构建基础表格组件（YoushuTable） ───────────────────

function buildTableComponent(tableDef, cubeCode, cubeTenantId, filterRefs) {
  const nodeId = nextNodeId();
  const componentSuffix = nextComponentSuffix();
  const tableId = "YoushuTable_" + componentSuffix;

  // 构建字段定义和字段列表
  const fieldDefinitionList = [];
  const fieldListKeys = [];
  const columnFields = [];
  const fieldListInfos = [];

  // 处理维度字段（用于分组）
  if (tableDef.dimensions && Array.isArray(tableDef.dimensions)) {
    for (const dim of tableDef.dimensions) {
      const dimAlias = nextFieldAlias();
      const dimFieldType = dim.fieldType || "TextField";
      const dimFieldCode = deriveFilterFieldCode(dim.fieldId, dimFieldType);
      const dimDataType = inferDataType(dimFieldType, dim.dataType);

      fieldDefinitionList.push({
        aliasName: i18nText(dim.label, dim.label),
        isDim: false,
        cubeCode: cubeCode,
        fieldCode: dimFieldCode,
        classifiedCode: cubeCode,
        dataType: dimDataType,
        alias: dimAlias,
        aggregateType: "NONE",
      });

      fieldListKeys.push(dimAlias);

      columnFields.push({
        visible: true,
        isDimension: "true",
        fieldKey: dimAlias,
        fieldCode: dimFieldCode,
        classifiedCode: cubeCode,
        dataType: dimDataType,
        format: { type: "NONE" },
        link: { hasLink: false },
        title: i18nText(dim.label, dim.label),
        width: dim.width || 150,
        align: "left",
      });

      fieldListInfos.push({
        fieldCode: dimFieldCode,
        alias: dimAlias,
        title: i18nText(dim.label, dim.label),
        dataType: dimDataType,
        aggregateType: "NONE",
        cubeCode: cubeCode,
      });
    }
  }

  // 处理聚合字段（如 COUNT）
  if (tableDef.aggregations && Array.isArray(tableDef.aggregations)) {
    for (const agg of tableDef.aggregations) {
      const aggAlias = nextFieldAlias();
      const aggFieldCode = agg.fieldId || "pid"; // pid 是宜搭内置的 COUNT 字段
      const aggType = agg.aggregation || "COUNT_DISTINCT";

      fieldDefinitionList.push({
        aliasName: i18nText(agg.label, agg.label),
        isDim: false,
        cubeCode: cubeCode,
        fieldCode: aggFieldCode,
        classifiedCode: cubeCode,
        dataType: "STRING",
        alias: aggAlias,
        aggregateType: aggType,
      });

      fieldListKeys.push(aggAlias);

      // 聚合字段的 columnFields 需要完整的格式
      columnFields.push({
        visible: true,
        isDimension: "false",
        fieldKey: aggAlias,
        fieldCode: aggFieldCode,
        classifiedCode: cubeCode,
        dataType: "STRING",
        format: { type: "NONE" },
        link: [{ type: "NONE" }],
        drillList: [],
        orderBy: { reference: aggAlias, type: "NONE" },
        isVisible: "y",
        title: i18nText(agg.label, agg.label),
        aggregateType: aggType,
        cubeCode: cubeCode,
        beUsedTimes: 1,
        id: aggFieldCode,
        text: agg.label,
        measureType: "MEASURE_ATTRIBUTE",
      });

      fieldListInfos.push({
        fieldCode: aggFieldCode,
        alias: aggAlias,
        title: i18nText(agg.label, agg.label),
        dataType: "STRING",
        aggregateType: aggType,
        cubeCode: cubeCode,
        beUsedTimes: 1,
        id: aggFieldCode,
        text: agg.label,
        measureType: "MEASURE_ATTRIBUTE",
      });
    }
  }

  // 处理明细字段（不聚合，直接显示）
  if (tableDef.columns && Array.isArray(tableDef.columns)) {
    for (const col of tableDef.columns) {
      const colAlias = nextFieldAlias();
      const colFieldType = col.fieldType || "TextField";
      const colFieldCode = deriveFilterFieldCode(col.fieldId, colFieldType);
      const colDataType = inferDataType(colFieldType, col.dataType);

      const fieldDef = {
        aliasName: i18nText(col.label, col.label),
        isDim: false,
        cubeCode: cubeCode,
        fieldCode: colFieldCode,
        classifiedCode: cubeCode,
        dataType: colDataType,
        alias: colAlias,
        aggregateType: "NONE",
      };

      // 日期类型需要添加时间粒度
      if (colDataType === "DATE") {
        fieldDef.timeGranularityType = "DAY";
      }

      fieldDefinitionList.push(fieldDef);
      fieldListKeys.push(colAlias);

      const fieldInfo = {
        visible: true,
        isDimension: "false",
        fieldKey: colAlias,
        fieldCode: colFieldCode,
        classifiedCode: cubeCode,
        dataType: colDataType,
        format: { type: "NONE" },
        link: [{ type: "NONE" }],
        drillList: [],
        orderBy: { reference: colAlias, type: "NONE" },
        isVisible: "y",
        title: i18nText(col.label, col.label),
        aggregateType: "NONE",
        cubeCode: cubeCode,
        beUsedTimes: 1,
        id: colFieldCode,
        text: col.label,
        measureType: "MEASURE_ATTRIBUTE",
      };

      // 日期类型需要添加时间格式
      if (colDataType === "DATE") {
        fieldInfo.timeGranularityType = "DAY";
        fieldInfo.timeFormat = "yyyy-MM-dd";
        fieldInfo.id = colFieldCode + "5";
      }

      columnFields.push({
        visible: true,
        isDimension: "false",
        fieldKey: colAlias,
        fieldCode: colFieldCode,
        classifiedCode: cubeCode,
        dataType: colDataType,
        format: { type: "NONE" },
        link: { hasLink: false },
        title: i18nText(col.label, col.label),
        width: col.width || 150,
        align: "left",
      });

      fieldListInfos.push(fieldInfo);
    }
  }

  // 构建关联筛选项的 filterList（内层和外层）
  const tableFilterList = [];
  const tableOuterFilterList = [];
  for (const filterRef of filterRefs) {
    const filterAlias = nextFieldAlias();
    const conditionType = filterRef.dataType === "DATE" ? "Between" : "EqualTo";
    const paramSuffix = filterRef.componentName === "YoushuTimeFilter" ? "filterData" : "selectFilter";

    // 添加筛选字段定义
    const filterFieldDef = {
      aliasName: filterRef.label,
      isDim: false,
      cubeCode: cubeCode,
      fieldCode: filterRef.fieldId,
      classifiedCode: cubeCode,
      dataType: filterRef.dataType,
      alias: filterAlias,
      aggregateType: "NONE",
    };

    // 日期类型需要添加时间粒度
    if (filterRef.dataType === "DATE") {
      filterFieldDef.timeGranularityType = "DAY";
    }

    fieldDefinitionList.push(filterFieldDef);

    // 内层 filterList（在 dataViewQueryModel 中）
    tableFilterList.push({
      filterKey: filterRef.filterKey,
      alias: filterAlias,
      conditionType: conditionType,
      paramId: filterRef.nodeId + "-" + paramSuffix,
      filterType: "relate",
    });

    // 外层 filterList（在 dataSetModelMap.table 中，包含完整的 fieldInfo）
    tableOuterFilterList.push({
      filterKey: filterRef.filterKey,
      conditionType: conditionType,
      paramId: filterRef.nodeId + "-" + paramSuffix,
      fieldInfo: {
        visible: true,
        isDimension: "false",
        fieldKey: filterAlias,
        fieldCode: filterRef.fieldId,
        classifiedCode: cubeCode,
        dataType: filterRef.dataType,
        format: { type: "NONE" },
        link: [{ type: "NONE" }],
        drillList: [],
        orderBy: { reference: filterAlias, type: "NONE" },
        isVisible: "y",
        title: filterRef.label + "_值",
        aggregateType: "NONE",
        cubeCode: cubeCode,
        beUsedTimes: 1,
        id: filterRef.fieldId,
        text: filterRef.label + "_值",
        measureType: "MEASURE_ATTRIBUTE",
      },
      filterType: "relate",
    });
  }

  return {
    componentName: "YoushuTable",
    id: tableId,
    props: {
      enableFieldSelect: false,
      auth: [],
      openRefresh: true,
      link: {
        hasLink: false,
        onlyIcon: true,
        content: i18nText("更多", "More"),
      },
      titleTipIconName: "help",
      exportData: {
        ignoreSwitch: true,
        passType: "NO_PASS",
        exportType: "BROWSER",
        supportExport: false,
        filterList: "",
        exportPromptFilter: "",
      },
      componentTitleTextAlign: "LEFT",
      hasFullscreen: false,
      showCopyData: false,
      componentTitle: i18nText(tableDef.title || "数据表格", tableDef.title || "Data Table"),
      titleTipContent: i18nText("", ""),
      __style__: {},
      fieldId: tableId,
      settings: {
        maxBodyHeight: "300",
        container: { height: tableDef.height || 264 },
        isTree: false,
        pagination: {
          isPagination: tableDef.pagination !== false,
          pageShowCount: 5,
          size: "small",
          pageSize: tableDef.pageSize || 10,
          type: "normal",
          showPageSelect: false,
        },
        defaultExpand: false,
        seqNumColWidth: 50,
        mergeCell: false,
        isUniqueRows: false,
        rglConfig: { w: 12, isHeightAuto: true, h: 21 },
        fixedColumnIndex: 1,
        rankStyle: false,
        fixedHeader: false,
        size: "medium",
        theme: "split",
        wordSize: "medium:14",
        isReverseTable: false,
        showReversedHeader: false,
      },
      showComponentTitle: true,
      dataSetModelMap: {
        table: {
          cubeCodes: [cubeCode],
          mockData: [],
          dataViewQueryModel: {
            orderByList: [],
            fieldDefinitionList: fieldDefinitionList,
            cubeCode: cubeCode,
            cubeTenantId: cubeTenantId,
            filterList: tableFilterList,
            fieldList: fieldListKeys,
          },
          limit: "",
          columnFields: columnFields,
          filterList: tableOuterFilterList,
          fieldList: fieldListInfos,
          youshuDataType: "real",
        },
      },
      titleTip: false,
      copyAsImg: false,
      defaultSelectedFields: [],
      headerSize: "medium",
      mockData: [],
      afterFetch: '/**\n* 对返回的数据做一些自定义处理\n*/\nfunction afterFetch(data, extraInfo) {\n  return data;\n}',
      isHeightAuto: true,
      showFieldSelectIcon: true,
      enabledCache: true,
      userConfig: [
        {
          name: "table",
          title: "表格数据",
          items: [
            {
              setterName: "ColumnFieldSetter",
              name: "dimension",
              setterProps: { single: false },
              title: "维度",
            },
            {
              setterName: "ColumnFieldSetter",
              name: "kpi",
              setterProps: { single: false, showFormatTab: true },
              title: "指标",
            },
          ],
        },
      ],
      cid: tableId,
    },
  };
}

// ── 构建图表的 dataViewQueryModel ────────────────────

/**
 * 根据 xField 和 yField 构建图表的 dataViewQueryModel。
 * 这是图表数据查询的核心配置，包含字段定义列表。
 *
 * @param {object[]} xFieldList - 维度字段列表
 * @param {object[]} yFieldList - 度量字段列表
 * @param {string} cubeCode - 数据集编码
 * @param {string} cubeTenantId - 租户 ID
 * @param {object[]} filterRefs - 关联筛选器引用列表
 * @returns {object} dataViewQueryModel 对象
 */
function buildChartDataViewQueryModel(xFieldList, yFieldList, cubeCode, cubeTenantId, filterRefs) {
  const fieldDefinitionList = [];
  const fieldList = [];

  // 添加维度字段定义
  for (const xField of xFieldList) {
    fieldDefinitionList.push({
      aliasName: xField.title,
      isDim: false,
      cubeCode: cubeCode,
      fieldCode: xField.fieldCode,
      classifiedCode: cubeCode,
      dataType: xField.dataType || "STRING",
      alias: xField.fieldKey,
      aggregateType: xField.aggregateType || "NONE",
    });
    fieldList.push(xField.fieldKey);
  }

  // 添加度量字段定义
  for (const yField of yFieldList) {
    fieldDefinitionList.push({
      aliasName: yField.title,
      isDim: false,
      cubeCode: cubeCode,
      fieldCode: yField.fieldCode,
      classifiedCode: cubeCode,
      dataType: yField.dataType || "STRING",
      alias: yField.fieldKey,
      aggregateType: yField.aggregateType || "COUNT",
    });
    fieldList.push(yField.fieldKey);
  }

  // 构建关联筛选项的 filterList
  const chartFilterList = [];
  if (filterRefs && Array.isArray(filterRefs)) {
    for (const filterRef of filterRefs) {
      const filterAlias = filterRef.alias;
      const conditionType = filterRef.dataType === "DATE" ? "Between" : "EqualTo";
      const paramSuffix = filterRef.componentName === "YoushuTimeFilter" ? "filterData" : "selectFilter";

      // 添加筛选字段定义到 fieldDefinitionList
      const filterFieldDef = {
        aliasName: filterRef.label,
        isDim: false,
        cubeCode: cubeCode,
        fieldCode: filterRef.fieldId,
        classifiedCode: cubeCode,
        dataType: filterRef.dataType,
        alias: filterAlias,
        aggregateType: "NONE",
      };

      // 日期类型需要添加时间粒度
      if (filterRef.dataType === "DATE") {
        filterFieldDef.timeGranularityType = "DAY";
      }

      fieldDefinitionList.push(filterFieldDef);

      chartFilterList.push({
        filterKey: filterRef.filterKey,
        alias: filterAlias,
        conditionType: conditionType,
        paramId: filterRef.nodeId + "-" + paramSuffix,
        filterType: "relate",
      });
    }
  }

  return {
    orderByList: [],
    fieldDefinitionList: fieldDefinitionList,
    cubeCode: cubeCode,
    cubeTenantId: cubeTenantId,
    filterList: chartFilterList,
    fieldList: fieldList,
  };
}

// ── 生成图表标题 ─────────────────────────────────────

/**
 * 根据图表类型和维度/度量字段自动生成图表标题。
 *
 * @param {string} chartType - 图表类型：pie | bar | line | funnel | radar | gauge
 * @param {object} dimension - 维度字段定义
 * @param {object} measure - 度量字段定义
 * @returns {string} 生成的图表标题
 */
function generateChartTitle(chartType, dimension, measure) {
  const dimLabel = dimension?.label || "数据";
  const measLabel = measure?.label || "统计";
  const aggregation = measure?.aggregation || "COUNT";

  // 根据聚合类型生成描述
  const aggDesc = {
    COUNT: "数量",
    COUNT_DISTINCT: "去重数量",
    SUM: "总计",
    AVG: "平均",
    MAX: "最大值",
    MIN: "最小值",
  };

  // 根据图表类型生成标题
  const typeDesc = {
    pie: "分布",
    bar: "统计",
    line: "趋势",
    funnel: "漏斗",
    radar: "雷达图",
    gauge: "仪表盘",
  };

  const suffix = typeDesc[chartType] || "分析";
  
  // 生成标题：如 "项目状态分布"、"项目优先级统计"
  return dimLabel + suffix;
}

// ── 图表类型 → 组件名映射 ────────────────────────────

const CHART_TYPE_MAP = {
  pie: "YoushuPieChart",
  bar: "YoushuGroupedBarChart",
  line: "YoushuLineChart",
  funnel: "YoushuFunnelChart",
  radar: "YoushuRadarChart",
  gauge: "YoushuGauge",
};

// ── 构建图表组件（饼图 / 柱状图 / 折线图等） ────────

/**
 * 根据图表定义构建完整的报表图表组件 Schema。
 *
 * @param {object} chartDef - 图表定义
 * @param {string} chartDef.type      - 图表类型：pie | bar | line | funnel | radar | gauge
 * @param {string} chartDef.title     - 图表标题
 * @param {object|object[]} chartDef.dimension - 维度字段（单个对象或数组）
 * @param {string} chartDef.dimension.fieldId    - 字段 ID
 * @param {string} chartDef.dimension.label      - 显示名称
 * @param {string} [chartDef.dimension.fieldType] - 字段类型（用于推断 dataType 和 fieldCode）
 * @param {object|object[]} chartDef.measure   - 度量字段（单个对象或数组）
 * @param {string} chartDef.measure.fieldId      - 字段 ID
 * @param {string} chartDef.measure.label        - 显示名称
 * @param {string} chartDef.measure.aggregation  - 聚合方式：COUNT | SUM | AVG | MAX | MIN | COUNT_DISTINCT
 * @param {object} [chartDef.settings] - 额外的图表配置（height、innerRadius 等）
 * @param {string} cubeCode
 * @param {string} cubeTenantId
 * @param {object[]} filterRefs - 关联筛选器引用列表
 * @returns {object} 完整的组件 Schema（含 componentName、id、props）
 */
function buildChartComponent(chartDef, cubeCode, cubeTenantId, filterRefs) {
  const componentSuffix = nextComponentSuffix();
  const componentName = CHART_TYPE_MAP[chartDef.type] || "YoushuPieChart";
  const chartId = componentName + "_" + componentSuffix;

  // 统一为数组
  const dimensions = Array.isArray(chartDef.dimension) ? chartDef.dimension : [chartDef.dimension];
  const measures = Array.isArray(chartDef.measure) ? chartDef.measure : [chartDef.measure];

  // 构建 xField（维度字段）- 使用示例报表的正确结构
  const xFieldList = [];
  for (const dim of dimensions) {
    const dimFieldType = dim.fieldType || "SelectField";
    const dimFieldKey = nextFieldAlias(); // fieldKey 使用随机生成的 alias
    // fieldCode 对于 SelectField 类型需要加 _value 后缀
    const dimFieldCode = deriveFilterFieldCode(dim.fieldId, dimFieldType);
    const dimDataType = inferDataType(dimFieldType, dim.dataType);

    xFieldList.push({
      visible: true,
      isDimension: "false",
      fieldKey: dimFieldKey,
      fieldCode: dimFieldCode,
      classifiedCode: cubeCode,
      dataType: dimDataType,
      format: { type: "NONE" },
      link: [{ type: "NONE" }],
      drillList: [],
      orderBy: { reference: dimFieldKey, type: "NONE" },
      isVisible: "y",
      title: { zh_CN: dim.label, type: "i18n" },
      aggregateType: "NONE",
      cubeCode: cubeCode,
      beUsedTimes: 1,
      id: dimFieldCode,
      text: dim.label,
      measureType: "MEASURE_ATTRIBUTE",
    });
  }

  // 构建 yField（度量字段）- 使用示例报表的正确结构
  const yFieldList = [];
  for (const meas of measures) {
    const measFieldKey = nextFieldAlias();
    const measFieldCode = meas.fieldId || "pid";
    const measAggregation = meas.aggregation || "COUNT";
    const measDataType = meas.dataType || "STRING";

    yFieldList.push({
      visible: true,
      isDimension: "false",
      fieldKey: measFieldKey,
      fieldCode: measFieldCode,
      classifiedCode: cubeCode,
      dataType: measDataType,
      format: { type: "NONE" },
      link: [{ type: "NONE" }],
      drillList: [],
      orderBy: { reference: measFieldKey, type: "NONE" },
      isVisible: "y",
      title: { zh_CN: meas.label, type: "i18n" },
      aggregateType: measAggregation,
      cubeCode: cubeCode,
      beUsedTimes: 1,
      id: measFieldCode,
      text: meas.label,
      measureType: "MEASURE_ATTRIBUTE",
    });
  }

  // 合并用户自定义 settings 与默认 settings
  const defaultSettings = {
    container: { height: chartDef.height || 248 },
    statistic: { showStatistic: false },
    legend: {
      layout: "vertical",
      showLegend: true,
      flipPage: true,
      cardWidth: "",
      legendPosition: "top-left",
      type: "item",
      contentType: "NAME",
      itemSpacing: 12,
      ratio: 65,
    },
    percentDigits: 2,
    tooltip: { showTooltip: true, contentType: "" },
    style: {
      isRing: false,
      customColor: "#5894FF,#394B76,#F7B900,#E55F24,#80D5F5,#9849B0,#3BC88A,#0E869D,#F4A49E,#80563C",
      radius: 75,
      innerRadius: chartDef.innerRadius ? chartDef.innerRadius * 100 : 65,
      chartColorsMode: "defaultColorsMode",
      colorType: "SCHEMA_COLOR",
    },
    label: {
      labelSize: 12,
      labelAlign: "outer",
      labelFormatType: "NAME_PERCENT",
      showLine: true,
      showLabel: true,
      labelColor: "#404040",
    },
  };

  // 按图表类型设置特有默认值
  if (chartDef.type === "bar") {
    defaultSettings.style = {
      customColor: "#5894FF,#394B76,#F7B900,#E55F24,#80D5F5,#9849B0,#3BC88A,#0E869D,#F4A49E,#80563C",
      chartColorsMode: "defaultColorsMode",
      colorType: "SCHEMA_COLOR",
    };
    defaultSettings.label = { showLabel: false };
    // 柱状图需要配置 xAxis 和 yAxis
    defaultSettings.slider = { showSlider: false };
    defaultSettings.xAxis = {
      showTitle: false,
      line: true,
      grid: false,
      values: i18nText("", ""),
      labelStyle: {
        rotate: "0",
        color: "rgba(23,26,29,0.4)",
        labelType: "default",
        fontSize: 12,
        autoHide: true,
        autoRotate: true,
        percent: 30,
        value: 100,
        limitLengthType: "percent",
      },
      label: true,
      title: i18nText("", ""),
      showXAxis: true,
      tickLine: false,
    };
    defaultSettings.yAxis = {
      tickCount: 5,
      showTitle: false,
      line: false,
      grid: true,
      labelStyle: {
        rotate: "0",
        color: "rgba(23,26,29,0.4)",
        labelType: "default",
        fontSize: 12,
        autoHide: true,
        autoRotate: true,
        percent: 30,
        value: 100,
        limitLengthType: "percent",
      },
      label: true,
      title: i18nText("", ""),
      showYAxis: true,
      tickLine: false,
    };
  } else if (chartDef.type === "line") {
    defaultSettings.style = {
      customColor: "#5894FF,#394B76,#F7B900,#E55F24,#80D5F5,#9849B0,#3BC88A,#0E869D,#F4A49E,#80563C",
      chartColorsMode: "defaultColorsMode",
      colorType: "SCHEMA_COLOR",
      smooth: false,
      lineWidth: 2,
    };
    defaultSettings.label = { showLabel: false };
    // 折线图也需要配置 xAxis 和 yAxis
    defaultSettings.slider = { showSlider: false };
    defaultSettings.xAxis = {
      showTitle: false,
      line: true,
      grid: false,
      labelStyle: {
        rotate: "0",
        color: "rgba(23,26,29,0.4)",
        labelType: "default",
        fontSize: 12,
        autoHide: true,
        autoRotate: true,
      },
      label: true,
      showXAxis: true,
      tickLine: false,
    };
    defaultSettings.yAxis = {
      tickCount: 5,
      showTitle: false,
      line: false,
      grid: true,
      labelStyle: {
        rotate: "0",
        color: "rgba(23,26,29,0.4)",
        labelType: "default",
        fontSize: 12,
        autoHide: true,
        autoRotate: true,
      },
      label: true,
      showYAxis: true,
      tickLine: false,
    };
  }

  const mergedSettings = {
    ...defaultSettings,
    ...(chartDef.settings || {}),
  };

  // 构建外层 filterList（包含完整的 fieldInfo）
  const outerFilterList = [];
  if (filterRefs && Array.isArray(filterRefs)) {
    for (const filterRef of filterRefs) {
      const conditionType = filterRef.dataType === "DATE" ? "Between" : "EqualTo";
      const paramSuffix = filterRef.componentName === "YoushuTimeFilter" ? "filterData" : "selectFilter";

      outerFilterList.push({
        filterKey: filterRef.filterKey,
        conditionType: conditionType,
        paramId: filterRef.nodeId + "-" + paramSuffix,
        fieldInfo: {
          visible: true,
          isDimension: "false",
          fieldKey: filterRef.alias,
          fieldCode: filterRef.fieldId,
          classifiedCode: cubeCode,
          dataType: filterRef.dataType,
          format: { type: "NONE" },
          link: [{ type: "NONE" }],
          drillList: [],
          orderBy: { reference: filterRef.alias, type: "NONE" },
          isVisible: "y",
          title: filterRef.label + "_值",
          aggregateType: "NONE",
          cubeCode: cubeCode,
          beUsedTimes: 1,
          id: filterRef.fieldId,
          text: filterRef.label + "_值",
          measureType: "MEASURE_ATTRIBUTE",
        },
        filterType: "relate",
      });
    }
  }

  // 生成图表标题：优先使用用户定义的 title，否则根据图表类型和维度/度量自动生成
  const chartTitle = chartDef.title || generateChartTitle(chartDef.type, dimensions[0], measures[0]);

  return {
    componentName: componentName,
    id: chartId,
    props: {
      settings: mergedSettings,
      showComponentTitle: true,
      componentTitleTextAlign: "LEFT",
      componentTitle: i18nText(chartTitle, chartTitle),
      titleTipIconName: "help",
      titleTipContent: i18nText("", ""),
      enableFilterFunction: false,
      auth: [],
      openRefresh: true,
      link: {
        hasLink: false,
        onlyIcon: true,
        content: i18nText("更多", "More"),
      },
      dataSetModelMap: {
        chartData: {
          totalValue: [],
          yField: yFieldList,
          trailingIconField: [],
          youshuDataType: "real",
          cubeCodes: [cubeCode],
          cubeCode: cubeCode,
          xField: xFieldList,
          totalRatio: [],
          mockData: [],
          dataViewQueryModel: buildChartDataViewQueryModel(xFieldList, yFieldList, cubeCode, cubeTenantId, filterRefs),
          fieldList: [...xFieldList, ...yFieldList],
          filterList: outerFilterList,
          limit: "",
        },
      },
      copyAsImg: false,
      exportData: {
        ignoreSwitch: true,
        passType: "NO_PASS",
        exportType: "BROWSER",
        supportExport: false,
      },
      hasFullscreen: false,
      mockData: [],
      autoLink: true,
      afterFetch: '/**\n* 对返回的数据做一些自定义处理\n*/\nfunction afterFetch(data, extraInfo) {\n  return data;\n}',
      isHeightAuto: false,
      enabledCache: true,
      userConfig: [
        {
          name: "chartData",
          title: "图表数据集",
          items: [
            {
              setterName: "ColumnFieldSetter",
              name: "xField",
              setterProps: {
                single: true,
                showFormatTab: true,
                showFormulaEditor: true,
                showFieldInfo: true,
                showAggregateTab: true,
                showEditTab: true,
                showSortTab: true,
              },
              title: "维度",
            },
            {
              setterName: "ColumnFieldSetter",
              name: "yField",
              setterProps: {
                single: true,
                showFormatTab: true,
                showFormulaEditor: true,
                showFieldInfo: true,
                showAggregateTab: true,
                showEditTab: true,
                showSortTab: true,
              },
              title: "度量",
            },
          ],
        },
      ],
      __style__: {},
      cid: chartId,
      fieldId: chartId,
    },
  };
}

// ── 收集所有使用的组件名（用于 componentsMap） ───────

function collectComponentNames(filterComponents, indicatorComponents, tableComponents, chartComponents) {
  const componentNames = new Set([
    "Page", "RootHeader", "RootContent", "RootFooter",
    "YoushuPageHeader", "PageHeaderContent", "PageHeaderTab",
    "YoushuTopFilterContainer",
  ]);

  for (const fc of filterComponents) {
    componentNames.add(fc.component.componentName);
  }
  for (const ic of indicatorComponents) {
    componentNames.add(ic.componentName);
  }
  if (tableComponents) {
    for (const tc of tableComponents) {
      componentNames.add(tc.componentName);
    }
  }
  if (chartComponents) {
    for (const cc of chartComponents) {
      componentNames.add(cc.componentName);
    }
  }

  return Array.from(componentNames);
}

// ── 构建完整报表 Schema ──────────────────────────────

function buildReportSchema(reportTitle, reportDef, reportFormUuid, cubeCode, cubeTenantId) {
  const pageNodeId = nextNodeId();
  const rootHeaderId = nextNodeId();
  const rootContentId = nextNodeId();
  const rootFooterId = nextNodeId();
  const pageHeaderId = nextNodeId();
  const pageHeaderContentId = nextNodeId();
  const pageHeaderTabId = nextNodeId();
  const filterContainerId = nextNodeId();

  // 构建筛选项
  const filterComponents = [];
  const filterRefs = [];

  if (reportDef.filters && Array.isArray(reportDef.filters)) {
    for (const filter of reportDef.filters) {
      let filterResult;
      if (filter.type === "time" || filter.dataType === "DATE") {
        filterResult = buildTimeFilterComponent(filter, cubeCode, cubeTenantId);
      } else {
        filterResult = buildSelectFilterComponent(filter, cubeCode, cubeTenantId);
      }
      filterComponents.push(filterResult);
      filterRefs.push({
        nodeId: filterResult.nodeId,
        alias: filterResult.alias,
        filterKey: filterResult.filterKey,
        fieldId: filterResult.fieldCode || filter.fieldId,
        label: filter.label,
        dataType: filter.dataType || (filter.type === "time" ? "DATE" : "STRING"),
        componentName: filterResult.component.componentName,
      });
    }
  }

  // 构建指标卡
  const indicatorComponents = [];
  if (reportDef.indicators && Array.isArray(reportDef.indicators)) {
    for (const indicator of reportDef.indicators) {
      indicatorComponents.push(buildIndicatorCardComponent(indicator, cubeCode, cubeTenantId, filterRefs));
    }
  }

  // 构建基础表格
  const tableComponents = [];
  if (reportDef.tables && Array.isArray(reportDef.tables)) {
    for (const tableDef of reportDef.tables) {
      tableComponents.push(buildTableComponent(tableDef, cubeCode, cubeTenantId, filterRefs));
    }
  }

  // 构建图表
  const chartComponents = [];
  if (reportDef.charts && Array.isArray(reportDef.charts)) {
    for (const chartDef of reportDef.charts) {
      chartComponents.push(buildChartComponent(chartDef, cubeCode, cubeTenantId, filterRefs));
    }
  }

  // 构建 componentsMap
  const allComponentNames = collectComponentNames(filterComponents, indicatorComponents, tableComponents, chartComponents);
  const componentsMap = allComponentNames.map((name) => ({
    package: REPORT_PACKAGE,
    componentName: name,
    version: REPORT_VERSION,
  }));

  // 构建 RootContent 的 layout
  const layoutItems = [];
  let currentY = 0;
  
  // 指标卡布局（每行2个，高度11）
  indicatorComponents.forEach((ic, index) => {
    layoutItems.push({
      static: false,
      minH: 11,
      resizeHandles: ["w", "e"],
      w: 6,
      maxH: 11,
      moved: false,
      h: 11,
      x: (index % 2) * 6,
      y: Math.floor(index / 2) * 11,
      i: ic.id,
    });
  });

  const indicatorRowCount = Math.ceil(indicatorComponents.length / 2);
  currentY = indicatorRowCount * 11;

  // 图表布局（每行2个，高度21）
  chartComponents.forEach((cc, index) => {
    layoutItems.push({
      static: false,
      minH: 15,
      resizeHandles: ["w", "e", "s"],
      w: 6,
      moved: false,
      h: 21,
      x: (index % 2) * 6,
      y: currentY + Math.floor(index / 2) * 21,
      i: cc.id,
    });
  });

  const chartRowCount = Math.ceil(chartComponents.length / 2);
  currentY += chartRowCount * 21;

  // 表格布局（每个表格占满一行，高度21）
  tableComponents.forEach((tc, index) => {
    layoutItems.push({
      static: false,
      minH: 15,
      resizeHandles: ["w", "e", "s"],
      w: 12,
      moved: false,
      h: 21,
      x: 0,
      y: currentY + index * 21,
      i: tc.id,
    });
  });

  // 构建筛选项容器的 layout 配置
  const filterContainerFieldId = "filter_" + nextComponentSuffix();
  const filterLayout = filterComponents.map((fc, index) => ({
    static: false,
    w: 1,
    moved: false,
    h: 1,
    x: index % 3,
    y: Math.floor(index / 3),
    i: fc.component.props.fieldId || fc.component.id,
  }));

  // 组装组件树
  // 参考报表结构：YoushuPageHeader 的 children 包含 PageHeaderContent（含筛选项）和 PageHeaderTab（空）
  const componentsTree = {
    css: "body {\n  background-color: #f2f3f5;\n}\n",
    children: [
      {
        children: [
          {
            children: [
              {
                children: filterComponents.map((fc) => fc.component),
                componentName: "YoushuTopFilterContainer",
                id: filterContainerId,
                props: {
                  resetBtn: true,
                  layout: filterLayout,
                  rowColumn: 3,
                  createForm: true,
                  searchBtn: true,
                  fixed: true,
                  __style__: {},
                  rglSwitch: true,
                  status: "normal",
                  fieldId: filterContainerFieldId,
                  cid: filterContainerId,
                },
              },
            ],
            componentName: "PageHeaderContent",
            id: pageHeaderContentId,
            props: {},
          },
          {
            componentName: "PageHeaderTab",
            id: pageHeaderTabId,
            props: {},
          },
        ],
        componentName: "YoushuPageHeader",
        id: pageHeaderId,
        props: {
          tab: false,
          showTitle: true,
          titleContent: i18nText(reportTitle, reportTitle),
          titleTip: i18nText("", ""),
          status: "normal",
          cid: pageHeaderId,
        },
      },
    ],
    componentName: "RootHeader",
    id: rootHeaderId,
    props: {},
  };

  const rootContent = {
    children: [...indicatorComponents, ...chartComponents, ...tableComponents],
    componentName: "RootContent",
    id: rootContentId,
    props: {
      layout: layoutItems,
      contentBgColor: "transparent",
      rglSwitch: true,
    },
  };

  const rootFooter = {
    componentName: "RootFooter",
    id: rootFooterId,
    props: {},
  };

  const pageComponent = {
    css: "body {\n  background-color: #f2f3f5;\n}\n",
    children: [componentsTree, rootContent, rootFooter],
    methods: {
      __initMethods__: {
        compiled: "function (exports, module) { /*set actions code here*/ }",
        source: "function (exports, module) { /*set actions code here*/ }",
        type: "js",
      },
    },
    componentName: "Page",
    id: pageNodeId,
    dataSource: {
      offline: [],
      globalConfig: {
        fit: {
          compiled: "'use strict';\n\nvar __preParser__ = function fit(response) {\n  var content = response.content !== undefined ? response.content : response;\n  var error = {\n    message: response.errorMsg || response.errors && response.errors[0] && response.errors[0].msg || response.content || '远程数据源请求出错，success is false'\n  };\n  var success = true;\n  if (response.success !== undefined) {\n    success = response.success;\n  } else if (response.hasError !== undefined) {\n    success = !response.hasError;\n  }\n  return {\n    content: content,\n    success: success,\n    error: error\n  };\n};",
          source: "function fit(response) {\r\n  const content = (response.content !== undefined) ? response.content : response;\r\n  const error = {\r\n    message: response.errorMsg ||\r\n      (response.errors && response.errors[0] && response.errors[0].msg) ||\r\n      response.content || '远程数据源请求出错，success is false',\r\n  };\r\n  let success = true;\r\n  if (response.success !== undefined) {\r\n    success = response.success;\r\n  } else if (response.hasError !== undefined) {\r\n    success = !response.hasError;\r\n  }\r\n  return {\r\n    content,\r\n    success,\r\n    error,\r\n  };\r\n}",
          type: "js",
          error: {},
        },
      },
      online: [],
      list: [],
      sync: true,
    },
    lifeCycles: {
      constructor: {
        compiled: "function constructor() {\nvar module = { exports: {} };\nvar _this = this;\nthis.__initMethods__(module.exports, module);\nObject.keys(module.exports).forEach(function(item) {\n  if(typeof module.exports[item] === 'function'){\n    _this[item] = module.exports[item];\n  }\n});\n\n}",
        source: "function constructor() {\nvar module = { exports: {} };\nvar _this = this;\nthis.__initMethods__(module.exports, module);\nObject.keys(module.exports).forEach(function(item) {\n  if(typeof module.exports[item] === 'function'){\n    _this[item] = module.exports[item];\n  }\n});\n\n}",
        type: "js",
      },
    },
    props: {
      pageStyle: ":root {\n  background-color: #f2f3f5;\n}\n",
      containerStyle: {},
      templateVersion: "1.0.0",
      className: "page_" + nextComponentSuffix(),
      params: [],
    },
  };

  return {
    schemaType: "superform",
    schemaVersion: "5.0",
    pages: [
      {
        componentsMap: componentsMap,
        id: reportFormUuid,
        componentsTree: [pageComponent],
      },
    ],
  };
}

// ── 主流程 ───────────────────────────────────────────

async function run(args) {
  const { appType, reportTitle, sourceFormUuid, reportJsonOrFile } = parseArgs(args);

  const SEP = "=".repeat(50);
  console.error(SEP);
  console.error("📊 创建宜搭原生报表");
  console.error(SEP);
  console.error("  应用 ID:       " + appType);
  console.error("  报表名称:      " + reportTitle);
  console.error("  数据源表单:    " + sourceFormUuid);

  // Step 1: 读取登录态
  console.error("\n[Step 1] 读取登录态...");
  let cookieData = loadCookieData();
  if (!cookieData) {
    console.error("  未找到登录缓存，触发登录...");
    cookieData = triggerLogin();
  }

  const authRef = {
    csrfToken: cookieData.csrf_token,
    cookies: cookieData.cookies,
    baseUrl: resolveBaseUrl(cookieData),
    cookieData,
  };
  console.error("  登录态就绪: " + authRef.baseUrl);

  // 提取 corpId 作为 cubeTenantId
  const { corpId: cubeTenantId } = extractInfoFromCookies(cookieData.cookies);
  console.error("  组织 ID:    " + cubeTenantId);

  // Step 2: 读取报表定义
  console.error("\n[Step 2] 读取报表定义...");
  const reportDef = readReportDefinition(reportJsonOrFile);
  const filterCount = (reportDef.filters || []).length;
  const indicatorCount = (reportDef.indicators || []).length;
  const chartCount = (reportDef.charts || []).length;
  const tableCount = (reportDef.tables || []).length;
  console.error("  筛选项: " + filterCount + " 个");
  console.error("  指标卡: " + indicatorCount + " 个");
  console.error("  图表:   " + chartCount + " 个");
  console.error("  表格:   " + tableCount + " 个");

  // Step 3: 验证数据源表单
  console.error("\n[Step 3] 验证数据源表单...");
  const schemaResult = await requestWithAutoLogin((auth) => {
    const requestPath = `/alibaba/web/${appType}/_view/query/formdesign/getFormSchema.json`;
    return httpGet(auth.baseUrl, requestPath, { formUuid: sourceFormUuid, schemaVersion: "V5" }, auth.cookies);
  }, authRef);

  if (!schemaResult || schemaResult.success === false) {
    const errorMsg = schemaResult ? schemaResult.errorMsg || "未知错误" : "请求失败";
    console.error("  ❌ 获取数据源表单 Schema 失败: " + errorMsg);
    console.log(JSON.stringify({ success: false, error: "数据源表单验证失败: " + errorMsg }));
    process.exit(1);
  }
  console.error("  ✅ 数据源表单验证通过");

  // Step 4: 创建空白报表
  console.error("\n[Step 4] 创建空白报表...");
  const createResult = await requestWithAutoLogin((auth) => {
    const postData = querystring.stringify({
      _csrf_token: auth.csrfToken,
      formType: "report",
      title: JSON.stringify(i18nText(reportTitle)),
    });
    return httpPost(
      auth.baseUrl,
      `/dingtalk/web/${appType}/query/formdesign/saveFormSchemaInfo.json`,
      postData,
      auth.cookies
    );
  }, authRef);

  if (!createResult || !createResult.success || !createResult.content) {
    const errorMsg = createResult ? createResult.errorMsg || "未知错误" : "请求失败";
    console.error("  ❌ 创建空白报表失败: " + errorMsg);
    console.log(JSON.stringify({ success: false, error: errorMsg }));
    process.exit(1);
  }

  // 从响应中提取报表信息
  const reportContent = createResult.content;
  const reportFormUuid = reportContent.formUuid || reportContent;
  
  console.error("  ✅ 空白报表已创建: " + reportFormUuid);

  // Step 4.5: 获取刚创建的报表 Schema，以获取正确的 gmtModified
  console.error("\n[Step 4.5] 获取报表元信息...");
  const reportSchemaResult = await requestWithAutoLogin((auth) => {
    const requestPath = `/alibaba/web/${appType}/_view/query/formdesign/getFormSchema.json`;
    return httpGet(auth.baseUrl, requestPath, { formUuid: reportFormUuid, schemaVersion: "V5" }, auth.cookies);
  }, authRef);

  let gmtModified = Date.now();
  let topicId = "";
  let domainCode = "";

  if (reportSchemaResult && reportSchemaResult.success && reportSchemaResult.content) {
    const schemaContent = reportSchemaResult.content;
    gmtModified = schemaContent.gmtModified || Date.now();
    topicId = schemaContent.topicId || "";
    domainCode = schemaContent.domainCode || "";
    console.error("  gmtModified: " + gmtModified);
    if (topicId) console.error("  topicId: " + topicId);
    if (domainCode) console.error("  domainCode: " + domainCode);
  } else {
    console.error("  ⚠️ 无法获取报表元信息，使用默认值");
  }

  // Step 5: 构建报表 Schema 并保存
  console.error("\n[Step 5] 构建并保存报表 Schema...");
  const cubeCode = deriveCubeCode(sourceFormUuid);
  console.error("  数据源 cubeCode: " + cubeCode);

  const reportSchema = buildReportSchema(reportTitle, reportDef, reportFormUuid, cubeCode, cubeTenantId);

  const saveResult = await requestWithAutoLogin((auth) => {
    // 构建保存参数，参考示例接口格式
    const saveParams = {
      _csrf_token: auth.csrfToken,
      prefix: "_view",
      formUuid: reportFormUuid,
      content: JSON.stringify(reportSchema),
      schemaVersion: "V5",
    };
    
    // 添加可选参数
    if (topicId) saveParams.topicId = topicId;
    if (domainCode) saveParams.domainCode = domainCode;
    if (gmtModified) saveParams.gmtModified = gmtModified;
    
    const postData = querystring.stringify(saveParams);
    return httpPost(
      auth.baseUrl,
      `/alibaba/web/${appType}/_view/query/formdesign/saveFormSchema.json`,
      postData,
      auth.cookies
    );
  }, authRef);

  if (!saveResult || !saveResult.success) {
    const errorMsg = saveResult ? saveResult.errorMsg || "未知错误" : "请求失败";
    console.error("  ❌ 保存报表 Schema 失败: " + errorMsg);
    if (saveResult) {
      console.error("  响应详情: " + JSON.stringify(saveResult, null, 2));
    }
    console.log(JSON.stringify({ success: false, reportFormUuid, error: errorMsg }));
    process.exit(1);
  }
  console.error("  ✅ 报表 Schema 保存成功");

  // 输出结果
  const reportUrl = authRef.baseUrl + "/" + appType + "/workbench/" + reportFormUuid;
  const SEP2 = "=".repeat(50);
  console.error("\n" + SEP2);
  console.error("🎉 报表创建成功！");
  console.error("  报表 UUID:     " + reportFormUuid);
  console.error("  数据源表单:    " + sourceFormUuid);
  console.error("  访问地址:      " + reportUrl);
  console.error(SEP2);

  console.log(JSON.stringify({
    success: true,
    reportFormUuid,
    reportTitle,
    appType,
    sourceFormUuid,
    cubeCode,
    filterCount,
    indicatorCount,
    chartCount,
    tableCount,
    url: reportUrl,
  }));
}

module.exports = { run, buildReportSchema, deriveCubeCode };
