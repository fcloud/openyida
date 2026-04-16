// ============================================================
// 项目数据大屏 — 深色科技风 + 中国地图
// ============================================================

var ECHARTS_CDN = 'https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js';
var CHINA_MAP_CDN = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';
var FORM_UUID = 'FORM-5FE501D96DDA42BDABA8AA33323CC4319LIC';

var FIELD = {
  name: 'textField_j2xehece',
  desc: 'textareaField_j2xe87xm',
  startDate: 'dateField_j2xe9bqx',
  endDate: 'dateField_j2xex1if',
  status: 'selectField_j2xeiduk',
  priority: 'selectField_j2xeiguj',
  budget: 'textField_j2xeja4e',
  progress: 'rateField_j2xeiy60',
};

var STATUS_LIST = ['规划中', '进行中', '已完成', '已延期', '已取消'];
var PRIORITY_LIST = ['低', '中', '高', '紧急'];

// 城市坐标映射（经度, 纬度）
var CITY_GEO = {
  '北京': [116.46, 39.92], '上海': [121.48, 31.22], '广州': [113.23, 23.16],
  '深圳': [114.07, 22.62], '杭州': [120.19, 30.26], '成都': [104.06, 30.67],
  '武汉': [114.31, 30.52], '南京': [118.78, 32.04], '西安': [108.95, 34.27],
  '重庆': [106.54, 29.59], '天津': [117.20, 39.13], '长沙': [112.94, 28.23],
  '青岛': [120.33, 36.07], '厦门': [118.10, 24.46], '郑州': [113.65, 34.76],
  '合肥': [117.27, 31.86], '昆明': [102.73, 25.04], '沈阳': [123.38, 41.80],
  '哈尔滨': [126.63, 45.75], '福州': [119.30, 26.08], '济南': [117.00, 36.65],
  '苏州': [120.62, 31.32], '无锡': [120.29, 31.59], '贵阳': [106.71, 26.57],
  '兰州': [103.73, 36.03], '大连': [121.62, 38.92], '宁波': [121.56, 29.87],
  '石家庄': [114.48, 38.03], '太原': [112.55, 37.87], '南昌': [115.89, 28.68],
  '南宁': [108.33, 22.84], '海口': [110.35, 20.02], '呼和浩特': [111.65, 40.82],
  '乌鲁木齐': [87.68, 43.77], '拉萨': [91.11, 29.97], '银川': [106.27, 38.47],
  '西宁': [101.74, 36.56],
};

// 城市关键词匹配
var CITY_KEYWORDS = {
  '华东': '上海', '总部': '北京', '研发': '深圳', '电商': '杭州', '供应链': '广州',
  '西部': '成都', '制造': '武汉', '金融': '南京', '航天': '西安', '工业': '重庆',
  '港口': '天津', '交通': '长沙', '海洋': '青岛', '跨境': '厦门', '物流': '郑州',
  '量子': '合肥', '文旅': '昆明', '装备': '沈阳', '冰雪': '哈尔滨', '政务': '福州',
  '医疗': '济南', '园区': '苏州', '车联网': '无锡', '大数据': '贵阳', '能源': '兰州',
};

var STATUS_COLORS = {
  '规划中': '#8b5cf6', '进行中': '#06b6d4', '已完成': '#10b981',
  '已延期': '#f59e0b', '已取消': '#6b7280',
};

var PRIORITY_COLORS = { '低': '#6b7280', '中': '#06b6d4', '高': '#f59e0b', '紧急': '#ef4444' };

// ============================================================
// 状态管理
// ============================================================

var _customState = {
  loading: true,
  allData: [],
  currentTime: '',
  scrollIndex: 0,
};

export function getCustomState(key) {
  if (key) return _customState[key];
  return Object.assign({}, _customState);
}

export function setCustomState(newState) {
  Object.keys(newState).forEach(function(key) { _customState[key] = newState[key]; });
  this.forceUpdate();
}

export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

// ============================================================
// 城市提取
// ============================================================

