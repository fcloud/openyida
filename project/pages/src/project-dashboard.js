// ============================================================
// 项目数据看板 v2 — 高端商务风格 + 全局/局部筛选
// ============================================================

var ECHARTS_CDN = 'https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js';
var FORM_UUID = 'FORM-5FE501D96DDA42BDABA8AA33323CC4319LIC';
var REPORT_UUID = 'REPORT-0R8665A1ED54RG45IJWIX55W9Q8U2U6AH9XMM1';
var PRD_ID = '13085982';

// 报表组件配置（从宜搭原生报表获取聚合数据，所有聚合统计均通过 getDataAsync.json 实现）
var REPORT_COMPONENTS = {
  totalCount: { cid: 'YoushuSimpleIndicatorCard_mmx9ha69i', cname: '项目总数', className: 'YoushuSimpleIndicatorCard', dataSetKey: 'youshuData' },
  totalBudget: { cid: 'YoushuSimpleIndicatorCard_mmx9ha69l', cname: '总预算', className: 'YoushuSimpleIndicatorCard', dataSetKey: 'youshuData' },
  avgProgress: { cid: 'YoushuSimpleIndicatorCard_mmx9ha6ao', cname: '平均进度', className: 'YoushuSimpleIndicatorCard', dataSetKey: 'youshuData' },
  statusTable: { cid: 'YoushuTable_mmx9ha6ar', cname: '按状态统计', className: 'YoushuTable', dataSetKey: 'table' },
  priorityTable: { cid: 'YoushuTable_mmx9ha6ax', cname: '按优先级统计', className: 'YoushuTable', dataSetKey: 'table' },
  budgetTable: { cid: 'YoushuTable_mmx9ha6a13', cname: '按状态统计预算', className: 'YoushuTable', dataSetKey: 'table' },
  monthlyTrend: { cid: 'YoushuTable_trend_mmxhdkl9', cname: '月度趋势', className: 'YoushuTable', dataSetKey: 'table' },
  crossAnalysis: { cid: 'YoushuTable_cross_mmxhdklg', cname: '状态×优先级交叉分析', className: 'YoushuTable', dataSetKey: 'table' },
};

var FIELD = {
  name: 'textField_j2xehece',
  desc: 'textareaField_j2xe87xm',
  startDate: 'dateField_j2xe9bqx',
  endDate: 'dateField_j2xex1if',
  status: 'selectField_j2xeiduk',
  priority: 'selectField_j2xeiguj',
  budget: 'numberField_d9h5xczk',
  progress: 'rateField_j2xeiy60',
};

var STATUS_LIST = ['规划中', '进行中', '已完成', '已延期', '已取消'];
var PRIORITY_LIST = ['低', '中', '高', '紧急'];

var PALETTE = {
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  accent: '#0ea5e9',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  neutral: '#64748b',
  bg: '#f8fafc',
  cardBg: '#ffffff',
  border: '#e2e8f0',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
};

var STATUS_COLORS = {
  '规划中': '#6366f1',
  '进行中': '#0ea5e9',
  '已完成': '#059669',
  '已延期': '#d97706',
  '已取消': '#94a3b8',
};

var PRIORITY_COLORS = {
  '低': '#94a3b8',
  '中': '#0ea5e9',
  '高': '#d97706',
  '紧急': '#dc2626',
};

// ============================================================
// 状态管理
// ============================================================

var _customState = {
  loading: true,
  allData: [],
  // 报表聚合数据（从 getDataAsync.json 获取，所有聚合统计的唯一数据源）
  reportTotalCount: 0,
  reportTotalBudget: 0,
  reportAvgProgress: 0,
  reportStatusStats: [],
  reportPriorityStats: [],
  reportBudgetByStatus: [],
  reportMonthlyTrend: [],
  reportCrossAnalysis: [],
  // 全局筛选
  filterName: '全部',
  filterStatus: '全部',
  filterPriority: '全部',
  filterBudgetRange: '全部',
  // 项目名称下拉搜索
  nameOptions: [],
  nameDropdownOpen: false,
  nameSearchKeyword: '',
  nameSearchLoading: false,
  // 局部筛选
  trendMetric: 'count',
  heatDimension: 'count',
  // 表格分页
  tablePage: 1,
  tablePageSize: 10,
  tableSortField: 'budget',
  tableSortOrder: 'desc',
};

