// ============================================================
// 任务管理高级报表 - ECharts 可视化看板
// 数据源：原生报表 REPORT-QA666SC1J3U3TFO9GM9MJ5400RIW3W83SUYMM5
// 通过报表 API getDataAsync 获取服务端聚合数据，严禁前端聚合
// ============================================================

var APP_TYPE = 'APP_KNILKT41DC5XXR5D4QEC';
var REPORT_FORM_UUID = 'REPORT-QA666SC1J3U3TFO9GM9MJ5400RIW3W83SUYMM5';

// 报表组件配置（从原生报表 Schema 中提取的 cid）
var REPORT_COMPONENTS = {
  totalCount: {
    cid: 'YoushuSimpleIndicatorCard_mmyus3h9l',
    cname: '任务总数',
    className: 'YoushuSimpleIndicatorCard',
    dataSetKey: 'youshuData',
  },
  statusTable: {
    cid: 'YoushuPieChart_mmyus3hbz',
    cname: '任务状态分布',
    className: 'YoushuPieChart',
    dataSetKey: 'table',
  },
  priorityTable: {
    cid: 'YoushuGroupedBarChart_mmyus3hb12',
    cname: '优先级分布',
    className: 'YoushuGroupedBarChart',
    dataSetKey: 'table',
  },
  trendTable: {
    cid: 'YoushuLineChart_mmyus3hb15',
    cname: '任务创建趋势',
    className: 'YoushuLineChart',
    dataSetKey: 'table',
  },
  projectTable: {
    cid: 'YoushuGroupedBarChart_mmyus3hb18',
    cname: '项目任务分布',
    className: 'YoushuGroupedBarChart',
    dataSetKey: 'table',
  },
  detailTable: {
    cid: 'YoushuTable_mmyus3hao',
    cname: '任务明细表',
    className: 'YoushuTable',
    dataSetKey: 'table',
  },
};

// 颜色方案
var COLORS = {
  primary: '#4F6EF7',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
  info: '#1890ff',
  chart: ['#4F6EF7', '#52c41a', '#faad14', '#ff4d4f', '#9254de', '#13c2c2', '#eb2f96', '#722ed1'],
};

// ============================================================
// 状态管理
// ============================================================

var _prdId = null; // 动态获取的报表 prdId（topicId）

var _customState = {
  loading: true,
  error: null,
  totalCount: 0,
  completedCount: 0,
  inProgressCount: 0,
  completionRate: 0,
  statusData: [],
  priorityData: [],
  trendData: [],
  projectData: [],
  detailData: [],
  echartsLoaded: false,
};

export function getCustomState(key) {
  if (key) return _customState[key];
  return Object.assign({}, _customState);
}

export function setCustomState(newState) {
  Object.keys(newState).forEach(function (key) {
    _customState[key] = newState[key];
  });
  this.forceUpdate();
}

export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}
// ============================================================
// 动态获取报表 prdId（topicId）
// 通过 getFormSchema.json 接口获取报表 Schema，从中提取 topicId 作为 prdId
// ============================================================

export function fetchPrdId() {
  var appType = APP_TYPE || (window.pageConfig && window.pageConfig.appType);
  var baseUrl = window.location.origin;
  var url = baseUrl + '/alibaba/web/' + appType + '/_view/query/formdesign/getFormSchema.json'
    + '?formUuid=' + encodeURIComponent(REPORT_FORM_UUID)
    + '&schemaVersion=V5';

  console.log('[报表] 正在获取报表 prdId，formUuid:', REPORT_FORM_UUID);

  return fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'accept': 'application/json, text/json',
      'x-requested-with': 'XMLHttpRequest',
    },
  })
    .then(function (resp) { return resp.json(); })
    .then(function (res) {
      if (res.success && res.content) {
        var topicId = res.content.topicId;
        if (topicId) {
          _prdId = topicId;
          console.log('[报表] prdId(topicId) 获取成功:', _prdId);
          return _prdId;
        }
        throw new Error('报表 Schema 中未找到 topicId 字段');
      }
      throw new Error(res.errorMsg || '获取报表 Schema 失败');
    });
}

// ============================================================
// 报表 API 调用
// ============================================================

