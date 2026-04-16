/* 数据源报表: REPORT-TX966ZA14I540SN3JAYSL57UV6WA3TJ8ESYMM5 (项目信息分析报表) */

// ============================================================
// 配置常量
// ============================================================

var ECHARTS_CDN = 'https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js';
var REPORT_PAGE_ID = 'REPORT-TX966ZA14I540SN3JAYSL57UV6WA3TJ8ESYMM5';
var APP_TYPE = 'APP_KNILKT41DC5XXR5D4QEC';
var PRD_ID = '13085982';

// 原生报表组件 cid 映射
var COMPONENT_MAP = {
  indicatorCard: { cid: 'YoushuSimpleIndicatorCard_mmyse8sxl', cname: '指标卡_1', className: 'YoushuSimpleIndicatorCard' },
  pieChart: { cid: 'YoushuPieChart_mmyse8sz11', cname: '饼图_1', className: 'YoushuPieChart' },
  barChart: { cid: 'YoushuGroupedBarChart_mmyse8sz14', cname: '分组条形图_1', className: 'YoushuGroupedBarChart' },
  lineChart: { cid: 'YoushuLineChart_mmyse8t017', cname: '折线图_1', className: 'YoushuLineChart' },
  table: { cid: 'YoushuTable_mmyse8syp', cname: '基础表格_1', className: 'YoushuTable' },
};

// 主题色
var COLORS = ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E86452', '#6DC8EC', '#945FB9', '#FF9845', '#1E9493'];

// ============================================================
// 状态管理
// ============================================================

var _customState = {
  loading: true,
  projectCount: 0,
  totalBudget: 0,
  statusData: [],
  priorityBudgetData: [],
  trendData: [],
  tableData: [],
  tableTotal: 0,
  tablePage: 1,
  tablePageSize: 10,
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
// 报表数据接口调用
// ============================================================

export function fetchReportData(componentConfig, options) {
  var csrfToken = window.g_config._csrf_token;
  var baseUrl = window.location.origin;
  options = options || {};

  var queryContext = {
    aliasList: [],
    filterValueMap: options.filterValueMap || {},
    dim2table: true,
    orderByList: [],
    needTotalCount: options.needTotalCount || false,
    variableParams: {},
    uniqueRows: true,
  };

  // 表格组件需要分页参数
  if (options.needPaging) {
    queryContext.paging = {
      start: options.start || 0,
      limit: options.limit || 10,
    };
  }

  var params = new URLSearchParams();
  params.append('timezone', 'GMT+8');
  params.append('_tb_token_', csrfToken);
  params.append('_csrf_token', csrfToken);
  params.append('_csrf', csrfToken);
  params.append('prdId', PRD_ID);
  params.append('pageId', REPORT_PAGE_ID);
  params.append('pageName', 'workbench');
  params.append('cid', componentConfig.cid);
  params.append('componentClassName', componentConfig.className);
  params.append('queryContext', JSON.stringify(queryContext));
  params.append('dataSetKey', options.dataSetKey || 'table');
  params.append('limit', options.limit !== undefined ? String(options.limit) : '');
  params.append('enabledCache', 'true');
  params.append('queryTimestamp', String(new Date().getTime()));
  params.append('appendTraceId', 'true');

  var apiUrl = baseUrl + '/alibaba/web/' + APP_TYPE
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
    body: params.toString(),
  })
  .then(function(response) { return response.json(); })
  .then(function(result) {
    if (result && result.content) {
      return result.content;
    }
    throw new Error(result.errorMsg || '数据获取失败');
  });
}

// ============================================================
// 生命周期
// ============================================================

export function didMount() {
  var self = this;
  this.utils.loadScript(ECHARTS_CDN)
    .then(function() {
      self.loadAllData();
      window.addEventListener('resize', function() {
        self.resizeAllCharts();
      });
    })
    .catch(function() {
      self.utils.toast({ title: 'ECharts 加载失败，请刷新重试', type: 'error' });
    });
}

