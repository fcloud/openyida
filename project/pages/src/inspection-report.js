// ============================================================
// 巡检数据报表 - ECharts 自定义页面
// 基于原生报表 REPORT-WG966BA18BT3CSKMMOTLS4Z29G1M2HYIEUYMMK
// ============================================================

// --- 常量 ---
var REPORT_FORM_UUID = 'REPORT-WG966BA18BT3CSKMMOTLS4Z29G1M2HYIEUYMMK';
var DATA_FORM_UUID = 'FORM-F696F9ECD173453AAEC806BBEB3F496CYOBR';
var CUBE_CODE = 'FORM_F696F9ECD173453AAEC806BBEB3F496CYOBR';
var ECHARTS_CDN = 'https://g.alicdn.com/code/lib/echarts/5.4.3/echarts.min.js';

// 各组件的 cid、componentClassName、dataSetKey、filterKey
var COMP = {
  indicator: { cid: 'node_ocmmyuejfte', cname: '巡检核心指标', className: 'YoushuSimpleIndicatorCard', dataSetKey: 'youshuData', filterKey: 'filter-dd5cbb0c-3dee-443e-b97c-912152362f3e' },
  pie:       { cid: 'node_ocmmyuejftg', cname: '设备状态分布', className: 'YoushuPieChart', dataSetKey: 'chartData', filterKey: 'filter-21f42176-6752-4108-8900-560f08a06eb1' },
  barArea:   { cid: 'node_ocmmyuejfti', cname: '各区域巡检次数', className: 'YoushuGroupedBarChart', dataSetKey: 'chartData', filterKey: 'filter-527ad750-5e20-4b07-8934-054ebe4ece35' },
  barDevice: { cid: 'node_ocmmyuejftk', cname: '各设备巡检次数', className: 'YoushuGroupedBarChart', dataSetKey: 'chartData', filterKey: 'filter-8e38fe3d-7967-42bc-a825-b70b3d207ab2' },
  line:      { cid: 'node_ocmmyuejftm', cname: '巡检日期趋势', className: 'YoushuLineChart', dataSetKey: 'chartData', filterKey: 'filter-426a03b4-63a0-447f-a798-bc786a841d8b' },
};

// 配色
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

var CHART_COLORS = ['#3b82f6', '#0ea5e9', '#059669', '#d97706', '#dc2626', '#7c3aed', '#ec4899', '#64748b'];

// 设备状态颜色映射
var STATUS_COLORS = {
  '正常': '#059669',
  '异常': '#dc2626',
  '待维修': '#d97706',
  '已停用': '#94a3b8',
};

// --- 动态 prdId（通过 getFormNavigationListByOrder 获取 topicId）---
var _prdId = null;

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
        var targetNav = res.content.find(function(item) {
          return item.formUuid === REPORT_FORM_UUID;
        });
        if (targetNav && targetNav.topicId) {
          _prdId = targetNav.topicId;
          console.log('[报表] prdId(topicId) 获取成功（精确匹配）:', _prdId);
          return _prdId;
        }
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

// --- 状态 ---
var _customState = {
  loading: true,
  filterStatus: '全部',
  statusOptions: ['全部'],
  kpiData: { totalInspections: 0 },
  pieData: [],
  barAreaData: [],
  barDeviceData: [],
  lineData: [],
  detailData: [],
  detailCurrentPage: 1,
  detailPageSize: 10,
  detailTotalCount: 0,
  sortField: null,
  sortOrder: 'desc',
  chartInstances: {},
};

// --- 数据请求函数（var 声明，避免被 UglifyJS 消除）---
var _fetchReportData = function(compConfig, filterValueMap) {
  var appType = window.pageConfig && window.pageConfig.appType;
  var csrfToken = window.g_config && window.g_config._csrf_token;
  var body = new URLSearchParams({
    timezone: 'GMT+8',
    _tb_token_: csrfToken || '',
    _csrf_token: csrfToken || '',
    _csrf: csrfToken || '',
    prdId: _prdId,
    pageId: REPORT_FORM_UUID,
    pageName: 'report',
    cid: compConfig.cid,
    cname: compConfig.cname || '',
    componentClassName: compConfig.className,
    queryContext: JSON.stringify({ filterValueMap: filterValueMap || {}, dim2table: true }),
    dataSetKey: compConfig.dataSetKey,
  });
  var url = '/alibaba/web/' + appType + '/visual/visualizationDataRpc/getDataAsync.json';
  return fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    credentials: 'include',
  }).then(function(response) { return response.json(); })
    .then(function(result) {
      if (result.success) return result.content;
      throw new Error(result.errorMsg || '数据请求失败');
    });
};

