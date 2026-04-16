// ============================================================
// 项目任务完成进展 — ECharts 美化报表
// 数据源报表: REPORT-3OG66891K834LPWFHDX5A7EYELG03RXM930NM5
// ============================================================

var ECHARTS_CDN = 'https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js';
var REPORT_FORM_UUID = 'REPORT-3OG66891K834LPWFHDX5A7EYELG03RXM930NM5';
var APP_TYPE = 'APP_KNILKT41DC5XXR5D4QEC';

// 报表组件配置（从原生报表 Schema 中提取）
var REPORT_COMPONENTS = {
  table: {
    cid: 'node_ocmn039naue',
    cname: '项目任务完成进展',
    className: 'YoushuTable',
    dataSetKey: 'table',
    filterKey: 'filter-55148b54-1309-4940-a0ec-439de6343eac',
  },
  barChart: {
    cid: 'node_ocmn039naug',
    cname: '不同项目任务完成情况',
    className: 'YoushuGroupedBarChart',
    dataSetKey: 'chartData',
    filterKey: 'filter-60595281-ef60-49e2-9b2b-38c2a3928e88',
  },
  filter: {
    cid: 'node_ocmn039nau6',
    cname: '所属项目筛选',
    className: 'YoushuSelectFilter',
    dataSetKey: 'selectFilter',
  },
};

// 主题色板
var PALETTE = {
  primary: '#4f46e5',
  primaryLight: '#818cf8',
  primaryGradientStart: '#6366f1',
  primaryGradientEnd: '#4f46e5',
  success: '#10b981',
  successLight: '#34d399',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  danger: '#ef4444',
  dangerLight: '#f87171',
  info: '#06b6d4',
  infoLight: '#22d3ee',
  bg: '#f8fafc',
  cardBg: '#ffffff',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
};

var CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'];

// 任务状态颜色映射
var STATUS_COLOR_MAP = {
  '未开始': PALETTE.textMuted,
  '进行中': PALETTE.primary,
  '已完成': PALETTE.success,
  '已暂停': PALETTE.warning,
  '已取消': PALETTE.danger,
  '已延期': PALETTE.danger,
};

// 优先级颜色映射
var PRIORITY_COLOR_MAP = {
  '紧急': '#dc2626',
  '高': '#ef4444',
  '中': '#f59e0b',
  '低': '#10b981',
  'P0': '#dc2626',
  'P1': '#ef4444',
  'P2': '#f59e0b',
  'P3': '#10b981',
};

// ============================================================
// 状态管理
// ============================================================

var _customState = {
  loading: true,
  filterOptions: [],
  selectedProject: '',
  taskTotal: 0,
  completedCount: 0,
  inProgressCount: 0,
  completionRate: 0,
  barChartData: null,
  tableData: [],
  tableTotal: 0,
  tablePage: 1,
  tablePageSize: 10,
  sortField: null,
  sortOrder: null,
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
// 模块级变量：数据请求函数
// ============================================================

var _prdId = null;

var _fetchPrdId = function() {
  var appType = window.pageConfig && window.pageConfig.appType;
  var csrfToken = window.g_config && window.g_config._csrf_token;
  var baseUrl = window.location.origin;
  var url = baseUrl + '/dingtalk/web/' + appType
    + '/query/formnav/getFormNavigationListByOrder.json'
    + '?_api=Nav.queryList&_mock=false&_csrf_token=' + encodeURIComponent(csrfToken);

  return fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'accept': 'application/json, text/json', 'x-requested-with': 'XMLHttpRequest' },
  })
    .then(function(resp) { return resp.json(); })
    .then(function(res) {
      if (res.success && Array.isArray(res.content)) {
        var targetNav = res.content.find(function(item) {
          return item.formUuid === REPORT_FORM_UUID;
        });
        if (targetNav && targetNav.topicId) {
          _prdId = targetNav.topicId;
          return _prdId;
        }
        var reportNav = res.content.find(function(item) {
          return item.formType === 'report' && item.topicId;
        });
        if (reportNav) {
          _prdId = reportNav.topicId;
          return _prdId;
        }
        throw new Error('应用导航菜单中未找到包含 topicId 的报表');
      }
      throw new Error(res.errorMsg || '获取应用导航菜单失败');
    });
};

