/**
 * 会议签到统计报表
 * 数据源报表: FORM-9F3DE073BE7D4800AA93B72E9283DFACMBD5 (会议签到记录)
 */

// ============================================================
// 配置
// ============================================================

var CONFIG = {
  formUuid: 'FORM-9F3DE073BE7D4800AA93B72E9283DFACMBD5',
  appType: 'APP_Q75GNJVS91NSO2UFT2GJ',
  fields: {
    meetingName: 'textField_vhav1vhuc',
    meetingDate: 'dateField_vhav2zjv8',
    signerName: 'textField_vhav3j87a',
    department: 'selectField_vhav4t2z0',
    signTime: 'dateField_vhaw5hl76',
    signStatus: 'radioField_vhaw6kxvt',
  },
};

var ECHARTS_CDN = 'https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js';

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
  text: '#1e293b',
  textLight: '#64748b',
};

// ============================================================
// 状态管理
// ============================================================

var _customState = {
  loading: true,
  dataList: [],
  statistics: {
    totalRecords: 0,
    totalMeetings: 0,
    signedCount: 0,
    notSignedCount: 0,
    leaveCount: 0,
    attendanceRate: 0,
  },
  meetingStats: [],
  departmentStats: [],
  statusStats: {},
};

export function getCustomState(key) {
  if (key) {
    return _customState[key];
  }
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
  self.utils.loadScript(ECHARTS_CDN)
    .then(function() {
      self.bindChartResize();
      self.loadData();
    })
    .catch(function(error) {
      self.utils.toast({ title: 'ECharts 加载失败，请刷新重试', type: 'error' });
      self.setCustomState({ loading: false });
    });
}

export function didUnmount() {
  var chartIds = ['chart-status', 'chart-department', 'chart-meeting'];
  chartIds.forEach(function(domId) {
    var container = document.getElementById(domId);
    if (container && window.echarts) {
      var instance = window.echarts.getInstanceByDom(container);
      if (instance) {
        instance.dispose();
      }
    }
  });
  if (this._resizeHandler) {
    window.removeEventListener('resize', this._resizeHandler);
  }
}

export function bindChartResize() {
  var self = this;
  self._resizeHandler = function() {
    var chartIds = ['chart-status', 'chart-department', 'chart-meeting'];
    chartIds.forEach(function(domId) {
      var container = document.getElementById(domId);
      if (container && window.echarts) {
        var instance = window.echarts.getInstanceByDom(container);
        if (instance) {
          instance.resize();
        }
      }
    });
  };
  window.addEventListener('resize', self._resizeHandler);
}

// ============================================================
// 数据加载
// ============================================================

export function loadData() {
  var self = this;
  self.setCustomState({ loading: true });
  
  self.fetchAllFormData(CONFIG.formUuid, null, 2000)
    .then(function(dataList) {
      var stats = self.calculateStatistics(dataList);
      self.setCustomState({
        loading: false,
        dataList: dataList,
        statistics: stats.summary,
        meetingStats: stats.meetingStats,
        departmentStats: stats.departmentStats,
        statusStats: stats.statusStats,
      });
      
      setTimeout(function() {
        self.renderCharts();
      }, 100);
    })
    .catch(function(error) {
      self.utils.toast({ title: '数据加载失败: ' + error.message, type: 'error' });
      self.setCustomState({ loading: false });
    });
}

export function fetchAllFormData(formUuid, searchCondition, maxRecords) {
  var self = this;
  var allData = [];
  var pageSize = 100;
  var limit = maxRecords || 2000;

  var fetchPage = function(currentPage) {
    var params = {
      formUuid: formUuid,
      currentPage: currentPage,
      pageSize: pageSize,
    };
    if (searchCondition) {
      params.searchFieldJson = JSON.stringify(searchCondition);
    }
    return self.utils.yida.searchFormDatas(params)
      .then(function(res) {
        allData = allData.concat(res.data || []);
        var totalCount = res.totalCount || 0;

        if (allData.length >= limit) {
          return allData.slice(0, limit);
        }

        if (currentPage * pageSize < totalCount) {
          return fetchPage(currentPage + 1);
        }
        return allData;
      });
  };

  return fetchPage(1);
}

