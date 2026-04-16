// ============================================================
// 常量定义
// ============================================================

var APP_TYPE = 'APP_KNILKT41DC5XXR5D4QEC';
var REPORT_FORM_UUID = 'REPORT-QA666SC1J3U3TFO9GM9MJ5400RIW3W83SUYMM5';
var ECHARTS_PAGE_ID = 'FORM-85FF0A1B49034703AC541DAA2DCC7910FFRB';
var CUBE_TENANT_ID = 'ding9a0954b4f9d9d40ef5bf40eda33b7ba0';
var CUBE_CODE = 'FORM_C390F55E49DA4B1BB7EE5F7DE687A2054OG1';

var BASE_URL = window.location.origin;

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

// ============================================================
// 状态管理
// ============================================================

var _customState = {
  loading: true,
  echartsLoaded: false,
  totalTasks: 0,
  completedTasks: 0,
  inProgressTasks: 0,
  pendingTasks: 0,
  statusFilter: '全部',
  priorityFilter: '全部',
  tableData: [],
  tableCurrentPage: 1,
  tablePageSize: 10,
  tableTotalCount: 0,
  tableSortField: '',
  tableSortOrder: 'asc',
  chartIds: [],
};

export function getCustomState(key) {
  if (key) {
    return _customState[key];
  }
  return { ..._customState };
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
// 辅助函数
// ============================================================

export function getStatusColor(status) {
  var colorMap = {
    '已完成': PALETTE.success,
    '进行中': PALETTE.primary,
    '待处理': PALETTE.warning,
    '已取消': PALETTE.neutral,
  };
  return colorMap[status] || PALETTE.neutral;
}

export function getPriorityColor(priority) {
  var colorMap = {
    '高': PALETTE.danger,
    '中': PALETTE.warning,
    '低': PALETTE.success,
  };
  return colorMap[priority] || PALETTE.neutral;
}

export function formatDate(timestamp) {
  if (!timestamp) return '-';
  var date = new Date(Number(timestamp));
  if (isNaN(date.getTime())) return '-';
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

// 数据源表单 UUID（从 cubeCode 转换：下划线变横线）
var DATA_FORM_UUID = 'FORM-C390F55E49DA4B1BB7EE5F7DE687A2054OG1';

export function getDetailUrl(formInstId) {
  if (!formInstId) return '';
  return BASE_URL + '/' + APP_TYPE + '/formDetail/' + DATA_FORM_UUID + '?formInstId=' + formInstId;
}
// 表单字段 ID 映射
var FORM_FIELDS = {
  taskName: 'textField_jr2gbmkf',
  project: 'textField_jr2gsc5g',
  owner: 'employeeField_jr2gcklo',
  status: 'selectField_jr2g93k9',
  priority: 'selectField_jr2hz8wp',
  startDate: 'dateField_jr2gufqh',
  endDate: 'dateField_jr2gjkqm',
};

// 使用 searchFormDatas 获取表格明细数据（含 formInstId）
export function loadTableData() {
  var searchFieldJson = {};
  if (_customState.statusFilter !== '全部') {
    searchFieldJson[FORM_FIELDS.status] = _customState.statusFilter;
  }
  if (_customState.priorityFilter !== '全部') {
    searchFieldJson[FORM_FIELDS.priority] = _customState.priorityFilter;
  }

  var dynamicOrder = '';
  if (_customState.tableSortField) {
    var fieldId = FORM_FIELDS[_customState.tableSortField];
    if (fieldId) {
      var orderObj = {};
      orderObj[fieldId] = _customState.tableSortOrder === 'asc' ? '+' : '-';
      dynamicOrder = JSON.stringify(orderObj);
    }
  }

  return this.utils.yida.searchFormDatas({
    formUuid: DATA_FORM_UUID,
    searchFieldJson: JSON.stringify(searchFieldJson),
    currentPage: _customState.tableCurrentPage,
    pageSize: _customState.tablePageSize,
    dynamicOrder: dynamicOrder,
  }).then(function(res) {
    var tableData = (res.data || []).map(function(item) {
      var formData = item.formData || {};
      return {
        formInstId: item.formInstId,
        taskName: formData[FORM_FIELDS.taskName] || '-',
        project: formData[FORM_FIELDS.project] || '-',
        owner: formData[FORM_FIELDS.owner] || '-',
        status: formData[FORM_FIELDS.status] || '-',
        priority: formData[FORM_FIELDS.priority] || '-',
        startDate: formData[FORM_FIELDS.startDate] || '',
        endDate: formData[FORM_FIELDS.endDate] || '',
      };
    });

    _customState.tableData = tableData;
    _customState.tableTotalCount = res.totalCount || 0;
    return tableData;
  });
}

// 使用 var 声明避免被宜搭 Babel 编译器当作组件方法处理
var _fetchReportData = function(cid, cname, componentClassName, dataSetKey, filterValueMap) {
  var appType = window.pageConfig && window.pageConfig.appType;
  var csrfToken = window.g_config && window.g_config._csrf_token;

  var queryContext = {
    aliasList: [],
    filterValueMap: filterValueMap || {},
    dim2table: true,
    orderByList: [],
    needTotalCount: componentClassName === 'YoushuTable',
    variableParams: {},
  };

  var body = new URLSearchParams({
    timezone: 'GMT+8',
    _tb_token_: csrfToken,
    _csrf_token: csrfToken,
    _csrf: csrfToken,
    prdId: '13085982',
    pageId: REPORT_FORM_UUID,
    pageName: 'report',
    cid: cid,
    cname: cname || '',
    componentClassName: componentClassName,
    queryContext: JSON.stringify(queryContext),
    dataSetKey: dataSetKey,
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
};

export function loadAllData() {
  this.setCustomState({ loading: true });

  var filterValueMap = {};
  if (_customState.statusFilter !== '全部') {
    filterValueMap['filter-add5a371-8095-468f-a5bc-afc3fd5f50bb'] = [_customState.statusFilter];
  }
  if (_customState.priorityFilter !== '全部') {
    filterValueMap['filter-3a7be709-6a19-4fa8-b504-6c3fc575bf50'] = [_customState.priorityFilter];
  }

  var self = this;

  // 图表数据用报表接口（模块级函数），表格数据用 searchFormDatas 接口
  Promise.all([
    _fetchReportData('YoushuSimpleIndicatorCard_mmyus3h9l', '指标卡_1', 'YoushuSimpleIndicatorCard', 'youshuData', filterValueMap),
    _fetchReportData('YoushuPieChart_mmyus3hbz', '饼图_1', 'YoushuPieChart', 'chartData', filterValueMap),
    _fetchReportData('YoushuGroupedBarChart_mmyus3hb12', '分组柱状图_1', 'YoushuGroupedBarChart', 'chartData', filterValueMap),
    _fetchReportData('YoushuLineChart_mmyus3hb15', '折线图_1', 'YoushuLineChart', 'chartData', filterValueMap),
    _fetchReportData('YoushuGroupedBarChart_mmyus3hb18', '分组柱状图_2', 'YoushuGroupedBarChart', 'chartData', filterValueMap),
    self.loadTableData(),
  ])
  .then(function(results) {
    function parseIndicator(rawContent) {
      var dataArray = rawContent.data || rawContent.dataList || [];
      if (dataArray.length === 0) return 0;
      var row = dataArray[0];
      var keys = Object.keys(row);
      for (var i = 0; i < keys.length; i++) {
        if (typeof row[keys[i]] === 'number') return row[keys[i]];
      }
      return keys.length > 0 ? row[keys[0]] : 0;
    }

    function parseChartData(rawContent) {
      var dataArray = rawContent.data || rawContent.dataList || [];
      var metaArray = rawContent.meta || [];
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

    var indicatorRaw = results[0] || {};
    var pieRaw = results[1] || {};
    var priorityBarRaw = results[2] || {};
    var lineRaw = results[3] || {};
    var projectBarRaw = results[4] || {};

    var totalTasks = parseIndicator(indicatorRaw);
    var pieData = parseChartData(pieRaw);
    var priorityBarData = parseChartData(priorityBarRaw);
    var lineData = parseChartData(lineRaw);
    var projectBarData = parseChartData(projectBarRaw);

    var completedTasks = 0;
    var inProgressTasks = 0;
    var pendingTasks = 0;

    pieData.forEach(function(item) {
      if (item.name === '已完成') {
        completedTasks = item.value;
      } else if (item.name === '进行中') {
        inProgressTasks = item.value;
      } else if (item.name === '待处理') {
        pendingTasks = item.value;
      }
    });

    self.setCustomState({
      totalTasks: totalTasks,
      completedTasks: completedTasks,
      inProgressTasks: inProgressTasks,
      pendingTasks: pendingTasks,
      loading: false,
    });

    setTimeout(function() {
      self.renderAllCharts(pieData, priorityBarData, lineData, projectBarData);
    }, 100);
  })
  .catch(function(err) {
    console.error('加载数据失败:', err);
    self.utils.toast({ title: '加载数据失败: ' + err.message, type: 'error' });
    self.setCustomState({ loading: false });
  });
}

// ============================================================
// 图表渲染
// ============================================================

export function createChart(domId) {
  var container = document.getElementById(domId);
  if (!container) {
    console.warn('图表容器不存在: ' + domId);
    return null;
  }
  var existingInstance = window.echarts.getInstanceByDom(container);
  if (existingInstance) {
    existingInstance.dispose();
  }
  return window.echarts.init(container);
}

export function renderAllCharts(pieData, priorityBarData, lineData, projectBarData) {
  this.renderPieChart(pieData);
  this.renderPriorityBarChart(priorityBarData);
  this.renderLineChart(lineData);
  this.renderProjectBarChart(projectBarData);
}

export function renderPieChart(data) {
  var chart = this.createChart('pie-chart');
  if (!chart) return;

  chart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' },
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      textStyle: { fontSize: 12, color: PALETTE.textSecondary },
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      data: data,
      itemStyle: {
        borderRadius: 4,
        borderColor: PALETTE.cardBg,
        borderWidth: 2,
      },
      label: {
        show: true,
        formatter: '{b}: {c} ({d}%)',
        fontSize: 12,
        color: PALETTE.textSecondary,
      },
    }],
    color: [PALETTE.success, PALETTE.primary, PALETTE.warning, PALETTE.neutral],
  });
}

export function renderPriorityBarChart(data) {
  var chart = this.createChart('priority-bar-chart');
  if (!chart) return;

  var categories = data.map(function(item) { return item.name; });
  var values = data.map(function(item) { return item.value; });

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        fontSize: 12,
        color: PALETTE.textSecondary,
      },
      axisLine: { lineStyle: { color: PALETTE.border } },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12,
        color: PALETTE.textSecondary,
      },
      axisLine: { lineStyle: { color: PALETTE.border } },
      splitLine: { lineStyle: { color: PALETTE.border, type: 'dashed' } },
    },
    series: [{
      type: 'bar',
      data: values,
      itemStyle: {
        color: function(params) {
          var colorMap = { '高': PALETTE.danger, '中': PALETTE.warning, '低': PALETTE.success };
          return colorMap[params.name] || PALETTE.primary;
        },
        borderRadius: [4, 4, 0, 0],
      },
      barMaxWidth: 60,
    }],
  });
}

