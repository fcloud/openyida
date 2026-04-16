// ============================================================
// 堆叠面积图示例
// 展示各分类随时间的占比变化趋势，适合分析结构性变化
//
// 使用前请替换以下占位符：
//   FORM-XXXXXX       → 实际的表单 formUuid
//   selectField_xxx   → 实际的分类字段 ID
//   numberField_xxx   → 实际的数值字段 ID
//   dateField_xxx     → 实际的日期字段 ID
// ============================================================

var ECHARTS_CDN = 'https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js';
var DATA_FORM_UUID = 'FORM-XXXXXX';
var CATEGORY_FIELD = 'selectField_xxx';
var NUMBER_FIELD = 'numberField_xxx';
var DATE_FIELD = 'dateField_xxx';

var THEME_COLORS = ['#0089FF', '#00B853', '#FFA200', '#FF7357', '#5C72FF', '#85C700', '#FFC505', '#FF6B7A'];

// ============================================================
// 状态管理
// ============================================================

var _customState = {
  loading: true,
  chartIds: ['chart-stacked-area'],
  areaData: {},
  showPercentage: false,
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
  _customState.chartIds.forEach(function(domId) {
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
    this.loadAreaData();
    return;
  }
  this.utils.loadScript(ECHARTS_CDN)
    .then(function() {
      this.bindChartResize();
      this.loadAreaData();
    }.bind(this))
    .catch(function() {
      this.utils.toast({ title: 'ECharts 加载失败，请刷新重试', type: 'error' });
      this.setCustomState({ loading: false });
    }.bind(this));
}

export function bindChartResize() {
  this._resizeHandler = function() {
    _customState.chartIds.forEach(function(domId) {
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

export function loadAreaData() {
  this.setCustomState({ loading: true });
  this.fetchAllFormData(DATA_FORM_UUID)
    .then(function(dataList) {
      var areaData = this.buildAreaData(dataList);
      this.setCustomState({ loading: false, areaData: areaData });
      setTimeout(function() {
        this.renderAreaChart();
      }.bind(this), 100);
    }.bind(this))
    .catch(function(error) {
      this.utils.toast({ title: '数据加载失败: ' + error.message, type: 'error' });
      this.setCustomState({ loading: false });
    }.bind(this));
}

export function fetchAllFormData(formUuid, searchCondition) {
  var allData = [];
  var pageSize = 100;
  var fetchPage = function(currentPage) {
    var params = { formUuid: formUuid, currentPage: currentPage, pageSize: pageSize };
    if (searchCondition) {
      params.searchFieldJson = JSON.stringify(searchCondition);
    }
    return this.utils.yida.searchFormDatas(params)
      .then(function(res) {
        allData = allData.concat(res.data || []);
        if (currentPage * pageSize < (res.totalCount || 0)) {
          return fetchPage.call(this, currentPage + 1);
        }
        return allData;
      }.bind(this));
  }.bind(this);
  return fetchPage(1);
}

/**
 * 构建堆叠面积图数据
 * 按分类字段分组，每个分类按月统计数值求和
 */
export function buildAreaData(dataList) {
  var seriesMap = {};
  var monthSet = {};

  dataList.forEach(function(item) {
    var category = item.formData[CATEGORY_FIELD] || '未分类';
    var timestamp = item.formData[DATE_FIELD];
    var numValue = Number(item.formData[NUMBER_FIELD]) || 0;
    if (!timestamp) return;

    var date = new Date(Number(timestamp));
    var month = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    monthSet[month] = true;

    if (!seriesMap[category]) seriesMap[category] = {};
    seriesMap[category][month] = (seriesMap[category][month] || 0) + numValue;
  });

  var months = Object.keys(monthSet).sort();
  var categories = Object.keys(seriesMap);
  var series = categories.map(function(cat) {
    return {
      name: cat,
      data: months.map(function(m) { return seriesMap[cat][m] || 0; }),
    };
  });

  return { months: months, series: series };
}

// ============================================================
// 图表渲染
// ============================================================

export function createChart(domId) {
  var container = document.getElementById(domId);
  if (!container) return null;
  var existingInstance = window.echarts.getInstanceByDom(container);
  if (existingInstance) existingInstance.dispose();
  return window.echarts.init(container);
}

export function renderAreaChart() {
  var chart = this.createChart('chart-stacked-area');
  if (!chart) return;

  var areaData = _customState.areaData;
  var months = areaData.months || [];
  var seriesList = areaData.series || [];
  var isMobile = this.utils.isMobile();

  chart.setOption({
    title: {
      text: '趋势占比分析',
      left: 'center',
      textStyle: { fontSize: isMobile ? 14 : 16 },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      bottom: 0,
      type: 'scroll',
      textStyle: { fontSize: isMobile ? 10 : 12 },
    },
    xAxis: {
      type: 'category',
      data: months,
      boundaryGap: false,
      axisLabel: { fontSize: isMobile ? 10 : 12, rotate: months.length > 8 ? 30 : 0 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: isMobile ? 10 : 12 },
    },
    series: seriesList.map(function(s, index) {
      var color = THEME_COLORS[index % THEME_COLORS.length];
      return {
        name: s.name,
        type: 'line',
        stack: 'total',
        data: s.data,
        smooth: true,
        lineStyle: { width: 1, color: color },
        itemStyle: { color: color },
        areaStyle: { color: color, opacity: 0.4 },
        emphasis: { focus: 'series' },
      };
    }),
    grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
    dataZoom: months.length > 12 ? [{
      type: 'inside',
      start: 0,
      end: 100,
    }] : [],
  });
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var timestamp = this.state.timestamp;
  var isMobile = this.utils.isMobile();
  var loading = _customState.loading;

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
    chartCard: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: isMobile ? '12px' : '20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      fontSize: '16px',
      color: '#999',
    },
  };

  var chartHeight = isMobile ? '320px' : '450px';

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
        <div style={styles.header}>堆叠面积趋势</div>
        <div style={styles.chartCard}>
          <div id="chart-stacked-area" style={{ width: '100%', height: chartHeight }} />
        </div>
      </div>
    </div>
  );
}
