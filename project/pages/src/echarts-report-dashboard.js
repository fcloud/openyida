// ============================================================
// ECharts 报表看板 - 使用宜搭原生报表聚合数据
// ============================================================

var ECHARTS_CDN = "https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js";

// 数据源配置
var FORM_UUID = "FORM-5FE501D96DDA42BDABA8AA33323CC4319LIC";
var REPORT_UUID = "REPORT-0R8665A1ED54RG45IJWIX55W9Q8U2U6AH9XMM1";
var CUBE_CODE = "FORM_5FE501D96DDA42BDABA8AA33323CC4319LIC";
var PRD_ID = "13085982";  // 报表产品 ID（从报表页面请求中获取）

// 报表组件 ID 和名称映射（从报表 Schema 中获取）
var REPORT_COMPONENTS = {
  // 指标卡
  totalCount: { cid: "YoushuSimpleIndicatorCard_mmx9ha69i", cname: "项目总数", className: "YoushuSimpleIndicatorCard", dataSetKey: "youshuData" },
  totalBudget: { cid: "YoushuSimpleIndicatorCard_mmx9ha69l", cname: "总预算", className: "YoushuSimpleIndicatorCard", dataSetKey: "youshuData" },
  avgProgress: { cid: "YoushuSimpleIndicatorCard_mmx9ha6ao", cname: "平均进度", className: "YoushuSimpleIndicatorCard", dataSetKey: "youshuData" },
  // 聚合表格
  statusTable: { cid: "YoushuTable_mmx9ha6ar", cname: "按状态统计", className: "YoushuTable", dataSetKey: "table" },
  priorityTable: { cid: "YoushuTable_mmx9ha6ax", cname: "按优先级统计", className: "YoushuTable", dataSetKey: "table" },
  budgetTable: { cid: "YoushuTable_mmx9ha6a13", cname: "按状态统计预算", className: "YoushuTable", dataSetKey: "table" },
};

// 字段配置
var FIELD = {
  name: "textField_j2xehece",
  status: "selectField_j2xeiduk",
  priority: "selectField_j2xeiguj",
  budget: "numberField_d9h5xczk",
  progress: "rateField_j2xeiy60",
  startDate: "dateField_j2xe9bqx",
  endDate: "dateField_j2xex1if",
};

// 状态和优先级列表
var STATUS_LIST = ["规划中", "进行中", "已完成", "已延期", "已取消"];
var PRIORITY_LIST = ["低", "中", "高", "紧急"];

// 颜色配置
var PALETTE = {
  primary: "#1e40af",
  primaryLight: "#3b82f6",
  accent: "#0ea5e9",
  success: "#059669",
  warning: "#d97706",
  danger: "#dc2626",
  neutral: "#64748b",
  bg: "#f8fafc",
  cardBg: "#ffffff",
  border: "#e2e8f0",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
};

var STATUS_COLORS = {
  "规划中": "#6366f1",
  "进行中": "#0ea5e9",
  "已完成": "#059669",
  "已延期": "#d97706",
  "已取消": "#94a3b8",
};

var PRIORITY_COLORS = {
  "低": "#94a3b8",
  "中": "#0ea5e9",
  "高": "#d97706",
  "紧急": "#dc2626",
};

// ============================================================
// 状态管理
// ============================================================

var _customState = {
  loading: true,
  error: null,
  // 聚合数据（从原生报表获取）
  statusStats: [],      // 按状态统计
  priorityStats: [],    // 按优先级统计
  totalCount: 0,
  totalBudget: 0,
  avgProgress: 0,
  // 明细数据（分页加载）
  detailData: [],
  detailPage: 1,
  detailPageSize: 10,
  detailTotal: 0,
  // 全局筛选
  filters: {
    status: "",         // 按状态筛选（空=全部）
    priority: "",       // 按优先级筛选（空=全部）
    keyword: "",        // 项目名称关键词搜索
  },
  // 筛选面板展开状态
  filterExpanded: true,
};

export function getCustomState(key) {
  if (key) {
    return _customState[key];
  }
  return Object.assign({}, _customState);
}

export function setCustomState(newState) {
  Object.keys(newState).forEach(function(key) {
    _customState[key] = newState[key];
  });
  this.forceUpdate();
}

export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

// ============================================================
// 生命周期
// ============================================================

export function didMount() {
  var self = this;
  
  // 加载 ECharts
  this.utils.loadScript(ECHARTS_CDN).then(function() {
    // 加载数据
    self.loadAllData();
  }).catch(function(err) {
    console.error("加载 ECharts 失败:", err);
    self.setCustomState({ loading: false, error: "加载图表库失败" });
  });
  
  // 绑定窗口 resize 事件
  this.bindChartResize();
}

export function didUnmount() {
  // 清理图表实例
  var chartIds = ["chart-statusPie", "chart-priorityBar", "chart-progressGauge"];
  chartIds.forEach(function(id) {
    var dom = document.getElementById(id);
    if (dom && window.echarts) {
      var chart = window.echarts.getInstanceByDom(dom);
      if (chart) {
        chart.dispose();
      }
    }
  });
  
  // 移除 resize 监听
  if (this._resizeHandler) {
    window.removeEventListener("resize", this._resizeHandler);
  }
}