export function didUnmount() {
  // 销毁图表实例
  var chartIds = ['chart-pie', 'chart-bar', 'chart-line'];
  chartIds.forEach(function(chartId) {
    var dom = document.getElementById(chartId);
    if (dom) {
      var instance = window.echarts.getInstanceByDom(dom);
      if (instance) instance.dispose();
    }
  });
}

export function resizeAllCharts() {
  var chartIds = ['chart-pie', 'chart-bar', 'chart-line'];
  chartIds.forEach(function(chartId) {
    var dom = document.getElementById(chartId);
    if (dom) {
      var instance = window.echarts.getInstanceByDom(dom);
      if (instance) instance.resize();
    }
  });
}

// ============================================================
// 数据加载
// ============================================================

export function loadAllData() {
  var self = this;
  self.setCustomState({ loading: true });

  Promise.all([
    self.fetchReportData(COMPONENT_MAP.indicatorCard, { dataSetKey: 'youshuData' }),
    self.fetchReportData(COMPONENT_MAP.pieChart, { dataSetKey: 'chartData' }),
    self.fetchReportData(COMPONENT_MAP.barChart, { dataSetKey: 'chartData' }),
    self.fetchReportData(COMPONENT_MAP.lineChart, { dataSetKey: 'chartData' }),
    self.fetchReportData(COMPONENT_MAP.table, { dataSetKey: 'table', limit: 10, needTotalCount: true, needPaging: true }),
  ])
  .then(function(results) {
    self.processIndicatorData(results[0]);
    self.processStatusData(results[1]);
    self.processPriorityBudgetData(results[2]);
    self.processTrendData(results[3]);
    self.processTableData(results[4]);
    self.setCustomState({ loading: false });

    setTimeout(function() {
      self.renderPieChart();
      self.renderBarChart();
      self.renderLineChart();
    }, 100);
  })
  .catch(function(error) {
    self.setCustomState({ loading: false });
    self.utils.toast({ title: '数据加载失败: ' + error.message, type: 'error' });
  });
}

// ============================================================
// 数据处理
// ============================================================

export function processIndicatorData(content) {
  var data = (content && content.data) || [];
  if (data.length > 0) {
    var row = data[0];
    var keys = Object.keys(row);
    var projectCount = 0;
    var totalBudget = 0;
    keys.forEach(function(key) {
      var value = row[key];
      if (typeof value === 'number') {
        if (value > 1000) {
          totalBudget = value;
        } else {
          projectCount = value;
        }
      }
    });
    _customState.projectCount = projectCount;
    _customState.totalBudget = totalBudget;
  }
}

export function processStatusData(content) {
  var data = (content && content.data) || [];
  var statusData = data.map(function(row) {
    var keys = Object.keys(row);
    var name = '';
    var value = 0;
    keys.forEach(function(key) {
      if (typeof row[key] === 'string') {
        name = row[key];
      } else if (typeof row[key] === 'number') {
        value = row[key];
      }
    });
    return { name: name, value: value };
  }).filter(function(item) { return item.name; });
  _customState.statusData = statusData;
}

export function processPriorityBudgetData(content) {
  var data = (content && content.data) || [];
  var priorityBudgetData = data.map(function(row) {
    var keys = Object.keys(row);
    var name = '';
    var value = 0;
    keys.forEach(function(key) {
      if (typeof row[key] === 'string') {
        name = row[key];
      } else if (typeof row[key] === 'number') {
        value = row[key];
      }
    });
    return { name: name, value: value };
  }).filter(function(item) { return item.name; });
  _customState.priorityBudgetData = priorityBudgetData;
}

export function processTrendData(content) {
  var data = (content && content.data) || [];
  var trendData = data.map(function(row) {
    var keys = Object.keys(row);
    var date = '';
    var count = 0;
    keys.forEach(function(key) {
      if (typeof row[key] === 'string') {
        date = row[key];
      } else if (typeof row[key] === 'number') {
        count = row[key];
      }
    });
    return { date: date, count: count };
  }).filter(function(item) { return item.date; });
  _customState.trendData = trendData;
}

