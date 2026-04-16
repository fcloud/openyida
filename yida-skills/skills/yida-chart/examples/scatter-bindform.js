// ============================================================
// 散点图示例
// 展示两个数值维度之间的相关性，支持按分类着色和气泡大小
//
// 使用前请替换以下占位符：
//   FORM-XXXXXX       → 实际的表单 formUuid
//   selectField_xxx   → 实际的分类字段 ID（用于颜色分组）
//   numberField_x     → X 轴数值字段 ID
//   numberField_y     → Y 轴数值字段 ID
//   numberField_size  → 气泡大小字段 ID（可选，不用时设为 null）
// ============================================================

var ECHARTS_CDN = 'https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js';
var DATA_FORM_UUID = 'FORM-XXXXXX';
var CATEGORY_FIELD = 'selectField_xxx';
var X_FIELD = 'numberField_x';
var Y_FIELD = 'numberField_y';
var SIZE_FIELD = 'numberField_size'; // 设为 null 则不使用气泡大小

var X_AXIS_LABEL = 'X 轴指标';
var Y_AXIS_LABEL = 'Y 轴指标';

var THEME_COLORS = ['#0089FF', '#00B853', '#FFA200', '#FF7357', '#5C72FF', '#85C700', '#FFC505', '#FF6B7A'];

// ============================================================
// 状态管理
// ============================================================

var _customState = {
  loading: true,
  chartIds: ['chart-scatter'],
  scatterData: {},
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
    this.loadScatterData();
    return;
  }
  this.utils.loadScript(ECHARTS_CDN)
    .then(function() {
      this.bindChartResize();
      this.loadScatterData();
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

export function loadScatterData() {
  this.setCustomState({ loading: true });
  this.fetchAllFormData(DATA_FORM_UUID)
    .then(function(dataList) {
      var scatterData = this.buildScatterData(dataList);
      this.setCustomState({ loading: false, scatterData: scatterData });
      setTimeout(function() {
        this.renderScatterChart();
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
 * 构建散点图数据
 * 按分类字段分组，每个数据点包含 [x, y, size]
 * @returns {{ categories: string[], seriesMap: Object }}
 */
export function buildScatterData(dataList) {
  var seriesMap = {};

  dataList.forEach(function(item) {
    var category = item.formData[CATEGORY_FIELD] || '未分类';
    var xVal = Number(item.formData[X_FIELD]);
    var yVal = Number(item.formData[Y_FIELD]);

    if (isNaN(xVal) || isNaN(yVal)) return;

    if (!seriesMap[category]) seriesMap[category] = [];

    var point = [xVal, yVal];
    if (SIZE_FIELD) {
      var sizeVal = Number(item.formData[SIZE_FIELD]) || 1;
      point.push(sizeVal);
    }
    seriesMap[category].push(point);
  });

  return {
    categories: Object.keys(seriesMap),
    seriesMap: seriesMap,
  };
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

export function renderScatterChart() {
  var chart = this.createChart('chart-scatter');
  if (!chart) return;

  var scatterData = _customState.scatterData;
  var categories = scatterData.categories || [];
  var seriesMap = scatterData.seriesMap || {};
  var isMobile = this.utils.isMobile();
  var hasSizeField = SIZE_FIELD !== null;

  var series = categories.map(function(cat, index) {
    var color = THEME_COLORS[index % THEME_COLORS.length];
    return {
      name: cat,
      type: 'scatter',
      data: seriesMap[cat],
      symbolSize: hasSizeField
        ? function(data) {
            // 根据第三个维度映射气泡大小（8~40px）
            var sizeVal = data[2] || 1;
            return Math.max(8, Math.min(40, Math.sqrt(sizeVal) * 4));
          }
        : 10,
      itemStyle: { color: color, opacity: 0.7 },
      emphasis: {
        focus: 'series',
        itemStyle: { opacity: 1, borderColor: '#333', borderWidth: 1 },
      },
    };
  });

  chart.setOption({
    title: {
      text: '相关性分析',
      left: 'center',
      textStyle: { fontSize: isMobile ? 14 : 16 },
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        var data = params.data;
        var tip = params.seriesName + '<br/>'
          + X_AXIS_LABEL + ': ' + data[0] + '<br/>'
          + Y_AXIS_LABEL + ': ' + data[1];
        if (hasSizeField && data[2] !== undefined) {
          tip += '<br/>数值: ' + data[2];
        }
        return tip;
      },
    },
    legend: {
      bottom: 0,
      type: 'scroll',
      data: categories,
      textStyle: { fontSize: isMobile ? 10 : 12 },
    },
    xAxis: {
      type: 'value',
      name: X_AXIS_LABEL,
      nameLocation: 'center',
      nameGap: 30,
      axisLabel: { fontSize: isMobile ? 10 : 12 },
    },
    yAxis: {
      type: 'value',
      name: Y_AXIS_LABEL,
      nameLocation: 'center',
      nameGap: 40,
      axisLabel: { fontSize: isMobile ? 10 : 12 },
    },
    series: series,
    grid: { left: '5%', right: '5%', bottom: '15%', top: '12%', containLabel: true },
  });
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var timestamp = this.state.timestamp;
  var isMobile = this.utils.isMobile();
  var loading = _customState.loading;
  var scatterData = _customState.scatterData;
  var totalPoints = 0;
  var categories = scatterData.categories || [];
  categories.forEach(function(cat) {
    totalPoints += (scatterData.seriesMap[cat] || []).length;
  });

  var styles = {
    container: {
      padding: isMobile ? '12px' : '24px',
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      borderRadius: '0 !important',
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isMobile ? '12px' : '20px',
    },
    header: {
      fontSize: isMobile ? '18px' : '22px',
      fontWeight: 'bold',
      color: '#1a1a1a',
    },
    badge: {
      padding: '4px 10px',
      backgroundColor: '#e8f4ff',
      color: '#0089FF',
      borderRadius: '12px',
      fontSize: '12px',
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

  var chartHeight = isMobile ? '320px' : '480px';

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
        <div style={styles.headerRow}>
          <div style={styles.header}>散点分析</div>
          <div style={styles.badge}>{totalPoints} 个数据点 · {categories.length} 个分类</div>
        </div>
        <div style={styles.chartCard}>
          <div id="chart-scatter" style={{ width: '100%', height: chartHeight }} />
        </div>
      </div>
    </div>
  );
}