export function bindChartResize() {
  var self = this;
  this._resizeHandler = function() {
    var chartIds = ["chart-statusPie", "chart-priorityBar", "chart-progressGauge"];
    chartIds.forEach(function(id) {
      var dom = document.getElementById(id);
      if (dom && window.echarts) {
        var chart = window.echarts.getInstanceByDom(dom);
        if (chart) {
          chart.resize();
        }
      }
    });
  };
  window.addEventListener("resize", this._resizeHandler);
}

// ============================================================
// 数据加载
// ============================================================

export function loadAllData() {
  var self = this;
  
  self.setCustomState({ loading: true, error: null });
  
  // 并行加载：聚合数据（报表API） + 明细数据第一页（表单API）
  // 聚合数据必须来自报表 API，失败则报错
  Promise.all([
    self.loadAggregateData(),
    self.loadDetailData(1).catch(function(e) {
      console.warn("[ECharts Dashboard] 明细数据加载失败（不影响聚合图表）:", e);
      return null;
    }),
  ]).then(function() {
    self.setCustomState({ loading: false });
    // 渲染图表
    setTimeout(function() {
      self.renderAllCharts();
    }, 100);
  }).catch(function(err) {
    console.error("[ECharts Dashboard] ❌ 数据加载失败:", err);
    self.setCustomState({ 
      loading: false, 
      error: "报表 API 调用失败: " + (err.message || String(err)) + "。请打开 F12 Console 查看详细日志。"
    });
  });
}

// 调用宜搭原生报表 API 获取组件数据
// 关键参数：pageName=report, prdId 必须正确
export function fetchReportComponentData(componentConfig, filterValueMap) {
  var appType = window.pageConfig && window.pageConfig.appType;
  var csrfToken = window.g_config && window.g_config._csrf_token;
  
  var queryContext = {
    aliasList: [],
    filterValueMap: filterValueMap || {},
    dim2table: true,
    orderByList: [],
    needTotalCount: componentConfig.className === "YoushuTable",
    variableParams: {},
    paging: { start: 0, limit: 100 },
  };
  
  var body = new URLSearchParams({
    timezone: "GMT+8",
    _tb_token_: csrfToken,
    _csrf_token: csrfToken,
    _csrf: csrfToken,
    prdId: PRD_ID,                              // 关键：报表产品 ID
    pageId: REPORT_UUID,
    pageName: "workbench",                       // 关键：必须是 workbench
    cid: componentConfig.cid,
    cname: "",
    componentClassName: componentConfig.className,
    queryContext: JSON.stringify(queryContext),
    dataSetKey: componentConfig.dataSetKey,
    limit: "",
    enabledCache: true,
    queryTimestamp: Date.now(),
    appendTraceId: true,
  });
  
  var url = "/alibaba/web/" + appType + "/visual/visualizationDataRpc/getDataAsync.json?_api=EDataService.getDataAsync&_mock=false&_stamp=" + Date.now();
  
  console.log("[Report API] 请求:", componentConfig.cname, componentConfig.cid);
  
  return fetch(url, {
    method: "POST",
    headers: {
      "accept": "application/json, text/json",
      "content-type": "application/x-www-form-urlencoded",
      "x-requested-with": "XMLHttpRequest",
    },
    body: body.toString(),
    credentials: "include",
  }).then(function(response) {
    return response.json();
  }).then(function(result) {
    console.log("[Report API] 响应:", componentConfig.cname, JSON.stringify(result).substring(0, 500));
    if (result.success && result.content) {
      console.log("[Report API] ✅ 成功获取:", componentConfig.cname, "数据条数:", 
        (result.content.data || result.content.dataList || []).length);
      return result.content;
    }
    console.error("[Report API] ❌ 失败:", componentConfig.cname, "errorMsg:", result.errorMsg, "errorCode:", result.errorCode);
    throw new Error(result.errorMsg || "报表数据获取失败");
  }).catch(function(err) {
    console.error("[Report API] ❌ 请求异常:", componentConfig.cname, err.message || err);
    throw err;
  });
}

// 报表筛选器 filterKey 映射（从报表 Schema 中获取）
var REPORT_FILTER_KEYS = {
  status: "filter-64d734db-c105-4372-ad2a-7833427d965b",    // 项目状态筛选器
  priority: "filter-1e6ace6c-10cf-4da4-bbdd-d433af52b9dc",  // 项目优先级筛选器
  name: "filter-35861624-0280-4001-8609-9dfe8151a8fe",      // 项目名称筛选器
};

// 构建报表 API 的 filterValueMap
// 格式：{ "filter-UUID": ["筛选值"] }
export function buildFilterValueMap() {
  var f = _customState.filters;
  var filterMap = {};
  
  if (f.status) {
    filterMap[REPORT_FILTER_KEYS.status] = [f.status];
  }
  if (f.priority) {
    filterMap[REPORT_FILTER_KEYS.priority] = [f.priority];
  }
  if (f.keyword) {
    filterMap[REPORT_FILTER_KEYS.name] = [f.keyword];
  }
  
  return filterMap;
}