var _buildFilterValueMap = function(statusValue, filterKey) {
  if (!statusValue || statusValue === '全部') return {};
  var map = {};
  map[filterKey] = [statusValue];
  return map;
};

var _parseChartData = function(content) {
  var data = content && content.data || [];
  var meta = content && content.meta || [];
  return { data: data, meta: meta };
};

var _formatDate = function(timestamp) {
  if (!timestamp) return '-';
  var date = new Date(Number(timestamp));
  if (isNaN(date.getTime())) return String(timestamp);
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
};

// ============================================================
// 状态管理
// ============================================================
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
// 生命周期
// ============================================================
export function didMount() {
  var self = this;
  this.utils.loadScript(ECHARTS_CDN).then(function() {
    self.loadAllData();
    window.addEventListener('resize', function() {
      self.handleResize();
    });
  }).catch(function(error) {
    self.utils.toast({ title: 'ECharts 加载失败: ' + error.message, type: 'error' });
  });
}

export function didUnmount() {
  var instances = _customState.chartInstances;
  Object.keys(instances).forEach(function(key) {
    if (instances[key]) {
      instances[key].dispose();
      instances[key] = null;
    }
  });
  window.removeEventListener('resize', this.handleResize);
}

export function handleResize() {
  var instances = _customState.chartInstances;
  Object.keys(instances).forEach(function(key) {
    if (instances[key]) instances[key].resize();
  });
}

// ============================================================
// 数据加载
// ============================================================
export function loadAllData() {
  var self = this;
  self.setCustomState({ loading: true });
  var filterStatus = _customState.filterStatus;

  // 先获取 prdId（topicId），再并行请求所有报表组件数据
  var prdIdPromise = _prdId ? Promise.resolve(_prdId) : _fetchPrdId();

  prdIdPromise.then(function() {
    console.log('[报表] prdId 获取成功:', _prdId);

    var promises = [
      _fetchReportData(COMP.indicator, _buildFilterValueMap(filterStatus, COMP.indicator.filterKey)),
      _fetchReportData(COMP.pie, _buildFilterValueMap(filterStatus, COMP.pie.filterKey)),
      _fetchReportData(COMP.barArea, _buildFilterValueMap(filterStatus, COMP.barArea.filterKey)),
      _fetchReportData(COMP.barDevice, _buildFilterValueMap(filterStatus, COMP.barDevice.filterKey)),
      _fetchReportData(COMP.line, _buildFilterValueMap(filterStatus, COMP.line.filterKey)),
    ];

    Promise.all(promises).then(function(results) {
      var indicatorResult = _parseChartData(results[0]);
      var pieResult = _parseChartData(results[1]);
      var barAreaResult = _parseChartData(results[2]);
      var barDeviceResult = _parseChartData(results[3]);
      var lineResult = _parseChartData(results[4]);

      // 提取 KPI
      var totalInspections = 0;
      if (indicatorResult.data.length > 0) {
        var kpiMeta = indicatorResult.meta;
        var measureAlias = kpiMeta.length > 0 ? kpiMeta[0].alias : '';
        totalInspections = Number(indicatorResult.data[0][measureAlias]) || 0;
      }

      // 提取状态选项（从饼图数据）
      var pieMeta = pieResult.meta;
      var pieDimAlias = pieMeta[0] ? pieMeta[0].alias : '';
      var pieMeasureAlias = pieMeta[1] ? pieMeta[1].alias : '';
      var statusOptions = ['全部'];
      pieResult.data.forEach(function(row) {
        var statusName = row[pieDimAlias];
        if (statusName && statusOptions.indexOf(statusName) === -1) {
          statusOptions.push(statusName);
        }
      });

      self.setCustomState({
        loading: false,
        kpiData: { totalInspections: totalInspections },
        pieData: pieResult,
        barAreaData: barAreaResult,
        barDeviceData: barDeviceResult,
        lineData: lineResult,
        statusOptions: statusOptions,
      });

      setTimeout(function() {
        self.renderPieChart();
        self.renderBarAreaChart();
        self.renderBarDeviceChart();
        self.renderLineChart();
      }, 100);

      self.loadDetailData();
    }).catch(function(error) {
      self.setCustomState({ loading: false });
      self.utils.toast({ title: '数据加载失败: ' + error.message, type: 'error' });
    });
  }).catch(function(error) {
    self.setCustomState({ loading: false });
    self.utils.toast({ title: 'prdId 获取失败: ' + error.message, type: 'error' });
  });
}