export function renderLineChart(data) {
  var chart = this.createChart('line-chart');
  if (!chart) return;

  var categories = data.map(function(item) { return item.name; });
  var values = data.map(function(item) { return item.value; });

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        fontSize: 12,
        color: PALETTE.textSecondary,
        rotate: categories.length > 8 ? 30 : 0,
      },
      axisLine: { lineStyle: { color: PALETTE.border } },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12,
        color: PALETTE.textSecondary,
      },
      axisLine: { lineStyle: { color: PALETTE.border } },
      splitLine: { lineStyle: { color: PALETTE.border, type: 'dashed' } },
    },
    series: [{
      type: 'line',
      data: values,
      smooth: true,
      itemStyle: { color: PALETTE.primary },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: PALETTE.primaryLight + '40' },
            { offset: 1, color: PALETTE.primaryLight + '05' },
          ],
        },
      },
      lineStyle: { width: 3 },
      symbolSize: 6,
    }],
  });
}

export function renderProjectBarChart(data) {
  var chart = this.createChart('project-bar-chart');
  if (!chart) return;

  var categories = data.map(function(item) { return item.name; });
  var values = data.map(function(item) { return item.value; });

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        fontSize: 12,
        color: PALETTE.textSecondary,
        rotate: categories.length > 6 ? 30 : 0,
      },
      axisLine: { lineStyle: { color: PALETTE.border } },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12,
        color: PALETTE.textSecondary,
      },
      axisLine: { lineStyle: { color: PALETTE.border } },
      splitLine: { lineStyle: { color: PALETTE.border, type: 'dashed' } },
    },
    series: [{
      type: 'bar',
      data: values,
      itemStyle: {
        color: PALETTE.accent,
        borderRadius: [4, 4, 0, 0],
      },
      barMaxWidth: 50,
    }],
  });
}