export function getCustomState(key) {
  if (key) return _customState[key];
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
// 筛选逻辑
// ============================================================

export function getFilteredData() {
  var data = _customState.allData;

  if (_customState.filterStatus !== '全部') {
    data = data.filter(function(item) {
      return (item.formData || {})[FIELD.status] === _customState.filterStatus;
    });
  }

  if (_customState.filterPriority !== '全部') {
    data = data.filter(function(item) {
      return (item.formData || {})[FIELD.priority] === _customState.filterPriority;
    });
  }

  if (_customState.filterName !== '全部') {
    data = data.filter(function(item) {
      return (item.formData || {})[FIELD.name] === _customState.filterName;
    });
  }

  if (_customState.filterBudgetRange !== '全部') {
    data = data.filter(function(item) {
      var budget = Number((item.formData || {})[FIELD.budget]) || 0;
      switch (_customState.filterBudgetRange) {
        case '100以下': return budget < 100;
        case '100-200': return budget >= 100 && budget < 200;
        case '200-500': return budget >= 200 && budget < 500;
        case '500以上': return budget >= 500;
        default: return true;
      }
    });
  }

  return data;
}

export function onFilterChange(filterKey, value) {
  _customState[filterKey] = value;
  _customState.tablePage = 1;
  this.forceUpdate();
  // 筛选变化时重新调用报表 API 获取筛选后的聚合数据
  var self = this;
  self.loadAggregateData().then(function() {
    self.forceUpdate();
    setTimeout(function() { self.renderAllCharts(); }, 50);
  });
}

// ============================================================
// 项目名称下拉搜索
// ============================================================

export function loadNameOptions() {
  var data = _customState.allData;
  var nameSet = {};
  var options = [];
  data.forEach(function(item) {
    var name = (item.formData || {})[FIELD.name];
    if (name && !nameSet[name]) {
      nameSet[name] = true;
      options.push(name);
    }
  });
  options.sort();
  _customState.nameOptions = options;
  this.forceUpdate();
}

export function searchNameByKeyword(keyword) {
  _customState.nameSearchKeyword = keyword;
  var data = _customState.allData;
  var nameSet = {};
  var options = [];
  var lowerKeyword = (keyword || '').trim().toLowerCase();

  data.forEach(function(item) {
    var name = (item.formData || {})[FIELD.name];
    if (name && !nameSet[name]) {
      if (!lowerKeyword || name.toLowerCase().indexOf(lowerKeyword) !== -1) {
        nameSet[name] = true;
        options.push(name);
      }
    }
  });
  options.sort();
  _customState.nameOptions = options;

  // 直接操作 DOM 更新下拉选项列表，避免 forceUpdate 导致 input 重建丢焦
  var listContainer = document.getElementById('name-options-list');
  if (listContainer) {
    var self = this;
    var html = '<div style="padding:8px 12px;font-size:13px;cursor:pointer;color:' +
      (_customState.filterName === '全部' ? PALETTE.primary : PALETTE.textSecondary) +
      ';font-weight:' + (_customState.filterName === '全部' ? '600' : '400') +
      ';background:' + (_customState.filterName === '全部' ? PALETTE.primary + '08' : 'transparent') +
      '" data-name="全部">全部</div>';

    if (options.length === 0) {
      html += '<div style="padding:8px 12px;font-size:12px;color:' + PALETTE.textMuted + ';text-align:center">暂无匹配项</div>';
    } else {
      options.forEach(function(name) {
        var isActive = _customState.filterName === name;
        html += '<div style="padding:8px 12px;font-size:13px;cursor:pointer;color:' +
          (isActive ? PALETTE.primary : PALETTE.textSecondary) +
          ';font-weight:' + (isActive ? '600' : '400') +
          ';background:' + (isActive ? PALETTE.primary + '08' : 'transparent') +
          ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap" data-name="' +
          name.replace(/"/g, '&quot;') + '">' + name + '</div>';
      });
    }
    listContainer.innerHTML = html;

    // 绑定点击事件
    var items = listContainer.querySelectorAll('[data-name]');
    for (var i = 0; i < items.length; i++) {
      (function(item) {
        item.onclick = function() {
          self.onNameSelect(item.getAttribute('data-name'));
        };
      })(items[i]);
    }
  }
}

export function onNameSelect(name) {
  _customState.filterName = name;
  _customState.nameDropdownOpen = false;
  _customState.nameSearchKeyword = '';
  _customState.tablePage = 1;
  this.forceUpdate();
  // 项目名称筛选变化时重新调用报表 API
  var self = this;
  self.loadAggregateData().then(function() {
    self.forceUpdate();
    setTimeout(function() { self.renderAllCharts(); }, 50);
  });
}

export function onNameDropdownToggle() {
  _customState.nameDropdownOpen = !_customState.nameDropdownOpen;
  if (_customState.nameDropdownOpen) {
    this.loadNameOptions();
  }
  this.forceUpdate();
}

export function onLocalFilterChange(filterKey, value) {
  _customState[filterKey] = value;
  this.forceUpdate();
  setTimeout(function() {
    if (filterKey === 'trendMetric') {
      this.renderBudgetLine();
    } else if (filterKey === 'heatDimension') {
      this.renderStatusPriorityHeat();
    }
  }.bind(this), 50);
}

// ============================================================
// 生命周期
// ============================================================

export function didMount() {
  this.utils.loadScript(ECHARTS_CDN)
    .then(function() {
      this.loadAllData();
    }.bind(this))
    .catch(function() {
      this.utils.toast({ title: 'ECharts 加载失败，请刷新重试', type: 'error' });
    }.bind(this));
}

export function didUnmount() {
  var chartIds = ['statusPie', 'priorityBar', 'budgetLine', 'progressGauge', 'budgetRadar', 'statusPriorityHeat'];
  chartIds.forEach(function(chartId) {
    var container = document.getElementById('chart-' + chartId);
    if (container) {
      var instance = window.echarts.getInstanceByDom(container);
      if (instance) instance.dispose();
    }
  });
  if (this._resizeHandler) {
    window.removeEventListener('resize', this._resizeHandler);
  }
}

// ============================================================
// 数据加载
// ============================================================

export function loadAllData() {
  var self = this;
  // 并行加载：报表API（KPI+图表聚合数据） + searchFormDatas（明细表数据）
  Promise.all([
    self.loadAggregateData(),
    self.fetchDetailData(FORM_UUID),
  ]).then(function() {
    self.setCustomState({ loading: false });
    self.loadNameOptions();
    setTimeout(function() {
      self.renderAllCharts();
      self.bindChartResize();
    }, 100);
  }).catch(function(error) {
    self.utils.toast({ title: '数据加载失败: ' + error.message, type: 'error' });
    self.setCustomState({ loading: false });
  });
}

// 从 searchFormDatas 加载明细表数据（只加载第一页100条）
export function fetchDetailData(formUuid) {
  var self = this;
  return self.utils.yida.searchFormDatas({
    formUuid: formUuid,
    currentPage: 1,
    pageSize: 100,
  }).then(function(res) {
    _customState.allData = res.data || [];
    return _customState.allData;
  });
}

// 报表筛选器 filter ID 映射（对应报表页面中的 YoushuSelectFilter 组件）
// 这些 ID 由报表页面运行时生成，需要从浏览器网络请求中获取
var REPORT_FILTER_IDS = {
  status: '',    // 项目状态筛选器的 filter ID（待获取后填入）
  priority: 'filter-1e6ace6c-10cf-4da4-bbdd-d433af52b9dc',  // 项目优先级筛选器的 filter ID
};

// 根据当前 Dashboard 筛选状态构建报表 API 的 filterValueMap
function buildFilterValueMap() {
  var filterValueMap = {};
  if (_customState.filterStatus !== '全部' && REPORT_FILTER_IDS.status) {
    filterValueMap[REPORT_FILTER_IDS.status] = [_customState.filterStatus];
  }
  if (_customState.filterPriority !== '全部' && REPORT_FILTER_IDS.priority) {
    filterValueMap[REPORT_FILTER_IDS.priority] = [_customState.filterPriority];
  }
  return filterValueMap;
}

// 调用宜搭原生报表 API 获取组件聚合数据
export function fetchReportComponentData(componentConfig, filterValueMap) {
  var appType = window.pageConfig && window.pageConfig.appType;
  var csrfToken = window.g_config && window.g_config._csrf_token;

  var queryContext = {
    aliasList: [],
    filterValueMap: filterValueMap || {},
    dim2table: true,
    orderByList: [],
    needTotalCount: componentConfig.className === 'YoushuTable',
    variableParams: {},
    paging: { start: 0, limit: 100 },
  };

  var body = new URLSearchParams({
    timezone: 'GMT+8',
    _tb_token_: csrfToken,
    _csrf_token: csrfToken,
    _csrf: csrfToken,
    prdId: PRD_ID,
    pageId: REPORT_UUID,
    pageName: 'workbench',
    cid: componentConfig.cid,
    cname: '',
    componentClassName: componentConfig.className,
    queryContext: JSON.stringify(queryContext),
    dataSetKey: componentConfig.dataSetKey,
    limit: '',
    enabledCache: true,
    queryTimestamp: Date.now(),
    appendTraceId: true,
  });

  var url = '/alibaba/web/' + appType + '/visual/visualizationDataRpc/getDataAsync.json?_api=EDataService.getDataAsync&_mock=false&_stamp=' + Date.now();

  return fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json, text/json',
      'content-type': 'application/x-www-form-urlencoded',
      'x-requested-with': 'XMLHttpRequest',
    },
    body: body.toString(),
    credentials: 'include',
  }).then(function(response) {
    return response.json();
  }).then(function(result) {
    if (result.success && result.content) {
      return result.content;
    }
    throw new Error(result.errorMsg || '报表数据获取失败');
  });
}