export function loadDetailData() {
  var self = this;
  var currentPage = _customState.detailCurrentPage;
  var pageSize = _customState.detailPageSize;

  this.utils.yida.searchFormDatas({
    formUuid: DATA_FORM_UUID,
    currentPage: currentPage,
    pageSize: pageSize,
  }).then(function(res) {
    self.setCustomState({
      detailData: res.data || [],
      detailTotalCount: res.totalCount || 0,
    });
  }).catch(function(error) {
    self.utils.toast({ title: '明细数据加载失败: ' + error.message, type: 'error' });
  });
}

export function onFilterChange(statusValue) {
  _customState.filterStatus = statusValue;
  _customState.detailCurrentPage = 1;
  this.forceUpdate();
  this.loadAllData();
}

export function onDetailPageChange(page) {
  _customState.detailCurrentPage = page;
  this.forceUpdate();
  this.loadDetailData();
}

export function onSortChange(field) {
  if (_customState.sortField === field) {
    _customState.sortOrder = _customState.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    _customState.sortField = field;
    _customState.sortOrder = 'desc';
  }
  this.forceUpdate();
}

// ============================================================
// 图表渲染
// ============================================================
export function renderPieChart() {
  var container = document.getElementById('chart-pie');
  if (!container || !window.echarts) return;
  if (_customState.chartInstances.pie) _customState.chartInstances.pie.dispose();
  var chart = window.echarts.init(container);
  _customState.chartInstances.pie = chart;

  var result = _customState.pieData;
  var meta = result.meta || [];
  var data = result.data || [];
  var dimAlias = meta[0] ? meta[0].alias : '';
  var measureAlias = meta[1] ? meta[1].alias : '';

  var seriesData = data.map(function(row) {
    var name = row[dimAlias] || '未知';
    return {
      name: name,
      value: Number(row[measureAlias]) || 0,
      itemStyle: { color: STATUS_COLORS[name] || undefined },
    };
  });

  chart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: 'transparent',
      textStyle: { color: '#fff', fontSize: 13 },
      borderRadius: 8,
      padding: [10, 14],
      formatter: function(params) {
        return '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + params.color + ';margin-right:6px;"></span>' + params.name + '<br/>数量: <b>' + params.value + '</b> (' + params.percent + '%)';
      },
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: PALETTE.textSecondary, fontSize: 12 },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 11, color: PALETTE.textSecondary },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' },
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.2)' },
      },
      data: seriesData,
    }],
    color: CHART_COLORS,
  });
}

export function renderBarAreaChart() {
  var container = document.getElementById('chart-bar-area');
  if (!container || !window.echarts) return;
  if (_customState.chartInstances.barArea) _customState.chartInstances.barArea.dispose();
  var chart = window.echarts.init(container);
  _customState.chartInstances.barArea = chart;

  var result = _customState.barAreaData;
  var meta = result.meta || [];
  var data = result.data || [];
  var dimAlias = meta[0] ? meta[0].alias : '';
  var measureAlias = meta[1] ? meta[1].alias : '';

  var categories = data.map(function(row) { return row[dimAlias] || ''; });
  var values = data.map(function(row) { return Number(row[measureAlias]) || 0; });

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: 'transparent',
      textStyle: { color: '#fff', fontSize: 13 },
      borderRadius: 8,
      padding: [10, 14],
      axisPointer: { type: 'shadow' },
    },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: PALETTE.textMuted, fontSize: 11, rotate: categories.length > 6 ? 30 : 0 },
      axisLine: { lineStyle: { color: PALETTE.border } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: PALETTE.textMuted, fontSize: 11 },
      splitLine: { lineStyle: { color: '#f1f5f9', type: [4, 4] } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [{
      type: 'bar',
      data: values,
      barWidth: '45%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#3b82f6' },
          { offset: 1, color: '#93c5fd' },
        ]),
      },
      emphasis: { itemStyle: { color: '#2563eb' } },
      label: { show: true, position: 'top', color: PALETTE.textSecondary, fontSize: 11 },
    }],
  });
}