export function extractCity(item) {
  var fd = item.formData || {};
  var desc = fd[FIELD.desc] || '';
  var name = fd[FIELD.name] || '';

  // 优先从描述中提取 [城市:xxx]
  var match = desc.match(/\[城市:(.+?)\]/);
  if (match && CITY_GEO[match[1]]) return match[1];

  // 按关键词匹配
  var keys = Object.keys(CITY_KEYWORDS);
  for (var i = 0; i < keys.length; i++) {
    if (name.indexOf(keys[i]) !== -1 || desc.indexOf(keys[i]) !== -1) {
      return CITY_KEYWORDS[keys[i]];
    }
  }

  // 直接匹配城市名
  var cities = Object.keys(CITY_GEO);
  for (var j = 0; j < cities.length; j++) {
    if (name.indexOf(cities[j]) !== -1 || desc.indexOf(cities[j]) !== -1) {
      return cities[j];
    }
  }

  return null;
}

// ============================================================
// 生命周期
// ============================================================

export function didMount() {
  var self = this;
  this.utils.loadScript(ECHARTS_CDN)
    .then(function() {
      return self.loadChinaMap();
    })
    .then(function() {
      self.loadAllData();
    })
    .catch(function(err) {
      self.utils.toast({ title: '资源加载失败: ' + err.message, type: 'error' });
    });
}

export function didUnmount() {
  if (this._clockTimer) clearInterval(this._clockTimer);
  if (this._scrollTimer) clearInterval(this._scrollTimer);
  if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
  var chartIds = ['chinaMap', 'statusPie', 'priorityBar', 'budgetLine', 'progressGauge'];
  chartIds.forEach(function(id) {
    var el = document.getElementById('bs-' + id);
    if (el) { var inst = window.echarts.getInstanceByDom(el); if (inst) inst.dispose(); }
  });
}

export function loadChinaMap() {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', CHINA_MAP_CDN, true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          var geoJson = JSON.parse(xhr.responseText);
          window.echarts.registerMap('china', geoJson);
          resolve();
        } catch (e) { reject(e); }
      } else { reject(new Error('Map load failed: ' + xhr.status)); }
    };
    xhr.onerror = function() { reject(new Error('Network error')); };
    xhr.send();
  });
}

// ============================================================
// 数据加载
// ============================================================

export function loadAllData() {
  var self = this;
  this.fetchAllFormData(FORM_UUID)
    .then(function(allData) {
      _customState.allData = allData;
      self.setCustomState({ loading: false });
      setTimeout(function() {
        self.renderAllCharts();
        self.startClock();
        self.startScroll();
        self.bindResize();
      }, 150);
    })
    .catch(function(err) {
      self.utils.toast({ title: '数据加载失败', type: 'error' });
      self.setCustomState({ loading: false });
    });
}

export function fetchAllFormData(formUuid) {
  var allData = [];
  var pageSize = 100;
  var self = this;
  var fetchPage = function(currentPage) {
    return self.utils.yida.searchFormDatas({
      formUuid: formUuid, currentPage: currentPage, pageSize: pageSize,
    }).then(function(res) {
      allData = allData.concat(res.data || []);
      if (currentPage * pageSize < (res.totalCount || 0)) return fetchPage(currentPage + 1);
      return allData;
    });
  };
  return fetchPage(1);
}

export function startClock() {
  var self = this;
  var updateTime = function() {
    var now = new Date();
    var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
    _customState.currentTime = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
    self.forceUpdate();
  };
  updateTime();
  this._clockTimer = setInterval(updateTime, 1000);
}

export function startScroll() {
  var self = this;
  this._scrollTimer = setInterval(function() {
    _customState.scrollIndex = (_customState.scrollIndex + 1) % Math.max(_customState.allData.length, 1);
    self.forceUpdate();
  }, 3000);
}

export function bindResize() {
  var chartIds = ['chinaMap', 'statusPie', 'priorityBar', 'budgetLine', 'progressGauge'];
  this._resizeHandler = function() {
    chartIds.forEach(function(id) {
      var el = document.getElementById('bs-' + id);
      if (el) { var inst = window.echarts.getInstanceByDom(el); if (inst) inst.resize(); }
    });
  };
  window.addEventListener('resize', this._resizeHandler);
}

// ============================================================
// 统计
// ============================================================

export function computeStats() {
  var data = _customState.allData;
  var totalBudget = 0, totalProgress = 0, statusCounts = {}, priorityCounts = {};
  data.forEach(function(item) {
    var fd = item.formData || {};
    var status = fd[FIELD.status] || '未知';
    var priority = fd[FIELD.priority] || '未知';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
    totalBudget += Number(fd[FIELD.budget]) || 0;
    totalProgress += Number(fd[FIELD.progress]) || 0;
  });
  var count = data.length;
  return {
    totalCount: count,
    totalBudget: totalBudget,
    avgProgress: count > 0 ? (totalProgress / count * 20).toFixed(0) : '0',
    statusCounts: statusCounts,
    priorityCounts: priorityCounts,
    inProgress: statusCounts['进行中'] || 0,
    completed: statusCounts['已完成'] || 0,
  };
}

