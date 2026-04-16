/**
 * 质检数据报表 - ECharts 自定义页面
 * 
 * 功能：展示质检数据的 KPI 指标、图表分析（饼图、柱状图、折线图）和数据明细表格
 * 数据源：
 *   - 图表数据：通过 getDataAsync.json 接口从报表获取聚合数据
 *   - 明细数据：通过 searchFormDatas 接口获取
 */

// ============================================================
// 常量定义
// ============================================================

var ECHARTS_CDN = 'https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js';
var REPORT_FORM_UUID = 'REPORT-R0D66OD1BGY3Q5GAMV6KECO4WEQ32KZT310NMC';
var FORM_UUID = 'FORM-47E70941290244F7ACE131C11BBF51ABF836';
var CUBE_CODE = 'FORM_47E70941290244F7ACE131C11BBF51ABF836';
var CUBE_TENANT_ID = 'ding9a0954b4f9d9d40ef5bf40eda33b7ba0';

// 报表组件配置
var CHART_CONFIGS = {
  pie: {
    cid: 'YoushuPieChart_mn013u28o',
    componentClassName: 'YoushuPieChart',
    dataSetKey: 'chartData',
    xAlias: 'field_mn013u28p',
    yAlias: 'field_mn013u29q'
  },
  barProduct: {
    cid: 'YoushuGroupedBarChart_mn013u29r',
    componentClassName: 'YoushuGroupedBarChart',
    dataSetKey: 'chartData',
    xAlias: 'field_mn013u29s',
    yAlias: 'field_mn013u29t'
  },
  barType: {
    cid: 'YoushuGroupedBarChart_mn013u29u',
    componentClassName: 'YoushuGroupedBarChart',
    dataSetKey: 'chartData',
    xAlias: 'field_mn013u29v',
    yAlias: 'field_mn013u29w'
  },
  line: {
    cid: 'YoushuLineChart_mn013u29x',
    componentClassName: 'YoushuLineChart',
    dataSetKey: 'chartData',
    xAlias: 'field_mn013u29y',
    yAlias: 'field_mn013u29z'
  },
  indicator: {
    cid: 'YoushuSimpleIndicatorCard_mn013u28l',
    componentClassName: 'YoushuSimpleIndicatorCard',
    dataSetKey: 'youshuData'
  }
};

// 数据源表单字段映射
var FORM_FIELDS = {
  serialNumber: 'serialNumberField_c9ls14nds',
  productName: 'textField_c9ls302nk',
  inspectionType: 'selectField_c9ls5ppeu',
  inspectionDate: 'dateField_c9lt6m1ju',
  inspector: 'textField_c9lu72tyu',
  testValue: 'numberField_c9lu9f1r1',
  standardValue: 'numberField_c9luas6m9',
  deviationRate: 'numberField_c9lubs6ug',
  inspectionResult: 'radioField_c9lucyagc',
  processStatus: 'selectField_c9ludb7g0'
};

// ============================================================
// 状态管理
// ============================================================

var _customState = {
  loading: false,
  prdId: null,
  totalCount: 0,
  qualifiedRate: 0,
  avgDeviationRate: 0,
  pendingCount: 0,
  detailData: [],
  currentPage: 1,
  pageSize: 10,
  sortField: null,
  sortOrder: null,
  charts: {
    pie: null,
    barProduct: null,
    barType: null,
    line: null
  }
};

/**
 * 获取状态
 */
export function getCustomState(key) {
  if (key) {
    return _customState[key];
  }
  return { ..._customState };
}

/**
 * 设置状态
 */
export function setCustomState(newState) {
  Object.keys(newState).forEach(function(key) {
    _customState[key] = newState[key];
  });
  this.forceUpdate();
}

/**
 * 强制重新渲染
 */
export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

// ============================================================
// 工具函数（var 声明，避免被编译器消除）
// ============================================================

/**
 * 格式化日期
 */
var formatDate = function(timestamp) {
  if (!timestamp) return '-';
  var date = new Date(Number(timestamp));
  if (isNaN(date.getTime())) return '-';
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
};