export function processTableData(content) {
  var data = (content && content.data) || [];
  var totalCount = (content && content.totalCount) || data.length;
  // 提取 formInstId（宜搭报表表格返回数据中通常包含 formInstId 字段）
  var processedData = data.map(function(row) {
    var keys = Object.keys(row);
    var rowData = { _formInstId: null };
    keys.forEach(function(key) {
      var value = row[key];
      // formInstId 通常是以 FINST- 开头的字符串
      if (typeof value === 'string' && value.indexOf('FINST-') === 0) {
        rowData._formInstId = value;
      }
    });
    rowData._raw = row;
    return rowData;
  });
  _customState.tableData = processedData;
  _customState.tableTotal = totalCount;
}

// ============================================================
// ECharts 图表渲染
// ============================================================

export function renderEmptyChart(domId, message) {
  var dom = document.getElementById(domId);
  if (!dom) return;
  var existingInstance = window.echarts.getInstanceByDom(dom);
  if (existingInstance) existingInstance.dispose();
  dom.innerHTML = '';
  var emptyDiv = document.createElement('div');
  emptyDiv.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#bbb;font-size:14px;';
  emptyDiv.innerHTML = '<div style="font-size:48px;margin-bottom:12px;">📭</div><div>' + (message || '暂无数据') + '</div>';
  dom.appendChild(emptyDiv);
}

export function renderPieChart() {
  var dom = document.getElementById('chart-pie');
  if (!dom || !window.echarts) return;
  var statusData = _customState.statusData;

  if (!statusData || statusData.length === 0) {
    this.renderEmptyChart('chart-pie', '暂无项目状态数据');
    return;
  }

  var chart = window.echarts.getInstanceByDom(dom) || window.echarts.init(dom);
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { fontSize: 13 } },
    color: COLORS,
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 12 },
      emphasis: {
        label: { show: true, fontSize: 16, fontWeight: 'bold' },
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' },
      },
      data: statusData,
    }],
  });
}

export function renderBarChart() {
  var dom = document.getElementById('chart-bar');
  if (!dom || !window.echarts) return;
  var priorityData = _customState.priorityBudgetData;

  if (!priorityData || priorityData.length === 0) {
    this.renderEmptyChart('chart-bar', '暂无优先级预算数据');
    return;
  }

  var chart = window.echarts.getInstanceByDom(dom) || window.echarts.init(dom);
  var categories = priorityData.map(function(item) { return item.name; });
  var values = priorityData.map(function(item) { return item.value; });

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        var param = params[0];
        return param.name + '<br/>项目预算: ¥' + (param.value || 0).toLocaleString();
      },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: categories, axisLabel: { fontSize: 12 } },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12,
        formatter: function(value) {
          if (value >= 10000) return (value / 10000).toFixed(1) + '万';
          return value;
        },
      },
    },
    series: [{
      type: 'bar',
      data: values,
      barWidth: '40%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: function(params) { return COLORS[params.dataIndex % COLORS.length]; },
      },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.15)' } },
    }],
  });
}

export function renderLineChart() {
  var dom = document.getElementById('chart-line');
  if (!dom || !window.echarts) return;
  var trendData = _customState.trendData;

  if (!trendData || trendData.length === 0) {
    this.renderEmptyChart('chart-line', '暂无项目创建趋势数据');
    return;
  }

  var chart = window.echarts.getInstanceByDom(dom) || window.echarts.init(dom);
  var dates = trendData.map(function(item) { return item.date; });
  var counts = trendData.map(function(item) { return item.count; });

  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: dates, boundaryGap: false, axisLabel: { fontSize: 11, rotate: 30 } },
    yAxis: { type: 'value', minInterval: 1, axisLabel: { fontSize: 12 } },
    series: [{
      type: 'line',
      data: counts,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { width: 3, color: '#5B8FF9' },
      itemStyle: { color: '#5B8FF9', borderWidth: 2, borderColor: '#fff' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(91,143,249,0.35)' },
            { offset: 1, color: 'rgba(91,143,249,0.05)' },
          ],
        },
      },
    }],
  });
}