export function fetchReportData(component) {
  var baseUrl = window.location.origin;
  var url = baseUrl + '/alibaba/web/' + APP_TYPE + '/visual/visualizationDataRpc/getDataAsync.json';

  var requestBody = {
    pageName: 'report',
    prdId: _prdId,
    cid: component.cid,
    cname: component.cname,
    className: component.className,
    dataSetKey: component.dataSetKey,
  };

  console.log('[报表] 请求报表数据:', component.cname, requestBody);

  // 构建 form-urlencoded 格式的请求体
  var formBody = Object.keys(requestBody).map(function (key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(requestBody[key]);
  }).join('&');

  return fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'accept': 'application/json, text/json',
      'content-type': 'application/x-www-form-urlencoded',
      'x-requested-with': 'XMLHttpRequest',
    },
    body: formBody,
  })
    .then(function (resp) { return resp.json(); })
    .then(function (res) {
      console.log('[报表] 报表数据响应:', component.cname, res);
      return res;
    });
}

// ============================================================
// 数据解析
// ============================================================

export function parseIndicatorData(responseData) {
  if (!responseData || !responseData.data || !responseData.data.length) return 0;
  return parseFloat(responseData.data[0][0]) || 0;
}

export function parseTableData(responseData) {
  if (!responseData || !responseData.data) return [];
  var dataArray = responseData.data;
  var metaArray = responseData.meta || [];

  var dimensionIndex = -1;
  var measureIndex = -1;

  metaArray.forEach(function (m, i) {
    if (m.type === 'DIMENSION') {
      dimensionIndex = i;
    } else if (m.type === 'MEASURE') {
      measureIndex = i;
    }
  });

  if (dimensionIndex === -1 && metaArray.length >= 2) {
    dimensionIndex = 0;
    measureIndex = 1;
  }

  return dataArray.map(function (row) {
    return {
      name: String(row[dimensionIndex] || ''),
      value: parseFloat(row[measureIndex]) || 0,
    };
  });
}

export function parseDetailTableData(responseData) {
  if (!responseData || !responseData.data) return [];
  var dataArray = responseData.data;
  var metaArray = responseData.meta || [];

  return dataArray.map(function (row) {
    var item = {};
    metaArray.forEach(function (m, i) {
      item[m.alias || ('col' + i)] = row[i] != null ? String(row[i]) : '';
    });
    return item;
  });
}

// ============================================================
// 数据加载
// ============================================================

export function loadAllData() {
  var self = this;
  self.setCustomState({ loading: true, error: null });

  // 第一步：动态获取 prdId（topicId），然后并行请求所有报表组件数据
  var prdIdPromise = _prdId ? Promise.resolve(_prdId) : self.fetchPrdId();

  prdIdPromise
    .then(function () {
      console.log('[报表] prdId 获取成功:', _prdId);
      return Promise.all([
        self.fetchReportData(REPORT_COMPONENTS.totalCount),
        self.fetchReportData(REPORT_COMPONENTS.statusTable),
        self.fetchReportData(REPORT_COMPONENTS.priorityTable),
        self.fetchReportData(REPORT_COMPONENTS.trendTable),
        self.fetchReportData(REPORT_COMPONENTS.projectTable),
        self.fetchReportData(REPORT_COMPONENTS.detailTable),
      ]);
    })
    .then(function (results) {
      var totalResult = results[0];
      var statusResult = results[1];
      var priorityResult = results[2];
      var trendResult = results[3];
      var projectResult = results[4];
      var detailResult = results[5];

      // 解析指标卡数据
      var totalCount = 0;
      if (totalResult && totalResult.content) {
        totalCount = self.parseIndicatorData(totalResult.content);
      }

      // 解析状态分布数据
      var statusData = [];
      if (statusResult && statusResult.content) {
        statusData = self.parseTableData(statusResult.content);
      }

      // 计算已完成和进行中数量
      var completedCount = 0;
      var inProgressCount = 0;
      statusData.forEach(function (item) {
        if (item.name === '已完成') completedCount = item.value;
        if (item.name === '进行中') inProgressCount = item.value;
      });
      var completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      // 解析优先级分布
      var priorityData = [];
      if (priorityResult && priorityResult.content) {
        priorityData = self.parseTableData(priorityResult.content);
      }

      // 解析趋势数据
      var trendData = [];
      if (trendResult && trendResult.content) {
        trendData = self.parseTableData(trendResult.content);
      }

      // 解析项目分布
      var projectData = [];
      if (projectResult && projectResult.content) {
        projectData = self.parseTableData(projectResult.content);
      }

      // 解析明细表
      var detailData = [];
      if (detailResult && detailResult.content) {
        detailData = self.parseDetailTableData(detailResult.content);
      }

      self.setCustomState({
        loading: false,
        totalCount: totalCount,
        completedCount: completedCount,
        inProgressCount: inProgressCount,
        completionRate: completionRate,
        statusData: statusData,
        priorityData: priorityData,
        trendData: trendData,
        projectData: projectData,
        detailData: detailData,
      });

      // 数据加载完成后渲染图表
      setTimeout(function () {
        self.renderAllCharts();
      }, 100);
    })
    .catch(function (err) {
      console.error('报表数据加载失败:', err);
      self.setCustomState({
        loading: false,
        error: '报表数据加载失败: ' + (err.message || '未知错误'),
      });
    });
}

