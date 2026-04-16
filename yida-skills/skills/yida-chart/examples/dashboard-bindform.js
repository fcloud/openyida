// ============================================================
// 宜搭报表 Dashboard 示例
// 基于表单数据的多图表看板（柱状图 + 饼图 + 折线图 + 统计卡片）
//
// 使用前请替换以下占位符：
//   FORM-XXXXXX       → 实际的表单 formUuid
//   selectField_xxx   → 实际的分类字段 ID（单选/下拉）
//   numberField_xxx   → 实际的数值字段 ID
//   dateField_xxx     → 实际的日期字段 ID
// ============================================================

// ----- 配置区 -----
var ECHARTS_CDN = 'https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js';
var DATA_FORM_UUID = 'FORM-XXXXXX';
var CATEGORY_FIELD = 'selectField_xxx';
var NUMBER_FIELD = 'numberField_xxx';
var DATE_FIELD = 'dateField_xxx';

// ----- 颜色主题 -----
var THEME_COLORS = ['#0089FF', '#00B853', '#FFA200', '#FF7357', '#5C72FF', '#85C700', '#FFC505', '#FF6B7A', '#8F66FF', '#14A9FF'];

// ============================================================
// 状态管理
// ============================================================

var _customState = {
  loading: true,
  totalCount: 0,
  categoryData: {},
  monthlyData: {},
  totalAmount: 0,
  chartIds: ['chart-bar', 'chart-pie', 'chart-line'],
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
    this.loadDashboardData();
    return;
  }
  this.utils.loadScript(ECHARTS_CDN)
    .then(function() {
      this.bindChartResize();
      this.loadDashboardData();
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
// 数据获取（优先使用 this.utils.yida.* 接口）
// ============================================================

export function loadDashboardData() {
  this.setCustomState({ loading: true });
  this.fetchAllFormData(DATA_FORM_UUID)
    .then(function(dataList) {
      var categoryData = this.groupCount(dataList, CATEGORY_FIELD);
      var monthlyData = this.groupByMonth(dataList, DATE_FIELD);
      var totalAmount = this.sumField(dataList, NUMBER_FIELD);

      this.setCustomState({
        loading: false,
        totalCount: dataList.length,
        categoryData: categoryData,
        monthlyData: monthlyData,
        totalAmount: totalAmount,
      });

      // 渲染图表（需要延迟一帧确保 DOM 更新完成）
      setTimeout(function() {
        this.renderAllCharts();
      }.bind(this), 100);
    }.bind(this))
    .catch(function(error) {
      this.utils.toast({ title: '数据加载失败: ' + error.message, type: 'error' });
      this.setCustomState({ loading: false });
    }.bind(this));
}

/**
 * 分页拉取全部表单数据
 */
export function fetchAllFormData(formUuid, searchCondition) {
  var allData = [];
  var pageSize = 100;

  var fetchPage = function(currentPage) {
    var params = {
      formUuid: formUuid,
      currentPage: currentPage,
      pageSize: pageSize,
    };
    if (searchCondition) {
      params.searchFieldJson = JSON.stringify(searchCondition);
    }
    return this.utils.yida.searchFormDatas(params)
      .then(function(res) {
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
// 数据聚合工具
// ============================================================

export function groupCount(dataList, fieldId) {
  var result = {};
  dataList.forEach(function(item) {
    var value = item.formData[fieldId];
    if (value === undefined || value === null || value === '') return;
    var values = Array.isArray(value) ? value : [String(value)];
    values.forEach(function(val) {
      result[val] = (result[val] || 0) + 1;
    });
  });
  return result;
}

export function groupByMonth(dataList, dateFieldId) {
  var result = {};
  dataList.forEach(function(item) {
    var timestamp = item.formData[dateFieldId];
    if (!timestamp) return;
    var date = new Date(Number(timestamp));
    var month = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    result[month] = (result[month] || 0) + 1;
  });
  return result;
}

export function sumField(dataList, numberFieldId) {
  var total = 0;
  dataList.forEach(function(item) {
    total += Number(item.formData[numberFieldId]) || 0;
  });
  return total;
}

// ============================================================
// 图表渲染
// ============================================================

export function renderAllCharts() {
  if (!window.echarts) return;
  this.renderBarChart();
  this.renderPieChart();
  this.renderLineChart();
}

export function createChart(domId) {
  var container = document.getElementById(domId);
  if (!container) return null;
  var existingInstance = window.echarts.getInstanceByDom(container);
  if (existingInstance) existingInstance.dispose();
  return window.echarts.init(container);
}

export function renderBarChart() {
  var chart = this.createChart('chart-bar');
  if (!chart) return;

  var categoryData = _customState.categoryData;
  var categories = Object.keys(categoryData);
  var values = categories.map(function(key) { return categoryData[key]; });

  chart.setOption({
    title: { text: '分类统计', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: categories.length > 6 ? 30 : 0,
        fontSize: this.utils.isMobile() ? 10 : 12,
      },
    },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: values,
      itemStyle: {
        color: function(params) { return THEME_COLORS[params.dataIndex % THEME_COLORS.length]; },
      },
      barMaxWidth: 40,
    }],
    grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
  });
}

export function renderPieChart() {
  var chart = this.createChart('chart-pie');
  if (!chart) return;

  var categoryData = _customState.categoryData;
  var pieData = Object.keys(categoryData).map(function(key, index) {
    return { name: key, value: categoryData[key], itemStyle: { color: THEME_COLORS[index % THEME_COLORS.length] } };
  });

  chart.setOption({
    title: { text: '分类占比', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, type: 'scroll' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}: {d}%', fontSize: this.utils.isMobile() ? 10 : 12 },
      data: pieData,
    }],
  });
}

export function renderLineChart() {
  var chart = this.createChart('chart-line');
  if (!chart) return;

  var monthlyData = _customState.monthlyData;
  var months = Object.keys(monthlyData).sort();
  var values = months.map(function(m) { return monthlyData[m]; });

  chart.setOption({
    title: { text: '月度趋势', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: months,
      boundaryGap: false,
      axisLabel: { fontSize: this.utils.isMobile() ? 10 : 12 },
    },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      data: values,
      smooth: true,
      areaStyle: { color: 'rgba(0,137,255,0.15)' },
      lineStyle: { color: '#0089FF', width: 2 },
      itemStyle: { color: '#0089FF' },
    }],
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
  });
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var timestamp = this.state.timestamp;
  var isMobile = this.utils.isMobile();
  var loading = _customState.loading;
  var totalCount = _customState.totalCount;
  var totalAmount = _customState.totalAmount;
  var categoryCount = Object.keys(_customState.categoryData).length;

  var styles = {
    container: {
      padding: isMobile ? '12px' : '24px',
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      borderRadius: '0 !important',
    },
    header: {
      fontSize: isMobile ? '18px' : '22px',
      fontWeight: 'bold',
      color: '#1a1a1a',
      marginBottom: isMobile ? '12px' : '20px',
    },
    statsRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: isMobile ? '8px' : '16px',
      marginBottom: isMobile ? '12px' : '20px',
    },
    statCard: {
      flex: isMobile ? '1 1 45%' : '1 1 22%',
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: isMobile ? '12px' : '16px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    },
    statLabel: {
      fontSize: '12px',
      color: '#999',
      marginBottom: '4px',
    },
    statValue: {
      fontSize: isMobile ? '20px' : '28px',
      fontWeight: 'bold',
      color: '#1a1a1a',
    },
    chartsRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: isMobile ? '8px' : '16px',
    },
    chartCard: {
      flex: isMobile ? '1 1 100%' : '1 1 48%',
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: isMobile ? '12px' : '16px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      marginBottom: isMobile ? '8px' : '16px',
    },
    chartCardFull: {
      flex: '1 1 100%',
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: isMobile ? '12px' : '16px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      marginBottom: isMobile ? '8px' : '16px',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      fontSize: '16px',
      color: '#999',
    },
    refreshButton: {
      padding: '8px 16px',
      backgroundColor: '#0089FF',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '13px',
    },
  };

  var chartHeight = isMobile ? '280px' : '380px';

  if (loading) {
    return (
      <div>
        <div style={{ display: 'none' }}>{timestamp}</div>
        <div style={styles.container}>
          <div style={styles.loadingContainer}>数据加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'none' }}>{timestamp}</div>
      <div style={styles.container}>
        {/* 标题栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '12px' : '20px' }}>
          <div style={styles.header}>数据看板</div>
          <button style={styles.refreshButton} onClick={(e) => { this.loadDashboardData(); }}>刷新数据</button>
        </div>

        {/* 统计卡片 */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>数据总量</div>
            <div style={styles.statValue}>{totalCount}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>分类数</div>
            <div style={styles.statValue}>{categoryCount}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>数值合计</div>
            <div style={Object.assign({}, styles.statValue, { color: '#0089FF' })}>{totalAmount.toLocaleString()}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>平均值</div>
            <div style={Object.assign({}, styles.statValue, { color: '#00B853' })}>{totalCount > 0 ? (totalAmount / totalCount).toFixed(1) : '0'}</div>
          </div>
        </div>

        {/* 图表区域 */}
        <div style={styles.chartsRow}>
          <div style={styles.chartCard}>
            <div id="chart-bar" style={{ width: '100%', height: chartHeight }} />
          </div>
          <div style={styles.chartCard}>
            <div id="chart-pie" style={{ width: '100%', height: chartHeight }} />
          </div>
          <div style={styles.chartCardFull}>
            <div id="chart-line" style={{ width: '100%', height: chartHeight }} />
          </div>
        </div>
      </div>
    </div>
  );
}