// ============================================================
// 数据统计
// ============================================================

export function calculateStatistics(dataList) {
  var fields = CONFIG.fields;
  var meetingMap = {};
  var departmentMap = {};
  var statusMap = { '已签到': 0, '未签到': 0, '请假': 0 };
  
  dataList.forEach(function(item) {
    var formData = item.formData || {};
    var meetingName = formData[fields.meetingName] || '未知会议';
    var department = formData[fields.department] || '未知部门';
    var status = formData[fields.signStatus] || '未签到';
    
    if (!meetingMap[meetingName]) {
      meetingMap[meetingName] = { total: 0, signed: 0, notSigned: 0, leave: 0 };
    }
    meetingMap[meetingName].total++;
    if (status === '已签到') {
      meetingMap[meetingName].signed++;
    } else if (status === '请假') {
      meetingMap[meetingName].leave++;
    } else {
      meetingMap[meetingName].notSigned++;
    }
    
    if (!departmentMap[department]) {
      departmentMap[department] = { total: 0, signed: 0 };
    }
    departmentMap[department].total++;
    if (status === '已签到') {
      departmentMap[department].signed++;
    }
    
    if (statusMap[status] !== undefined) {
      statusMap[status]++;
    }
  });
  
  var totalRecords = dataList.length;
  var signedCount = statusMap['已签到'] || 0;
  var notSignedCount = statusMap['未签到'] || 0;
  var leaveCount = statusMap['请假'] || 0;
  var attendanceRate = totalRecords > 0 ? Math.round((signedCount / totalRecords) * 100) : 0;
  
  var meetingStats = Object.keys(meetingMap).map(function(name) {
    var data = meetingMap[name];
    return {
      name: name,
      total: data.total,
      signed: data.signed,
      notSigned: data.notSigned,
      leave: data.leave,
      rate: data.total > 0 ? Math.round((data.signed / data.total) * 100) : 0,
    };
  });
  
  var departmentStats = Object.keys(departmentMap).map(function(name) {
    var data = departmentMap[name];
    return {
      name: name,
      total: data.total,
      signed: data.signed,
      rate: data.total > 0 ? Math.round((data.signed / data.total) * 100) : 0,
    };
  });
  
  return {
    summary: {
      totalRecords: totalRecords,
      totalMeetings: Object.keys(meetingMap).length,
      signedCount: signedCount,
      notSignedCount: notSignedCount,
      leaveCount: leaveCount,
      attendanceRate: attendanceRate,
    },
    meetingStats: meetingStats,
    departmentStats: departmentStats,
    statusStats: statusMap,
  };
}

// ============================================================
// 图表渲染
// ============================================================

export function renderCharts() {
  this.renderStatusPieChart();
  this.renderDepartmentBarChart();
  this.renderMeetingBarChart();
}

export function createChart(domId) {
  var container = document.getElementById(domId);
  if (!container) {
    return null;
  }
  var existingInstance = window.echarts.getInstanceByDom(container);
  if (existingInstance) {
    existingInstance.dispose();
  }
  return window.echarts.init(container);
}

export function renderStatusPieChart() {
  var chart = this.createChart('chart-status');
  if (!chart) return;
  
  var statusStats = this.getCustomState('statusStats');
  var pieData = [
    { name: '已签到', value: statusStats['已签到'] || 0, itemStyle: { color: PALETTE.success } },
    { name: '未签到', value: statusStats['未签到'] || 0, itemStyle: { color: PALETTE.danger } },
    { name: '请假', value: statusStats['请假'] || 0, itemStyle: { color: PALETTE.warning } },
  ];
  
  chart.setOption({
    title: { text: '签到状态分布', left: 'center', textStyle: { fontSize: 14, color: PALETTE.text } },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 10, type: 'scroll' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}: {d}%' },
      data: pieData,
    }],
  });
}