// 从报表 API 加载聚合数据（KPI + 图表），支持筛选条件透传
export function loadAggregateData() {
  var self = this;
  var appType = window.pageConfig && window.pageConfig.appType;
  var csrfToken = window.g_config && window.g_config._csrf_token;

  if (!appType || !csrfToken) {
    console.warn('[Dashboard] 缺少 appType 或 csrfToken，跳过报表 API');
    return Promise.resolve();
  }

  // 根据当前筛选状态构建 filterValueMap，传递给报表 API
  var currentFilterValueMap = buildFilterValueMap();

  return Promise.all([
    self.fetchReportComponentData(REPORT_COMPONENTS.totalCount, currentFilterValueMap),
    self.fetchReportComponentData(REPORT_COMPONENTS.totalBudget, currentFilterValueMap),
    self.fetchReportComponentData(REPORT_COMPONENTS.avgProgress, currentFilterValueMap),
    self.fetchReportComponentData(REPORT_COMPONENTS.statusTable, currentFilterValueMap),
    self.fetchReportComponentData(REPORT_COMPONENTS.priorityTable, currentFilterValueMap),
    self.fetchReportComponentData(REPORT_COMPONENTS.budgetTable, currentFilterValueMap),
    self.fetchReportComponentData(REPORT_COMPONENTS.monthlyTrend, currentFilterValueMap),
    self.fetchReportComponentData(REPORT_COMPONENTS.crossAnalysis, currentFilterValueMap),
  ]).then(function(results) {
    // 解析指标卡数据
    function parseIndicator(indicatorData) {
      var dataArray = indicatorData.data || indicatorData.dataList || [];
      if (dataArray.length === 0) return null;
      var row = dataArray[0];
      var keys = Object.keys(row);
      for (var i = 0; i < keys.length; i++) {
        if (typeof row[keys[i]] === 'number') return row[keys[i]];
      }
      return keys.length > 0 ? row[keys[0]] : null;
    }

    // 解析表格数据（维度+度量），支持多度量
    function parseTable(tableData) {
      var dataArray = tableData.data || tableData.dataList || [];
      var metaArray = tableData.meta || [];
      if (dataArray.length === 0) return [];
      var dimensionField = null;
      var measureField = null;
      if (metaArray.length >= 2) {
        dimensionField = metaArray[0].alias;
        measureField = metaArray[1].alias;
      } else if (dataArray.length > 0) {
        var sampleRow = dataArray[0];
        Object.keys(sampleRow).forEach(function(key) {
          if (typeof sampleRow[key] === 'string' && !dimensionField) dimensionField = key;
          else if (typeof sampleRow[key] === 'number' && !measureField) measureField = key;
        });
      }
      if (!dimensionField || !measureField) return [];
      return dataArray.map(function(row) {
        return { name: String(row[dimensionField] || ''), value: Number(row[measureField]) || 0 };
      });
    }

    // 解析多度量表格数据（返回完整行数据）
    function parseMultiMeasureTable(tableData) {
      var dataArray = tableData.data || tableData.dataList || [];
      var metaArray = tableData.meta || [];
      if (dataArray.length === 0) return [];
      return dataArray.map(function(row) {
        var parsed = {};
        metaArray.forEach(function(meta) {
          parsed[meta.alias] = row[meta.alias];
        });
        return parsed;
      });
    }

    var totalCountVal = parseIndicator(results[0]);
    if (totalCountVal !== null) _customState.reportTotalCount = totalCountVal;

    var totalBudgetVal = parseIndicator(results[1]);
    if (totalBudgetVal !== null) _customState.reportTotalBudget = totalBudgetVal;

    var avgProgressVal = parseIndicator(results[2]);
    if (avgProgressVal !== null) _customState.reportAvgProgress = typeof avgProgressVal === 'number' ? avgProgressVal.toFixed(1) : avgProgressVal;

    var statusStats = parseTable(results[3]);
    if (statusStats.length > 0) _customState.reportStatusStats = statusStats;

    var priorityStats = parseTable(results[4]);
    if (priorityStats.length > 0) _customState.reportPriorityStats = priorityStats;

    var budgetByStatus = parseTable(results[5]);
    if (budgetByStatus.length > 0) _customState.reportBudgetByStatus = budgetByStatus;

    // 月度趋势数据（维度：月份，度量：数量+预算）
    var trendRaw = parseMultiMeasureTable(results[6]);
    if (trendRaw.length > 0) {
      var trendMeta = results[6].meta || [];
      _customState.reportMonthlyTrend = trendRaw.map(function(row) {
        var keys = Object.keys(row);
        return {
          month: String(row[keys[0]] || ''),
          count: Number(row[keys[1]]) || 0,
          budget: Number(row[keys[2]]) || 0,
        };
      });
    }

    // 交叉分析数据（维度：状态+优先级，度量：数量+预算）
    var crossRaw = parseMultiMeasureTable(results[7]);
    if (crossRaw.length > 0) {
      var crossMeta = results[7].meta || [];
      _customState.reportCrossAnalysis = crossRaw.map(function(row) {
        var keys = Object.keys(row);
        return {
          status: String(row[keys[0]] || ''),
          priority: String(row[keys[1]] || ''),
          count: Number(row[keys[2]]) || 0,
          budget: Number(row[keys[3]]) || 0,
        };
      });
    }

    return Promise.resolve();
  }).catch(function(err) {
    console.error('[Dashboard] 报表 API 加载失败:', err.message || err);
    self.utils.toast({ title: '报表数据加载失败: ' + (err.message || err), type: 'error' });
    return Promise.resolve();
  });
}

// ============================================================
// 统计计算
// ============================================================

export function computeStats(dataList) {
  var totalBudget = 0;
  var totalProgress = 0;
  var statusCounts = {};
  var priorityCounts = {};
  var completedOnTime = 0;
  var delayedCount = 0;

  dataList.forEach(function(item) {
    var fd = item.formData || {};
    var status = fd[FIELD.status] || '未知';
    var priority = fd[FIELD.priority] || '未知';
    var budget = Number(fd[FIELD.budget]) || 0;
    var progress = Number(fd[FIELD.progress]) || 0;

    statusCounts[status] = (statusCounts[status] || 0) + 1;
    priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
    totalBudget += budget;
    totalProgress += progress;

    if (status === '已完成') completedOnTime++;
    if (status === '已延期') delayedCount++;
  });

  var count = dataList.length;
  var completionRate = count > 0 ? ((completedOnTime / count) * 100).toFixed(1) : '0.0';
  var avgProgress = count > 0 ? (totalProgress / count).toFixed(1) : '0.0';

  return {
    totalCount: count,
    totalBudget: totalBudget,
    avgProgress: avgProgress,
    completionRate: completionRate,
    delayedCount: delayedCount,
    statusCounts: statusCounts,
    priorityCounts: priorityCounts,
  };
}

// ============================================================
// 辅助函数
// ============================================================