var _fetchReportData = function(componentConfig, filterValueMap, options) {
  var appType = window.pageConfig && window.pageConfig.appType;
  var csrfToken = window.g_config && window.g_config._csrf_token;
  options = options || {};

  var queryContext = {
    aliasList: [],
    filterValueMap: filterValueMap || {},
    dim2table: true,
    orderByList: [],
    needTotalCount: options.needTotalCount || false,
    variableParams: {},
    uniqueRows: true,
  };

  if (options.start !== undefined) queryContext.start = options.start;
  if (options.limit !== undefined) queryContext.limit = options.limit;
  if (options.needPaging) queryContext.needPaging = true;

  var body = new URLSearchParams({
    timezone: 'GMT+8',
    _tb_token_: csrfToken,
    _csrf_token: csrfToken,
    _csrf: csrfToken,
    prdId: _prdId,
    pageId: REPORT_FORM_UUID,
    pageName: 'report',
    cid: componentConfig.cid,
    cname: componentConfig.cname || '',
    componentClassName: componentConfig.className,
    queryContext: JSON.stringify(queryContext),
    dataSetKey: componentConfig.dataSetKey,
  });

  var url = '/alibaba/web/' + appType + '/visual/visualizationDataRpc/getDataAsync.json';
  return fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    credentials: 'include',
  })
    .then(function(r) { return r.json(); })
    .then(function(result) {
      if (result.success) return result.content;
      throw new Error(result.errorMsg || '数据请求失败');
    });
};

// ============================================================
// 生命周期
// ============================================================

export function didMount() {
  var self = this;
  this.utils.loadScript(ECHARTS_CDN)
    .then(function() {
      return _fetchPrdId();
    })
    .then(function() {
      return self.loadAllData();
    })
    .catch(function(error) {
      console.error('[报表] 初始化失败:', error);
      self.utils.toast({ title: '初始化失败: ' + error.message, type: 'error' });
      self.setCustomState({ loading: false });
    });

  window.addEventListener('resize', function() {
    var charts = ['chart-grouped-bar'];
    charts.forEach(function(domId) {
      var dom = document.getElementById(domId);
      if (dom) {
        var instance = window.echarts && window.echarts.getInstanceByDom(dom);
        if (instance) instance.resize();
      }
    });
  });
}

export function didUnmount() {}

// ============================================================
// 数据加载
// ============================================================

export function loadAllData() {
  var self = this;
  self.setCustomState({ loading: true });

  var filterValueMap = {};
  if (_customState.selectedProject) {
    filterValueMap[REPORT_COMPONENTS.table.filterKey] = [_customState.selectedProject];
    filterValueMap[REPORT_COMPONENTS.barChart.filterKey] = [_customState.selectedProject];
  }

  return Promise.all([
    _fetchReportData(REPORT_COMPONENTS.filter, {}),
    _fetchReportData(REPORT_COMPONENTS.table, filterValueMap, {
      needTotalCount: true,
      needPaging: true,
      start: 0,
      limit: _customState.tablePageSize,
    }),
    _fetchReportData(REPORT_COMPONENTS.barChart, filterValueMap),
  ])
    .then(function(results) {
      var filterContent = results[0];
      var tableContent = results[1];
      var barContent = results[2];

      // 解析筛选器选项
      var filterData = filterContent.data || [];
      var filterMeta = filterContent.meta || [];
      var labelAlias = filterMeta.length > 0 ? filterMeta[0].alias : null;
      var filterOptions = filterData.map(function(row) {
        return labelAlias ? row[labelAlias] : Object.values(row)[0];
      }).filter(function(val) { return val; });

      // 解析表格数据
      var tableData = tableContent.data || [];
      var tableMeta = tableContent.meta || [];
      var tableTotal = tableContent.totalCount || tableData.length;

      // 解析柱状图数据
      var barData = barContent.data || [];
      var barMeta = barContent.meta || [];

      // 计算 KPI
      var completedCount = 0;
      var inProgressCount = 0;
      barData.forEach(function(row) {
        var statusAlias = barMeta.find(function(m) { return (m.aliasName || '').indexOf('状态') > -1; });
        var countAlias = barMeta.find(function(m) { return m.aliasName !== statusAlias?.aliasName && (m.aliasName || '').indexOf('项目') > -1; });
        if (!countAlias) countAlias = barMeta.find(function(m) { return m.alias !== (statusAlias && statusAlias.alias); });
        var statusVal = statusAlias ? row[statusAlias.alias] : '';
        var countVal = countAlias ? Number(row[countAlias.alias]) || 0 : 0;
        if (statusVal === '已完成') completedCount += countVal;
        if (statusVal === '进行中') inProgressCount += countVal;
      });

      var taskTotal = 0;
      barData.forEach(function(row) {
        var countAlias = barMeta.find(function(m) { return m.aggregateType === 'COUNT' || (m.aliasName || '').indexOf('ID') > -1; });
        if (countAlias) taskTotal += Number(row[countAlias.alias]) || 0;
      });

      var completionRate = taskTotal > 0 ? Math.round((completedCount / taskTotal) * 100) : 0;

      self.setCustomState({
        loading: false,
        filterOptions: filterOptions,
        taskTotal: taskTotal,
        completedCount: completedCount,
        inProgressCount: inProgressCount,
        completionRate: completionRate,
        barChartData: { data: barData, meta: barMeta },
        tableData: tableData,
        tableMeta: tableMeta,
        tableTotal: tableTotal,
        tablePage: 1,
      });

      setTimeout(function() {
        self.renderGroupedBarChart();
      }, 100);
    })
    .catch(function(error) {
      console.error('[报表] 数据加载失败:', error);
      self.utils.toast({ title: '数据加载失败: ' + error.message, type: 'error' });
      self.setCustomState({ loading: false });
    });
}