/**
 * 格式化数字（保留2位小数）
 */
var formatNumber = function(num) {
  if (num === null || num === undefined || isNaN(num)) return '-';
  return Number(num).toFixed(2);
};

/**
 * 格式化百分比
 */
var formatPercent = function(num) {
  if (num === null || num === undefined || isNaN(num)) return '-';
  return Number(num).toFixed(1) + '%';
};

/**
 * 获取状态标签颜色
 */
var getStatusColor = function(status) {
  var colorMap = {
    '合格': '#10b981',
    '不合格': '#ef4444',
    '待处理': '#f59e0b',
    '已处理': '#3b82f6',
    '已完成': '#10b981'
  };
  return colorMap[status] || '#64748b';
};

/**
 * 获取表单详情页 URL
 */
var getDetailUrl = function(formInstId) {
  var appType = window.pageConfig && window.pageConfig.appType;
  if (!appType || !formInstId) return '';
  return 'https://www.aliwork.com/' + appType + '/formDetail/' + FORM_UUID + '?formInstId=' + formInstId;
};

/**
 * 动态获取 prdId（topicId）
 */
var _fetchPrdId = function() {
  var appType = window.pageConfig && window.pageConfig.appType;
  var csrfToken = window.g_config && window.g_config._csrf_token;
  var url = '/dingtalk/web/' + appType
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
    .then(function(resp) { 
      var contentType = resp.headers.get('content-type') || '';
      if (!contentType.includes('application/json') && !contentType.includes('text/json')) {
        throw new Error('导航菜单接口返回非 JSON 响应（可能是登录页），status=' + resp.status);
      }
      return resp.json(); 
    })
    .then(function(res) {
      if (res.success && Array.isArray(res.content)) {
        var targetNav = res.content.find(function(item) {
          return item.formUuid === REPORT_FORM_UUID;
        });
        if (targetNav && targetNav.topicId) {
          console.log('[报表] prdId(topicId) 获取成功（精确匹配）:', targetNav.topicId);
          return targetNav.topicId;
        }
        var reportNav = res.content.find(function(item) {
          return item.formType === 'report' && item.topicId;
        });
        if (reportNav) {
          console.log('[报表] prdId(topicId) 获取成功（兜底匹配）:', reportNav.topicId, '来自:', reportNav.formUuid);
          return reportNav.topicId;
        }
        throw new Error('应用导航菜单中未找到包含 topicId 的报表');
      }
      throw new Error(res.errorMsg || '获取应用导航菜单失败');
    });
};

/**
 * 获取报表数据
 */
var _fetchReportData = function(cid, cname, componentClassName, dataSetKey, filterValueMap) {
  var appType = window.pageConfig && window.pageConfig.appType;
  var csrfToken = window.g_config && window.g_config._csrf_token;
  var prdId = _customState.prdId;
  
  var body = new URLSearchParams({
    timezone: 'GMT+8',
    _tb_token_: csrfToken, 
    _csrf_token: csrfToken, 
    _csrf: csrfToken,
    prdId: prdId,
    pageId: REPORT_FORM_UUID,
    pageName: 'report',
    cid: cid, 
    cname: cname || '',
    componentClassName: componentClassName,
    queryContext: JSON.stringify({ filterValueMap: filterValueMap || {}, dim2table: true }),
    dataSetKey: dataSetKey,
  });
  
  var url = '/alibaba/web/' + appType + '/visual/visualizationDataRpc/getDataAsync.json';
  
  return fetch(url, { 
    method: 'POST', 
    headers: { 
      'content-type': 'application/x-www-form-urlencoded',
      'x-requested-with': 'XMLHttpRequest',
      'accept': 'application/json, text/json'
    }, 
    body: body.toString(), 
    credentials: 'include' 
  })
    .then(function(r) { 
      var contentType = r.headers.get('content-type') || '';
      if (!contentType.includes('application/json') && !contentType.includes('text/json')) {
        throw new Error('报表数据接口返回非 JSON 响应（可能是登录页），status=' + r.status);
      }
      return r.json(); 
    })
    .then(function(result) { 
      if (result.success) return result.content; 
      throw new Error(result.errorMsg || '报表数据获取失败'); 
    });
};