// ============================================================
// ECharts 图表渲染
// ============================================================

export function renderAllCharts() {
  if (typeof window.echarts === 'undefined') return;

  this.renderStatusPieChart();
  this.renderPriorityBarChart();
  this.renderTrendLineChart();
  this.renderProjectBarChart();
}

export function renderStatusPieChart() {
  var container = document.getElementById('chart-status-pie');
  if (!container) return;
  var chart = window.echarts.init(container);
  var statusData = _customState.statusData;

  var option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 12 } },
    series: [
      {
        name: '任务状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{c}个' },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: statusData.map(function (item, index) {
          return { value: item.value, name: item.name, itemStyle: { color: COLORS.chart[index % COLORS.chart.length] } };
        }),
      },
    ],
  };
  chart.setOption(option);
  window.addEventListener('resize', function () { chart.resize(); });
}

export function renderPriorityBarChart() {
  var container = document.getElementById('chart-priority-bar');
  if (!container) return;
  var chart = window.echarts.init(container);
  var priorityData = _customState.priorityData;

  var priorityColors = { '紧急': '#ff4d4f', '高': '#faad14', '中': '#4F6EF7', '低': '#52c41a' };

  var option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: priorityData.map(function (d) { return d.name; }), axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: '任务数量',
        type: 'bar',
        barWidth: '50%',
        data: priorityData.map(function (d) {
          return { value: d.value, itemStyle: { color: priorityColors[d.name] || COLORS.primary, borderRadius: [4, 4, 0, 0] } };
        }),
        label: { show: true, position: 'top', fontSize: 12 },
      },
    ],
  };
  chart.setOption(option);
  window.addEventListener('resize', function () { chart.resize(); });
}

export function renderTrendLineChart() {
  var container = document.getElementById('chart-trend-line');
  if (!container) return;
  var chart = window.echarts.init(container);
  var trendData = _customState.trendData;

  var option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: trendData.map(function (d) { return d.name; }), axisLabel: { fontSize: 11, rotate: trendData.length > 8 ? 30 : 0 } },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: '任务数量',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3, color: COLORS.primary },
        itemStyle: { color: COLORS.primary },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(79,110,247,0.3)' }, { offset: 1, color: 'rgba(79,110,247,0.02)' }] } },
        data: trendData.map(function (d) { return d.value; }),
      },
    ],
  };
  chart.setOption(option);
  window.addEventListener('resize', function () { chart.resize(); });
}

export function renderProjectBarChart() {
  var container = document.getElementById('chart-project-bar');
  if (!container) return;
  var chart = window.echarts.init(container);
  var projectData = _customState.projectData;

  var option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', minInterval: 1 },
    yAxis: { type: 'category', data: projectData.map(function (d) { return d.name; }), axisLabel: { fontSize: 12, width: 80, overflow: 'truncate' } },
    series: [
      {
        name: '任务数量',
        type: 'bar',
        barWidth: '60%',
        data: projectData.map(function (d, i) {
          return { value: d.value, itemStyle: { color: COLORS.chart[i % COLORS.chart.length], borderRadius: [0, 4, 4, 0] } };
        }),
        label: { show: true, position: 'right', fontSize: 12 },
      },
    ],
  };
  chart.setOption(option);
  window.addEventListener('resize', function () { chart.resize(); });
}

// ============================================================
// 生命周期
// ============================================================