// ============================================================
// 筛选器
// ============================================================

export function onFilterChange(value) {
  _customState.selectedProject = value;
  _customState.tablePage = 1;
  this.loadAllData();
}

// ============================================================
// 图表渲染
// ============================================================

export function renderGroupedBarChart() {
  var dom = document.getElementById('chart-grouped-bar');
  if (!dom || !window.echarts) return;

  var chartData = _customState.barChartData;
  if (!chartData || !chartData.data || chartData.data.length === 0) {
    this.renderEmptyChart('chart-grouped-bar', '暂无任务数据');
    return;
  }

  var data = chartData.data;
  var meta = chartData.meta;

  // 从 meta 中识别维度和度量
  var xFieldMeta = meta.find(function(m) { return (m.aliasName || '').indexOf('项目') > -1 && (m.aliasName || '').indexOf('状态') === -1; });
  var groupFieldMeta = meta.find(function(m) { return (m.aliasName || '').indexOf('状态') > -1; });
  var yFieldMeta = meta.find(function(m) { return m.aggregateType === 'COUNT' || (m.aliasName || '').indexOf('ID') > -1; });

  if (!xFieldMeta || !groupFieldMeta || !yFieldMeta) {
    this.renderEmptyChart('chart-grouped-bar', '数据格式异常');
    return;
  }

  // 提取唯一的项目名和状态
  var projectSet = {};
  var statusSet = {};
  data.forEach(function(row) {
    var project = row[xFieldMeta.alias] || '未知';
    var status = row[groupFieldMeta.alias] || '未知';
    projectSet[project] = true;
    statusSet[status] = true;
  });
  var projects = Object.keys(projectSet);
  var statuses = Object.keys(statusSet);

  // 构建每个状态的 series 数据
  var seriesList = statuses.map(function(status, statusIndex) {
    var seriesData = projects.map(function(project) {
      var matchRow = data.find(function(row) {
        return row[xFieldMeta.alias] === project && row[groupFieldMeta.alias] === status;
      });
      return matchRow ? Number(matchRow[yFieldMeta.alias]) || 0 : 0;
    });

    var statusColor = STATUS_COLOR_MAP[status] || CHART_COLORS[statusIndex % CHART_COLORS.length];

    return {
      name: status,
      type: 'bar',
      data: seriesData,
      barMaxWidth: 32,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: statusColor },
            { offset: 1, color: statusColor + 'cc' },
          ],
        },
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 12,
          shadowColor: statusColor + '40',
        },
      },
    };
  });

  var chart = window.echarts.getInstanceByDom(dom) || window.echarts.init(dom);
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: 'transparent',
      borderRadius: 8,
      padding: [12, 16],
      textStyle: { color: '#fff', fontSize: 13 },
      formatter: function(params) {
        var title = '<div style="font-weight:600;margin-bottom:8px;font-size:14px">' + params[0].axisValue + '</div>';
        var items = params.map(function(param) {
          return '<div style="display:flex;align-items:center;gap:6px;margin:4px 0">'
            + '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + param.color.colorStops[0].color + '"></span>'
            + '<span>' + param.seriesName + '</span>'
            + '<span style="font-weight:600;margin-left:auto">' + param.value + '</span>'
            + '</div>';
        }).join('');
        return title + items;
      },
    },
    legend: {
      top: 0,
      left: 'center',
      textStyle: { fontSize: 12, color: PALETTE.textSecondary },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 20,
      icon: 'roundRect',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '48px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: projects,
      axisLabel: {
        fontSize: 12,
        color: PALETTE.textMuted,
        rotate: projects.length > 6 ? 25 : 0,
      },
      axisLine: { lineStyle: { color: PALETTE.borderLight } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { fontSize: 12, color: PALETTE.textMuted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: PALETTE.borderLight, type: [4, 4] } },
    },
    series: seriesList,
    animationDuration: 800,
    animationEasing: 'cubicOut',
  }, true);
}