// 加载聚合数据（从宜搭原生报表 API 获取）
export function loadAggregateData() {
  var self = this;
  var filterMap = self.buildFilterValueMap();
  
  console.log("========================================");
  console.log("[ECharts Dashboard] 正在从宜搭原生报表 API 加载数据");
  console.log("[ECharts Dashboard] 报表 UUID:", REPORT_UUID);
  console.log("[ECharts Dashboard] 报表 prdId:", PRD_ID);
  console.log("[ECharts Dashboard] 筛选条件:", JSON.stringify(filterMap));
  console.log("========================================");
  
  var appType = window.pageConfig && window.pageConfig.appType;
  var csrfToken = window.g_config && window.g_config._csrf_token;
  
  if (!appType || !csrfToken) {
    var errMsg = "缺少运行环境参数：" + (!appType ? "appType 为空" : "") + (!csrfToken ? " csrfToken 为空" : "");
    console.error("[ECharts Dashboard] ❌", errMsg);
    _customState.error = errMsg + "，请检查页面是否在宜搭应用中打开";
    return Promise.reject(new Error(errMsg));
  }
  
  // 并行调用所有报表组件 API，传入筛选条件
  return Promise.all([
    self.fetchReportComponentData(REPORT_COMPONENTS.totalCount, filterMap),
    self.fetchReportComponentData(REPORT_COMPONENTS.totalBudget, filterMap),
    self.fetchReportComponentData(REPORT_COMPONENTS.avgProgress, filterMap),
    self.fetchReportComponentData(REPORT_COMPONENTS.statusTable, filterMap),
    self.fetchReportComponentData(REPORT_COMPONENTS.priorityTable, filterMap),
  ]).then(function(results) {
    console.log("[ECharts Dashboard] 报表 API 返回结果:", results);
    
    var totalCountData = results[0];
    var totalBudgetData = results[1];
    var avgProgressData = results[2];
    var statusTableData = results[3];
    var priorityTableData = results[4];
    
    var hasReportData = false;
    
    // ========================================
    // 报表 API 返回的数据结构说明：
    // {
    //   "content": {
    //     "data": [{"field_xxx": "进行中", "field_yyy": 1021}, ...],  // 数据在 data 字段
    //     "meta": [{"alias": "field_xxx", "aliasName": "..."}, ...]   // meta 描述字段信息
    //   }
    // }
    // 注意：字段名是动态生成的 field_xxx 格式，不是原始表单字段名
    // ========================================
    
    // 辅助函数：从报表数据中解析维度和度量
    // 第一个字段通常是维度（文本），第二个字段是度量（数值）
    function parseTableData(tableData) {
      // 数据在 data 字段，不是 dataList
      var dataArray = tableData.data || tableData.dataList || [];
      var metaArray = tableData.meta || [];
      
      if (dataArray.length === 0) {
        return [];
      }
      
      console.log("[ECharts Dashboard] 解析表格数据:", JSON.stringify(dataArray));
      console.log("[ECharts Dashboard] 字段元信息:", JSON.stringify(metaArray));
      
      // 从 meta 中识别维度字段和度量字段
      var dimensionField = null;  // 维度字段（文本，如状态、优先级）
      var measureField = null;    // 度量字段（数值，如计数）
      
      if (metaArray.length >= 2) {
        // 通常第一个是维度，第二个是度量
        dimensionField = metaArray[0].alias;
        measureField = metaArray[1].alias;
      } else if (dataArray.length > 0) {
        // 如果没有 meta，从数据中推断
        var sampleRow = dataArray[0];
        Object.keys(sampleRow).forEach(function(key) {
          if (typeof sampleRow[key] === "string" && !dimensionField) {
            dimensionField = key;
          } else if (typeof sampleRow[key] === "number" && !measureField) {
            measureField = key;
          }
        });
      }
      
      console.log("[ECharts Dashboard] 维度字段:", dimensionField, "度量字段:", measureField);
      
      if (!dimensionField || !measureField) {
        console.warn("[ECharts Dashboard] 无法识别维度或度量字段");
        return [];
      }
      
      // 解析数据
      var result = [];
      dataArray.forEach(function(row) {
        var name = row[dimensionField];
        var value = row[measureField];
        if (name !== undefined && name !== null) {
          result.push({ name: String(name), value: Number(value) || 0 });
        }
      });
      
      return result;
    }
    
    // 辅助函数：从指标卡数据中解析单一数值
    function parseIndicatorData(indicatorData) {
      var dataArray = indicatorData.data || indicatorData.dataList || [];
      if (dataArray.length === 0) {
        return null;
      }
      
      var row = dataArray[0];
      var keys = Object.keys(row);
      
      // 找到第一个数值字段
      for (var i = 0; i < keys.length; i++) {
        var val = row[keys[i]];
        if (typeof val === "number") {
          return val;
        }
      }
      
      // 如果没有数值，返回第一个字段的值
      return keys.length > 0 ? row[keys[0]] : null;
    }
    
    // 解析项目总数（指标卡）
    if (totalCountData) {
      var val = parseIndicatorData(totalCountData);
      if (val !== null) {
        _customState.totalCount = val;
        hasReportData = true;
        console.log("[ECharts Dashboard] ✅ 项目总数 (报表API):", _customState.totalCount);
      }
    }
    
    // 解析总预算（指标卡）
    if (totalBudgetData) {
      var val = parseIndicatorData(totalBudgetData);
      if (val !== null) {
        _customState.totalBudget = val;
        hasReportData = true;
        console.log("[ECharts Dashboard] ✅ 总预算 (报表API):", _customState.totalBudget);
      }
    }
    
    // 解析平均进度（指标卡）
    if (avgProgressData) {
      var val = parseIndicatorData(avgProgressData);
      if (val !== null) {
        _customState.avgProgress = typeof val === "number" ? val.toFixed(1) : val;
        hasReportData = true;
        console.log("[ECharts Dashboard] ✅ 平均进度 (报表API):", _customState.avgProgress);
      }
    }
    
    // 解析状态统计表格（用于饼图）
    if (statusTableData) {
      var statusStats = parseTableData(statusTableData);
      if (statusStats.length > 0) {
        _customState.statusStats = statusStats;
        hasReportData = true;
        console.log("[ECharts Dashboard] ✅ 状态统计 (报表API):", statusStats);
      }
    }
    
    // 解析优先级统计表格（用于柱状图）
    if (priorityTableData) {
      var priorityStats = parseTableData(priorityTableData);
      if (priorityStats.length > 0) {
        _customState.priorityStats = priorityStats;
        hasReportData = true;
        console.log("[ECharts Dashboard] ✅ 优先级统计 (报表API):", priorityStats);
      }
    }
    
    _customState.dataSource = "report";
    console.log("========================================");
    console.log("[ECharts Dashboard] ✅ 数据来源: 宜搭原生报表 API");
    console.log("[ECharts Dashboard] 报表 UUID:", REPORT_UUID);
    console.log("[ECharts Dashboard] 报表 prdId:", PRD_ID);
    console.log("[ECharts Dashboard] 数据解析结果:", {
      totalCount: _customState.totalCount,
      totalBudget: _customState.totalBudget,
      avgProgress: _customState.avgProgress,
      statusStats: _customState.statusStats.length + "条",
      priorityStats: _customState.priorityStats.length + "条",
    });
    console.log("========================================");
    return Promise.resolve();
  }).catch(function(err) {
    var errMsg = "报表 API 调用失败: " + (err.message || String(err));
    console.error("[ECharts Dashboard] ❌", errMsg);
    console.error("[ECharts Dashboard] 请在浏览器 Console 中检查上方的 [Report API] 日志，确认具体哪个组件失败");
    console.error("[ECharts Dashboard] 调试提示: 请先在浏览器中打开报表页面确认报表可正常访问");
    _customState.error = errMsg;
    return Promise.reject(err);
  });
}