// ============================================================
// 表格翻页
// ============================================================

export function handleTablePageChange(page) {
  var self = this;
  var start = (page - 1) * _customState.tablePageSize;
  _customState.tablePage = page;

  self.fetchReportData(COMPONENT_MAP.table, {
    dataSetKey: 'table',
    start: start,
    limit: _customState.tablePageSize,
    needTotalCount: true,
    needPaging: true,
  })
  .then(function(content) {
    self.processTableData(content);
    self.forceUpdate();
  })
  .catch(function(error) {
    self.utils.toast({ title: '翻页失败: ' + error.message, type: 'error' });
  });
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var timestamp = this.state.timestamp;
  var isMobile = this.utils.isMobile();
  var loading = _customState.loading;
  var projectCount = _customState.projectCount;
  var totalBudget = _customState.totalBudget;
  var tableData = _customState.tableData;
  var tableTotal = _customState.tableTotal;
  var tablePage = _customState.tablePage;
  var tablePageSize = _customState.tablePageSize;
  var totalPages = Math.ceil(tableTotal / tablePageSize) || 1;

  var styles = {
    container: {
      padding: isMobile ? '12px' : '24px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      padding: isMobile ? '20px 16px' : '28px 32px',
      marginBottom: '20px',
      color: '#fff',
      boxShadow: '0 8px 32px rgba(102,126,234,0.3)',
    },
    headerTitle: { fontSize: isMobile ? '22px' : '28px', fontWeight: '700', margin: '0 0 6px 0' },
    headerSubtitle: { fontSize: '14px', opacity: 0.85, margin: 0 },
    kpiRow: {
      display: 'flex',
      gap: isMobile ? '12px' : '20px',
      marginBottom: '20px',
      flexWrap: 'wrap',
    },
    kpiCard: function(gradientStart, gradientEnd) {
      return {
        flex: '1 1 200px',
        background: 'linear-gradient(135deg, ' + gradientStart + ' 0%, ' + gradientEnd + ' 100%)',
        borderRadius: '14px',
        padding: isMobile ? '18px 16px' : '24px',
        color: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
      };
    },
    kpiLabel: { fontSize: '13px', opacity: 0.9, marginBottom: '8px' },
    kpiValue: { fontSize: isMobile ? '28px' : '36px', fontWeight: '700', lineHeight: 1.2 },
    kpiIcon: {
      position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
      fontSize: '48px', opacity: 0.2,
    },
    chartRow: {
      display: 'flex',
      gap: '20px',
      marginBottom: '20px',
      flexWrap: 'wrap',
    },
    chartCard: function(flex) {
      return {
        flex: flex || '1 1 300px',
        background: '#fff',
        borderRadius: '14px',
        padding: isMobile ? '16px' : '20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        minWidth: 0,
      };
    },
    chartTitle: {
      fontSize: '16px', fontWeight: '600', color: '#1a1a2e',
      marginBottom: '16px', paddingBottom: '10px',
      borderBottom: '2px solid #f0f0f0',
    },
    chartContainer: { width: '100%', height: isMobile ? '280px' : '340px' },
    tableCard: {
      background: '#fff',
      borderRadius: '14px',
      padding: isMobile ? '16px' : '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      marginBottom: '20px',
    },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    tableHeader: {
      background: '#f8f9fc', color: '#5a607f', fontWeight: '600',
      padding: '12px 14px', textAlign: 'left', borderBottom: '2px solid #eef0f5',
      whiteSpace: 'nowrap',
    },
    tableCell: {
      padding: '11px 14px', borderBottom: '1px solid #f2f3f7', color: '#3a3f5c',
    },
    tableRowHover: { background: '#fafbfe' },
    pagination: {
      display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
      gap: '8px', marginTop: '16px',
    },
    pageButton: function(isActive) {
      return {
        padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
        border: isActive ? 'none' : '1px solid #d9dce6',
        background: isActive ? '#667eea' : '#fff',
        color: isActive ? '#fff' : '#5a607f',
        fontSize: '13px', fontWeight: isActive ? '600' : '400',
      };
    },
    loadingOverlay: {
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '400px', fontSize: '16px', color: '#888',
    },
    badge: function(color) {
      return {
        display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
        fontSize: '12px', fontWeight: '500',
        background: color + '18', color: color,
      };
    },
  };

  // 状态颜色映射
  var statusColorMap = {
    '进行中': '#5B8FF9', '已完成': '#5AD8A6', '未开始': '#F6BD16',
    '已暂停': '#E86452', '已取消': '#6DC8EC',
  };
  var priorityColorMap = {
    '高': '#E86452', '中': '#F6BD16', '低': '#5AD8A6', '紧急': '#ff4d4f',
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'none' }}>{timestamp}</div>
        <div style={styles.loadingOverlay}>
          <span>📊 数据加载中...</span>
        </div>
      </div>
    );
  }

  // 构建翻页按钮
  var pageButtons = [];
  for (var pageIndex = 1; pageIndex <= totalPages && pageIndex <= 5; pageIndex++) {
    (function(currentPageIndex) {
      pageButtons.push(
        <span
          key={currentPageIndex}
          style={styles.pageButton(currentPageIndex === tablePage)}
          onClick={(e) => { this.handleTablePageChange(currentPageIndex); }}
        >
          {currentPageIndex}
        </span>
      );
    }.bind(this))(pageIndex);
  }

  // 表格列定义
  var tableColumns = [
    { key: 0, label: '项目名称' },
    { key: 1, label: '项目状态' },
    { key: 2, label: '项目优先级' },
    { key: 3, label: '项目负责人' },
    { key: 4, label: '所属部门' },
    { key: 5, label: '开始日期' },
    { key: 6, label: '结束日期' },
    { key: 7, label: '项目预算' },
    { key: -1, label: '操作' },
  ];

  // 详情页链接构建
  var baseUrl = window.location.origin;
  var buildDetailUrl = function(formInstId) {
    if (!formInstId) return null;
    return baseUrl + '/' + APP_TYPE + '/formDetail/' + FORM_UUID + '?formInstId=' + formInstId;
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'none' }}>{timestamp}</div>

      {/* 页面标题 */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>📊 项目信息分析报表</h1>
        <p style={styles.headerSubtitle}>基于项目信息表的多维度数据分析 · 数据实时更新</p>
      </div>

      {/* KPI 指标卡 */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiCard('#5B8FF9', '#3D6FE0')}>
          <div style={styles.kpiLabel}>项目总数</div>
          <div style={styles.kpiValue}>{projectCount}</div>
          <div style={styles.kpiIcon}>📋</div>
        </div>
        <div style={styles.kpiCard('#5AD8A6', '#36B37E')}>
          <div style={styles.kpiLabel}>总预算</div>
          <div style={styles.kpiValue}>¥{totalBudget >= 10000 ? (totalBudget / 10000).toFixed(1) + '万' : totalBudget.toLocaleString()}</div>
          <div style={styles.kpiIcon}>💰</div>
        </div>
      </div>

      {/* 第一行图表：饼图 + 条形图 */}
      <div style={styles.chartRow}>
        <div style={styles.chartCard('1 1 45%')}>
          <div style={styles.chartTitle}>🎯 项目状态分布</div>
          <div id="chart-pie" style={styles.chartContainer}></div>
        </div>
        <div style={styles.chartCard('1 1 45%')}>
          <div style={styles.chartTitle}>📊 各优先级项目预算对比</div>
          <div id="chart-bar" style={styles.chartContainer}></div>
        </div>
      </div>

      {/* 第二行图表：折线图 */}
      <div style={styles.chartRow}>
        <div style={styles.chartCard('1 1 100%')}>
          <div style={styles.chartTitle}>📈 项目创建趋势（按月）</div>
          <div id="chart-line" style={styles.chartContainer}></div>
        </div>
      </div>

      {/* 明细表格 */}
      <div style={styles.tableCard}>
        <div style={styles.chartTitle}>📋 项目明细（共 {tableTotal} 条）</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {tableColumns.map(function(col) {
                  return <th key={col.key} style={styles.tableHeader}>{col.label}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns.length} style={Object.assign({}, styles.tableCell, { textAlign: 'center', color: '#aaa', padding: '40px' })}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>📭</div>
                    <div>暂无项目数据</div>
                  </td>
                </tr>
              ) : (
                tableData.map(function(rowData, rowIndex) {
                  var rawRow = rowData._raw || rowData;
                  var values = Object.values(rawRow);
                  var formInstId = rowData._formInstId;
                  var detailUrl = buildDetailUrl(formInstId);
                  return (
                    <tr key={rowIndex} style={rowIndex % 2 === 0 ? {} : styles.tableRowHover}>
                      {tableColumns.map(function(col) {
                        var cellStyle = Object.assign({}, styles.tableCell);

                        // 操作列：详情链接
                        if (col.key === -1) {
                          return (
                            <td key="action" style={cellStyle}>
                              {detailUrl ? (
                                <a
                                  href={detailUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}
                                >
                                  查看详情
                                </a>
                              ) : (
                                <span style={{ color: '#ccc' }}>-</span>
                              )}
                            </td>
                          );
                        }

                        var cellValue = values[col.key] !== undefined ? values[col.key] : '-';

                        // 空值处理
                        if (cellValue === null || cellValue === undefined || cellValue === '') {
                          return <td key={col.key} style={Object.assign({}, cellStyle, { color: '#ccc' })}>-</td>;
                        }

                        // 状态列加颜色标签
                        if (col.key === 1 && statusColorMap[cellValue]) {
                          return (
                            <td key={col.key} style={cellStyle}>
                              <span style={styles.badge(statusColorMap[cellValue])}>{cellValue}</span>
                            </td>
                          );
                        }
                        // 优先级列加颜色标签
                        if (col.key === 2 && priorityColorMap[cellValue]) {
                          return (
                            <td key={col.key} style={cellStyle}>
                              <span style={styles.badge(priorityColorMap[cellValue])}>{cellValue}</span>
                            </td>
                          );
                        }
                        // 预算列格式化
                        if (col.key === 7 && typeof cellValue === 'number') {
                          return <td key={col.key} style={cellStyle}>¥{cellValue.toLocaleString()}</td>;
                        }
                        // 项目名称列：可点击跳转详情
                        if (col.key === 0 && detailUrl) {
                          return (
                            <td key={col.key} style={cellStyle}>
                              <a
                                href={detailUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}
                              >
                                {String(cellValue)}
                              </a>
                            </td>
                          );
                        }

                        return <td key={col.key} style={cellStyle}>{String(cellValue)}</td>;
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
            <span style={{ fontSize: '13px', color: '#888' }}>
              第 {(tablePage - 1) * tablePageSize + 1}-{Math.min(tablePage * tablePageSize, tableTotal)} 条，共 {tableTotal} 条
            </span>
            <span
              style={styles.pageButton(false)}
              onClick={(e) => { if (tablePage > 1) this.handleTablePageChange(tablePage - 1); }}
            >
              上一页
            </span>
            {pageButtons}
            <span
              style={styles.pageButton(false)}
              onClick={(e) => { if (tablePage < totalPages) this.handleTablePageChange(tablePage + 1); }}
            >
              下一页
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