// ============================================================
// 事件处理
// ============================================================

export function handleStatusFilterChange(e) {
  var value = e.target.value;
  _customState.statusFilter = value;
  _customState.tableCurrentPage = 1;
  this.forceUpdate();
  setTimeout(function() {
    this.loadAllData();
  }.bind(this), 50);
}

export function handlePriorityFilterChange(e) {
  var value = e.target.value;
  _customState.priorityFilter = value;
  _customState.tableCurrentPage = 1;
  this.forceUpdate();
  setTimeout(function() {
    this.loadAllData();
  }.bind(this), 50);
}

export function handleTableSort(field) {
  if (_customState.tableSortField === field) {
    _customState.tableSortOrder = _customState.tableSortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    _customState.tableSortField = field;
    _customState.tableSortOrder = 'asc';
  }
  _customState.tableCurrentPage = 1;
  this.forceUpdate();
  var self = this;
  setTimeout(function() {
    self.loadTableData().then(function() { self.forceUpdate(); });
  }, 50);
}

export function handlePageChange(page) {
  _customState.tableCurrentPage = page;
  this.forceUpdate();
  var self = this;
  setTimeout(function() {
    self.loadTableData().then(function() { self.forceUpdate(); });
  }, 50);
}

// ============================================================
// 生命周期
// ============================================================