// 加载明细数据（支持服务端筛选）
export function loadDetailData(page) {
  var self = this;
  var f = _customState.filters;
  
  // 构建 searchFieldJson 服务端筛选条件
  var searchFieldJson = {};
  if (f.status) {
    searchFieldJson[FIELD.status] = f.status;
  }
  if (f.priority) {
    searchFieldJson[FIELD.priority] = f.priority;
  }
  if (f.keyword) {
    searchFieldJson[FIELD.name] = f.keyword;
  }
  
  var params = {
    formUuid: FORM_UUID,
    currentPage: page,
    pageSize: _customState.detailPageSize,
  };
  
  // 只在有筛选条件时传 searchFieldJson
  if (Object.keys(searchFieldJson).length > 0) {
    params.searchFieldJson = JSON.stringify(searchFieldJson);
  }
  
  return self.utils.yida.searchFormDatas(params).then(function(res) {
    var rawData = res.data || [];
    console.log("[ECharts Dashboard] 明细数据加载成功，共", rawData.length, "条");
    if (rawData.length > 0) {
      console.log("[ECharts Dashboard] 第一条数据样例:", JSON.stringify(rawData[0]).substring(0, 500));
      console.log("[ECharts Dashboard] formInstId:", rawData[0].formInstId);
    }
    _customState.detailData = rawData;
    _customState.detailPage = page;
    _customState.detailTotal = res.totalCount || 0;
    return Promise.resolve();
  });
}

export function onDetailPageChange(page) {
  var self = this;
  self.loadDetailData(page).then(function() {
    self.forceUpdate();
  });
}

// ============================================================
// 筛选功能
// ============================================================

// 检查是否有激活的筛选条件
export function hasActiveFilters() {
  var f = _customState.filters;
  return f.status !== "" || f.priority !== "";
}

// 全局筛选：状态变更
export function onFilterStatusChange(value) {
  _customState.filters.status = value;
  _customState.detailPage = 1;
  this.applyFilters();
}

// 全局筛选：优先级变更
export function onFilterPriorityChange(value) {
  _customState.filters.priority = value;
  _customState.detailPage = 1;
  this.applyFilters();
}

// 重置所有筛选
export function onFilterReset() {
  var self = this;
  _customState.filters = { status: "", priority: "", keyword: "" };
  _customState.detailPage = 1;
  // 重新加载所有数据（报表 API 聚合 + 明细）
  Promise.all([
    self.loadAggregateData(),
    self.loadDetailData(1),
  ]).then(function() {
    self.forceUpdate();
    setTimeout(function() { self.renderAllCharts(); }, 100);
  });
}

