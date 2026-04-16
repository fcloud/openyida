// ============================================================
// 雷达图示例
// 多维度能力评估 / 指标对比，适合展示各分类在多个指标上的表现
//
// 使用前请替换以下占位符：
//   FORM-XXXXXX        → 实际的表单 formUuid
//   selectField_xxx    → 实际的分类字段 ID（如部门、产品线）
//   numberField_dim1   → 维度1 的数值字段 ID
//   numberField_dim2   → 维度2 的数值字段 ID
//   numberField_dim3   → 维度3 的数值字段 ID
//   numberField_dim4   → 维度4 的数值字段 ID
//   numberField_dim5   → 维度5 的数值字段 ID
// ============================================================

var ECHARTS_CDN = 'https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js';
var DATA_FORM_UUID = 'FORM-XXXXXX';
var CATEGORY_FIELD = 'selectField_xxx';

// 雷达图的维度配置：{ fieldId: 字段ID, label: 显示名称, max: 最大值 }
var RADAR_DIMENSIONS = [
  { fieldId: 'numberField_dim1', label: '维度一', max: 100 },
  { fieldId: 'numberField_dim2', label: '维度二', max: 100 },
  { fieldId: 'numberField_dim3', label: '维度三', max: 100 },
  { fieldId: 'numberField_dim4', label: '维度四', max: 100 },
  { fieldId: 'numberField_dim5', label: '维度五', max: 100 },
];

var THEME_COLORS = ['#0089FF', '#00B853', '#FFA200', '#FF7357', '#5C72FF', '#85C700'];

// ============================================================
// 状态管理
// ============================================================

var _customState = {
  loading: true,
  chartIds: ['chart-radar'],
  radarData: {},
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
    this.loadRadarData();
    return;
  }
  this.utils.loadScript(ECHARTS_CDN)
    .then(function() {
      this.bindChartResize();
      this.loadRadarData();
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

export function loadRadarData() {
  this.setCustomState({ loading: true });
  this.fetchAllFormData(DATA_FORM_UUID)
    .then(function(dataList) {
      var radarData = this.buildRadarData(dataList);
      this.setCustomState({ loading: false, radarData: radarData });
      setTimeout(function() {
        this.renderRadarChart();
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
 * 构建雷达图数据
 * 按分类字段分组，每个分类计算各维度的平均值
 * @returns {{ categories: string[], seriesData: { name: string, values: number[] }[] }}
 */
export function buildRadarData(dataList) {
  var groupData = {};
  var groupCount = {};

  dataList.forEach(function(item) {
    var category = item.formData[CATEGORY_FIELD] || '未分类';
    if (!groupData[category]) {
      groupData[category] = RADAR_DIMENSIONS.map(function() { return 0; });
      groupCount[category] = 0;
    }
    groupCount[category]++;
    RADAR_DIMENSIONS.forEach(function(dim, index) {
      groupData[category][index] += Number(item.formData[dim.fieldId]) || 0;
    });
  });

  var categories = Object.keys(groupData);
  var seriesData = categories.map(function(cat) {
    var count = groupCount[cat];
    return {
      name: cat,
      values: groupData[cat].map(function(sum) {
        return count > 0 ? Math.round(sum / count * 10) / 10 : 0;
      }),
    };
  });

  return { categories: categories, seriesData: seriesData };
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

export function renderRadarChart() {
  var chart = this.createChart('chart-radar');
  if (!chart) return;

  var radarData = _customState.radarData;
  var seriesData = radarData.seriesData || [];
  var isMobile = this.utils.isMobile();

  // 根据实际数据动态计算各维度最大值
  var maxValues = RADAR_DIMENSIONS.map(function(dim, index) {
    var maxVal = dim.max;
    seriesData.forEach(function(s) {
      if (s.values[index] > maxVal) maxVal = s.values[index];
    });
    return maxVal;
  });

  chart.setOption({
    title: {
      text: '多维度评估',
      left: 'center',
      textStyle: { fontSize: isMobile ? 14 : 16 },
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      bottom: 0,
      type: 'scroll',
      data: seriesData.map(function(s) { return s.name; }),
      textStyle: { fontSize: isMobile ? 10 : 12 },
    },
    radar: {
      indicator: RADAR_DIMENSIONS.map(function(dim, index) {
        return { name: dim.label, max: maxValues[index] };
      }),
      radius: isMobile ? '55%' : '65%',
      center: ['50%', '50%'],
      name: {
        textStyle: { fontSize: isMobile ? 10 : 12, color: '#666' },
      },
    },
    series: [{
      type: 'radar',
      data: seriesData.map(function(s, index) {
        return {
          name: s.name,
          value: s.values,
          lineStyle: { color: THEME_COLORS[index % THEME_COLORS.length], width: 2 },
          itemStyle: { color: THEME_COLORS[index % THEME_COLORS.length] },
          areaStyle: { color: THEME_COLORS[index % THEME_COLORS.length], opacity: 0.15 },
        };
      }),
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

  var chartHeight = isMobile ? '350px' : '480px';

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
        <div style={styles.header}>能力评估雷达图</div>
        <div style={styles.chartCard}>
          <div id="chart-radar" style={{ width: '100%', height: chartHeight }} />
        </div>
      </div>
    </div>
  );
}