export function formatDate(timestamp) {
  if (!timestamp) return '-';
  var date = new Date(Number(timestamp));
  if (isNaN(date.getTime())) return '-';
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

export function getDetailUrl(formInstId) {
  var appType = window.pageConfig && window.pageConfig.appType;
  if (!appType || !formInstId) return '';
  return 'https://www.aliwork.com/' + appType + '/formDetail/' + FORM_UUID + '?formInstId=' + formInstId;
}

export function onTablePageChange(page) {
  _customState.tablePage = page;
  this.forceUpdate();
}

export function onTableSort(field) {
  if (_customState.tableSortField === field) {
    _customState.tableSortOrder = _customState.tableSortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    _customState.tableSortField = field;
    _customState.tableSortOrder = 'desc';
  }
  _customState.tablePage = 1;
  this.forceUpdate();
}

export function getSortedTableData(filteredData) {
  var field = _customState.tableSortField;
  var order = _customState.tableSortOrder;
  var sorted = filteredData.slice();

  sorted.sort(function(a, b) {
    var fdA = a.formData || {};
    var fdB = b.formData || {};
    var valA, valB;

    if (field === 'budget') {
      valA = Number(fdA[FIELD.budget]) || 0;
      valB = Number(fdB[FIELD.budget]) || 0;
    } else if (field === 'progress') {
      valA = Number(fdA[FIELD.progress]) || 0;
      valB = Number(fdB[FIELD.progress]) || 0;
    } else if (field === 'startDate') {
      valA = Number(fdA[FIELD.startDate]) || 0;
      valB = Number(fdB[FIELD.startDate]) || 0;
    } else if (field === 'name') {
      valA = (fdA[FIELD.name] || '').toLowerCase();
      valB = (fdB[FIELD.name] || '').toLowerCase();
      return order === 'asc' ? (valA < valB ? -1 : valA > valB ? 1 : 0) : (valA > valB ? -1 : valA < valB ? 1 : 0);
    } else {
      valA = 0; valB = 0;
    }

    return order === 'asc' ? valA - valB : valB - valA;
  });

  return sorted;
}

// ============================================================
// 图表渲染
// ============================================================

export function renderAllCharts() {
  this.renderStatusPie();
  this.renderPriorityBar();
  this.renderBudgetLine();
  this.renderProgressGauge();
  this.renderBudgetRadar();
  this.renderStatusPriorityHeat();
}

export function bindChartResize() {
  var chartIds = ['statusPie', 'priorityBar', 'budgetLine', 'progressGauge', 'budgetRadar', 'statusPriorityHeat'];
  this._resizeHandler = function() {
    chartIds.forEach(function(chartId) {
      var container = document.getElementById('chart-' + chartId);
      if (container) {
        var instance = window.echarts.getInstanceByDom(container);
        if (instance) instance.resize();
      }
    });
  };
  window.addEventListener('resize', this._resizeHandler);
}

// 共用 tooltip 样式
function tooltipTheme() {
  return {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderColor: 'transparent',
    borderWidth: 0,
    textStyle: { color: '#f1f5f9', fontSize: 13, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
    extraCssText: 'border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.28);',
  };
}

export function renderStatusPie() {
  var container = document.getElementById('chart-statusPie');
  if (!container) return;
  var chart = window.echarts.getInstanceByDom(container) || window.echarts.init(container);

  // 统一使用报表聚合数据（筛选条件已通过 filterValueMap 传递给报表 API）
  var pieData = _customState.reportStatusStats.map(function(item) {
    return {
      name: item.name,
      value: item.value,
      itemStyle: { color: STATUS_COLORS[item.name] || PALETTE.neutral },
    };
  }).filter(function(d) { return d.value > 0; });

  chart.setOption({
    tooltip: Object.assign({}, tooltipTheme(), {
      trigger: 'item',
      formatter: function(p) { return '<b>' + p.name + '</b><br/>数量: ' + p.value + ' 个 (' + p.percent + '%)'; },
    }),
    legend: {
      orient: 'vertical',
      right: '4%',
      top: 'center',
      textStyle: { color: PALETTE.textSecondary, fontSize: 12 },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14,
      icon: 'circle',
    },
    series: [{
      type: 'pie',
      radius: ['48%', '74%'],
      center: ['38%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 13, fontWeight: 600, color: PALETTE.textPrimary },
        itemStyle: { shadowBlur: 16, shadowColor: 'rgba(0,0,0,0.12)' },
      },
      data: pieData,
    }],
  }, true);
}

export function renderPriorityBar() {
  var container = document.getElementById('chart-priorityBar');
  if (!container) return;
  var chart = window.echarts.getInstanceByDom(container) || window.echarts.init(container);

  var categories = [];
  var values = [];
  var colors = [];

  // 统一使用报表聚合数据（筛选条件已通过 filterValueMap 传递给报表 API）
  PRIORITY_LIST.forEach(function(key) {
    categories.push(key);
    var found = _customState.reportPriorityStats.filter(function(item) { return item.name === key; });
    values.push(found.length > 0 ? found[0].value : 0);
    colors.push(PRIORITY_COLORS[key]);
  });

  chart.setOption({
    tooltip: Object.assign({}, tooltipTheme(), {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,0,0,0.03)' } },
    }),
    grid: { left: '14%', right: '6%', top: '12%', bottom: '14%' },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: PALETTE.textSecondary, fontSize: 12, fontWeight: 500 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: PALETTE.textMuted, fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9', type: [4, 4] } },
    },
    series: [{
      type: 'bar',
      data: values.map(function(val, idx) {
        return {
          value: val,
          itemStyle: {
            color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors[idx] },
              { offset: 1, color: colors[idx] + '40' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        };
      }),
      barWidth: '40%',
      label: {
        show: true,
        position: 'top',
        formatter: function(p) { return p.value > 0 ? p.value : ''; },
        color: PALETTE.textSecondary,
        fontSize: 13,
        fontWeight: 600,
      },
    }],
  }, true);
}

export function renderBudgetLine() {
  var container = document.getElementById('chart-budgetLine');
  if (!container) return;
  var chart = window.echarts.getInstanceByDom(container) || window.echarts.init(container);
  var metric = _customState.trendMetric;

  var primaryLabel = metric === 'count' ? '项目数量' : '预算总额(万)';
  var primaryColor = metric === 'count' ? PALETTE.primary : PALETTE.warning;

  // 统一使用报表聚合数据（筛选条件已通过 filterValueMap 传递给报表 API）
  var trendData = _customState.reportMonthlyTrend || [];
  var months = trendData.map(function(item) { return item.month; });
  var primaryData = trendData.map(function(item) { return metric === 'count' ? item.count : item.budget; });

  chart.setOption({
    tooltip: Object.assign({}, tooltipTheme(), { trigger: 'axis' }),
    grid: { left: '10%', right: '6%', top: '14%', bottom: '12%' },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: { color: PALETTE.textMuted, fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      name: primaryLabel,
      nameTextStyle: { color: PALETTE.textMuted, fontSize: 11, padding: [0, 0, 0, -20] },
      axisLabel: { color: PALETTE.textMuted, fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9', type: [4, 4] } },
    },
    series: [{
      name: primaryLabel,
      type: 'line',
      data: primaryData,
      smooth: 0.4,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 2.5, color: primaryColor },
      itemStyle: { color: primaryColor, borderWidth: 2, borderColor: '#fff' },
      areaStyle: {
        color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: primaryColor + '25' },
          { offset: 1, color: primaryColor + '02' },
        ]),
      },
    }],
  }, true);
}

export function renderProgressGauge() {
  var container = document.getElementById('chart-progressGauge');
  if (!container) return;
  var chart = window.echarts.getInstanceByDom(container) || window.echarts.init(container);

  // 统一使用报表聚合数据（筛选条件已通过 filterValueMap 传递给报表 API）
  var avgProgress = Number(_customState.reportAvgProgress) || 0;
  var percentage = Math.round((avgProgress / 5) * 100);

  chart.setOption({
    series: [{
      type: 'gauge',
      startAngle: 220,
      endAngle: -40,
      min: 0,
      max: 100,
      splitNumber: 5,
      radius: '88%',
      center: ['50%', '55%'],
      axisLine: {
        lineStyle: {
          width: 14,
          color: [
            [0.3, '#ef4444'],
            [0.6, '#f59e0b'],
            [0.8, '#3b82f6'],
            [1, '#059669'],
          ],
        },
      },
      pointer: { itemStyle: { color: PALETTE.textPrimary }, width: 4, length: '60%' },
      axisTick: { distance: -14, length: 4, lineStyle: { color: '#fff', width: 1 } },
      splitLine: { distance: -14, length: 14, lineStyle: { color: '#fff', width: 2 } },
      axisLabel: { color: PALETTE.textMuted, fontSize: 10, distance: 20 },
      detail: {
        valueAnimation: true,
        formatter: percentage + '%',
        color: PALETTE.textPrimary,
        fontSize: 22,
        fontWeight: 700,
        offsetCenter: [0, '72%'],
      },
      data: [{ value: percentage }],
    }],
  }, true);
}

