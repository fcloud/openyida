// ============================================================
// 任务管理报表 Dashboard
// 基于表单数据的多维度分析看板
// 包含：KPI 指标卡 + 状态分布饼图 + 项目柱状图 + 月度趋势折线图 + 数据明细表格
// ============================================================

var ECHARTS_CDN = 'https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js';
var FORM_UUID = 'FORM-C390F55E49DA4B1BB7EE5F7DE687A2054OG1';

var FIELD = {
  taskName: 'textField_jr2gbmkf',
  taskDesc: 'textareaField_jr2gs3re',
  project: 'textField_jr2gsc5g',
  startDate: 'dateField_jr2gufqh',
  endDate: 'dateField_jr2gjkqm',
  status: 'selectField_jr2g93k9',
  priority: 'selectField_jr2hz8wp',
  progress: 'rateField_jr2h5mft',
};

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
  '未开始': '#94a3b8',
  '进行中': '#3b82f6',
  '已完成': '#059669',
  '已延期': '#dc2626',
  '已取消': '#64748b',
};

var PRIORITY_COLORS = {
  '高': '#dc2626',
  '中': '#d97706',
  '低': '#059669',
};

var CHART_COLORS = ['#3b82f6', '#059669', '#d97706', '#dc2626', '#8b5cf6', '#0ea5e9', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];

// ============================================================
// 状态管理
// ============================================================