/**
 * 渲染饼图
 */
var renderPieChart = function(data, meta, containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  
  var xAlias = meta[0] && meta[0].alias;
  var yAlias = meta[1] && meta[1].alias;
  
  var chartData = data.map(function(row) {
    return { name: row[xAlias], value: row[yAlias] };
  });
  
  var chart = window.echarts.init(container);
  var option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderRadius: 8,
      padding: 12,
      textStyle: { color: '#f8fafc', fontSize: 13 }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { fontSize: 12, color: '#475569' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        fontSize: 12,
        color: '#475569',
        formatter: '{b}: {d}%'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      data: chartData
    }],
    color: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']
  };
  
  chart.setOption(option);
  return chart;
};

/**
 * 渲染柱状图
 */
var renderBarChart = function(data, meta, containerId, title) {
  var container = document.getElementById(containerId);
  if (!container) return;
  
  var xAlias = meta[0] && meta[0].alias;
  var yAlias = meta[1] && meta[1].alias;
  
  var categories = data.map(function(row) { return row[xAlias]; });
  var values = data.map(function(row) { return row[yAlias]; });
  
  var chart = window.echarts.init(container);
  var option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderRadius: 8,
      padding: 12,
      textStyle: { color: '#f8fafc', fontSize: 13 },
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { 
        fontSize: 11, 
        color: '#64748b',
        rotate: categories.length > 5 ? 30 : 0
      },
      axisLine: { lineStyle: { color: '#e2e8f0' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 11, color: '#64748b' },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }
    },
    series: [{
      name: title,
      type: 'bar',
      data: values,
      barWidth: '50%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#3b82f6' },
          { offset: 1, color: '#60a5fa' }
        ])
      }
    }]
  };
  
  chart.setOption(option);
  return chart;
};

/**
 * 渲染折线图
 */
var renderLineChart = function(data, meta, containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  
  var xAlias = meta[0] && meta[0].alias;
  var yAlias = meta[1] && meta[1].alias;
  
  var categories = data.map(function(row) { 
    var rawValue = row[xAlias];
    if (!rawValue) return '-';
    var numValue = Number(rawValue);
    if (!isNaN(numValue) && numValue > 1e9) {
      var date = new Date(numValue);
      if (!isNaN(date.getTime())) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
      }
    }
    return String(rawValue);
  });
  var values = data.map(function(row) { return row[yAlias]; });
  
  var chart = window.echarts.init(container);
  var option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderRadius: 8,
      padding: 12,
      textStyle: { color: '#f8fafc', fontSize: 13 }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { fontSize: 11, color: '#64748b' },
      axisLine: { lineStyle: { color: '#e2e8f0' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 11, color: '#64748b' },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }
    },
    series: [{
      name: '质检次数',
      type: 'line',
      data: values,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2, color: '#10b981' },
      itemStyle: { color: '#10b981' },
      areaStyle: {
        color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
          { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
        ])
      }
    }]
  };
  
  chart.setOption(option);
  return chart;
};

// ============================================================
// 数据加载
// ============================================================

/**
 * 加载所有数据
 */
export function loadAllData() {
  this.setCustomState({ loading: true });
  var self = this;
  
  Promise.all([
    this.loadDetailData(),
    this.loadChartData()
  ])
    .then(function() {
      self.setCustomState({ loading: false });
    })
    .catch(function(error) {
      self.utils.toast({ title: error.message, type: 'error' });
      self.setCustomState({ loading: false });
    });
}

/**
 * 加载明细数据和 KPI
 */