export function renderBarDeviceChart() {
  var container = document.getElementById('chart-bar-device');
  if (!container || !window.echarts) return;
  if (_customState.chartInstances.barDevice) _customState.chartInstances.barDevice.dispose();
  var chart = window.echarts.init(container);
  _customState.chartInstances.barDevice = chart;

  var result = _customState.barDeviceData;
  var meta = result.meta || [];
  var data = result.data || [];
  var dimAlias = meta[0] ? meta[0].alias : '';
  var measureAlias = meta[1] ? meta[1].alias : '';

  var categories = data.map(function(row) { return row[dimAlias] || ''; });
  var values = data.map(function(row) { return Number(row[measureAlias]) || 0; });

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: 'transparent',
      textStyle: { color: '#fff', fontSize: 13 },
      borderRadius: 8,
      padding: [10, 14],
      axisPointer: { type: 'shadow' },
    },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: PALETTE.textMuted, fontSize: 11, rotate: categories.length > 6 ? 30 : 0 },
      axisLine: { lineStyle: { color: PALETTE.border } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: PALETTE.textMuted, fontSize: 11 },
      splitLine: { lineStyle: { color: '#f1f5f9', type: [4, 4] } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [{
      type: 'bar',
      data: values,
      barWidth: '45%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#0ea5e9' },
          { offset: 1, color: '#7dd3fc' },
        ]),
      },
      emphasis: { itemStyle: { color: '#0284c7' } },
      label: { show: true, position: 'top', color: PALETTE.textSecondary, fontSize: 11 },
    }],
  });
}

export function renderLineChart() {
  var container = document.getElementById('chart-line');
  if (!container || !window.echarts) return;
  if (_customState.chartInstances.line) _customState.chartInstances.line.dispose();
  var chart = window.echarts.init(container);
  _customState.chartInstances.line = chart;

  var result = _customState.lineData;
  var meta = result.meta || [];
  var data = result.data || [];
  var dimAlias = meta[0] ? meta[0].alias : '';
  var measureAlias = meta[1] ? meta[1].alias : '';

  var categories = data.map(function(row) { return _formatDate(row[dimAlias]); });
  var values = data.map(function(row) { return Number(row[measureAlias]) || 0; });

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: 'transparent',
      textStyle: { color: '#fff', fontSize: 13 },
      borderRadius: 8,
      padding: [10, 14],
    },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: categories,
      boundaryGap: false,
      axisLabel: { color: PALETTE.textMuted, fontSize: 11, rotate: categories.length > 10 ? 45 : 0 },
      axisLine: { lineStyle: { color: PALETTE.border } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: PALETTE.textMuted, fontSize: 11 },
      splitLine: { lineStyle: { color: '#f1f5f9', type: [4, 4] } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [{
      type: 'line',
      data: values,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 3, color: '#3b82f6' },
      itemStyle: { color: '#3b82f6', borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59, 130, 246, 0.25)' },
          { offset: 1, color: 'rgba(59, 130, 246, 0.02)' },
        ]),
      },
      emphasis: { itemStyle: { borderWidth: 3, shadowBlur: 8, shadowColor: 'rgba(59, 130, 246, 0.4)' } },
      label: { show: true, position: 'top', color: PALETTE.textSecondary, fontSize: 11 },
    }],
  });
}