var _customState = {
  loading: true,
  allData: [],
  totalCount: 0,
  filterStatus: '全部',
  filterPriority: '全部',
  filterProject: '全部',
  chartIds: ['chart-status-pie', 'chart-project-bar', 'chart-trend-line', 'chart-priority-pie'],
  tablePage: 1,
  tablePageSize: 10,
  sortField: '',
  sortOrder: 'desc',
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
// 生命周期
// ============================================================

export function didMount() {
  this.loadECharts();
}

export function didUnmount() {
  var chartIds = _customState.chartIds || [];
  chartIds.forEach(function(domId) {
    var container = document.getElementById(domId);
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
// ECharts 加载
// ============================================================

export function loadECharts() {
  if (window.echarts) {
    this.bindChartResize();
    this.loadAllData();
    return;
  }
  this.utils.loadScript(ECHARTS_CDN)
    .then(function() {
      this.bindChartResize();
      this.loadAllData();
    }.bind(this))
    .catch(function() {
      this.utils.toast({ title: 'ECharts 加载失败，请刷新重试', type: 'error' });
      this.setCustomState({ loading: false });
    }.bind(this));
}

export function bindChartResize() {
  this._resizeHandler = function() {
    var chartIds = _customState.chartIds || [];
    chartIds.forEach(function(domId) {
      var container = document.getElementById(domId);
      if (container) {
        var instance = window.echarts.getInstanceByDom(container);
        if (instance) instance.resize();
      }
    });
  }.bind(this);
  window.addEventListener('resize', this._resizeHandler);
}

// ============================================================
// 数据获取
// ============================================================

export function loadAllData() {
  this.setCustomState({ loading: true });
  this.fetchAllFormData(FORM_UUID)
    .then(function(dataList) {
      this.setCustomState({
        loading: false,
        allData: dataList,
        totalCount: dataList.length,
        tablePage: 1,
      });
      setTimeout(function() {
        this.renderAllCharts();
      }.bind(this), 100);
    }.bind(this))
    .catch(function(error) {
      this.utils.toast({ title: '数据加载失败: ' + error.message, type: 'error' });
      this.setCustomState({ loading: false });
    }.bind(this));
}

export function fetchAllFormData(formUuid) {
  var allData = [];
  var pageSize = 100;

  var fetchPage = function(currentPage) {
    return this.utils.yida.searchFormDatas({
      formUuid: formUuid,
      currentPage: currentPage,
      pageSize: pageSize,
    }).then(function(res) {
      allData = allData.concat(res.data || []);
      var totalCount = res.totalCount || 0;
      if (currentPage * pageSize < totalCount) {
        return fetchPage.call(this, currentPage + 1);
      }
      return allData;
    }.bind(this));
  }.bind(this);

  return fetchPage(1);
}

// ============================================================
// 筛选
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
  if (_customState.filterProject !== '全部') {
    data = data.filter(function(item) {
      return (item.formData || {})[FIELD.project] === _customState.filterProject;
    });
  }
  return data;
}

export function onFilterChange(filterKey, value) {
  _customState[filterKey] = value;
  _customState.tablePage = 1;
  this.forceUpdate();
  setTimeout(function() {
    this.renderAllCharts();
  }.bind(this), 50);
}

// ============================================================
// 数据聚合
// ============================================================

export function groupCount(dataList, fieldId) {
  var result = {};
  dataList.forEach(function(item) {
    var value = (item.formData || {})[fieldId];
    if (value === undefined || value === null || value === '') return;
    var key = String(value);
    result[key] = (result[key] || 0) + 1;
  });
  return result;
}

export function groupByMonth(dataList, dateFieldId) {
  var result = {};
  dataList.forEach(function(item) {
    var timestamp = (item.formData || {})[dateFieldId];
    if (!timestamp) return;
    var date = new Date(Number(timestamp));
    if (isNaN(date.getTime())) return;
    var month = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    result[month] = (result[month] || 0) + 1;
  });
  return result;
}

export function calcAvgProgress(dataList) {
  if (dataList.length === 0) return 0;
  var total = 0;
  var count = 0;
  dataList.forEach(function(item) {
    var val = Number((item.formData || {})[FIELD.progress]);
    if (!isNaN(val) && val > 0) {
      total += val;
      count++;
    }
  });
  return count > 0 ? (total / count).toFixed(1) : 0;
}

// ============================================================
// 图表渲染
// ============================================================

export function renderAllCharts() {
  if (!window.echarts) return;
  var filteredData = this.getFilteredData();
  this.renderStatusPie(filteredData);
  this.renderProjectBar(filteredData);
  this.renderTrendLine(filteredData);
  this.renderPriorityPie(filteredData);
}

export function createChart(domId) {
  var container = document.getElementById(domId);
  if (!container) return null;
  var existingInstance = window.echarts.getInstanceByDom(container);
  if (existingInstance) existingInstance.dispose();
  return window.echarts.init(container);
}

export function renderStatusPie(dataList) {
  var chart = this.createChart('chart-status-pie');
  if (!chart) return;

  var statusData = this.groupCount(dataList, FIELD.status);
  var pieData = Object.keys(statusData).map(function(key) {
    return {
      name: key,
      value: statusData[key],
      itemStyle: { color: STATUS_COLORS[key] || '#94a3b8' },
    };
  });

  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', backgroundColor: 'rgba(15, 23, 42, 0.92)', borderColor: 'transparent', textStyle: { color: '#fff', fontSize: 13 }, borderRadius: 8 },
    legend: { bottom: 0, type: 'scroll', textStyle: { color: PALETTE.textSecondary, fontSize: 12 } },
    series: [{
      type: 'pie',
      radius: ['42%', '72%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 11, color: PALETTE.textSecondary },
      data: pieData,
    }],
  });
}

export function renderPriorityPie(dataList) {
  var chart = this.createChart('chart-priority-pie');
  if (!chart) return;

  var priorityData = this.groupCount(dataList, FIELD.priority);
  var pieData = Object.keys(priorityData).map(function(key) {
    return {
      name: key + '优先级',
      value: priorityData[key],
      itemStyle: { color: PRIORITY_COLORS[key] || '#94a3b8' },
    };
  });

  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', backgroundColor: 'rgba(15, 23, 42, 0.92)', borderColor: 'transparent', textStyle: { color: '#fff', fontSize: 13 }, borderRadius: 8 },
    legend: { bottom: 0, type: 'scroll', textStyle: { color: PALETTE.textSecondary, fontSize: 12 } },
    series: [{
      type: 'pie',
      radius: ['42%', '72%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 11, color: PALETTE.textSecondary },
      data: pieData,
    }],
  });
}

export function renderProjectBar(dataList) {
  var chart = this.createChart('chart-project-bar');
  if (!chart) return;

  var projectData = this.groupCount(dataList, FIELD.project);
  var sorted = Object.keys(projectData).sort(function(a, b) { return projectData[b] - projectData[a]; });
  var topProjects = sorted.slice(0, 10);
  var values = topProjects.map(function(key) { return projectData[key]; });
  var isMobile = this.utils.isMobile();

  chart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15, 23, 42, 0.92)', borderColor: 'transparent', textStyle: { color: '#fff', fontSize: 13 }, borderRadius: 8 },
    grid: { left: '3%', right: '6%', bottom: '8%', top: '12%', containLabel: true },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f1f5f9', type: [4, 4] } },
      axisLabel: { color: PALETTE.textMuted, fontSize: 12 },
    },
    yAxis: {
      type: 'category',
      data: topProjects.reverse(),
      axisLabel: {
        color: PALETTE.textSecondary,
        fontSize: isMobile ? 10 : 12,
        width: isMobile ? 80 : 120,
        overflow: 'truncate',
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [{
      type: 'bar',
      data: values.reverse(),
      barMaxWidth: 24,
      itemStyle: {
        color: function(params) { return CHART_COLORS[params.dataIndex % CHART_COLORS.length]; },
        borderRadius: [0, 4, 4, 0],
      },
      label: { show: true, position: 'right', color: PALETTE.textSecondary, fontSize: 12 },
    }],
  });
}