export function loadDetailData() {
  var self = this;
  return this.utils.yida.searchFormDatas({
    formUuid: FORM_UUID,
    currentPage: 1,
    pageSize: 100
  })
    .then(function(res) {
      var totalCount = res.totalCount || 0;
      var data = res.data || [];
      
      var qualifiedCount = 0;
      var totalDeviationRate = 0;
      var validDeviationCount = 0;
      var pendingCount = 0;
      
      data.forEach(function(item) {
        var formData = item.formData || {};
        
        if (formData[FORM_FIELDS.inspectionResult] === '合格') {
          qualifiedCount++;
        }
        
        var deviationRate = formData[FORM_FIELDS.deviationRate];
        if (deviationRate !== null && deviationRate !== undefined && !isNaN(deviationRate)) {
          totalDeviationRate += Number(deviationRate);
          validDeviationCount++;
        }
        
        if (formData[FORM_FIELDS.processStatus] === '待处理') {
          pendingCount++;
        }
      });
      
      var qualifiedRate = totalCount > 0 ? (qualifiedCount / totalCount) * 100 : 0;
      var avgDeviationRate = validDeviationCount > 0 ? totalDeviationRate / validDeviationCount : 0;
      
      self.setCustomState({
        totalCount: totalCount,
        qualifiedRate: qualifiedRate,
        avgDeviationRate: avgDeviationRate,
        pendingCount: pendingCount,
        detailData: data
      });
    });
}

/**
 * 加载图表数据
 */
export function loadChartData() {
  var self = this;
  var prdId = _customState.prdId;
  
  if (!prdId) {
    return Promise.reject(new Error('prdId 未获取'));
  }
  
  return Promise.all([
    _fetchReportData(
      CHART_CONFIGS.pie.cid, 
      '检验结果分布', 
      CHART_CONFIGS.pie.componentClassName, 
      CHART_CONFIGS.pie.dataSetKey
    ),
    _fetchReportData(
      CHART_CONFIGS.barProduct.cid, 
      '各产品质检次数', 
      CHART_CONFIGS.barProduct.componentClassName, 
      CHART_CONFIGS.barProduct.dataSetKey
    ),
    _fetchReportData(
      CHART_CONFIGS.barType.cid, 
      '各检验类型分布', 
      CHART_CONFIGS.barType.componentClassName, 
      CHART_CONFIGS.barType.dataSetKey
    ),
    _fetchReportData(
      CHART_CONFIGS.line.cid, 
      '质检日期趋势', 
      CHART_CONFIGS.line.componentClassName, 
      CHART_CONFIGS.line.dataSetKey
    )
  ])
    .then(function(results) {
      var pieResult = results[0];
      var barProductResult = results[1];
      var barTypeResult = results[2];
      var lineResult = results[3];
      
      var charts = _customState.charts;
      
      if (charts.pie) {
        charts.pie.dispose();
      }
      if (charts.barProduct) {
        charts.barProduct.dispose();
      }
      if (charts.barType) {
        charts.barType.dispose();
      }
      if (charts.line) {
        charts.line.dispose();
      }
      
      charts.pie = renderPieChart(pieResult.data, pieResult.meta, 'pie-chart');
      charts.barProduct = renderBarChart(barProductResult.data, barProductResult.meta, 'bar-product-chart', '质检次数');
      charts.barType = renderBarChart(barTypeResult.data, barTypeResult.meta, 'bar-type-chart', '质检次数');
      charts.line = renderLineChart(lineResult.data, lineResult.meta, 'line-chart');
      
      self.setCustomState({ charts: charts });
    });
}

// ============================================================
// 表格操作
// ============================================================

/**
 * 排序
 */
export function handleSort(field) {
  var currentSortField = _customState.sortField;
  var currentSortOrder = _customState.sortOrder;
  
  var newSortOrder = 'asc';
  if (currentSortField === field && currentSortOrder === 'asc') {
    newSortOrder = 'desc';
  }
  
  this.setCustomState({
    sortField: field,
    sortOrder: newSortOrder
  });
  
  this.sortDetailData();
}

/**
 * 排序明细数据
 */