// ============================================================
// 渲染
// ============================================================
export function renderJsx() {
  var timestamp = this.state.timestamp;
  var isMobile = this.utils.isMobile();
  var loading = _customState.loading;
  var kpiData = _customState.kpiData;
  var filterStatus = _customState.filterStatus;
  var statusOptions = _customState.statusOptions;
  var detailData = _customState.detailData;
  var detailCurrentPage = _customState.detailCurrentPage;
  var detailPageSize = _customState.detailPageSize;
  var detailTotalCount = _customState.detailTotalCount;
  var sortField = _customState.sortField;
  var sortOrder = _customState.sortOrder;
  var self = this;

  // 计算附加 KPI
  var pieData = _customState.pieData;
  var pieMeta = pieData.meta || [];
  var pieRows = pieData.data || [];
  var pieDimAlias = pieMeta[0] ? pieMeta[0].alias : '';
  var pieMeasureAlias = pieMeta[1] ? pieMeta[1].alias : '';
  var normalCount = 0;
  var abnormalCount = 0;
  pieRows.forEach(function(row) {
    var name = row[pieDimAlias] || '';
    var count = Number(row[pieMeasureAlias]) || 0;
    if (name === '正常') normalCount = count;
    else if (name === '异常') abnormalCount = count;
  });
  var normalRate = kpiData.totalInspections > 0 ? ((normalCount / kpiData.totalInspections) * 100).toFixed(1) : '0.0';

  // 排序明细数据
  var sortedDetail = detailData.slice();
  if (sortField && sortedDetail.length > 0) {
    sortedDetail.sort(function(a, b) {
      var valA = (a.formData || {})[sortField] || '';
      var valB = (b.formData || {})[sortField] || '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      var strA = String(valA);
      var strB = String(valB);
      return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }

  // 分页计算
  var totalPages = Math.ceil(detailTotalCount / detailPageSize) || 1;

  // --- 样式定义 ---
  var styles = {
    page: { background: PALETTE.bg, minHeight: '100vh', padding: isMobile ? '12px' : '20px 24px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif', borderRadius: 0 },
    header: { marginBottom: isMobile ? 16 : 24 },
    title: { fontSize: isMobile ? 20 : 26, fontWeight: 700, color: PALETTE.textPrimary, margin: 0, letterSpacing: '-0.02em' },
    subtitle: { fontSize: 13, color: PALETTE.textMuted, marginTop: 4 },
    filterBar: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: isMobile ? 16 : 20, flexWrap: 'wrap' },
    filterLabel: { fontSize: 13, color: PALETTE.textSecondary, fontWeight: 500 },
    filterBtn: function(active) {
      return {
        padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
        background: active ? PALETTE.primaryLight : '#fff',
        color: active ? '#fff' : PALETTE.textSecondary,
        boxShadow: active ? '0 2px 8px rgba(59,130,246,0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
      };
    },
    kpiRow: { display: 'flex', gap: isMobile ? 8 : 16, marginBottom: isMobile ? 16 : 20, flexWrap: 'wrap' },
    kpiCard: function(color) {
      return {
        flex: isMobile ? '1 1 calc(50% - 4px)' : '1 1 0',
        background: PALETTE.cardBg, borderRadius: 10, padding: isMobile ? '14px 12px' : '18px 20px',
        border: '1px solid ' + PALETTE.border, position: 'relative', overflow: 'hidden',
      };
    },
    kpiAccent: function(color) {
      return { position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: color, borderRadius: '10px 0 0 10px' };
    },
    kpiLabel: { fontSize: 12, color: PALETTE.textMuted, marginBottom: 6, fontWeight: 500 },
    kpiValue: { fontSize: 26, fontWeight: 700, color: PALETTE.textPrimary, fontFeatureSettings: '"tnum"', lineHeight: 1.2 },
    kpiUnit: { fontSize: 13, color: PALETTE.textMuted, fontWeight: 400, marginLeft: 4 },
    chartRow: { display: 'flex', gap: isMobile ? 8 : 16, marginBottom: isMobile ? 8 : 16, flexWrap: 'wrap' },
    chartCard: function(widthPercent) {
      return {
        flex: isMobile ? '1 1 100%' : '1 1 ' + widthPercent,
        background: PALETTE.cardBg, borderRadius: 10, padding: isMobile ? 12 : 16,
        border: '1px solid ' + PALETTE.border, minWidth: 0,
      };
    },
    chartTitle: { fontSize: 14, fontWeight: 600, color: PALETTE.textPrimary, marginBottom: 12 },
    chartContainer: { width: '100%', height: isMobile ? 260 : 300 },
    tableCard: { background: PALETTE.cardBg, borderRadius: 10, padding: isMobile ? 12 : 16, border: '1px solid ' + PALETTE.border },
    tableTitle: { fontSize: 14, fontWeight: 600, color: PALETTE.textPrimary, marginBottom: 12 },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: PALETTE.textSecondary, fontSize: 12, borderBottom: '2px solid ' + PALETTE.border, background: '#f8fafc', whiteSpace: 'nowrap', cursor: 'pointer' },
    td: { padding: '10px 12px', borderBottom: '1px solid ' + PALETTE.border, color: PALETTE.textSecondary, fontSize: 13 },
    statusBadge: function(status) {
      var color = STATUS_COLORS[status] || PALETTE.neutral;
      return {
        display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, lineHeight: '18px',
        color: color, background: color + '14', border: '1px solid ' + color + '30',
      };
    },
    detailLink: { color: '#3b82f6', fontSize: 12, textDecoration: 'none', cursor: 'pointer', fontWeight: 500 },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 12 },
    pageBtn: function(active, disabled) {
      return {
        padding: '4px 10px', borderRadius: 4, fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer', border: '1px solid ' + PALETTE.border,
        background: active ? PALETTE.primaryLight : '#fff', color: active ? '#fff' : (disabled ? PALETTE.textMuted : PALETTE.textSecondary),
        opacity: disabled ? 0.5 : 1,
      };
    },
    loadingOverlay: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 60, color: PALETTE.textMuted, fontSize: 14 },
  };

  // 获取详情页 URL
  var getDetailUrl = function(formInstId) {
    var appType = window.pageConfig && window.pageConfig.appType;
    if (!appType || !formInstId) return '';
    return 'https://www.aliwork.com/' + appType + '/formDetail/' + DATA_FORM_UUID + '?formInstId=' + formInstId;
  };

  // 排序图标
  var getSortIcon = function(field) {
    if (sortField !== field) return ' ↕';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  // 生成分页按钮
  var pageButtons = [];
  for (var pageIdx = 1; pageIdx <= totalPages && pageIdx <= 7; pageIdx++) {
    pageButtons.push(pageIdx);
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ display: 'none' }}>{timestamp}</div>
        <div style={styles.loadingOverlay}>
          <span>📊 数据加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={{ display: 'none' }}>{timestamp}</div>

      {/* 页面标题 */}
      <div style={styles.header}>
        <h2 style={styles.title}>巡检数据报表</h2>
        <div style={styles.subtitle}>设备巡检数据统计与分析</div>
      </div>

      {/* 筛选栏 */}
      <div style={styles.filterBar}>
        <span style={styles.filterLabel}>设备状态：</span>
        {statusOptions.map(function(option) {
          return (
            <button
              key={option}
              style={styles.filterBtn(filterStatus === option)}
              onClick={(e) => { self.onFilterChange(option); }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* KPI 指标卡 */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiCard(PALETTE.primaryLight)}>
          <div style={styles.kpiAccent(PALETTE.primaryLight)}></div>
          <div style={{ paddingLeft: 12 }}>
            <div style={styles.kpiLabel}>总巡检次数</div>
            <div style={styles.kpiValue}>
              {kpiData.totalInspections}
              <span style={styles.kpiUnit}>次</span>
            </div>
          </div>
        </div>
        <div style={styles.kpiCard(PALETTE.success)}>
          <div style={styles.kpiAccent(PALETTE.success)}></div>
          <div style={{ paddingLeft: 12 }}>
            <div style={styles.kpiLabel}>正常设备</div>
            <div style={styles.kpiValue}>
              {normalCount}
              <span style={styles.kpiUnit}>次</span>
            </div>
          </div>
        </div>
        <div style={styles.kpiCard(PALETTE.danger)}>
          <div style={styles.kpiAccent(PALETTE.danger)}></div>
          <div style={{ paddingLeft: 12 }}>
            <div style={styles.kpiLabel}>异常设备</div>
            <div style={styles.kpiValue}>
              {abnormalCount}
              <span style={styles.kpiUnit}>次</span>
            </div>
          </div>
        </div>
        <div style={styles.kpiCard(PALETTE.accent)}>
          <div style={styles.kpiAccent(PALETTE.accent)}></div>
          <div style={{ paddingLeft: 12 }}>
            <div style={styles.kpiLabel}>正常率</div>
            <div style={styles.kpiValue}>
              {normalRate}
              <span style={styles.kpiUnit}>%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 图表区域 - 第一行：饼图 + 区域柱状图 */}
      <div style={styles.chartRow}>
        <div style={styles.chartCard('48%')}>
          <div style={styles.chartTitle}>设备状态分布</div>
          <div id="chart-pie" style={styles.chartContainer}></div>
        </div>
        <div style={styles.chartCard('48%')}>
          <div style={styles.chartTitle}>各区域巡检次数</div>
          <div id="chart-bar-area" style={styles.chartContainer}></div>
        </div>
      </div>

      {/* 图表区域 - 第二行：设备柱状图 + 趋势折线图 */}
      <div style={styles.chartRow}>
        <div style={styles.chartCard('48%')}>
          <div style={styles.chartTitle}>各设备巡检次数</div>
          <div id="chart-bar-device" style={styles.chartContainer}></div>
        </div>
        <div style={styles.chartCard('48%')}>
          <div style={styles.chartTitle}>巡检日期趋势</div>
          <div id="chart-line" style={styles.chartContainer}></div>
        </div>
      </div>

      {/* 数据明细表格 */}
      <div style={styles.tableCard}>
        <div style={styles.tableTitle}>巡检数据明细（共 {detailTotalCount} 条）</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th} onClick={(e) => { self.onSortChange('textField_pq063xees'); }}>巡检项目{getSortIcon('textField_pq063xees')}</th>
                <th style={styles.th} onClick={(e) => { self.onSortChange('selectField_pq062vhhm'); }}>设备名称{getSortIcon('selectField_pq062vhhm')}</th>
                <th style={styles.th} onClick={(e) => { self.onSortChange('selectField_pq0647gqt'); }}>巡检区域{getSortIcon('selectField_pq0647gqt')}</th>
                <th style={styles.th} onClick={(e) => { self.onSortChange('radioField_pq067njt6'); }}>设备状态{getSortIcon('radioField_pq067njt6')}</th>
                <th style={styles.th} onClick={(e) => { self.onSortChange('dateField_pq066npit'); }}>巡检日期{getSortIcon('dateField_pq066npit')}</th>
                <th style={Object.assign({}, styles.th, { cursor: 'default' })}>操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedDetail.length === 0 ? (
                <tr>
                  <td colSpan={6} style={Object.assign({}, styles.td, { textAlign: 'center', padding: 40, color: PALETTE.textMuted })}>暂无数据</td>
                </tr>
              ) : sortedDetail.map(function(item, index) {
                var formData = item.formData || {};
                var rowBg = index % 2 === 0 ? '#fff' : '#f8fafc';
                var statusValue = formData.radioField_pq067njt6 || '-';
                return (
                  <tr key={item.formInstId || index} style={{ background: rowBg }}>
                    <td style={styles.td}>{formData.textField_pq063xees || '-'}</td>
                    <td style={styles.td}>{formData.selectField_pq062vhhm || '-'}</td>
                    <td style={styles.td}>{formData.selectField_pq0647gqt || '-'}</td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge(statusValue)}>{statusValue}</span>
                    </td>
                    <td style={styles.td}>{_formatDate(formData.dateField_pq066npit)}</td>
                    <td style={styles.td}>
                      <a style={styles.detailLink} href={getDetailUrl(item.formInstId)} target="_blank" rel="noopener">详情</a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 分页器 */}
        {detailTotalCount > detailPageSize && (
          <div style={styles.pagination}>
            <button
              style={styles.pageBtn(false, detailCurrentPage <= 1)}
              onClick={(e) => { if (detailCurrentPage > 1) self.onDetailPageChange(detailCurrentPage - 1); }}
            >上一页</button>
            {pageButtons.map(function(pageNum) {
              return (
                <button
                  key={pageNum}
                  style={styles.pageBtn(detailCurrentPage === pageNum, false)}
                  onClick={(e) => { self.onDetailPageChange(pageNum); }}
                >{pageNum}</button>
              );
            })}
            {totalPages > 7 && <span style={{ color: PALETTE.textMuted, fontSize: 12 }}>...</span>}
            <button
              style={styles.pageBtn(false, detailCurrentPage >= totalPages)}
              onClick={(e) => { if (detailCurrentPage < totalPages) self.onDetailPageChange(detailCurrentPage + 1); }}
            >下一页</button>
          </div>
        )}
      </div>
    </div>
  );
}