export function renderTrendLine(dataList) {
  var chart = this.createChart('chart-trend-line');
  if (!chart) return;

  var monthlyData = this.groupByMonth(dataList, FIELD.startDate);
  var months = Object.keys(monthlyData).sort();
  var values = months.map(function(m) { return monthlyData[m]; });
  var displayMonths = months.map(function(m) { return m.substring(2); });

  chart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15, 23, 42, 0.92)', borderColor: 'transparent', textStyle: { color: '#fff', fontSize: 13 }, borderRadius: 8 },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: displayMonths,
      boundaryGap: false,
      axisLabel: { color: PALETTE.textMuted, fontSize: 12 },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f1f5f9', type: [4, 4] } },
      axisLabel: { color: PALETTE.textMuted, fontSize: 12 },
    },
    series: [{
      type: 'line',
      data: values,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59, 130, 246, 0.25)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.02)' },
          ],
        },
      },
      lineStyle: { color: PALETTE.primaryLight, width: 2.5 },
      itemStyle: { color: PALETTE.primaryLight, borderColor: '#fff', borderWidth: 2 },
    }],
  });
}

// ============================================================
// 表格排序与分页
// ============================================================

export function onTableSort(field) {
  if (_customState.sortField === field) {
    _customState.sortOrder = _customState.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    _customState.sortField = field;
    _customState.sortOrder = 'desc';
  }
  _customState.tablePage = 1;
  this.forceUpdate();
}

export function onTablePageChange(page) {
  _customState.tablePage = page;
  this.forceUpdate();
}