// ============================================================
// 图表渲染
// ============================================================

export function renderAllCharts() {
  this.renderChinaMap();
  this.renderStatusPie();
  this.renderPriorityBar();
  this.renderBudgetLine();
  this.renderProgressGauge();
}

function bsTooltip() {
  return {
    backgroundColor: 'rgba(0, 15, 45, 0.92)',
    borderColor: 'rgba(0, 200, 255, 0.3)',
    borderWidth: 1,
    textStyle: { color: '#e0f0ff', fontSize: 12 },
    extraCssText: 'border-radius: 4px; box-shadow: 0 0 20px rgba(0, 150, 255, 0.3);',
  };
}

export function renderChinaMap() {
  var container = document.getElementById('bs-chinaMap');
  if (!container) return;
  var chart = window.echarts.init(container, 'dark');
  var data = _customState.allData;
  var self = this;

  // 按城市聚合
  var cityData = {};
  data.forEach(function(item) {
    var city = self.extractCity(item);
    if (!city || !CITY_GEO[city]) return;
    if (!cityData[city]) cityData[city] = { count: 0, budget: 0, projects: [] };
    cityData[city].count += 1;
    cityData[city].budget += Number((item.formData || {})[FIELD.budget]) || 0;
    cityData[city].projects.push((item.formData || {})[FIELD.name] || '');
  });

  var scatterData = Object.keys(cityData).map(function(city) {
    var geo = CITY_GEO[city];
    return {
      name: city,
      value: geo.concat([cityData[city].count, cityData[city].budget]),
    };
  });

  var effectData = scatterData.filter(function(d) { return d.value[2] >= 2; });

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: Object.assign({}, bsTooltip(), {
      trigger: 'item',
      formatter: function(params) {
        if (params.seriesType === 'effectScatter' || params.seriesType === 'scatter') {
          var city = params.name;
          var info = cityData[city];
          if (!info) return city;
          var html = '<b style="color:#00d4ff">' + city + '</b><br/>';
          html += '项目数: <b>' + info.count + '</b> 个<br/>';
          html += '预算: <b>' + info.budget + '</b> 万<br/>';
          html += '<span style="color:#8899aa">─────────</span><br/>';
          info.projects.slice(0, 5).forEach(function(p) { html += '· ' + p + '<br/>'; });
          if (info.projects.length > 5) html += '...等 ' + info.projects.length + ' 个项目';
          return html;
        }
        return params.name;
      },
    }),
    geo: {
      map: 'china',
      roam: false,
      zoom: 1.2,
      center: [104.5, 36],
      label: { show: false },
      itemStyle: {
        areaColor: 'rgba(10, 30, 70, 0.6)',
        borderColor: 'rgba(0, 150, 255, 0.4)',
        borderWidth: 1,
      },
      emphasis: {
        itemStyle: {
          areaColor: 'rgba(0, 100, 200, 0.4)',
          borderColor: '#00d4ff',
          borderWidth: 2,
        },
        label: { show: true, color: '#00d4ff', fontSize: 11 },
      },
    },
    series: [
      {
        name: '项目分布',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: effectData,
        symbolSize: function(val) { return Math.max(10, Math.min(val[2] * 6, 30)); },
        showEffectOn: 'render',
        rippleEffect: { brushType: 'stroke', scale: 3, period: 4 },
        itemStyle: { color: '#00d4ff', shadowBlur: 10, shadowColor: 'rgba(0, 200, 255, 0.5)' },
        zlevel: 1,
      },
      {
        name: '项目点',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: scatterData.filter(function(d) { return d.value[2] < 2; }),
        symbolSize: 8,
        itemStyle: { color: '#4ade80', shadowBlur: 6, shadowColor: 'rgba(74, 222, 128, 0.4)' },
        zlevel: 1,
      },
    ],
  });
}