export function renderEmptyChart(domId, message) {
  var dom = document.getElementById(domId);
  if (!dom) return;
  var existingInstance = window.echarts && window.echarts.getInstanceByDom(dom);
  if (existingInstance) existingInstance.dispose();
  dom.innerHTML = '';
  var emptyDiv = document.createElement('div');
  emptyDiv.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:' + PALETTE.textMuted + ';font-size:14px;';
  emptyDiv.innerHTML = '<div style="font-size:48px;margin-bottom:12px;">📭</div><div>' + (message || '暂无数据') + '</div>';
  dom.appendChild(emptyDiv);
}

// ============================================================
// 表格翻页
// ============================================================

export function handleTablePageChange(page) {
  var self = this;
  var start = (page - 1) * _customState.tablePageSize;
  _customState.tablePage = page;

  var filterValueMap = {};
  if (_customState.selectedProject) {
    filterValueMap[REPORT_COMPONENTS.table.filterKey] = [_customState.selectedProject];
  }

  _fetchReportData(REPORT_COMPONENTS.table, filterValueMap, {
    needTotalCount: true,
    needPaging: true,
    start: start,
    limit: _customState.tablePageSize,
  })
    .then(function(content) {
      self.setCustomState({
        tableData: content.data || [],
        tableMeta: content.meta || _customState.tableMeta,
        tableTotal: content.totalCount || _customState.tableTotal,
      });
    })
    .catch(function(error) {
      self.utils.toast({ title: '翻页失败: ' + error.message, type: 'error' });
    });
}

// ============================================================
// 表格排序
// ============================================================