export function getDetailUrl(formInstId) {
  var appType = window.pageConfig && window.pageConfig.appType;
  if (!appType || !formInstId) return '';
  return 'https://www.aliwork.com/' + appType + '/formDetail/' + FORM_UUID + '?formInstId=' + formInstId;
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

export function getSortedTableData() {
  var data = this.getFilteredData();
  var sortField = _customState.sortField;
  var sortOrder = _customState.sortOrder;

  if (sortField) {
    data = data.slice().sort(function(a, b) {
      var valA = (a.formData || {})[sortField];
      var valB = (b.formData || {})[sortField];
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';
      var numA = Number(valA);
      var numB = Number(valB);
      var result = 0;
      if (!isNaN(numA) && !isNaN(numB)) {
        result = numA - numB;
      } else {
        result = String(valA).localeCompare(String(valB));
      }
      return sortOrder === 'asc' ? result : -result;
    });
  }
  return data;
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var timestamp = this.state.timestamp;
  var isMobile = this.utils.isMobile();
  var loading = _customState.loading;
  var filteredData = loading ? [] : this.getFilteredData();
  var allData = _customState.allData;

  var totalCount = filteredData.length;
  var statusCounts = loading ? {} : this.groupCount(filteredData, FIELD.status);
  var completedCount = statusCounts['已完成'] || 0;
  var inProgressCount = statusCounts['进行中'] || 0;
  var delayedCount = statusCounts['已延期'] || 0;
  var completionRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : '0.0';
  var avgProgress = loading ? 0 : this.calcAvgProgress(filteredData);

  var projectSet = {};
  allData.forEach(function(item) {
    var proj = (item.formData || {})[FIELD.project];
    if (proj) projectSet[proj] = true;
  });
  var projectList = Object.keys(projectSet).sort();

  var sortedData = loading ? [] : this.getSortedTableData();
  var tablePage = _customState.tablePage;
  var tablePageSize = _customState.tablePageSize;
  var totalPages = Math.ceil(sortedData.length / tablePageSize) || 1;
  var pageData = sortedData.slice((tablePage - 1) * tablePageSize, tablePage * tablePageSize);

  var styles = {
    page: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      backgroundColor: PALETTE.bg,
      minHeight: '100vh',
      padding: isMobile ? '12px' : '24px 32px',
      borderRadius: '0 !important',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
      marginBottom: isMobile ? '16px' : '24px',
      gap: '12px',
    },
    title: { fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: PALETTE.textPrimary, letterSpacing: '-0.02em' },
    subtitle: { fontSize: '13px', color: PALETTE.textMuted, marginTop: '4px' },
    refreshBtn: { padding: '8px 20px', backgroundColor: PALETTE.primaryLight, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' },
    filterBar: { display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: isMobile ? '16px' : '20px', alignItems: 'center' },
    filterLabel: { fontSize: '13px', color: PALETTE.textSecondary, fontWeight: 600 },
    filterSelect: { padding: '6px 12px', borderRadius: '6px', border: '1px solid ' + PALETTE.border, fontSize: '13px', color: PALETTE.textPrimary, backgroundColor: '#fff', outline: 'none', cursor: 'pointer', minWidth: '100px' },
    kpiRow: { display: 'flex', flexWrap: 'wrap', gap: isMobile ? '8px' : '16px', marginBottom: isMobile ? '16px' : '24px' },
    kpiCard: { flex: isMobile ? '1 1 45%' : '1 1 0', backgroundColor: PALETTE.cardBg, borderRadius: '10px', padding: isMobile ? '14px' : '20px', border: '1px solid ' + PALETTE.border },
    kpiLabel: { fontSize: '12px', color: PALETTE.textMuted, marginBottom: '6px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' },
    kpiValue: { fontSize: isMobile ? '22px' : '26px', fontWeight: 700, color: PALETTE.textPrimary, fontFeatureSettings: '"tnum"' },
    chartsRow: { display: 'flex', flexWrap: 'wrap', gap: isMobile ? '8px' : '16px', marginBottom: isMobile ? '16px' : '24px' },
    chartCard: { flex: isMobile ? '1 1 100%' : '1 1 48%', backgroundColor: PALETTE.cardBg, borderRadius: '10px', padding: isMobile ? '14px' : '20px', border: '1px solid ' + PALETTE.border },
    chartTitle: { fontSize: '14px', fontWeight: 600, color: PALETTE.textPrimary, marginBottom: '12px' },
    tableCard: { backgroundColor: PALETTE.cardBg, borderRadius: '10px', padding: isMobile ? '12px' : '20px', border: '1px solid ' + PALETTE.border },
    tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    tableTitle: { fontSize: '14px', fontWeight: 600, color: PALETTE.textPrimary },
    tableCount: { fontSize: '12px', color: PALETTE.textMuted },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: PALETTE.textSecondary, fontSize: '12px', borderBottom: '2px solid ' + PALETTE.border, background: PALETTE.bg, whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' },
    td: { padding: '10px 12px', borderBottom: '1px solid ' + PALETTE.border, color: PALETTE.textSecondary, fontSize: '13px' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '16px' },
    pageBtn: { padding: '6px 12px', border: '1px solid ' + PALETTE.border, borderRadius: '6px', backgroundColor: '#fff', color: PALETTE.textSecondary, cursor: 'pointer', fontSize: '12px' },
    pageBtnActive: { padding: '6px 12px', border: '1px solid ' + PALETTE.primaryLight, borderRadius: '6px', backgroundColor: PALETTE.primaryLight, color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
    pageBtnDisabled: { padding: '6px 12px', border: '1px solid ' + PALETTE.border, borderRadius: '6px', backgroundColor: PALETTE.bg, color: PALETTE.textMuted, cursor: 'not-allowed', fontSize: '12px' },
    loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', fontSize: '16px', color: PALETTE.textMuted },
  };

  var chartHeight = isMobile ? '280px' : '340px';

  if (loading) {
    return (
      <div>
        <div style={{ display: 'none' }}>{timestamp}</div>
        <div style={styles.page}>
          <div style={styles.loadingContainer}>数据加载中...</div>
        </div>
      </div>
    );
  }

  var sortField = _customState.sortField;
  var sortOrder = _customState.sortOrder;
  var sortIcon = function(field) {
    if (sortField !== field) return ' ↕';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  var pageButtons = [];
  var startPage = Math.max(1, tablePage - 2);
  var endPage = Math.min(totalPages, tablePage + 2);
  for (var pageIdx = startPage; pageIdx <= endPage; pageIdx++) {
    pageButtons.push(pageIdx);
  }

  return (
    <div>
      <div style={{ display: 'none' }}>{timestamp}</div>
      <div style={styles.page}>

        <div style={styles.header}>
          <div>
            <div style={styles.title}>📊 任务管理报表</div>
            <div style={styles.subtitle}>共 {_customState.totalCount} 条数据 · 筛选后 {totalCount} 条</div>
          </div>
          <button style={styles.refreshBtn} onClick={(e) => { this.loadAllData(); }}>🔄 刷新数据</button>
        </div>

        <div style={styles.filterBar}>
          <span style={styles.filterLabel}>筛选：</span>
          <select style={styles.filterSelect} value={_customState.filterStatus} onChange={(e) => { this.onFilterChange('filterStatus', e.target.value); }}>
            <option value="全部">全部状态</option>
            <option value="未开始">未开始</option>
            <option value="进行中">进行中</option>
            <option value="已完成">已完成</option>
            <option value="已延期">已延期</option>
            <option value="已取消">已取消</option>
          </select>
          <select style={styles.filterSelect} value={_customState.filterPriority} onChange={(e) => { this.onFilterChange('filterPriority', e.target.value); }}>
            <option value="全部">全部优先级</option>
            <option value="高">高优先级</option>
            <option value="中">中优先级</option>
            <option value="低">低优先级</option>
          </select>
          <select style={styles.filterSelect} value={_customState.filterProject} onChange={(e) => { this.onFilterChange('filterProject', e.target.value); }}>
            <option value="全部">全部项目</option>
            {projectList.map(function(proj) {
              return <option key={proj} value={proj}>{proj}</option>;
            })}
          </select>
        </div>

        <div style={styles.kpiRow}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>任务总数</div>
            <div style={styles.kpiValue}>{totalCount}</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>完成率</div>
            <div style={Object.assign({}, styles.kpiValue, { color: PALETTE.success })}>{completionRate}%</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>进行中</div>
            <div style={Object.assign({}, styles.kpiValue, { color: PALETTE.primaryLight })}>{inProgressCount}</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>已延期</div>
            <div style={Object.assign({}, styles.kpiValue, { color: PALETTE.danger })}>{delayedCount}</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>平均进度</div>
            <div style={Object.assign({}, styles.kpiValue, { color: PALETTE.warning })}>{avgProgress}★</div>
          </div>
        </div>

        <div style={styles.chartsRow}>
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>任务状态分布</div>
            <div id="chart-status-pie" style={{ width: '100%', height: chartHeight }} />
          </div>
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>优先级分布</div>
            <div id="chart-priority-pie" style={{ width: '100%', height: chartHeight }} />
          </div>
        </div>
        <div style={styles.chartsRow}>
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>项目任务数 TOP10</div>
            <div id="chart-project-bar" style={{ width: '100%', height: chartHeight }} />
          </div>
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>月度任务趋势</div>
            <div id="chart-trend-line" style={{ width: '100%', height: chartHeight }} />
          </div>
        </div>

        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>📋 数据明细</div>
            <div style={styles.tableCount}>共 {sortedData.length} 条</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th} onClick={(e) => { this.onTableSort(FIELD.taskName); }}>任务名称{sortIcon(FIELD.taskName)}</th>
                  <th style={styles.th} onClick={(e) => { this.onTableSort(FIELD.project); }}>所属项目{sortIcon(FIELD.project)}</th>
                  <th style={styles.th} onClick={(e) => { this.onTableSort(FIELD.status); }}>状态{sortIcon(FIELD.status)}</th>
                  <th style={styles.th} onClick={(e) => { this.onTableSort(FIELD.priority); }}>优先级{sortIcon(FIELD.priority)}</th>
                  <th style={styles.th} onClick={(e) => { this.onTableSort(FIELD.startDate); }}>开始日期{sortIcon(FIELD.startDate)}</th>
                  <th style={styles.th} onClick={(e) => { this.onTableSort(FIELD.endDate); }}>截止日期{sortIcon(FIELD.endDate)}</th>
                  <th style={styles.th} onClick={(e) => { this.onTableSort(FIELD.progress); }}>进度{sortIcon(FIELD.progress)}</th>
                  <th style={Object.assign({}, styles.th, { cursor: 'default' })}>操作</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map(function(item, index) {
                  var formData = item.formData || {};
                  var statusVal = formData[FIELD.status] || '-';
                  var priorityVal = formData[FIELD.priority] || '-';
                  var progressVal = Number(formData[FIELD.progress]) || 0;
                  var statusColor = STATUS_COLORS[statusVal] || '#94a3b8';
                  var priorityColor = PRIORITY_COLORS[priorityVal] || '#94a3b8';
                  var rowBg = index % 2 === 0 ? '#fff' : PALETTE.bg;
                  var detailUrl = this.getDetailUrl(item.formInstId);

                  var statusBadge = { display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, lineHeight: '18px', color: statusColor, background: statusColor + '14', border: '1px solid ' + statusColor + '30' };
                  var priorityBadge = { display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, lineHeight: '18px', color: priorityColor, background: priorityColor + '14', border: '1px solid ' + priorityColor + '30' };
                  var progressBarBg = { width: '60px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' };
                  var progressBarFill = { width: (progressVal / 5 * 100) + '%', height: '100%', backgroundColor: progressVal >= 4 ? PALETTE.success : progressVal >= 2 ? PALETTE.warning : PALETTE.danger, borderRadius: '3px' };

                  return (
                    <tr key={item.formInstId || index} style={{ backgroundColor: rowBg }}>
                      <td style={Object.assign({}, styles.td, { maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: PALETTE.primaryLight, fontWeight: 500 })}>
                        {detailUrl ? (
                          <a href={detailUrl} target="_blank" rel="noopener noreferrer" style={{ color: PALETTE.primaryLight, textDecoration: 'none' }}>{formData[FIELD.taskName] || '-'}</a>
                        ) : (formData[FIELD.taskName] || '-')}
                      </td>
                      <td style={Object.assign({}, styles.td, { maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>{formData[FIELD.project] || '-'}</td>
                      <td style={styles.td}><span style={statusBadge}>{statusVal}</span></td>
                      <td style={styles.td}><span style={priorityBadge}>{priorityVal}</span></td>
                      <td style={styles.td}>{this.formatDate(formData[FIELD.startDate])}</td>
                      <td style={styles.td}>{this.formatDate(formData[FIELD.endDate])}</td>
                      <td style={styles.td}>
                        <div style={progressBarBg}><div style={progressBarFill} /></div>
                        <span style={{ fontSize: '11px', color: PALETTE.textMuted }}>{progressVal}/5</span>
                      </td>
                      <td style={styles.td}>
                        {detailUrl ? (
                          <a href={detailUrl} target="_blank" rel="noopener noreferrer" style={{ color: PALETTE.primaryLight, fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>详情</a>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                }.bind(this))}
              </tbody>
            </table>
          </div>

          <div style={styles.pagination}>
            <button
              style={tablePage <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
              onClick={(e) => { if (_customState.tablePage > 1) this.onTablePageChange(_customState.tablePage - 1); }}
            >上一页</button>
            {pageButtons.map(function(pageNum) {
              return (
                <button
                  key={pageNum}
                  style={pageNum === tablePage ? styles.pageBtnActive : styles.pageBtn}
                  onClick={(e) => { this.onTablePageChange(pageNum); }}
                >{pageNum}</button>
              );
            }.bind(this))}
            <button
              style={tablePage >= totalPages ? styles.pageBtnDisabled : styles.pageBtn}
              onClick={(e) => { if (_customState.tablePage < totalPages) this.onTablePageChange(_customState.tablePage + 1); }}
            >下一页</button>
          </div>
        </div>

      </div>
    </div>
  );
}