export function renderStatusPie() {
  var container = document.getElementById('bs-statusPie');
  if (!container) return;
  var chart = window.echarts.init(container, 'dark');
  var stats = this.computeStats();

  var pieData = STATUS_LIST.map(function(s) {
    return { name: s, value: stats.statusCounts[s] || 0, itemStyle: { color: STATUS_COLORS[s] } };
  }).filter(function(d) { return d.value > 0; });

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: Object.assign({}, bsTooltip(), { trigger: 'item' }),
    series: [{
      type: 'pie',
      radius: ['45%', '72%'],
      center: ['50%', '52%'],
      label: {
        show: true,
        formatter: '{b}\n{c}',
        color: '#8899bb',
        fontSize: 10,
        lineHeight: 14,
      },
      labelLine: { lineStyle: { color: 'rgba(100,150,200,0.3)' } },
      itemStyle: { borderRadius: 4, borderColor: 'rgba(10,14,39,0.8)', borderWidth: 2 },
      data: pieData,
    }],
  });
}

export function renderPriorityBar() {
  var container = document.getElementById('bs-priorityBar');
  if (!container) return;
  var chart = window.echarts.init(container, 'dark');
  var stats = this.computeStats();

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: Object.assign({}, bsTooltip(), { trigger: 'axis' }),
    grid: { left: '15%', right: '8%', top: '12%', bottom: '16%' },
    xAxis: {
      type: 'category',
      data: PRIORITY_LIST,
      axisLabel: { color: '#6b8299', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(0,150,255,0.15)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#4a6080', fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(0,150,255,0.08)' } },
    },
    series: [{
      type: 'bar',
      barWidth: '45%',
      data: PRIORITY_LIST.map(function(p) {
        return {
          value: stats.priorityCounts[p] || 0,
          itemStyle: {
            color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: PRIORITY_COLORS[p] },
              { offset: 1, color: PRIORITY_COLORS[p] + '30' },
            ]),
            borderRadius: [3, 3, 0, 0],
          },
        };
      }),
      label: {
        show: true, position: 'top', color: '#8899bb', fontSize: 11, fontWeight: 600,
        formatter: function(p) { return p.value > 0 ? p.value : ''; },
      },
    }],
  });
}

export function renderBudgetLine() {
  var container = document.getElementById('bs-budgetLine');
  if (!container) return;
  var chart = window.echarts.init(container, 'dark');
  var data = _customState.allData;

  var monthlyData = {};
  data.forEach(function(item) {
    var fd = item.formData || {};
    var startDate = fd[FIELD.startDate];
    if (!startDate) return;
    var date = new Date(Number(startDate));
    var key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    if (!monthlyData[key]) monthlyData[key] = { count: 0, budget: 0 };
    monthlyData[key].count += 1;
    monthlyData[key].budget += Number(fd[FIELD.budget]) || 0;
  });

  var months = Object.keys(monthlyData).sort();
  var counts = months.map(function(m) { return monthlyData[m].count; });
  var budgets = months.map(function(m) { return monthlyData[m].budget; });

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: Object.assign({}, bsTooltip(), { trigger: 'axis' }),
    legend: {
      data: ['项目数', '预算(万)'],
      textStyle: { color: '#6b8299', fontSize: 10 },
      top: '2%', right: '4%',
      icon: 'roundRect', itemWidth: 12, itemHeight: 3,
    },
    grid: { left: '12%', right: '12%', top: '18%', bottom: '14%' },
    xAxis: {
      type: 'category', data: months, boundaryGap: false,
      axisLabel: { color: '#4a6080', fontSize: 9, rotate: 30 },
      axisLine: { lineStyle: { color: 'rgba(0,150,255,0.15)' } },
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: 'value', name: '数量', nameTextStyle: { color: '#4a6080', fontSize: 9 },
        axisLabel: { color: '#4a6080', fontSize: 9 },
        splitLine: { lineStyle: { color: 'rgba(0,150,255,0.06)' } },
        axisLine: { show: false }, axisTick: { show: false },
      },
      {
        type: 'value', name: '万元', nameTextStyle: { color: '#4a6080', fontSize: 9 },
        axisLabel: { color: '#4a6080', fontSize: 9 },
        splitLine: { show: false },
        axisLine: { show: false }, axisTick: { show: false },
      },
    ],
    series: [
      {
        name: '项目数', type: 'line', data: counts, smooth: 0.4,
        symbol: 'circle', symbolSize: 5,
        lineStyle: { color: '#06b6d4', width: 2 },
        itemStyle: { color: '#06b6d4' },
        areaStyle: {
          color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(6,182,212,0.25)' },
            { offset: 1, color: 'rgba(6,182,212,0.02)' },
          ]),
        },
      },
      {
        name: '预算(万)', type: 'line', yAxisIndex: 1, data: budgets, smooth: 0.4,
        symbol: 'circle', symbolSize: 5,
        lineStyle: { color: '#f59e0b', width: 2 },
        itemStyle: { color: '#f59e0b' },
        areaStyle: {
          color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245,158,11,0.2)' },
            { offset: 1, color: 'rgba(245,158,11,0.02)' },
          ]),
        },
      },
    ],
  });
}