export function handleSort(fieldAlias) {
  var currentSort = _customState.sortField;
  var currentOrder = _customState.sortOrder;
  var newOrder = 'asc';
  if (currentSort === fieldAlias) {
    newOrder = currentOrder === 'asc' ? 'desc' : (currentOrder === 'desc' ? null : 'asc');
  }

  if (!newOrder) {
    _customState.sortField = null;
    _customState.sortOrder = null;
  } else {
    _customState.sortField = fieldAlias;
    _customState.sortOrder = newOrder;
  }
  this.forceUpdate();
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var timestamp = this.state.timestamp;
  var isMobile = this.utils.isMobile();
  var loading = _customState.loading;
  var taskTotal = _customState.taskTotal;
  var completedCount = _customState.completedCount;
  var inProgressCount = _customState.inProgressCount;
  var completionRate = _customState.completionRate;
  var filterOptions = _customState.filterOptions;
  var selectedProject = _customState.selectedProject;
  var tableData = _customState.tableData;
  var tableMeta = _customState.tableMeta || [];
  var tableTotal = _customState.tableTotal;
  var tablePage = _customState.tablePage;
  var tablePageSize = _customState.tablePageSize;
  var totalPages = Math.ceil(tableTotal / tablePageSize) || 1;
  var sortField = _customState.sortField;
  var sortOrder = _customState.sortOrder;

  // 表格排序
  var sortedTableData = tableData.slice();
  if (sortField && sortOrder) {
    sortedTableData.sort(function(rowA, rowB) {
      var valA = rowA[sortField];
      var valB = rowB[sortField];
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';
      var numA = Number(valA);
      var numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }
      var strA = String(valA);
      var strB = String(valB);
      return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }

  // ---- 样式定义 ----
  var styles = {
    container: {
      padding: isMobile ? '12px' : '0 24px 24px',
      background: PALETTE.bg,
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      borderRadius: 0,
    },
    header: {
      background: 'linear-gradient(135deg, ' + PALETTE.primaryGradientStart + ' 0%, ' + PALETTE.primaryGradientEnd + ' 100%)',
      borderRadius: isMobile ? '12px' : '0 0 16px 16px',
      padding: isMobile ? '20px 16px' : '28px 32px',
      marginBottom: '20px',
      marginLeft: isMobile ? 0 : '-24px',
      marginRight: isMobile ? 0 : '-24px',
      color: '#fff',
      boxShadow: '0 4px 24px rgba(99, 102, 241, 0.25)',
    },
    headerTitle: {
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: '700',
      margin: '0 0 4px 0',
      letterSpacing: '-0.02em',
    },
    headerSubtitle: { fontSize: '13px', opacity: 0.8, margin: 0 },
    filterBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px',
      flexWrap: 'wrap',
    },
    filterLabel: {
      fontSize: '13px',
      fontWeight: '600',
      color: PALETTE.textSecondary,
    },
    filterSelect: {
      padding: '8px 14px',
      borderRadius: '8px',
      border: '1px solid ' + PALETTE.border,
      background: '#fff',
      fontSize: '13px',
      color: PALETTE.text,
      outline: 'none',
      minWidth: '180px',
      cursor: 'pointer',
    },
    kpiRow: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
      gap: isMobile ? '10px' : '16px',
      marginBottom: '20px',
    },
    kpiCard: function(color, lightColor) {
      return {
        background: '#fff',
        borderRadius: '12px',
        padding: isMobile ? '16px 14px' : '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        border: '1px solid ' + PALETTE.border,
        position: 'relative',
        overflow: 'hidden',
      };
    },
    kpiAccent: function(color) {
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, ' + color + ', ' + color + '80)',
        borderRadius: '12px 12px 0 0',
      };
    },
    kpiLabel: {
      fontSize: '12px',
      color: PALETTE.textMuted,
      marginBottom: '8px',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    kpiValue: {
      fontSize: isMobile ? '24px' : '28px',
      fontWeight: '700',
      color: PALETTE.text,
      lineHeight: 1.2,
      fontFeatureSettings: '"tnum"',
    },
    kpiSuffix: {
      fontSize: '14px',
      fontWeight: '500',
      color: PALETTE.textMuted,
      marginLeft: '2px',
    },
    chartCard: {
      background: '#fff',
      borderRadius: '12px',
      padding: isMobile ? '16px' : '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      border: '1px solid ' + PALETTE.border,
      marginBottom: '20px',
    },
    chartTitle: {
      fontSize: '15px',
      fontWeight: '600',
      color: PALETTE.text,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    chartTitleDot: function(color) {
      return {
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color,
      };
    },
    chartContainer: { width: '100%', height: isMobile ? '280px' : '360px' },
    tableCard: {
      background: '#fff',
      borderRadius: '12px',
      padding: isMobile ? '16px' : '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      border: '1px solid ' + PALETTE.border,
      marginBottom: '20px',
    },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: {
      padding: '10px 12px',
      textAlign: 'left',
      fontWeight: '600',
      color: PALETTE.textSecondary,
      fontSize: '12px',
      borderBottom: '2px solid ' + PALETTE.border,
      background: PALETTE.bg,
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      userSelect: 'none',
    },
    td: {
      padding: '10px 12px',
      borderBottom: '1px solid ' + PALETTE.borderLight,
      color: PALETTE.textSecondary,
      fontSize: '13px',
    },
    badge: function(color) {
      return {
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '600',
        lineHeight: '18px',
        color: color,
        background: color + '14',
        border: '1px solid ' + color + '30',
      };
    },
    progressBarOuter: {
      width: '80px',
      height: '6px',
      background: PALETTE.borderLight,
      borderRadius: '3px',
      overflow: 'hidden',
      display: 'inline-block',
      verticalAlign: 'middle',
      marginRight: '6px',
    },
    progressBarInner: function(percent) {
      var color = percent >= 80 ? PALETTE.success : (percent >= 50 ? PALETTE.warning : PALETTE.danger);
      return {
        width: Math.min(percent, 100) + '%',
        height: '100%',
        background: color,
        borderRadius: '3px',
        transition: 'width 0.3s ease',
      };
    },
    pagination: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '16px',
      flexWrap: 'wrap',
      gap: '8px',
    },
    pageInfo: { fontSize: '13px', color: PALETTE.textMuted },
    pageButtons: { display: 'flex', gap: '4px', alignItems: 'center' },
    pageButton: function(isActive, isDisabled) {
      return {
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        border: isActive ? 'none' : '1px solid ' + PALETTE.border,
        background: isActive ? PALETTE.primary : '#fff',
        color: isActive ? '#fff' : (isDisabled ? PALETTE.textMuted : PALETTE.textSecondary),
        fontSize: '13px',
        fontWeight: isActive ? '600' : '400',
        opacity: isDisabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
      };
    },
    loadingOverlay: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      gap: '16px',
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid ' + PALETTE.borderLight,
      borderTop: '3px solid ' + PALETTE.primary,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'none' }}>{timestamp}</div>
        <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>项目任务完成进展</h1>
          <p style={styles.headerSubtitle}>数据加载中...</p>
        </div>
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner}></div>
          <span style={{ color: PALETTE.textMuted, fontSize: '14px' }}>正在加载报表数据...</span>
        </div>
      </div>
    );
  }

  // 构建表格列
  var tableColumns = tableMeta.map(function(metaItem) {
    var label = metaItem.aliasName;
    if (typeof label === 'object' && label.zh_CN) label = label.zh_CN;
    return { alias: metaItem.alias, label: label || metaItem.alias, aliasName: label };
  });

  // 翻页按钮
  var pageButtonElements = [];
  var startPage = Math.max(1, tablePage - 2);
  var endPage = Math.min(totalPages, startPage + 4);
  if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

  for (var pageIndex = startPage; pageIndex <= endPage; pageIndex++) {
    (function(currentPage) {
      pageButtonElements.push(
        <span
          key={currentPage}
          style={styles.pageButton(currentPage === tablePage, false)}
          onClick={(e) => { this.handleTablePageChange(currentPage); }}
        >
          {currentPage}
        </span>
      );
    }.bind(this))(pageIndex);
  }

  return (
    <div style={styles.container}>
      <div style={{ display: 'none' }}>{timestamp}</div>

      {/* 页面标题 */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>项目任务完成进展</h1>
        <p style={styles.headerSubtitle}>基于项目任务数据的多维度分析看板 · 数据实时更新</p>
      </div>

      {/* 筛选栏 */}
      {filterOptions.length > 0 && (
        <div style={styles.filterBar}>
          <span style={styles.filterLabel}>所属项目</span>
          <select
            id="project-filter"
            style={styles.filterSelect}
            defaultValue={selectedProject}
            onChange={(e) => { this.onFilterChange(e.target.value); }}
          >
            <option value="">全部项目</option>
            {filterOptions.map(function(opt, optIndex) {
              return <option key={optIndex} value={opt}>{opt}</option>;
            })}
          </select>
        </div>
      )}

      {/* KPI 指标卡 */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiCard(PALETTE.primary, PALETTE.primaryLight)}>
          <div style={styles.kpiAccent(PALETTE.primary)}></div>
          <div style={styles.kpiLabel}>任务总数</div>
          <div style={styles.kpiValue}>{taskTotal}</div>
        </div>
        <div style={styles.kpiCard(PALETTE.success, PALETTE.successLight)}>
          <div style={styles.kpiAccent(PALETTE.success)}></div>
          <div style={styles.kpiLabel}>已完成</div>
          <div style={styles.kpiValue}>
            {completedCount}
            <span style={styles.kpiSuffix}>个</span>
          </div>
        </div>
        <div style={styles.kpiCard(PALETTE.info, PALETTE.infoLight)}>
          <div style={styles.kpiAccent(PALETTE.info)}></div>
          <div style={styles.kpiLabel}>进行中</div>
          <div style={styles.kpiValue}>
            {inProgressCount}
            <span style={styles.kpiSuffix}>个</span>
          </div>
        </div>
        <div style={styles.kpiCard(PALETTE.warning, PALETTE.warningLight)}>
          <div style={styles.kpiAccent(PALETTE.warning)}></div>
          <div style={styles.kpiLabel}>完成率</div>
          <div style={styles.kpiValue}>
            {completionRate}
            <span style={styles.kpiSuffix}>%</span>
          </div>
        </div>
      </div>

      {/* 分组柱状图 */}
      <div style={styles.chartCard}>
        <div style={styles.chartTitle}>
          <span style={styles.chartTitleDot(PALETTE.primary)}></span>
          不同项目任务完成情况
        </div>
        <div id="chart-grouped-bar" style={styles.chartContainer}></div>
      </div>

      {/* 数据明细表格 */}
      <div style={styles.tableCard}>
        <div style={styles.chartTitle}>
          <span style={styles.chartTitleDot(PALETTE.success)}></span>
          任务明细
          <span style={{ fontSize: '12px', color: PALETTE.textMuted, fontWeight: '400', marginLeft: '8px' }}>
            共 {tableTotal} 条
          </span>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {tableColumns.map(function(col) {
                  var isSorted = sortField === col.alias;
                  var sortIndicator = isSorted ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : '';
                  return (
                    <th
                      key={col.alias}
                      style={styles.th}
                      onClick={(e) => { this.handleSort(col.alias); }}
                    >
                      {col.label}{sortIndicator}
                    </th>
                  );
                }.bind(this))}
              </tr>
            </thead>
            <tbody>
              {sortedTableData.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns.length} style={Object.assign({}, styles.td, { textAlign: 'center', padding: '48px 16px', color: PALETTE.textMuted })}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>📭</div>
                    <div>暂无任务数据</div>
                  </td>
                </tr>
              ) : (
                sortedTableData.map(function(row, rowIndex) {
                  var rowBg = rowIndex % 2 === 1 ? { background: '#fafbfe' } : {};
                  return (
                    <tr key={rowIndex} style={rowBg}>
                      {tableColumns.map(function(col) {
                        var cellValue = row[col.alias];
                        var cellStyle = Object.assign({}, styles.td);
                        var aliasName = col.aliasName || '';
                        if (typeof aliasName === 'object') aliasName = aliasName.zh_CN || '';

                        // 空值处理
                        if (cellValue === null || cellValue === undefined || cellValue === '') {
                          return <td key={col.alias} style={Object.assign({}, cellStyle, { color: PALETTE.textMuted })}>-</td>;
                        }

                        // 状态列
                        if (aliasName.indexOf('状态') > -1 && STATUS_COLOR_MAP[cellValue]) {
                          return (
                            <td key={col.alias} style={cellStyle}>
                              <span style={styles.badge(STATUS_COLOR_MAP[cellValue])}>{cellValue}</span>
                            </td>
                          );
                        }

                        // 优先级列
                        if (aliasName.indexOf('优先级') > -1 && PRIORITY_COLOR_MAP[cellValue]) {
                          return (
                            <td key={col.alias} style={cellStyle}>
                              <span style={styles.badge(PRIORITY_COLOR_MAP[cellValue])}>{cellValue}</span>
                            </td>
                          );
                        }

                        // 完成进度列
                        if (aliasName.indexOf('进度') > -1) {
                          var progressVal = Number(cellValue);
                          if (!isNaN(progressVal)) {
                            var displayPercent = progressVal > 1 ? progressVal : Math.round(progressVal * 100);
                            return (
                              <td key={col.alias} style={cellStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <div style={styles.progressBarOuter}>
                                    <div style={styles.progressBarInner(displayPercent)}></div>
                                  </div>
                                  <span style={{ fontSize: '12px', fontWeight: '600', color: PALETTE.textSecondary }}>
                                    {displayPercent}%
                                  </span>
                                </div>
                              </td>
                            );
                          }
                        }

                        // 执行人列（可能是数组）
                        if (aliasName.indexOf('执行人') > -1 || aliasName.indexOf('名称') > -1) {
                          var displayValue = Array.isArray(cellValue) ? cellValue.join(', ') : String(cellValue);
                          return <td key={col.alias} style={cellStyle}>{displayValue}</td>;
                        }

                        return <td key={col.alias} style={cellStyle}>{String(cellValue)}</td>;
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {tableTotal > tablePageSize && (
          <div style={styles.pagination}>
            <span style={styles.pageInfo}>
              第 {(tablePage - 1) * tablePageSize + 1}-{Math.min(tablePage * tablePageSize, tableTotal)} 条，共 {tableTotal} 条
            </span>
            <div style={styles.pageButtons}>
              <span
                style={styles.pageButton(false, tablePage <= 1)}
                onClick={(e) => { if (tablePage > 1) this.handleTablePageChange(tablePage - 1); }}
              >
                上一页
              </span>
              {pageButtonElements}
              <span
                style={styles.pageButton(false, tablePage >= totalPages)}
                onClick={(e) => { if (tablePage < totalPages) this.handleTablePageChange(tablePage + 1); }}
              >
                下一页
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