export function didMount() {
  var chartIds = [
    'pie-chart',
    'priority-bar-chart',
    'line-chart',
    'project-bar-chart',
  ];
  this.setCustomState({ chartIds: chartIds });

  if (window.echarts) {
    _customState.echartsLoaded = true;
    this.loadAllData();
  } else {
    this.utils.loadScript('https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js')
      .then(function() {
        _customState.echartsLoaded = true;
        this.loadAllData();
      }.bind(this))
      .catch(function(err) {
        console.error('加载 ECharts 失败:', err);
        this.utils.toast({ title: '加载图表库失败', type: 'error' });
      }.bind(this));
  }

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

  if (this._resizeHandler) {
    window.removeEventListener('resize', this._resizeHandler);
  }
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var { timestamp } = this.state;
  var isMobile = this.utils.isMobile();

  var styles = {
    container: {
      padding: isMobile ? '12px' : '20px',
      minHeight: '100vh',
      background: PALETTE.bg,
      borderRadius: '0 !important',
    },
    filterBar: {
      display: 'flex',
      gap: isMobile ? '8px' : '12px',
      marginBottom: isMobile ? '12px' : '16px',
      flexWrap: 'wrap',
    },
    filterItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    filterLabel: {
      fontSize: 13,
      color: PALETTE.textSecondary,
      whiteSpace: 'nowrap',
    },
    filterSelect: {
      padding: '6px 12px',
      border: '1px solid ' + PALETTE.border,
      borderRadius: '6px',
      fontSize: 13,
      color: PALETTE.textPrimary,
      background: PALETTE.cardBg,
      minWidth: '120px',
      cursor: 'pointer',
    },
    kpiContainer: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? '8px' : '16px',
      marginBottom: isMobile ? '12px' : '20px',
    },
    kpiCard: {
      padding: isMobile ? '12px' : '20px',
      background: PALETTE.cardBg,
      borderRadius: '10px',
      border: '1px solid ' + PALETTE.border,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    kpiLabel: {
      fontSize: 12,
      color: PALETTE.textSecondary,
      marginBottom: isMobile ? '6px' : '8px',
    },
    kpiValue: {
      fontSize: isMobile ? '20px' : '26px',
      fontWeight: 700,
      color: PALETTE.textPrimary,
      fontFeatureSettings: '"tnum"',
    },
    chartGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: isMobile ? '12px' : '16px',
      marginBottom: isMobile ? '12px' : '20px',
    },
    chartCard: {
      padding: isMobile ? '12px' : '16px',
      background: PALETTE.cardBg,
      borderRadius: '10px',
      border: '1px solid ' + PALETTE.border,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    chartTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: PALETTE.textPrimary,
      marginBottom: isMobile ? '8px' : '12px',
    },
    chartContainer: {
      height: isMobile ? '280px' : '350px',
    },
    tableCard: {
      padding: isMobile ? '12px' : '16px',
      background: PALETTE.cardBg,
      borderRadius: '10px',
      border: '1px solid ' + PALETTE.border,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    tableTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: PALETTE.textPrimary,
      marginBottom: isMobile ? '12px' : '16px',
    },
    tableContainer: {
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13,
    },
    th: {
      padding: '10px 12px',
      textAlign: 'left',
      fontWeight: 600,
      color: PALETTE.textSecondary,
      fontSize: 12,
      borderBottom: '2px solid ' + PALETTE.border,
      background: PALETTE.bg,
      whiteSpace: 'nowrap',
      cursor: 'pointer',
    },
    td: {
      padding: '10px 12px',
      borderBottom: '1px solid ' + PALETTE.border,
      color: PALETTE.textSecondary,
      fontSize: 13,
    },
    statusBadge: function(status) {
      var statusColor = getStatusColor(status);
      return {
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: '18px',
        color: statusColor,
        background: statusColor + '14',
        border: '1px solid ' + statusColor + '30',
      };
    },
    priorityBadge: function(priority) {
      var priorityColor = getPriorityColor(priority);
      return {
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: '18px',
        color: priorityColor,
        background: priorityColor + '14',
        border: '1px solid ' + priorityColor + '30',
      };
    },
    detailLink: {
      color: PALETTE.primaryLight,
      fontSize: 12,
      textDecoration: 'none',
      cursor: 'pointer',
      fontWeight: 500,
    },
    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '8px',
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid ' + PALETTE.border,
    },
    paginationBtn: {
      padding: '6px 12px',
      border: '1px solid ' + PALETTE.border,
      borderRadius: '4px',
      fontSize: 12,
      color: PALETTE.textSecondary,
      background: PALETTE.cardBg,
      cursor: 'pointer',
    },
    paginationBtnActive: {
      padding: '6px 12px',
      border: '1px solid ' + PALETTE.primary,
      borderRadius: '4px',
      fontSize: 12,
      color: '#fff',
      background: PALETTE.primary,
      cursor: 'pointer',
    },
    paginationInfo: {
      fontSize: 12,
      color: PALETTE.textMuted,
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      color: PALETTE.textSecondary,
    },
  };

  // 表格数据已通过 searchFormDatas 服务端分页，直接使用
  var tableData = this.getCustomState('tableData') || [];
  var tableCurrentPage = this.getCustomState('tableCurrentPage') || 1;
  var tablePageSize = this.getCustomState('tablePageSize') || 10;
  var tableTotalCount = this.getCustomState('tableTotalCount') || 0;
  var tableSortField = this.getCustomState('tableSortField') || '';
  var tableSortOrder = this.getCustomState('tableSortOrder') || 'asc';

  var totalPages = Math.max(1, Math.ceil(tableTotalCount / tablePageSize));
  var pageData = tableData;

  return (
    <div style={styles.container}>
      <div style={{ display: 'none' }}>{timestamp}</div>

      <div style={styles.filterBar}>
        <div style={styles.filterItem}>
          <span style={styles.filterLabel}>任务状态:</span>
          <select 
            id="status-filter"
            defaultValue={_customState.statusFilter}
            onChange={(e) => { this.handleStatusFilterChange(e); }}
            style={styles.filterSelect}
          >
            <option value="全部">全部</option>
            <option value="已完成">已完成</option>
            <option value="进行中">进行中</option>
            <option value="待处理">待处理</option>
          </select>
        </div>
        <div style={styles.filterItem}>
          <span style={styles.filterLabel}>优先级:</span>
          <select 
            id="priority-filter"
            defaultValue={_customState.priorityFilter}
            onChange={(e) => { this.handlePriorityFilterChange(e); }}
            style={styles.filterSelect}
          >
            <option value="全部">全部</option>
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
          </select>
        </div>
      </div>

      <div style={styles.kpiContainer}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>任务总数</div>
          <div style={styles.kpiValue}>{this.getCustomState('totalTasks')}</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>已完成</div>
          <div style={{ ...styles.kpiValue, color: PALETTE.success }}>
            {this.getCustomState('completedTasks')}
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>进行中</div>
          <div style={{ ...styles.kpiValue, color: PALETTE.primary }}>
            {this.getCustomState('inProgressTasks')}
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>待处理</div>
          <div style={{ ...styles.kpiValue, color: PALETTE.warning }}>
            {this.getCustomState('pendingTasks')}
          </div>
        </div>
      </div>

      <div style={styles.chartGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>任务状态分布</div>
          <div id="pie-chart" style={styles.chartContainer}></div>
        </div>
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>按优先级分布</div>
          <div id="priority-bar-chart" style={styles.chartContainer}></div>
        </div>
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>按截止日期趋势</div>
          <div id="line-chart" style={styles.chartContainer}></div>
        </div>
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>按所属项目分布</div>
          <div id="project-bar-chart" style={styles.chartContainer}></div>
        </div>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableTitle}>任务明细</div>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th} onClick={(e) => { this.handleTableSort('taskName'); }}>
                  任务名称 {tableSortField === 'taskName' && (tableSortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th} onClick={(e) => { this.handleTableSort('project'); }}>
                  所属项目 {tableSortField === 'project' && (tableSortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th} onClick={(e) => { this.handleTableSort('owner'); }}>
                  负责人 {tableSortField === 'owner' && (tableSortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th} onClick={(e) => { this.handleTableSort('status'); }}>
                  任务状态 {tableSortField === 'status' && (tableSortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th} onClick={(e) => { this.handleTableSort('priority'); }}>
                  优先级 {tableSortField === 'priority' && (tableSortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th} onClick={(e) => { this.handleTableSort('startDate'); }}>
                  开始日期 {tableSortField === 'startDate' && (tableSortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th} onClick={(e) => { this.handleTableSort('endDate'); }}>
                  截止日期 {tableSortField === 'endDate' && (tableSortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(function(row, index) {
                return (
                  <tr key={index} style={{ background: index % 2 === 0 ? PALETTE.cardBg : PALETTE.bg }}>
                    <td style={styles.td}>{row.taskName || '-'}</td>
                    <td style={styles.td}>{row.project || '-'}</td>
                    <td style={styles.td}>{row.owner || '-'}</td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge(row.status)}>{row.status || '-'}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.priorityBadge(row.priority)}>{row.priority || '-'}</span>
                    </td>
                    <td style={styles.td}>{this.formatDate(row.startDate)}</td>
                    <td style={styles.td}>{this.formatDate(row.endDate)}</td>
                    <td style={styles.td}>
                      <a 
                        href={getDetailUrl(row.formInstId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.detailLink}
                      >
                        详情
                      </a>
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
        </div>

        <div style={styles.pagination}>
          <span style={styles.paginationInfo}>
            共 {tableTotalCount} 条，第 {tableCurrentPage} / {totalPages} 页
          </span>
          <button 
            style={styles.paginationBtn}
            onClick={(e) => { this.handlePageChange(tableCurrentPage - 1); }}
            disabled={tableCurrentPage === 1}
          >
            上一页
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, function(_, i) {
            var pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (tableCurrentPage <= 3) {
              pageNum = i + 1;
            } else if (tableCurrentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = tableCurrentPage - 2 + i;
            }
            return (
              <button
                key={pageNum}
                style={pageNum === tableCurrentPage ? styles.paginationBtnActive : styles.paginationBtn}
                onClick={(e) => { this.handlePageChange(pageNum); }}
              >
                {pageNum}
              </button>
            );
          }.bind(this))}
          <button 
            style={styles.paginationBtn}
            onClick={(e) => { this.handlePageChange(tableCurrentPage + 1); }}
            disabled={tableCurrentPage === totalPages}
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