export function didMount() {
  var self = this;
  console.log('[报表] didMount 开始执行');

  // 并行：加载 ECharts + 加载数据（互不依赖）
  // 数据加载完成后，如果 ECharts 也加载完了就立即渲染，否则等 ECharts 加载完再渲染
  self.loadAllData();

  // 加载 ECharts（使用国内 CDN）
  var cdnList = [
    'https://unpkg.com/echarts@5/dist/echarts.min.js',
    'https://cdn.bootcdn.net/ajax/libs/echarts/5.4.3/echarts.min.js',
    'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js',
  ];

  function tryLoadECharts(index) {
    if (index >= cdnList.length) {
      console.error('[报表] 所有 ECharts CDN 加载失败');
      return;
    }
    console.log('[报表] 尝试加载 ECharts:', cdnList[index]);
    var script = document.createElement('script');
    script.src = cdnList[index];
    script.onload = function () {
      console.log('[报表] ECharts 加载成功');
      _customState.echartsLoaded = true;
      // 如果数据已经加载完毕，立即渲染图表
      if (!_customState.loading && !_customState.error) {
        self.renderAllCharts();
      }
    };
    script.onerror = function () {
      console.warn('[报表] ECharts CDN 加载失败:', cdnList[index]);
      tryLoadECharts(index + 1);
    };
    document.head.appendChild(script);
  }

  tryLoadECharts(0);
}