export function renderDepartmentBarChart() {
  var chart = this.createChart('chart-department');
  if (!chart) return;
  
  var departmentStats = this.getCustomState('departmentStats');
  var categories = departmentStats.map(function(d) { return d.name; });
  var signedData = departmentStats.map(function(d) { return d.signed; });
  var totalData = departmentStats.map(function(d) { return d.total - d.signed; });
  
  chart.setOption({
    title: { text: '各部门签到情况', left: 'center', textStyle: { fontSize: 14, color: PALETTE.text } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 10, data: ['已签到', '未签到/请假'] },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { rotate: categories.length > 4 ? 30 : 0, fontSize: 11 },
    },
    yAxis: { type: 'value' },
    series: [
      { name: '已签到', type: 'bar', stack: 'total', data: signedData, itemStyle: { color: PALETTE.success } },
      { name: '未签到/请假', type: 'bar', stack: 'total', data: totalData, itemStyle: { color: PALETTE.neutral } },
    ],
  });
}

export function renderMeetingBarChart() {
  var chart = this.createChart('chart-meeting');
  if (!chart) return;
  
  var meetingStats = this.getCustomState('meetingStats');
  var categories = meetingStats.map(function(m) { return m.name; });
  var rateData = meetingStats.map(function(m) { return m.rate; });
  
  chart.setOption({
    title: { text: '各会议出勤率', left: 'center', textStyle: { fontSize: 14, color: PALETTE.text } },
    tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { rotate: 30, fontSize: 10, interval: 0 },
    },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [{
      type: 'bar',
      data: rateData,
      itemStyle: {
        color: function(params) {
          var value = params.value;
          if (value >= 80) return PALETTE.success;
          if (value >= 60) return PALETTE.warning;
          return PALETTE.danger;
        },
      },
      barMaxWidth: 50,
      label: { show: true, position: 'top', formatter: '{c}%', fontSize: 11 },
    }],
  });
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var timestamp = this.state.timestamp;
  var loading = this.getCustomState('loading');
  var statistics = this.getCustomState('statistics');
  var meetingStats = this.getCustomState('meetingStats');
  var isMobile = this.utils.isMobile();
  
  var styles = {
    container: {
      padding: isMobile ? '12px' : '24px',
      backgroundColor: PALETTE.bg,
      minHeight: '100vh',
    },
    header: {
      marginBottom: '24px',
    },
    title: {
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: '600',
      color: PALETTE.text,
      margin: '0 0 8px 0',
    },
    subtitle: {
      fontSize: '14px',
      color: PALETTE.textLight,
      margin: 0,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: '16px',
      marginBottom: '24px',
    },
    statCard: {
      backgroundColor: PALETTE.cardBg,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    statValue: {
      fontSize: isMobile ? '28px' : '32px',
      fontWeight: '700',
      margin: '0 0 4px 0',
    },
    statLabel: {
      fontSize: '13px',
      color: PALETTE.textLight,
      margin: 0,
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: '20px',
      marginBottom: '24px',
    },
    chartCard: {
      backgroundColor: PALETTE.cardBg,
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    chartContainer: {
      width: '100%',
      height: isMobile ? '280px' : '320px',
    },
    fullWidthChart: {
      gridColumn: isMobile ? '1' : '1 / -1',
    },
    tableCard: {
      backgroundColor: PALETTE.cardBg,
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    tableTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: PALETTE.text,
      margin: '0 0 16px 0',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '13px',
    },
    th: {
      padding: '12px 8px',
      textAlign: 'left',
      borderBottom: '2px solid ' + PALETTE.border,
      color: PALETTE.textLight,
      fontWeight: '500',
    },
    td: {
      padding: '12px 8px',
      borderBottom: '1px solid ' + PALETTE.border,
      color: PALETTE.text,
    },
    badge: {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '300px',
      color: PALETTE.textLight,
    },
    emptyContainer: {
      textAlign: 'center',
      padding: '60px 20px',
      color: PALETTE.textLight,
    },
    refreshBtn: {
      padding: '8px 16px',
      backgroundColor: PALETTE.primary,
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
    },
  };
  
  var getBadgeStyle = function(rate) {
    var bgColor = rate >= 80 ? PALETTE.success : (rate >= 60 ? PALETTE.warning : PALETTE.danger);
    return Object.assign({}, styles.badge, { backgroundColor: bgColor, color: '#fff' });
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'none' }}>{timestamp}</div>
      
      <div style={styles.header}>
        <h1 style={styles.title}>会议签到统计报表</h1>
        <p style={styles.subtitle}>实时统计会议签到情况，支持按部门、会议维度分析</p>
      </div>
      
      {loading ? (
        <div style={styles.loadingContainer}>
          <span>数据加载中...</span>
        </div>
      ) : statistics.totalRecords === 0 ? (
        <div style={styles.emptyContainer}>
          <p style={{ fontSize: '16px', marginBottom: '16px' }}>暂无签到数据</p>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>请先在「会议签到记录」表单中提交签到数据</p>
          <button style={styles.refreshBtn} onClick={(e) => { this.loadData(); }}>刷新数据</button>
        </div>
      ) : (
        <div>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <p style={Object.assign({}, styles.statValue, { color: PALETTE.primary })}>{statistics.totalRecords}</p>
              <p style={styles.statLabel}>签到记录总数</p>
            </div>
            <div style={styles.statCard}>
              <p style={Object.assign({}, styles.statValue, { color: PALETTE.accent })}>{statistics.totalMeetings}</p>
              <p style={styles.statLabel}>会议场次</p>
            </div>
            <div style={styles.statCard}>
              <p style={Object.assign({}, styles.statValue, { color: PALETTE.success })}>{statistics.signedCount}</p>
              <p style={styles.statLabel}>已签到人次</p>
            </div>
            <div style={styles.statCard}>
              <p style={Object.assign({}, styles.statValue, { color: statistics.attendanceRate >= 80 ? PALETTE.success : PALETTE.warning })}>{statistics.attendanceRate}%</p>
              <p style={styles.statLabel}>总体出勤率</p>
            </div>
          </div>
          
          <div style={styles.chartsGrid}>
            <div style={styles.chartCard}>
              <div id="chart-status" style={styles.chartContainer}></div>
            </div>
            <div style={styles.chartCard}>
              <div id="chart-department" style={styles.chartContainer}></div>
            </div>
            <div style={Object.assign({}, styles.chartCard, styles.fullWidthChart)}>
              <div id="chart-meeting" style={styles.chartContainer}></div>
            </div>
          </div>
          
          <div style={styles.tableCard}>
            <h3 style={styles.tableTitle}>会议签到明细</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>会议名称</th>
                    <th style={styles.th}>应到人数</th>
                    <th style={styles.th}>已签到</th>
                    <th style={styles.th}>未签到</th>
                    <th style={styles.th}>请假</th>
                    <th style={styles.th}>出勤率</th>
                  </tr>
                </thead>
                <tbody>
                  {meetingStats.map(function(meeting, index) {
                    return (
                      <tr key={index}>
                        <td style={styles.td}>{meeting.name}</td>
                        <td style={styles.td}>{meeting.total}</td>
                        <td style={styles.td}>{meeting.signed}</td>
                        <td style={styles.td}>{meeting.notSigned}</td>
                        <td style={styles.td}>{meeting.leave}</td>
                        <td style={styles.td}>
                          <span style={getBadgeStyle(meeting.rate)}>{meeting.rate}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