// 切换筛选面板展开/收起
export function onToggleFilter() {
  _customState.filterExpanded = !_customState.filterExpanded;
  this.forceUpdate();
}

// 应用筛选条件（聚合数据走报表 API + 明细数据走 searchFormDatas 服务端筛选）
export function applyFilters() {
  var self = this;
  var hasFilter = self.hasActiveFilters();
  
  if (!hasFilter) {
    self.onFilterReset();
    return;
  }
  
  // 并行：报表 API 重新聚合（带 filterValueMap）+ 明细数据服务端筛选
  Promise.all([
    self.loadAggregateData(),
    self.loadDetailData(1),
  ]).then(function() {
    self.forceUpdate();
    setTimeout(function() { self.renderAllCharts(); }, 100);
  }).catch(function(err) {
    console.error("[ECharts Dashboard] 筛选数据加载失败:", err);
  });
}

// ============================================================
// 图表渲染
// ============================================================

export function renderAllCharts() {
  this.renderStatusPie();
  this.renderPriorityBar();
  this.renderProgressGauge();
}

// 状态分布饼图
export function renderStatusPie() {
  var dom = document.getElementById("chart-statusPie");
  if (!dom || !window.echarts) return;
  
  var chart = window.echarts.init(dom);
  var data = _customState.statusStats.filter(function(item) {
    return item.value > 0;
  }).map(function(item) {
    return {
      name: item.name,
      value: item.value,
      itemStyle: { color: STATUS_COLORS[item.name] || PALETTE.neutral },
    };
  });
  
  var option = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      right: 10,
      top: "center",
      textStyle: { color: PALETTE.textSecondary, fontSize: 12 },
    },
    series: [{
      type: "pie",
      radius: ["45%", "70%"],
      center: ["40%", "50%"],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: "#fff",
        borderWidth: 2,
      },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: "bold" },
      },
      data: data,
    }],
  };
  
  chart.setOption(option);
}

// 优先级分布柱状图
export function renderPriorityBar() {
  var dom = document.getElementById("chart-priorityBar");
  if (!dom || !window.echarts) return;
  
  var chart = window.echarts.init(dom);
  var categories = _customState.priorityStats.map(function(item) { return item.name; });
  var values = _customState.priorityStats.map(function(item) { return item.value; });
  var colors = _customState.priorityStats.map(function(item) {
    return PRIORITY_COLORS[item.name] || PALETTE.neutral;
  });
  
  var option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: categories,
      axisLine: { lineStyle: { color: PALETTE.border } },
      axisLabel: { color: PALETTE.textSecondary },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: { lineStyle: { color: PALETTE.border, type: "dashed" } },
      axisLabel: { color: PALETTE.textMuted },
    },
    series: [{
      type: "bar",
      data: values.map(function(v, i) {
        return { value: v, itemStyle: { color: colors[i], borderRadius: [4, 4, 0, 0] } };
      }),
      barWidth: "50%",
    }],
  };
  
  chart.setOption(option);
}