export function renderBudgetRadar() {
  var container = document.getElementById('chart-budgetRadar');
  if (!container) return;
  var chart = window.echarts.getInstanceByDom(container) || window.echarts.init(container);

  // 统一使用报表聚合数据（筛选条件已通过 filterValueMap 传递给报表 API）
  var statusBudget = {};
  _customState.reportBudgetByStatus.forEach(function(item) {
    statusBudget[item.name] = item.value;
  });

  var maxBudget = Math.max.apply(null, STATUS_LIST.map(function(k) { return statusBudget[k] || 0; }).concat([100]));
  var indicators = STATUS_LIST.map(function(s) {
    return { name: s, max: Math.ceil(maxBudget * 1.2) };
  });
  var budgetValues = STATUS_LIST.map(function(s) { return statusBudget[s] || 0; });

  chart.setOption({
    tooltip: tooltipTheme(),
    radar: {
      indicator: indicators,
      shape: 'polygon',
      splitNumber: 4,
      radius: '68%',
      axisName: { color: PALETTE.textSecondary, fontSize: 11 },
      splitLine: { lineStyle: { color: PALETTE.border } },
      splitArea: { areaStyle: { color: ['rgba(30,64,175,0.02)', 'rgba(30,64,175,0.05)'] } },
      axisLine: { lineStyle: { color: PALETTE.border } },
    },
    series: [{
      type: 'radar',
      data: [{
        value: budgetValues,
        name: '预算(万)',
        lineStyle: { color: PALETTE.primary, width: 2 },
        itemStyle: { color: PALETTE.primary },
        areaStyle: { color: PALETTE.primary + '18' },
        symbol: 'circle',
        symbolSize: 5,
      }],
    }],
  }, true);
}