export function renderProgressGauge() {
  var container = document.getElementById('bs-progressGauge');
  if (!container) return;
  var chart = window.echarts.init(container, 'dark');
  var stats = this.computeStats();
  var pct = Number(stats.avgProgress);

  chart.setOption({
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      startAngle: 220, endAngle: -40,
      min: 0, max: 100, splitNumber: 5,
      radius: '90%', center: ['50%', '56%'],
      axisLine: {
        lineStyle: {
          width: 12,
          color: [[0.3, '#ef4444'], [0.6, '#f59e0b'], [0.8, '#06b6d4'], [1, '#10b981']],
        },
      },
      pointer: { itemStyle: { color: '#00d4ff' }, width: 4, length: '55%' },
      axisTick: { distance: -12, length: 4, lineStyle: { color: 'rgba(0,200,255,0.3)', width: 1 } },
      splitLine: { distance: -12, length: 12, lineStyle: { color: 'rgba(0,200,255,0.3)', width: 1.5 } },
      axisLabel: { color: '#4a6080', fontSize: 9, distance: 18 },
      detail: {
        valueAnimation: true,
        formatter: pct + '%',
        color: '#00d4ff',
        fontSize: 20, fontWeight: 700,
        offsetCenter: [0, '72%'],
      },
      data: [{ value: pct }],
    }],
  });
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var timestamp = this.state.timestamp;
  var loading = _customState.loading;
  var self = this;

  // 深色大屏配色
  var C = {
    bg: '#0a0e27',
    panelBg: 'rgba(6, 20, 50, 0.75)',
    border: 'rgba(0, 150, 255, 0.2)',
    borderGlow: 'rgba(0, 150, 255, 0.08)',
    accent: '#00d4ff',
    accentDim: 'rgba(0, 212, 255, 0.6)',
    text: '#c8daf0',
    textDim: '#5a7a9a',
    textBright: '#e8f4ff',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  var s = {
    page: {
      width: '100%', minHeight: '100vh', margin: 0, padding: 0,
      background: 'linear-gradient(180deg, #060a1f 0%, #0a0e27 30%, #0d1230 100%)',
      fontFamily: '"DIN Alternate", "Helvetica Neue", -apple-system, sans-serif',
      color: C.text, overflow: 'hidden', position: 'relative',
    },
    // 顶部标题栏
    header: {
      height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', zIndex: 10,
      background: 'linear-gradient(180deg, rgba(0,100,200,0.12) 0%, transparent 100%)',
      borderBottom: '1px solid ' + C.border,
    },
    headerTitle: {
      fontSize: 24, fontWeight: 700, letterSpacing: '6px',
      background: 'linear-gradient(90deg, ' + C.accentDim + ', ' + C.accent + ', ' + C.accentDim + ')',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      textShadow: 'none',
    },
    headerTime: {
      position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)',
      fontSize: 13, color: C.textDim, fontFamily: '"DIN Alternate", monospace', letterSpacing: '1px',
    },
    headerDecoLeft: {
      position: 'absolute', left: 0, top: 0, width: 200, height: '100%',
      background: 'linear-gradient(90deg, rgba(0,150,255,0.08), transparent)',
    },
    headerDecoRight: {
      position: 'absolute', right: 0, top: 0, width: 200, height: '100%',
      background: 'linear-gradient(-90deg, rgba(0,150,255,0.08), transparent)',
    },
    // 主体三栏布局
    body: {
      display: 'flex', height: 'calc(100vh - 94px)', padding: '10px 12px',
      gap: 10,
    },
    leftPanel: { width: '24%', display: 'flex', flexDirection: 'column', gap: 10 },
    centerPanel: { flex: 1, display: 'flex', flexDirection: 'column', gap: 10 },
    rightPanel: { width: '24%', display: 'flex', flexDirection: 'column', gap: 10 },
    // 面板卡片
    card: {
      background: C.panelBg, borderRadius: 4,
      border: '1px solid ' + C.border,
      boxShadow: '0 0 20px ' + C.borderGlow + ', inset 0 0 30px rgba(0,50,100,0.05)',
      position: 'relative', overflow: 'hidden',
    },
    cardTitle: {
      fontSize: 13, fontWeight: 600, color: C.accent, padding: '10px 14px 6px',
      borderBottom: '1px solid rgba(0,150,255,0.1)',
      display: 'flex', alignItems: 'center', gap: 6,
    },
    cardTitleDot: {
      width: 6, height: 6, borderRadius: '50%', background: C.accent,
      boxShadow: '0 0 6px ' + C.accent,
    },
    // KPI 数字
    kpiRow: {
      display: 'flex', flexWrap: 'wrap', gap: 8, padding: '10px 12px',
    },
    kpiItem: {
      flex: '1 1 45%', textAlign: 'center', padding: '8px 4px',
      background: 'rgba(0,100,200,0.06)', borderRadius: 4,
      border: '1px solid rgba(0,150,255,0.1)',
    },
    kpiValue: {
      fontSize: 26, fontWeight: 700, lineHeight: 1.1,
      fontFamily: '"DIN Alternate", monospace',
    },
    kpiLabel: { fontSize: 10, color: C.textDim, marginTop: 2 },
    // 项目列表
    listWrap: { flex: 1, overflow: 'hidden', padding: '6px 10px' },
    listItem: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 8px', marginBottom: 4, borderRadius: 3,
      background: 'rgba(0,100,200,0.06)',
      border: '1px solid rgba(0,150,255,0.08)',
      fontSize: 11, transition: 'all 0.3s',
    },
    listItemActive: {
      background: 'rgba(0,150,255,0.12)',
      border: '1px solid rgba(0,150,255,0.25)',
    },
    statusDot: {
      width: 6, height: 6, borderRadius: '50%', marginRight: 6, flexShrink: 0,
    },
    // 底部装饰
    footer: {
      height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(0deg, rgba(0,100,200,0.08) 0%, transparent 100%)',
      borderTop: '1px solid ' + C.border,
    },
    footerLine: {
      width: 200, height: 1,
      background: 'linear-gradient(90deg, transparent, ' + C.accent + ', transparent)',
    },
    // 加载
    loadingWrap: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', gap: 16,
    },
    loadingRing: {
      width: 40, height: 40, borderRadius: '50%',
      border: '3px solid rgba(0,150,255,0.15)',
      borderTopColor: C.accent,
      animation: 'bsSpin 0.8s linear infinite',
    },
  };

  var cssAnim = '@keyframes bsSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';

  if (loading) {
    return (
      <div style={s.page}>
        <div style={{ display: 'none' }}>{timestamp}</div>
        <style dangerouslySetInnerHTML={{ __html: cssAnim }} />
        <div style={s.loadingWrap}>
          <div style={s.loadingRing}></div>
          <div style={{ color: C.accent, fontSize: 14, letterSpacing: '2px' }}>数据加载中</div>
        </div>
      </div>
    );
  }

  var stats = this.computeStats();
  var scrollIdx = _customState.scrollIndex;
  var visibleCount = 8;
  var sortedData = _customState.allData.slice().sort(function(a, b) {
    return (Number((b.formData || {})[FIELD.budget]) || 0) - (Number((a.formData || {})[FIELD.budget]) || 0);
  });

  return (
    <div style={s.page}>
      <div style={{ display: 'none' }}>{timestamp}</div>
      <style dangerouslySetInnerHTML={{ __html: cssAnim }} />

      {/* 顶部标题栏 */}
      <div style={s.header}>
        <div style={s.headerDecoLeft}></div>
        <div style={s.headerDecoRight}></div>
        <div style={s.headerTitle}>项 目 管 理 数 据 大 屏</div>
        <div style={s.headerTime}>{_customState.currentTime}</div>
      </div>

      {/* 三栏主体 */}
      <div style={s.body}>

        {/* ── 左侧面板 ── */}
        <div style={s.leftPanel}>
          {/* KPI 数字 */}
          <div style={Object.assign({}, s.card)}>
            <div style={s.cardTitle}>
              <div style={s.cardTitleDot}></div>
              <span>核心指标</span>
            </div>
            <div style={s.kpiRow}>
              <div style={s.kpiItem}>
                <div style={Object.assign({}, s.kpiValue, { color: C.accent })}>{stats.totalCount}</div>
                <div style={s.kpiLabel}>项目总数</div>
              </div>
              <div style={s.kpiItem}>
                <div style={Object.assign({}, s.kpiValue, { color: '#06b6d4' })}>{stats.inProgress}</div>
                <div style={s.kpiLabel}>进行中</div>
              </div>
              <div style={s.kpiItem}>
                <div style={Object.assign({}, s.kpiValue, { color: C.success })}>{stats.completed}</div>
                <div style={s.kpiLabel}>已完成</div>
              </div>
              <div style={s.kpiItem}>
                <div style={Object.assign({}, s.kpiValue, { color: C.warning })}>{stats.totalBudget}</div>
                <div style={s.kpiLabel}>总预算(万)</div>
              </div>
            </div>
          </div>

          {/* 状态分布 */}
          <div style={Object.assign({}, s.card, { flex: 1 })}>
            <div style={s.cardTitle}>
              <div style={s.cardTitleDot}></div>
              <span>状态分布</span>
            </div>
            <div id="bs-statusPie" style={{ width: '100%', height: 'calc(100% - 36px)' }}></div>
          </div>

          {/* 项目列表 */}
          <div style={Object.assign({}, s.card, { flex: 1 })}>
            <div style={s.cardTitle}>
              <div style={s.cardTitleDot}></div>
              <span>项目列表</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: C.textDim }}>TOP {Math.min(visibleCount, sortedData.length)}</span>
            </div>
            <div style={s.listWrap}>
              {sortedData.slice(0, visibleCount).map(function(item, idx) {
                var fd = item.formData || {};
                var isActive = idx === scrollIdx % visibleCount;
                var statusColor = STATUS_COLORS[fd[FIELD.status]] || '#6b7280';
                return (
                  <div key={idx} style={Object.assign({}, s.listItem, isActive ? s.listItemActive : {})}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                      <div style={Object.assign({}, s.statusDot, { background: statusColor, boxShadow: '0 0 4px ' + statusColor })}></div>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fd[FIELD.name] || '-'}</span>
                    </div>
                    <span style={{ color: C.warning, fontWeight: 600, fontSize: 12, marginLeft: 8, flexShrink: 0 }}>{fd[FIELD.budget] || 0}万</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 中间面板（地图） ── */}
        <div style={s.centerPanel}>
          <div style={Object.assign({}, s.card, { flex: 1 })}>
            <div style={s.cardTitle}>
              <div style={s.cardTitleDot}></div>
              <span>全国项目分布</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: C.textDim }}>
                覆盖 {Object.keys(CITY_GEO).length}+ 城市
              </span>
            </div>
            <div id="bs-chinaMap" style={{ width: '100%', height: 'calc(100% - 36px)' }}></div>
          </div>
        </div>

        {/* ── 右侧面板 ── */}
        <div style={s.rightPanel}>
          {/* 完成率仪表盘 */}
          <div style={Object.assign({}, s.card)}>
            <div style={s.cardTitle}>
              <div style={s.cardTitleDot}></div>
              <span>平均进度</span>
            </div>
            <div id="bs-progressGauge" style={{ width: '100%', height: 180 }}></div>
          </div>

          {/* 优先级分布 */}
          <div style={Object.assign({}, s.card, { flex: 1 })}>
            <div style={s.cardTitle}>
              <div style={s.cardTitleDot}></div>
              <span>优先级分布</span>
            </div>
            <div id="bs-priorityBar" style={{ width: '100%', height: 'calc(100% - 36px)' }}></div>
          </div>

          {/* 预算趋势 */}
          <div style={Object.assign({}, s.card, { flex: 1 })}>
            <div style={s.cardTitle}>
              <div style={s.cardTitleDot}></div>
              <span>月度趋势</span>
            </div>
            <div id="bs-budgetLine" style={{ width: '100%', height: 'calc(100% - 36px)' }}></div>
          </div>
        </div>
      </div>

      {/* 底部装饰 */}
      <div style={s.footer}>
        <div style={s.footerLine}></div>
      </div>
    </div>
  );
}