export function didUnmount() {
  // 清理 ECharts 实例
  var chartIds = ['chart-status-pie', 'chart-priority-bar', 'chart-trend-line', 'chart-project-bar'];
  chartIds.forEach(function (id) {
    var container = document.getElementById(id);
    if (container && window.echarts) {
      var instance = window.echarts.getInstanceByDom(container);
      if (instance) instance.dispose();
    }
  });
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var timestamp = this.state.timestamp;
  var isMobile = this.utils.isMobile();
  var loading = _customState.loading;
  var error = _customState.error;

  var styles = {
    page: { padding: 0, margin: 0, minHeight: '100vh', background: '#f0f2f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
    header: { background: 'linear-gradient(135deg, #4F6EF7 0%, #764ba2 100%)', padding: isMobile ? '20px 16px' : '28px 32px', color: '#fff', borderRadius: 0 },
    headerTitle: { fontSize: isMobile ? 20 : 26, fontWeight: 700, margin: 0, letterSpacing: 1 },
    headerSub: { fontSize: isMobile ? 12 : 14, opacity: 0.85, marginTop: 6 },
    content: { padding: isMobile ? '12px' : '20px 24px', maxWidth: 1400, margin: '0 auto' },
    kpiRow: { display: 'flex', flexWrap: 'wrap', gap: isMobile ? 8 : 16, marginBottom: isMobile ? 12 : 20 },
    kpiCard: { flex: isMobile ? '1 1 calc(50% - 4px)' : '1 1 0', background: '#fff', borderRadius: 10, padding: isMobile ? '14px 12px' : '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', minWidth: isMobile ? 0 : 180 },
    kpiValue: { fontSize: isMobile ? 26 : 32, fontWeight: 700, margin: '4px 0' },
    kpiLabel: { fontSize: isMobile ? 12 : 14, color: '#8c8c8c' },
    chartRow: { display: 'flex', flexWrap: 'wrap', gap: isMobile ? 8 : 16, marginBottom: isMobile ? 12 : 20 },
    chartCard: { flex: isMobile ? '1 1 100%' : '1 1 calc(50% - 8px)', background: '#fff', borderRadius: 10, padding: isMobile ? 12 : 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
    chartTitle: { fontSize: isMobile ? 14 : 16, fontWeight: 600, marginBottom: 12, color: '#262626' },
    chartContainer: { width: '100%', height: isMobile ? 260 : 320 },
    tableCard: { background: '#fff', borderRadius: 10, padding: isMobile ? 12 : 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 12 : 14 },
    th: { padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #f0f0f0', color: '#8c8c8c', fontWeight: 600, fontSize: isMobile ? 11 : 13, whiteSpace: 'nowrap' },
    td: { padding: '10px 12px', borderBottom: '1px solid #f5f5f5', color: '#262626' },
    loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, fontSize: 16, color: '#8c8c8c' },
    errorContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, fontSize: 16, color: '#ff4d4f', flexDirection: 'column', gap: 12 },
    refreshBtn: { padding: '8px 24px', background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
    statusBadge: { display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 },
  };

  var statusColors = { '待开始': '#d9d9d9', '进行中': '#1890ff', '已完成': '#52c41a', '已取消': '#ff4d4f' };
  var priorityColors = { '低': '#52c41a', '中': '#1890ff', '高': '#faad14', '紧急': '#ff4d4f' };

  return (
    <div style={styles.page}>
      <div style={{ display: 'none' }}>{timestamp}</div>

      {/* 顶部标题栏 */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>📊 任务管理数据看板</h1>
        <div style={styles.headerSub}>数据来源：宜搭原生报表服务端聚合 · 实时更新</div>
      </div>

      <div style={styles.content}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <span>⏳ 正在加载报表数据...</span>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <span>❌ {error}</span>
            <button style={styles.refreshBtn} onClick={(e) => { this.loadAllData(); }}>重新加载</button>
          </div>
        ) : (
          <div>
            {/* KPI 指标卡 */}
            <div style={styles.kpiRow}>
              <div style={styles.kpiCard}>
                <div style={styles.kpiLabel}>📋 任务总数</div>
                <div style={Object.assign({}, styles.kpiValue, { color: COLORS.primary })}>{_customState.totalCount}</div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiLabel}>✅ 已完成</div>
                <div style={Object.assign({}, styles.kpiValue, { color: COLORS.success })}>{_customState.completedCount}</div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiLabel}>🔄 进行中</div>
                <div style={Object.assign({}, styles.kpiValue, { color: COLORS.info })}>{_customState.inProgressCount}</div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiLabel}>📈 完成率</div>
                <div style={Object.assign({}, styles.kpiValue, { color: _customState.completionRate >= 60 ? COLORS.success : COLORS.warning })}>{_customState.completionRate}%</div>
              </div>
            </div>

            {/* 图表区域 - 第一行 */}
            <div style={styles.chartRow}>
              <div style={styles.chartCard}>
                <div style={styles.chartTitle}>🥧 任务状态分布</div>
                <div id="chart-status-pie" style={styles.chartContainer}></div>
              </div>
              <div style={styles.chartCard}>
                <div style={styles.chartTitle}>📊 优先级分布</div>
                <div id="chart-priority-bar" style={styles.chartContainer}></div>
              </div>
            </div>

            {/* 图表区域 - 第二行 */}
            <div style={styles.chartRow}>
              <div style={styles.chartCard}>
                <div style={styles.chartTitle}>📈 任务创建趋势</div>
                <div id="chart-trend-line" style={styles.chartContainer}></div>
              </div>
              <div style={styles.chartCard}>
                <div style={styles.chartTitle}>🏢 项目任务分布</div>
                <div id="chart-project-bar" style={styles.chartContainer}></div>
              </div>
            </div>

            {/* 明细表格 */}
            <div style={styles.tableCard}>
              <div style={styles.chartTitle}>📝 任务明细表</div>
              {_customState.detailData.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {Object.keys(_customState.detailData[0]).map(function (key) {
                          return <th key={key} style={styles.th}>{key}</th>;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {_customState.detailData.slice(0, 50).map(function (row, rowIndex) {
                        return (
                          <tr key={rowIndex} style={{ background: rowIndex % 2 === 0 ? '#fff' : '#fafafa' }}>
                            {Object.keys(row).map(function (key, colIndex) {
                              var cellValue = row[key];
                              var cellStyle = Object.assign({}, styles.td);

                              // 状态字段高亮
                              if (statusColors[cellValue]) {
                                return (
                                  <td key={colIndex} style={cellStyle}>
                                    <span style={Object.assign({}, styles.statusBadge, { background: statusColors[cellValue] + '20', color: statusColors[cellValue] })}>{cellValue}</span>
                                  </td>
                                );
                              }
                              // 优先级字段高亮
                              if (priorityColors[cellValue]) {
                                return (
                                  <td key={colIndex} style={cellStyle}>
                                    <span style={Object.assign({}, styles.statusBadge, { background: priorityColors[cellValue] + '20', color: priorityColors[cellValue] })}>{cellValue}</span>
                                  </td>
                                );
                              }
                              return <td key={colIndex} style={cellStyle}>{cellValue}</td>;
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#bfbfbf' }}>暂无数据</div>
              )}
            </div>

            {/* 底部刷新按钮 */}
            <div style={{ textAlign: 'center', padding: '12px 0 24px' }}>
              <button style={styles.refreshBtn} onClick={(e) => { this.loadAllData(); }}>🔄 刷新数据</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