export function renderStatusPriorityHeat() {
  var container = document.getElementById('chart-statusPriorityHeat');
  if (!container) return;
  var chart = window.echarts.getInstanceByDom(container) || window.echarts.init(container);
  var dimension = _customState.heatDimension;

  var heatData = [];
  var maxVal = 0;

  // 统一使用报表聚合数据（筛选条件已通过 filterValueMap 传递给报表 API）
  var crossData = _customState.reportCrossAnalysis || [];
  var crossMap = {};
  crossData.forEach(function(item) {
    var key = item.status + '|' + item.priority;
    crossMap[key] = { count: item.count, budget: item.budget };
  });
  STATUS_LIST.forEach(function(status, sIdx) {
    PRIORITY_LIST.forEach(function(priority, pIdx) {
      var entry = crossMap[status + '|' + priority] || { count: 0, budget: 0 };
      var val = dimension === 'count' ? entry.count : entry.budget;
      heatData.push([pIdx, sIdx, val]);
      if (val > maxVal) maxVal = val;
    });
  });

  var unitLabel = dimension === 'count' ? '个' : '万';

  chart.setOption({
    tooltip: Object.assign({}, tooltipTheme(), {
      position: 'top',
      formatter: function(params) {
        return '<b>' + PRIORITY_LIST[params.data[0]] + ' · ' + STATUS_LIST[params.data[1]] + '</b><br/>' + params.data[2] + ' ' + unitLabel;
      },
    }),
    grid: { left: '18%', right: '10%', top: '6%', bottom: '22%' },
    xAxis: {
      type: 'category',
      data: PRIORITY_LIST,
      axisLabel: { color: PALETTE.textSecondary, fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitArea: { show: false },
    },
    yAxis: {
      type: 'category',
      data: STATUS_LIST,
      axisLabel: { color: PALETTE.textSecondary, fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitArea: { show: false },
    },
    visualMap: {
      min: 0,
      max: Math.max(maxVal, 1),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      itemWidth: 14,
      itemHeight: 120,
      inRange: { color: ['#eff6ff', '#bfdbfe', '#60a5fa', '#2563eb', '#1e3a8a'] },
      textStyle: { color: PALETTE.textMuted, fontSize: 10 },
    },
    series: [{
      type: 'heatmap',
      data: heatData,
      label: {
        show: true,
        formatter: function(p) { return p.data[2] > 0 ? p.data[2] : ''; },
        color: PALETTE.textSecondary,
        fontSize: 13,
        fontWeight: 600,
      },
      emphasis: { itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,0.15)' } },
      itemStyle: { borderColor: '#fff', borderWidth: 3, borderRadius: 4 },
    }],
  }, true);
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var timestamp = this.state.timestamp;
  var isMobile = this.utils.isMobile();
  var loading = _customState.loading;
  var self = this;

  // ── 样式定义 ──
  var s = {
    page: {
      padding: 0, margin: 0, minHeight: '100vh',
      background: '#f1f5f9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: PALETTE.textPrimary,
      WebkitFontSmoothing: 'antialiased',
    },
    topBar: {
      background: '#fff',
      borderBottom: '1px solid ' + PALETTE.border,
      padding: isMobile ? '16px' : '20px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
    },
    titleGroup: { display: 'flex', flexDirection: 'column', gap: 2 },
    title: {
      fontSize: isMobile ? 18 : 22,
      fontWeight: 700,
      color: PALETTE.textPrimary,
      letterSpacing: '-0.02em',
      margin: 0,
    },
    subtitle: { fontSize: 13, color: PALETTE.textMuted, margin: 0 },
    filterBar: {
      background: '#fff',
      borderBottom: '1px solid ' + PALETTE.border,
      padding: isMobile ? '12px 16px' : '12px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? 8 : 16,
      flexWrap: 'wrap',
    },
    filterLabel: {
      fontSize: 12,
      fontWeight: 600,
      color: PALETTE.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginRight: 4,
      whiteSpace: 'nowrap',
    },
    filterSelect: {
      appearance: 'none',
      WebkitAppearance: 'none',
      border: '1px solid ' + PALETTE.border,
      borderRadius: 6,
      padding: '6px 28px 6px 10px',
      fontSize: 13,
      color: PALETTE.textSecondary,
      background: '#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M3 5l3 3 3-3\' stroke=\'%2394a3b8\' stroke-width=\'1.5\' fill=\'none\'/%3E%3C/svg%3E") no-repeat right 8px center',
      cursor: 'pointer',
      outline: 'none',
      minWidth: 80,
    },
    filterDivider: {
      width: 1,
      height: 24,
      background: PALETTE.border,
      margin: '0 4px',
    },
    content: {
      padding: isMobile ? '16px 12px' : '24px 32px',
      maxWidth: 1440,
      margin: '0 auto',
    },
    kpiRow: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
      gap: isMobile ? 10 : 14,
      marginBottom: isMobile ? 16 : 22,
    },
    kpiCard: {
      background: '#fff',
      borderRadius: 10,
      padding: isMobile ? '14px 12px' : '18px 20px',
      border: '1px solid ' + PALETTE.border,
    },
    kpiValue: {
      fontSize: isMobile ? 22 : 26,
      fontWeight: 700,
      color: PALETTE.textPrimary,
      lineHeight: 1.1,
      fontFeatureSettings: '"tnum"',
    },
    kpiLabel: {
      fontSize: 12,
      color: PALETTE.textMuted,
      marginTop: 4,
      fontWeight: 500,
    },
    kpiAccent: {
      width: 4,
      height: 28,
      borderRadius: 2,
      marginBottom: 10,
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isMobile ? 12 : 18,
      marginBottom: isMobile ? 12 : 18,
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '260px 1fr 1fr',
      gap: isMobile ? 12 : 18,
      marginBottom: isMobile ? 12 : 18,
    },
    card: {
      background: '#fff',
      borderRadius: 10,
      padding: isMobile ? '16px 14px' : '20px 22px',
      border: '1px solid ' + PALETTE.border,
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: PALETTE.textPrimary,
      margin: 0,
    },
    localFilter: {
      appearance: 'none',
      WebkitAppearance: 'none',
      border: '1px solid ' + PALETTE.border,
      borderRadius: 5,
      padding: '4px 24px 4px 8px',
      fontSize: 12,
      color: PALETTE.textMuted,
      background: '#f8fafc url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 10 10\'%3E%3Cpath d=\'M2.5 4l2.5 2.5 2.5-2.5\' stroke=\'%2394a3b8\' stroke-width=\'1.2\' fill=\'none\'/%3E%3C/svg%3E") no-repeat right 6px center',
      cursor: 'pointer',
      outline: 'none',
    },
    chartBox: { width: '100%', height: isMobile ? 260 : 300 },
    chartBoxSmall: { width: '100%', height: isMobile ? 200 : 240 },
    loadingWrap: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '70vh', gap: 16,
    },
    dot: {
      width: 8, height: 8, borderRadius: '50%', background: PALETTE.primary,
      animation: 'pulse 1.2s ease-in-out infinite',
    },
    footer: {
      textAlign: 'center', padding: '24px 0 16px', fontSize: 11,
      color: PALETTE.textMuted, letterSpacing: '0.02em',
    },
  };

  var cssAnimation = '@keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }';

  if (loading) {
    return (
      <div style={s.page}>
        <div style={{ display: 'none' }}>{timestamp}</div>
        <style dangerouslySetInnerHTML={{ __html: cssAnimation }} />
        <div style={s.loadingWrap}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={Object.assign({}, s.dot, { animationDelay: '0s' })}></div>
            <div style={Object.assign({}, s.dot, { animationDelay: '0.2s' })}></div>
            <div style={Object.assign({}, s.dot, { animationDelay: '0.4s' })}></div>
          </div>
          <div style={{ fontSize: 14, color: PALETTE.textMuted, fontWeight: 500 }}>加载中</div>
        </div>
      </div>
    );
  }

  var filteredData = this.getFilteredData();
  var isFiltered = _customState.filterName !== '全部' || _customState.filterStatus !== '全部' || _customState.filterPriority !== '全部' || _customState.filterBudgetRange !== '全部';

  // KPI 数据：统一使用报表聚合数据（筛选条件已通过 filterValueMap 传递给报表 API）
  var kpiTotalCount = _customState.reportTotalCount;
  var kpiTotalBudget = _customState.reportTotalBudget;
  var kpiAvgProgress = _customState.reportAvgProgress;

  // 完成率和延期数从报表状态统计中计算
  var reportTotal = 0;
  var reportCompleted = 0;
  var reportDelayed = 0;
  _customState.reportStatusStats.forEach(function(item) {
    reportTotal += item.value;
    if (item.name === '已完成') reportCompleted = item.value;
    if (item.name === '已延期') reportDelayed = item.value;
  });
  var kpiCompletionRate = reportTotal > 0 ? ((reportCompleted / reportTotal) * 100).toFixed(1) : '0.0';
  var kpiDelayedCount = reportDelayed;

  return (
    <div style={s.page}>
      <div style={{ display: 'none' }}>{timestamp}</div>
      <style dangerouslySetInnerHTML={{ __html: cssAnimation }} />

      {/* 顶部栏 */}
      <div style={s.topBar}>
        <div style={s.titleGroup}>
          <div style={s.title}>项目管理看板</div>
          <div style={s.subtitle}>
            {isFiltered ? '筛选结果 ' + kpiTotalCount + ' 个项目' : '共 ' + kpiTotalCount + ' 个项目'}
            {' · '}
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* 全局筛选栏 */}
      <div style={s.filterBar}>
        <span style={s.filterLabel}>筛选</span>

        {/* 项目名称 - 可搜索下拉 */}
        <div style={{ position: 'relative', minWidth: isMobile ? '100%' : 160 }}>
          <div
            style={Object.assign({}, s.filterSelect, {
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 4,
              background: _customState.filterName !== '全部' ? PALETTE.primary + '08' : '#fff',
              borderColor: _customState.filterName !== '全部' ? PALETTE.primary : PALETTE.border,
            })}
            onClick={function() { self.onNameDropdownToggle(); }}
          >
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              color: _customState.filterName !== '全部' ? PALETTE.primary : PALETTE.textSecondary,
            }}>
              {_customState.filterName === '全部' ? '项目名称: 全部' : _customState.filterName}
            </span>
            <span style={{ fontSize: 10, color: PALETTE.textMuted, flexShrink: 0 }}>
              {_customState.nameDropdownOpen ? '▲' : '▼'}
            </span>
          </div>
          {_customState.nameDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              background: '#fff',
              border: '1px solid ' + PALETTE.border,
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              zIndex: 1000,
              minWidth: 200,
              maxHeight: 320,
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{ padding: '8px 8px 4px' }}>
                <input
                  type="text"
                  placeholder="输入关键词搜索..."
                  defaultValue={_customState.nameSearchKeyword}
                  onChange={function(e) {
                    var value = e.target.value;
                    if (self._nameSearchTimer) clearTimeout(self._nameSearchTimer);
                    self._nameSearchTimer = setTimeout(function() {
                      self.searchNameByKeyword(value);
                    }, 300);
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid ' + PALETTE.border,
                    fontSize: 13,
                    color: PALETTE.textPrimary,
                    background: '#f8fafc',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div id="name-options-list" style={{
                overflowY: 'auto',
                maxHeight: 260,
                padding: '4px 0',
              }}>
                <div
                  style={{
                    padding: '8px 12px',
                    fontSize: 13,
                    cursor: 'pointer',
                    color: _customState.filterName === '全部' ? PALETTE.primary : PALETTE.textSecondary,
                    fontWeight: _customState.filterName === '全部' ? 600 : 400,
                    background: _customState.filterName === '全部' ? PALETTE.primary + '08' : 'transparent',
                  }}
                  onClick={function() { self.onNameSelect('全部'); }}
                >
                  全部
                </div>
                {_customState.nameOptions.length === 0 && (
                  <div style={{ padding: '8px 12px', fontSize: 12, color: PALETTE.textMuted, textAlign: 'center' }}>
                    暂无匹配项
                  </div>
                )}
                {_customState.nameOptions.map(function(name) {
                  var isActive = _customState.filterName === name;
                  return (
                    <div
                      key={name}
                      style={{
                        padding: '8px 12px',
                        fontSize: 13,
                        cursor: 'pointer',
                        color: isActive ? PALETTE.primary : PALETTE.textSecondary,
                        fontWeight: isActive ? 600 : 400,
                        background: isActive ? PALETTE.primary + '08' : 'transparent',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={function() { self.onNameSelect(name); }}
                    >
                      {name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <select
          style={s.filterSelect}
          value={_customState.filterStatus}
          onChange={function(e) { self.onFilterChange('filterStatus', e.target.value); }}
        >
          <option value="全部">状态: 全部</option>
          {STATUS_LIST.map(function(st) {
            return <option key={st} value={st}>{st}</option>;
          })}
        </select>

        <select
          style={s.filterSelect}
          value={_customState.filterPriority}
          onChange={function(e) { self.onFilterChange('filterPriority', e.target.value); }}
        >
          <option value="全部">优先级: 全部</option>
          {PRIORITY_LIST.map(function(pr) {
            return <option key={pr} value={pr}>{pr}</option>;
          })}
        </select>

        <select
          style={s.filterSelect}
          value={_customState.filterBudgetRange}
          onChange={function(e) { self.onFilterChange('filterBudgetRange', e.target.value); }}
        >
          <option value="全部">预算: 全部</option>
          <option value="100以下">100万以下</option>
          <option value="100-200">100-200万</option>
          <option value="200-500">200-500万</option>
          <option value="500以上">500万以上</option>
        </select>

        {isFiltered && (
          <span
            style={{ fontSize: 12, color: PALETTE.primaryLight, cursor: 'pointer', fontWeight: 500, marginLeft: 4 }}
            onClick={function() {
              _customState.filterName = '全部';
              _customState.filterStatus = '全部';
              _customState.filterPriority = '全部';
              _customState.filterBudgetRange = '全部';
              _customState.nameSearchKeyword = '';
              self.loadAggregateData();
              self.forceUpdate();
              setTimeout(function() { self.renderAllCharts(); }, 50);
            }}
          >
            清除筛选
          </span>
        )}
      </div>

      <div style={s.content}>
        {/* KPI 卡片（数据来自报表 API） */}
        <div style={s.kpiRow}>
          <div style={s.kpiCard}>
            <div style={Object.assign({}, s.kpiAccent, { background: PALETTE.primary })}></div>
            <div style={s.kpiValue}>{kpiTotalCount}</div>
            <div style={s.kpiLabel}>项目总数</div>
          </div>
          <div style={s.kpiCard}>
            <div style={Object.assign({}, s.kpiAccent, { background: PALETTE.accent })}></div>
            <div style={s.kpiValue}>{(function() {
              var found = _customState.reportStatusStats.filter(function(item) { return item.name === '进行中'; });
              return found.length > 0 ? found[0].value : 0;
            })()}</div>
            <div style={s.kpiLabel}>进行中</div>
          </div>
          <div style={s.kpiCard}>
            <div style={Object.assign({}, s.kpiAccent, { background: PALETTE.success })}></div>
            <div style={s.kpiValue}>{kpiCompletionRate}<span style={{ fontSize: 13, fontWeight: 400, color: PALETTE.textMuted }}>%</span></div>
            <div style={s.kpiLabel}>完成率</div>
          </div>
          <div style={s.kpiCard}>
            <div style={Object.assign({}, s.kpiAccent, { background: PALETTE.warning })}></div>
            <div style={s.kpiValue}>{kpiTotalBudget}<span style={{ fontSize: 13, fontWeight: 400, color: PALETTE.textMuted }}>万</span></div>
            <div style={s.kpiLabel}>总预算</div>
          </div>
          <div style={s.kpiCard}>
            <div style={Object.assign({}, s.kpiAccent, { background: PALETTE.danger })}></div>
            <div style={s.kpiValue}>{kpiDelayedCount}</div>
            <div style={s.kpiLabel}>已延期</div>
          </div>
        </div>

        {/* 第一行：饼图 + 柱状图 */}
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

        {/* 第二行：趋势图（带局部筛选） */}
        <div style={{ marginBottom: isMobile ? 12 : 18 }}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitle}>月度趋势</div>
              <select
                style={s.localFilter}
                value={_customState.trendMetric}
                onChange={function(e) { self.onLocalFilterChange('trendMetric', e.target.value); }}
              >
                <option value="count">按数量</option>
                <option value="budget">按预算</option>
              </select>
            </div>
            <div id="chart-budgetLine" style={s.chartBox}></div>
          </div>
        </div>

        {/* 第三行：仪表盘 + 雷达 + 热力图 */}
        <div style={s.grid3}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitle}>平均进度</div>
            </div>
            <div id="chart-progressGauge" style={s.chartBoxSmall}></div>
            <div style={{ textAlign: 'center', color: PALETTE.textMuted, fontSize: 12, marginTop: -8 }}>
              {kpiAvgProgress} / 5
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitle}>各状态预算</div>
            </div>
            <div id="chart-budgetRadar" style={s.chartBoxSmall}></div>
          </div>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitle}>交叉分析</div>
              <select
                style={s.localFilter}
                value={_customState.heatDimension}
                onChange={function(e) { self.onLocalFilterChange('heatDimension', e.target.value); }}
              >
                <option value="count">按数量</option>
                <option value="budget">按预算</option>
              </select>
            </div>
            <div id="chart-statusPriorityHeat" style={s.chartBoxSmall}></div>
          </div>
        </div>

        {/* 数据明细表格 */}
        {(function() {
          var sortedData = self.getSortedTableData(filteredData);
          var pageSize = _customState.tablePageSize;
          var currentPage = _customState.tablePage;
          var totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
          if (currentPage > totalPages) currentPage = totalPages;
          var startIdx = (currentPage - 1) * pageSize;
          var pageData = sortedData.slice(startIdx, startIdx + pageSize);

          var sortField = _customState.tableSortField;
          var sortOrder = _customState.tableSortOrder;
          var sortIcon = function(field) {
            if (sortField !== field) return ' ↕';
            return sortOrder === 'asc' ? ' ↑' : ' ↓';
          };

          var ts = {
            wrap: { marginBottom: isMobile ? 12 : 18 },
            table: {
              width: '100%', borderCollapse: 'separate', borderSpacing: 0,
              fontSize: 13, lineHeight: 1.5,
            },
            th: {
              padding: '10px 12px', textAlign: 'left', fontWeight: 600,
              color: PALETTE.textSecondary, fontSize: 12,
              borderBottom: '2px solid ' + PALETTE.border,
              background: '#f8fafc', whiteSpace: 'nowrap', cursor: 'pointer',
              userSelect: 'none',
            },
            thFirst: { borderRadius: '8px 0 0 0' },
            thLast: { borderRadius: '0 8px 0 0' },
            td: {
              padding: '10px 12px', borderBottom: '1px solid ' + PALETTE.border,
              color: PALETTE.textSecondary, fontSize: 13,
            },
            nameLink: {
              color: PALETTE.primary, fontWeight: 500, textDecoration: 'none',
              cursor: 'pointer',
            },
            statusBadge: {
              display: 'inline-block', padding: '2px 8px', borderRadius: 4,
              fontSize: 11, fontWeight: 600, lineHeight: '18px',
            },
            priorityBadge: {
              display: 'inline-block', padding: '2px 8px', borderRadius: 4,
              fontSize: 11, fontWeight: 500, lineHeight: '18px',
            },
            detailLink: {
              color: PALETTE.primaryLight, fontSize: 12, textDecoration: 'none',
              cursor: 'pointer', fontWeight: 500,
            },
            pager: {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', flexWrap: 'wrap', gap: 8,
            },
            pagerInfo: { fontSize: 12, color: PALETTE.textMuted },
            pagerBtns: { display: 'flex', gap: 4 },
            pagerBtn: {
              padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 500,
              border: '1px solid ' + PALETTE.border, background: '#fff',
              color: PALETTE.textSecondary, cursor: 'pointer', outline: 'none',
            },
            pagerBtnActive: {
              padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600,
              border: '1px solid ' + PALETTE.primary, background: PALETTE.primary,
              color: '#fff', cursor: 'default', outline: 'none',
            },
            pagerBtnDisabled: {
              padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 500,
              border: '1px solid ' + PALETTE.border, background: '#f8fafc',
              color: PALETTE.textMuted, cursor: 'not-allowed', outline: 'none',
            },
            progressBar: {
              width: 60, height: 6, borderRadius: 3, background: '#f1f5f9',
              display: 'inline-block', verticalAlign: 'middle', marginRight: 6,
            },
          };

          var statusBadgeStyle = function(status) {
            var color = STATUS_COLORS[status] || PALETTE.neutral;
            return Object.assign({}, ts.statusBadge, { color: color, background: color + '14', border: '1px solid ' + color + '30' });
          };

          var priorityBadgeStyle = function(priority) {
            var color = PRIORITY_COLORS[priority] || PALETTE.neutral;
            return Object.assign({}, ts.priorityBadge, { color: color, background: color + '10' });
          };

          // 生成分页按钮
          var pageButtons = [];
          var maxVisible = isMobile ? 3 : 5;
          var startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
          var endPage = Math.min(totalPages, startPage + maxVisible - 1);
          if (endPage - startPage + 1 < maxVisible) startPage = Math.max(1, endPage - maxVisible + 1);

          for (var p = startPage; p <= endPage; p++) {
            (function(pageNum) {
              pageButtons.push(
                <button
                  key={pageNum}
                  style={pageNum === currentPage ? ts.pagerBtnActive : ts.pagerBtn}
                  onClick={pageNum === currentPage ? undefined : function() { self.onTablePageChange(pageNum); }}
                >{pageNum}</button>
              );
            })(p);
          }

          return (
            <div style={ts.wrap}>
              <div style={s.card}>
                <div style={s.cardHeader}>
                  <div style={s.cardTitle}>数据明细</div>
                  <span style={{ fontSize: 12, color: PALETTE.textMuted }}>
                    共 {sortedData.length} 条
                  </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={ts.table}>
                    <thead>
                      <tr>
                        <th style={Object.assign({}, ts.th, ts.thFirst, { width: 44 })}>#</th>
                        <th style={Object.assign({}, ts.th, { minWidth: 140 })} onClick={function() { self.onTableSort('name'); }}>
                          项目名称{sortIcon('name')}
                        </th>
                        <th style={ts.th}>状态</th>
                        <th style={ts.th}>优先级</th>
                        <th style={ts.th} onClick={function() { self.onTableSort('budget'); }}>
                          预算(万){sortIcon('budget')}
                        </th>
                        <th style={ts.th} onClick={function() { self.onTableSort('progress'); }}>
                          进度{sortIcon('progress')}
                        </th>
                        <th style={ts.th} onClick={function() { self.onTableSort('startDate'); }}>
                          开始日期{sortIcon('startDate')}
                        </th>
                        <th style={ts.th}>结束日期</th>
                        <th style={Object.assign({}, ts.th, ts.thLast, { width: 60, textAlign: 'center' })}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.length === 0 && (
                        <tr>
                          <td colSpan="9" style={Object.assign({}, ts.td, { textAlign: 'center', padding: '32px 12px', color: PALETTE.textMuted })}>
                            暂无数据
                          </td>
                        </tr>
                      )}
                      {pageData.map(function(item, idx) {
                        var fd = item.formData || {};
                        var rowNum = startIdx + idx + 1;
                        var progressVal = Number(fd[FIELD.progress]) || 0;
                        var progressPct = Math.round(progressVal / 5 * 100);
                        var progressColor = progressPct >= 80 ? PALETTE.success : progressPct >= 40 ? PALETTE.warning : PALETTE.danger;
                        var detailUrl = self.getDetailUrl(item.formInstId);

                        return (
                          <tr key={item.formInstId || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                            <td style={Object.assign({}, ts.td, { color: PALETTE.textMuted, fontSize: 12 })}>{rowNum}</td>
                            <td style={ts.td}>
                              {detailUrl ? (
                                <a href={detailUrl} target="_blank" rel="noopener noreferrer" style={ts.nameLink}>
                                  {fd[FIELD.name] || '-'}
                                </a>
                              ) : (
                                <span style={{ fontWeight: 500 }}>{fd[FIELD.name] || '-'}</span>
                              )}
                            </td>
                            <td style={ts.td}>
                              <span style={statusBadgeStyle(fd[FIELD.status])}>{fd[FIELD.status] || '-'}</span>
                            </td>
                            <td style={ts.td}>
                              <span style={priorityBadgeStyle(fd[FIELD.priority])}>{fd[FIELD.priority] || '-'}</span>
                            </td>
                            <td style={Object.assign({}, ts.td, { fontFeatureSettings: '"tnum"' })}>
                              {fd[FIELD.budget] || '0'}
                            </td>
                            <td style={ts.td}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={ts.progressBar}>
                                  <div style={{ width: progressPct + '%', height: '100%', borderRadius: 3, background: progressColor, transition: 'width 0.3s' }}></div>
                                </div>
                                <span style={{ fontSize: 12, color: PALETTE.textSecondary, fontFeatureSettings: '"tnum"' }}>{progressPct}%</span>
                              </div>
                            </td>
                            <td style={Object.assign({}, ts.td, { fontSize: 12, fontFeatureSettings: '"tnum"' })}>
                              {self.formatDate(fd[FIELD.startDate])}
                            </td>
                            <td style={Object.assign({}, ts.td, { fontSize: 12, fontFeatureSettings: '"tnum"' })}>
                              {self.formatDate(fd[FIELD.endDate])}
                            </td>
                            <td style={Object.assign({}, ts.td, { textAlign: 'center' })}>
                              {detailUrl ? (
                                <a href={detailUrl} target="_blank" rel="noopener noreferrer" style={ts.detailLink}>详情</a>
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
                {totalPages > 1 && (
                  <div style={ts.pager}>
                    <div style={ts.pagerInfo}>
                      第 {startIdx + 1}-{Math.min(startIdx + pageSize, sortedData.length)} 条，共 {sortedData.length} 条
                    </div>
                    <div style={ts.pagerBtns}>
                      <button
                        style={currentPage <= 1 ? ts.pagerBtnDisabled : ts.pagerBtn}
                        onClick={currentPage <= 1 ? undefined : function() { self.onTablePageChange(currentPage - 1); }}
                        disabled={currentPage <= 1}
                      >上一页</button>
                      {startPage > 1 && <span style={{ padding: '4px 2px', color: PALETTE.textMuted }}>...</span>}
                      {pageButtons}
                      {endPage < totalPages && <span style={{ padding: '4px 2px', color: PALETTE.textMuted }}>...</span>}
                      <button
                        style={currentPage >= totalPages ? ts.pagerBtnDisabled : ts.pagerBtn}
                        onClick={currentPage >= totalPages ? undefined : function() { self.onTablePageChange(currentPage + 1); }}
                        disabled={currentPage >= totalPages}
                      >下一页</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        <div style={s.footer}>
          Project Management Dashboard · Powered by OpenYida
        </div>
      </div>
    </div>
  );
}