export function sortDetailData() {
  var data = [..._customState.detailData];
  var sortField = _customState.sortField;
  var sortOrder = _customState.sortOrder;
  
  if (!sortField) {
    this.setCustomState({ detailData: data });
    return;
  }
  
  data.sort(function(a, b) {
    var aValue = a.formData && a.formData[sortField];
    var bValue = b.formData && b.formData[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    var aStr = String(aValue);
    var bStr = String(bValue);
    return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });
  
  this.setCustomState({ detailData: data });
}

/**
 * 上一页
 */
export function handlePrevPage() {
  var currentPage = _customState.currentPage;
  if (currentPage > 1) {
    this.setCustomState({ currentPage: currentPage - 1 });
  }
}

/**
 * 下一页
 */
export function handleNextPage() {
  var currentPage = _customState.currentPage;
  var pageSize = _customState.pageSize;
  var totalCount = _customState.totalCount;
  var maxPage = Math.ceil(totalCount / pageSize);
  
  if (currentPage < maxPage) {
    this.setCustomState({ currentPage: currentPage + 1 });
  }
}

/**
 * 跳转到指定页
 */
export function handleGoToPage(page) {
  var pageSize = _customState.pageSize;
  var totalCount = _customState.totalCount;
  var maxPage = Math.ceil(totalCount / pageSize);
  
  if (page >= 1 && page <= maxPage) {
    this.setCustomState({ currentPage: page });
  }
}

// ============================================================
// 生命周期
// ============================================================

/**
 * 页面加载完成
 */
/**
 * 加载 ECharts 库
 */
export function loadECharts() {
  if (window.echarts) {
    return this.loadAllData();
  }
  var self = this;
  this.utils.loadScript(ECHARTS_CDN)
    .then(function() {
      self.loadAllData();
    })
    .catch(function() {
      self.utils.toast({ title: 'ECharts 加载失败，请刷新重试', type: 'error' });
      self.setCustomState({ loading: false });
    });
}

export function didMount() {
  var self = this;
  
  this.setCustomState({ loading: true });
  
  _fetchPrdId()
    .then(function(prdId) {
      self.setCustomState({ prdId: prdId });
      return self.loadECharts();
    })
    .catch(function(error) {
      self.utils.toast({ title: error.message, type: 'error' });
      self.setCustomState({ loading: false });
    });
  
  var resizeHandler = function() {
    var charts = _customState.charts;
    Object.keys(charts).forEach(function(key) {
      if (charts[key]) {
        charts[key].resize();
      }
    });
  };
  
  window.addEventListener('resize', resizeHandler);
  
  _customState._resizeHandler = resizeHandler;
}

/**
 * 页面卸载
 */
export function didUnmount() {
  var charts = _customState.charts;
  Object.keys(charts).forEach(function(key) {
    if (charts[key]) {
      charts[key].dispose();
    }
  });
  
  if (_customState._resizeHandler) {
    window.removeEventListener('resize', _customState._resizeHandler);
  }
}

// ============================================================
// 渲染
// ============================================================

/**
 * 页面渲染
 */
export function renderJsx() {
  var state = this.getCustomState();
  var isMobile = this.utils.isMobile();
  
  var containerStyle = {
    padding: isMobile ? '12px' : '20px',
    minHeight: '100vh',
    background: '#f8fafc'
  };
  
  var headerStyle = {
    marginBottom: isMobile ? '16px' : '24px'
  };
  
  var titleStyle = {
    fontSize: isMobile ? '20px' : '24px',
    fontWeight: 700,
    color: '#1e293b',
    margin: 0,
    marginBottom: '8px'
  };
  
  var subtitleStyle = {
    fontSize: 13,
    color: '#64748b',
    margin: 0
  };
  
  var kpiContainerStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
    gap: isMobile ? '12px' : '16px',
    marginBottom: isMobile ? '16px' : '24px'
  };
  
  var kpiCardStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: isMobile ? '16px' : '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  };
  
  var kpiLabelStyle = {
    fontSize: 12,
    color: '#64748b',
    marginBottom: '8px'
  };
  
  var kpiValueStyle = {
    fontSize: isMobile ? '22px' : '26px',
    fontWeight: 700,
    color: '#1e293b',
    fontFeatureSettings: '"tnum"',
    margin: 0
  };
  
  var chartGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
    gap: isMobile ? '12px' : '16px',
    marginBottom: isMobile ? '16px' : '24px'
  };
  
  var chartCardStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: isMobile ? '16px' : '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  };
  
  var chartTitleStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: '#1e293b',
    margin: '0 0 12px 0'
  };
  
  var chartContainerStyle = {
    height: isMobile ? '250px' : '300px'
  };
  
  var tableCardStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: isMobile ? '16px' : '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  };
  
  var tableTitleStyle = {
    fontSize: 16,
    fontWeight: 600,
    color: '#1e293b',
    margin: '0 0 16px 0'
  };
  
  var thStyle = {
    padding: '10px 12px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#475569',
    fontSize: 12,
    borderBottom: '2px solid #e2e8f0',
    background: '#f8fafc',
    whiteSpace: 'nowrap',
    cursor: 'pointer'
  };
  
  var tdStyle = {
    padding: '10px 12px',
    borderBottom: '1px solid #e2e8f0',
    color: '#475569',
    fontSize: 13
  };
  
  var statusBadgeStyle = function(status) {
    var color = getStatusColor(status);
    return {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      lineHeight: '18px',
      color: color,
      background: color + '14',
      border: '1px solid ' + color + '30'
    };
  };
  
  var detailLinkStyle = {
    color: '#3b82f6',
    fontSize: 12,
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: 500
  };
  
  var paginationStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '16px'
  };
  
  var pageButtonStyle = {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#475569',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.2s'
  };
  
  var pageButtonActiveStyle = {
    ...pageButtonStyle,
    background: '#3b82f6',
    color: '#fff',
    borderColor: '#3b82f6'
  };
  
  var pageButtonDisabledStyle = {
    ...pageButtonStyle,
    opacity: 0.5,
    cursor: 'not-allowed'
  };
  
  var currentPage = state.currentPage;
  var pageSize = state.pageSize;
  var totalCount = state.totalCount;
  var maxPage = Math.ceil(totalCount / pageSize);
  var startIndex = (currentPage - 1) * pageSize;
  var endIndex = startIndex + pageSize;
  var displayData = state.detailData.slice(startIndex, endIndex);
  
  return (
    <div style={containerStyle}>
      <div style={{ display: 'none' }}>{this.state.timestamp}</div>
      
      <div style={headerStyle}>
        <h1 style={titleStyle}>质检数据报表</h1>
        <p style={subtitleStyle}>实时监控质检数据统计与分析</p>
      </div>
      
      <div style={kpiContainerStyle}>
        <div style={kpiCardStyle}>
          <div style={kpiLabelStyle}>总质检数</div>
          <div style={kpiValueStyle}>{state.totalCount}</div>
        </div>
        <div style={kpiCardStyle}>
          <div style={kpiLabelStyle}>合格率</div>
          <div style={{ ...kpiValueStyle, color: '#10b981' }}>{formatPercent(state.qualifiedRate)}</div>
        </div>
        <div style={kpiCardStyle}>
          <div style={kpiLabelStyle}>平均偏差率</div>
          <div style={kpiValueStyle}>{formatNumber(state.avgDeviationRate)}%</div>
        </div>
        <div style={kpiCardStyle}>
          <div style={kpiLabelStyle}>待处理数</div>
          <div style={{ ...kpiValueStyle, color: '#f59e0b' }}>{state.pendingCount}</div>
        </div>
      </div>
      
      <div style={chartGridStyle}>
        <div style={chartCardStyle}>
          <h3 style={chartTitleStyle}>检验结果分布</h3>
          <div id="pie-chart" style={chartContainerStyle}></div>
        </div>
        <div style={chartCardStyle}>
          <h3 style={chartTitleStyle}>各产品质检次数</h3>
          <div id="bar-product-chart" style={chartContainerStyle}></div>
        </div>
        <div style={chartCardStyle}>
          <h3 style={chartTitleStyle}>各检验类型分布</h3>
          <div id="bar-type-chart" style={chartContainerStyle}></div>
        </div>
        <div style={chartCardStyle}>
          <h3 style={chartTitleStyle}>质检日期趋势</h3>
          <div id="line-chart" style={chartContainerStyle}></div>
        </div>
      </div>
      
      <div style={tableCardStyle}>
        <h3 style={tableTitleStyle}>数据明细</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle} onClick={(e) => { this.handleSort(FORM_FIELDS.serialNumber); }}>
                  质检编号 {state.sortField === FORM_FIELDS.serialNumber && (state.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={thStyle} onClick={(e) => { this.handleSort(FORM_FIELDS.productName); }}>
                  产品名称 {state.sortField === FORM_FIELDS.productName && (state.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={thStyle} onClick={(e) => { this.handleSort(FORM_FIELDS.inspectionType); }}>
                  检验类型 {state.sortField === FORM_FIELDS.inspectionType && (state.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={thStyle} onClick={(e) => { this.handleSort(FORM_FIELDS.inspectionDate); }}>
                  检验日期 {state.sortField === FORM_FIELDS.inspectionDate && (state.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={thStyle} onClick={(e) => { this.handleSort(FORM_FIELDS.inspector); }}>
                  检验员 {state.sortField === FORM_FIELDS.inspector && (state.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={thStyle} onClick={(e) => { this.handleSort(FORM_FIELDS.testValue); }}>
                  检测数值 {state.sortField === FORM_FIELDS.testValue && (state.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={thStyle} onClick={(e) => { this.handleSort(FORM_FIELDS.standardValue); }}>
                  标准值 {state.sortField === FORM_FIELDS.standardValue && (state.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={thStyle} onClick={(e) => { this.handleSort(FORM_FIELDS.deviationRate); }}>
                  偏差率 {state.sortField === FORM_FIELDS.deviationRate && (state.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={thStyle}>检验结果</th>
                <th style={thStyle}>处理状态</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map(function(item, index) {
                var formData = item.formData || {};
                return (
                  <tr key={item.formInstId} style={{ background: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={tdStyle}>
                      <a 
                        href={getDetailUrl(item.formInstId)} 
                        target="_blank" 
                        style={detailLinkStyle}
                      >
                        {formData[FORM_FIELDS.serialNumber] || '-'}
                      </a>
                    </td>
                    <td style={tdStyle}>{formData[FORM_FIELDS.productName] || '-'}</td>
                    <td style={tdStyle}>{formData[FORM_FIELDS.inspectionType] || '-'}</td>
                    <td style={tdStyle}>{formatDate(formData[FORM_FIELDS.inspectionDate])}</td>
                    <td style={tdStyle}>{formData[FORM_FIELDS.inspector] || '-'}</td>
                    <td style={tdStyle}>{formatNumber(formData[FORM_FIELDS.testValue])}</td>
                    <td style={tdStyle}>{formatNumber(formData[FORM_FIELDS.standardValue])}</td>
                    <td style={tdStyle}>{formatNumber(formData[FORM_FIELDS.deviationRate])}%</td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle(formData[FORM_FIELDS.inspectionResult])}>
                        {formData[FORM_FIELDS.inspectionResult] || '-'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle(formData[FORM_FIELDS.processStatus])}>
                        {formData[FORM_FIELDS.processStatus] || '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div style={paginationStyle}>
          <button 
            style={currentPage === 1 ? pageButtonDisabledStyle : pageButtonStyle}
            disabled={currentPage === 1}
            onClick={(e) => { this.handlePrevPage(); }}
          >
            上一页
          </button>
          {Array.from({ length: Math.min(5, maxPage) }, function(_, i) {
            var pageNum;
            if (maxPage <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= maxPage - 2) {
              pageNum = maxPage - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <button
                key={pageNum}
                style={pageNum === currentPage ? pageButtonActiveStyle : pageButtonStyle}
                onClick={(e) => { this.handleGoToPage(pageNum); }}
              >
                {pageNum}
              </button>
            );
          })}
          <button 
            style={currentPage === maxPage ? pageButtonDisabledStyle : pageButtonStyle}
            disabled={currentPage === maxPage}
            onClick={(e) => { this.handleNextPage(); }}
          >
            下一页
          </button>
          <span style={{ fontSize: 12, color: '#64748b', marginLeft: '8px' }}>
            共 {totalCount} 条，第 {currentPage}/{maxPage} 页
          </span>
        </div>
      </div>
    </div>
  );
}