// 进度仪表盘
export function renderProgressGauge() {
  var dom = document.getElementById("chart-progressGauge");
  if (!dom || !window.echarts) return;
  
  var chart = window.echarts.init(dom);
  var progress = parseFloat(_customState.avgProgress) || 0;
  var percent = Math.round(progress / 5 * 100);
  
  var option = {
    series: [{
      type: "gauge",
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 5,
      radius: "90%",
      center: ["50%", "70%"],
      axisLine: {
        lineStyle: {
          width: 12,
          color: [
            [0.4, PALETTE.danger],
            [0.7, PALETTE.warning],
            [1, PALETTE.success],
          ],
        },
      },
      pointer: {
        icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
        length: "60%",
        width: 8,
        offsetCenter: [0, "-10%"],
        itemStyle: { color: "auto" },
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      title: { show: false },
      detail: {
        fontSize: 24,
        fontWeight: "bold",
        color: PALETTE.textPrimary,
        offsetCenter: [0, "20%"],
        formatter: function(value) { return value + "%"; },
      },
      data: [{ value: percent }],
    }],
  };
  
  chart.setOption(option);
}

// ============================================================
// 辅助函数
// ============================================================

export function formatDate(timestamp) {
  if (!timestamp) return "-";
  var d = new Date(timestamp);
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

export function getDetailUrl(formInstId) {
  if (!formInstId) return null;
  var appType = window.pageConfig && window.pageConfig.appType;
  if (!appType) return null;
  return "https://www.aliwork.com/" + appType + "/formDetail/" + FORM_UUID + "?formInstId=" + formInstId;
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var self = this;
  var timestamp = this.state.timestamp;
  var isMobile = this.utils.isMobile();
  
  // 样式定义
  var s = {
    container: {
      padding: isMobile ? "12px" : "20px",
      background: PALETTE.bg,
      minHeight: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    header: {
      marginBottom: isMobile ? 16 : 24,
    },
    title: {
      fontSize: isMobile ? 20 : 24,
      fontWeight: 700,
      color: PALETTE.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 13,
      color: PALETTE.textMuted,
    },
    kpiRow: {
      display: "flex",
      gap: isMobile ? 8 : 16,
      marginBottom: isMobile ? 16 : 24,
      flexWrap: "wrap",
    },
    kpiCard: {
      flex: isMobile ? "1 1 45%" : "1 1 0",
      background: PALETTE.cardBg,
      borderRadius: 12,
      padding: isMobile ? "12px" : "16px 20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      position: "relative",
      overflow: "hidden",
    },
    kpiAccent: {
      position: "absolute",
      top: 0,
      left: 0,
      width: 4,
      height: "100%",
      borderRadius: "12px 0 0 12px",
    },
    kpiValue: {
      fontSize: isMobile ? 24 : 28,
      fontWeight: 700,
      color: PALETTE.textPrimary,
      marginBottom: 4,
    },
    kpiLabel: {
      fontSize: 12,
      color: PALETTE.textMuted,
      fontWeight: 500,
    },
    grid2: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: isMobile ? 12 : 20,
      marginBottom: isMobile ? 16 : 24,
    },
    card: {
      background: PALETTE.cardBg,
      borderRadius: 12,
      padding: isMobile ? 12 : 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: PALETTE.textPrimary,
    },
    chartBox: {
      height: isMobile ? 200 : 240,
    },
    chartBoxSmall: {
      height: isMobile ? 160 : 180,
    },
    loading: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: 200,
      color: PALETTE.textMuted,
      fontSize: 14,
    },
    error: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: 200,
      color: PALETTE.danger,
      fontSize: 14,
    },
    footer: {
      textAlign: "center",
      padding: "20px 0",
      color: PALETTE.textMuted,
      fontSize: 12,
    },
  };
  
  // 表格样式
  var ts = {
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
      fontSize: 13,
    },
    th: {
      padding: "10px 12px",
      textAlign: "left",
      fontWeight: 600,
      color: PALETTE.textSecondary,
      fontSize: 12,
      borderBottom: "2px solid " + PALETTE.border,
      background: "#f8fafc",
    },
    td: {
      padding: "10px 12px",
      borderBottom: "1px solid " + PALETTE.border,
      color: PALETTE.textSecondary,
      fontSize: 13,
    },
    statusBadge: {
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
    },
    pager: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 0",
      flexWrap: "wrap",
      gap: 8,
    },
    pagerInfo: {
      fontSize: 12,
      color: PALETTE.textMuted,
    },
    pagerBtn: {
      padding: "6px 12px",
      borderRadius: 4,
      fontSize: 12,
      border: "1px solid " + PALETTE.border,
      background: "#fff",
      color: PALETTE.textSecondary,
      cursor: "pointer",
      marginLeft: 8,
    },
    pagerBtnDisabled: {
      padding: "6px 12px",
      borderRadius: 4,
      fontSize: 12,
      border: "1px solid " + PALETTE.border,
      background: "#f8fafc",
      color: PALETTE.textMuted,
      cursor: "not-allowed",
      marginLeft: 8,
    },
  };
  
  // 计算统计数据
  var statusCounts = {};
  _customState.statusStats.forEach(function(item) {
    statusCounts[item.name] = item.value;
  });
  var completedCount = statusCounts["已完成"] || 0;
  var delayedCount = statusCounts["已延期"] || 0;
  var inProgressCount = statusCounts["进行中"] || 0;
  var completionRate = _customState.totalCount > 0 
    ? Math.round(completedCount / _customState.totalCount * 100) 
    : 0;
  
  // 分页计算
  var totalPages = Math.max(1, Math.ceil(_customState.detailTotal / _customState.detailPageSize));
  var currentPage = _customState.detailPage;
  var startIdx = (currentPage - 1) * _customState.detailPageSize;
  
  return (
    <div style={s.container}>
      <div style={{ display: "none" }}>{timestamp}</div>
      
      {/* 标题 */}
      <div style={s.header}>
        <div style={s.title}>📊 项目数据看板</div>
      </div>
      
      {/* 全局筛选栏 */}
      {!_customState.loading && !_customState.error && (
        <div style={{
          background: PALETTE.cardBg,
          borderRadius: 12,
          padding: isMobile ? "12px" : "16px 20px",
          marginBottom: isMobile ? 12 : 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: _customState.filterExpanded ? 12 : 0,
            cursor: "pointer",
          }} onClick={function() { self.onToggleFilter(); }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: PALETTE.textPrimary }}>
              🔍 筛选条件
              {self.hasActiveFilters() && (
                <span style={{
                  marginLeft: 8,
                  padding: "2px 8px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#fff",
                  background: PALETTE.primary,
                }}>筛选中</span>
              )}
            </div>
            <span style={{ fontSize: 12, color: PALETTE.textMuted }}>
              {_customState.filterExpanded ? "▲ 收起" : "▼ 展开"}
            </span>
          </div>
          
          {_customState.filterExpanded && (
            <div>
              <div style={{
                display: "flex",
                gap: isMobile ? 8 : 16,
                flexWrap: "wrap",
                alignItems: "flex-end",
              }}>
                {/* 项目状态筛选 */}
                <div style={{ flex: isMobile ? "1 1 100%" : "0 0 180px" }}>
                  <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4, fontWeight: 500 }}>项目状态</div>
                  <select
                    value={_customState.filters.status}
                    onChange={function(e) { self.onFilterStatusChange(e.target.value); }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid " + PALETTE.border,
                      fontSize: 13,
                      color: PALETTE.textPrimary,
                      background: "#fff",
                      outline: "none",
                      cursor: "pointer",
                      appearance: "auto",
                    }}
                  >
                    <option value="">全部状态</option>
                    {STATUS_LIST.map(function(status) {
                      return <option key={status} value={status}>{status}</option>;
                    })}
                  </select>
                </div>
                
                {/* 优先级筛选 */}
                <div style={{ flex: isMobile ? "1 1 100%" : "0 0 180px" }}>
                  <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4, fontWeight: 500 }}>优先级</div>
                  <select
                    value={_customState.filters.priority}
                    onChange={function(e) { self.onFilterPriorityChange(e.target.value); }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid " + PALETTE.border,
                      fontSize: 13,
                      color: PALETTE.textPrimary,
                      background: "#fff",
                      outline: "none",
                      cursor: "pointer",
                      appearance: "auto",
                    }}
                  >
                    <option value="">全部优先级</option>
                    {PRIORITY_LIST.map(function(priority) {
                      return <option key={priority} value={priority}>{priority}</option>;
                    })}
                  </select>
                </div>
                
                {/* 重置按钮 */}
                <div style={{ flex: "0 0 auto" }}>
                  <button
                    onClick={function() { self.onFilterReset(); }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      border: "1px solid " + PALETTE.border,
                      fontSize: 13,
                      color: self.hasActiveFilters() ? PALETTE.danger : PALETTE.textMuted,
                      background: "#fff",
                      cursor: self.hasActiveFilters() ? "pointer" : "default",
                      fontWeight: 500,
                      opacity: self.hasActiveFilters() ? 1 : 0.5,
                    }}
                    disabled={!self.hasActiveFilters()}
                  >🔄 重置</button>
                </div>
              </div>
              
              {/* 筛选结果提示 */}
              {self.hasActiveFilters() && (
                <div style={{
                  marginTop: 10,
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: PALETTE.primary + "08",
                  border: "1px solid " + PALETTE.primary + "20",
                  fontSize: 12,
                  color: PALETTE.primary,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}>
                  <span>📋 筛选结果：共 {_customState.totalCount} 条</span>
                  {_customState.filters.status && (
                    <span style={{
                      padding: "1px 6px",
                      borderRadius: 4,
                      background: (STATUS_COLORS[_customState.filters.status] || PALETTE.neutral) + "14",
                      color: STATUS_COLORS[_customState.filters.status] || PALETTE.neutral,
                      fontWeight: 600,
                    }}>状态: {_customState.filters.status}</span>
                  )}
                  {_customState.filters.priority && (
                    <span style={{
                      padding: "1px 6px",
                      borderRadius: 4,
                      background: (PRIORITY_COLORS[_customState.filters.priority] || PALETTE.neutral) + "14",
                      color: PRIORITY_COLORS[_customState.filters.priority] || PALETTE.neutral,
                      fontWeight: 600,
                    }}>优先级: {_customState.filters.priority}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* 加载状态 */}
      {_customState.loading && (
        <div style={s.loading}>⏳ 加载中...</div>
      )}
      
      {/* 错误状态 */}
      {_customState.error && (
        <div style={s.error}>❌ {_customState.error}</div>
      )}
      
      {/* 主内容 */}
      {!_customState.loading && !_customState.error && (
        <div>
          {/* KPI 卡片 */}
          <div style={s.kpiRow}>
            <div style={s.kpiCard}>
              <div style={Object.assign({}, s.kpiAccent, { background: PALETTE.primary })}></div>
              <div style={s.kpiValue}>{_customState.totalCount}</div>
              <div style={s.kpiLabel}>项目总数</div>
            </div>
            <div style={s.kpiCard}>
              <div style={Object.assign({}, s.kpiAccent, { background: PALETTE.accent })}></div>
              <div style={s.kpiValue}>{inProgressCount}</div>
              <div style={s.kpiLabel}>进行中</div>
            </div>
            <div style={s.kpiCard}>
              <div style={Object.assign({}, s.kpiAccent, { background: PALETTE.success })}></div>
              <div style={s.kpiValue}>{completionRate}<span style={{ fontSize: 13, color: PALETTE.textMuted }}>%</span></div>
              <div style={s.kpiLabel}>完成率</div>
            </div>
            <div style={s.kpiCard}>
              <div style={Object.assign({}, s.kpiAccent, { background: PALETTE.warning })}></div>
              <div style={s.kpiValue}>{_customState.totalBudget}<span style={{ fontSize: 13, color: PALETTE.textMuted }}>万</span></div>
              <div style={s.kpiLabel}>总预算</div>
            </div>
            <div style={s.kpiCard}>
              <div style={Object.assign({}, s.kpiAccent, { background: PALETTE.danger })}></div>
              <div style={s.kpiValue}>{delayedCount}</div>
              <div style={s.kpiLabel}>已延期</div>
            </div>
          </div>
          
          {/* 图表区域 */}
          <div style={s.grid2}>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.cardTitle}>状态分布</div>
              </div>
              <div id="chart-statusPie" style={s.chartBox}></div>
            </div>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.cardTitle}>优先级分布</div>
              </div>
              <div id="chart-priorityBar" style={s.chartBox}></div>
            </div>
          </div>
          
          {/* 进度仪表盘 */}
          <div style={{ marginBottom: isMobile ? 16 : 24 }}>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.cardTitle}>平均进度</div>
                <span style={{ fontSize: 12, color: PALETTE.textMuted }}>
                  {_customState.avgProgress} / 5 星
                </span>
              </div>
              <div id="chart-progressGauge" style={s.chartBoxSmall}></div>
            </div>
          </div>
          
          {/* 数据明细表格 */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitle}>数据明细</div>
              <span style={{ fontSize: 12, color: PALETTE.textMuted }}>
                共 {_customState.detailTotal} 条
              </span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={ts.table}>
                <thead>
                  <tr>
                    <th style={ts.th}>#</th>
                    <th style={ts.th}>项目名称</th>
                    <th style={ts.th}>状态</th>
                    <th style={ts.th}>优先级</th>
                    <th style={ts.th}>预算(万)</th>
                    <th style={ts.th}>进度</th>
                    <th style={ts.th}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {_customState.detailData.length === 0 && (
                    <tr>
                      <td colSpan="7" style={Object.assign({}, ts.td, { textAlign: "center", padding: "32px 12px", color: PALETTE.textMuted })}>
                        暂无数据
                      </td>
                    </tr>
                  )}
                  {_customState.detailData.map(function(item, idx) {
                    var fd = item.formData || {};
                    var rowNum = startIdx + idx + 1;
                    var status = fd[FIELD.status] || "-";
                    var priority = fd[FIELD.priority] || "-";
                    var statusColor = STATUS_COLORS[status] || PALETTE.neutral;
                    var priorityColor = PRIORITY_COLORS[priority] || PALETTE.neutral;
                    var progressVal = parseFloat(fd[FIELD.progress]) || 0;
                    var progressPct = Math.round(progressVal / 5 * 100);
                    var instanceId = item.formInstId || (item.formData && item.formData.pid) || null;
                    var detailUrl = self.getDetailUrl(instanceId);
                    
                    return (
                      <tr key={item.formInstId || idx} style={{ background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                        <td style={ts.td}>{rowNum}</td>
                        <td style={ts.td}>
                          {detailUrl ? (
                            <a href={detailUrl} target="_blank" rel="noopener noreferrer" style={{ color: PALETTE.primary, textDecoration: "none", fontWeight: 500 }}>
                              {fd[FIELD.name] || "-"}
                            </a>
                          ) : (
                            <span style={{ fontWeight: 500 }}>{fd[FIELD.name] || "-"}</span>
                          )}
                        </td>
                        <td style={ts.td}>
                          <span style={Object.assign({}, ts.statusBadge, { color: statusColor, background: statusColor + "14", border: "1px solid " + statusColor + "30" })}>
                            {status}
                          </span>
                        </td>
                        <td style={ts.td}>
                          <span style={Object.assign({}, ts.statusBadge, { color: priorityColor, background: priorityColor + "10" })}>
                            {priority}
                          </span>
                        </td>
                        <td style={ts.td}>{fd[FIELD.budget] || "0"}</td>
                        <td style={ts.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 60, height: 6, borderRadius: 3, background: "#f1f5f9" }}>
                              <div style={{ width: progressPct + "%", height: "100%", borderRadius: 3, background: progressPct >= 80 ? PALETTE.success : progressPct >= 40 ? PALETTE.warning : PALETTE.danger }}></div>
                            </div>
                            <span style={{ fontSize: 12, color: PALETTE.textSecondary }}>{progressPct}%</span>
                          </div>
                        </td>
                        <td style={ts.td}>
                          {detailUrl ? (
                            <a href={detailUrl} target="_blank" rel="noopener noreferrer" style={{ color: PALETTE.primaryLight, fontSize: 12, textDecoration: "none" }}>详情</a>
                          ) : (
                            <span style={{ fontSize: 12, color: PALETTE.textMuted }}>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* 分页 */}
            {totalPages > 1 && (
              <div style={ts.pager}>
                <div style={ts.pagerInfo}>
                  第 {startIdx + 1}-{Math.min(startIdx + _customState.detailPageSize, _customState.detailTotal)} 条，共 {_customState.detailTotal} 条
                </div>
                <div>
                  <button
                    style={currentPage <= 1 ? ts.pagerBtnDisabled : ts.pagerBtn}
                    onClick={currentPage <= 1 ? undefined : function() { self.onDetailPageChange(currentPage - 1); }}
                    disabled={currentPage <= 1}
                  >上一页</button>
                  <button
                    style={currentPage >= totalPages ? ts.pagerBtnDisabled : ts.pagerBtn}
                    onClick={currentPage >= totalPages ? undefined : function() { self.onDetailPageChange(currentPage + 1); }}
                    disabled={currentPage >= totalPages}
                  >下一页</button>
                </div>
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
}
