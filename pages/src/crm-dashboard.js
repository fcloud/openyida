// CRM 数据看板
// 展示：客户统计、商机漏斗、跟进动态、合同金额

var APP_TYPE = 'APP_I59A1V430BTU5ZC66061';

var FORM_CUSTOMERS     = 'FORM-953351B24D8D48698D50D042EFD138C65E3P';
var FORM_OPPORTUNITIES = 'FORM-E5FB92FCD6F84F0ABB6843197AA136427UB5';
var FORM_FOLLOWUPS     = 'FORM-A4F910DAA56944BAA437733176915EECHXR0';
var FORM_CONTRACTS     = 'FORM-F4D94FB1074F463888FB3C1836FDAAFA8E76';

var OPPORTUNITY_STAGES = ['初步接触', '需求确认', '方案报价', '商务谈判', '赢单'];
var STAGE_COLORS = {
  '初步接触': '#5B8FF9',
  '需求确认': '#5AD8A6',
  '方案报价': '#F6BD16',
  '商务谈判': '#E86452',
  '赢单': '#6DC8EC',
};

// ============================================================
// 状态管理
// ============================================================

const _customState = {
  loading: true,
  error: null,
  customers: { total: 0, byStatus: {} },
  opportunities: { total: 0, byStage: {}, totalAmount: 0 },
  followups: { total: 0, thisWeek: 0, byResult: {} },
  contracts: { total: 0 },
  recentFollowups: [],
};

export function getCustomState(key) {
  if (key) return _customState[key];
  return { ..._customState };
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
  loadData.call(this);
}

export function didUnmount() {
  // 无需清理
}

// ============================================================
// 数据加载
// ============================================================

function loadData() {
  var self = this;
  self.setCustomState({ loading: true, error: null });

  var yida = self.utils.yida;

  Promise.all([
    yida.searchFormDatas({ formUuid: FORM_CUSTOMERS,     appType: APP_TYPE, pageSize: 100 }),
    yida.searchFormDatas({ formUuid: FORM_OPPORTUNITIES, appType: APP_TYPE, pageSize: 100 }),
    yida.searchFormDatas({ formUuid: FORM_FOLLOWUPS,     appType: APP_TYPE, pageSize: 100 }),
    yida.searchFormDatas({ formUuid: FORM_CONTRACTS,     appType: APP_TYPE, pageSize: 100 }),
  ]).then(function(results) {
    var customers     = (results[0] && results[0].data) || [];
    var opportunities = (results[1] && results[1].data) || [];
    var followups     = (results[2] && results[2].data) || [];
    var contracts     = (results[3] && results[3].data) || [];

    // 客户统计
    var customerByStatus = {};
    customers.forEach(function(c) {
      var status = (c.formData && c.formData.selectField_q96iseth) || '未知';
      customerByStatus[status] = (customerByStatus[status] || 0) + 1;
    });

    // 商机统计
    var oppByStage = {};
    var totalAmount = 0;
    opportunities.forEach(function(o) {
      var stage = (o.formData && o.formData.selectField_qwlc7yvf) || '未知';
      oppByStage[stage] = (oppByStage[stage] || 0) + 1;
      totalAmount += parseFloat((o.formData && o.formData.numberField_qwlcpanw) || 0) || 0;
    });

    // 跟进统计
    var weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    var followByResult = {};
    var thisWeekCount = 0;
    followups.forEach(function(f) {
      var result = (f.formData && f.formData.selectField_r8rxqzmg) || '未知';
      followByResult[result] = (followByResult[result] || 0) + 1;
      var followDate = f.formData && f.formData.dateField_r8rwbdb4;
      if (followDate && followDate > weekAgo) thisWeekCount++;
    });

    self.setCustomState({
      loading: false,
      error: null,
      customers: { total: customers.length, byStatus: customerByStatus },
      opportunities: { total: opportunities.length, byStage: oppByStage, totalAmount: totalAmount },
      followups: { total: followups.length, thisWeek: thisWeekCount, byResult: followByResult },
      contracts: { total: contracts.length },
      recentFollowups: followups.slice(0, 5),
    });
  }).catch(function(err) {
    self.setCustomState({ loading: false, error: (err && err.message) || '数据加载失败' });
  });
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  const { timestamp } = this.state;
  const self = this;
  const state = self.getCustomState();
  const isMobile = self.utils.isMobile();

  const styles = {
    page: {
      background: '#f0f2f5',
      minHeight: '100vh',
      padding: isMobile ? '12px' : '24px',
      fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
      boxSizing: 'border-box',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
    },
    title: {
      fontSize: isMobile ? '18px' : '24px',
      fontWeight: 'bold',
      color: '#1a1a2e',
      margin: 0,
    },
    refreshBtn: {
      background: '#1677ff',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '6px 16px',
      cursor: 'pointer',
      fontSize: '13px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
      gap: '16px',
      marginBottom: '20px',
    },
    card: {
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    twoCol: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '16px',
      marginBottom: '20px',
    },
    sectionTitle: {
      fontSize: '15px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: '2px solid #f0f2f5',
    },
  };

  const statCardStyle = function(color) {
    return {
      background: 'linear-gradient(135deg, ' + color + ' 0%, ' + color + 'cc 100%)',
      borderRadius: '12px',
      padding: '20px',
      color: '#fff',
      boxShadow: '0 4px 12px ' + color + '55',
    };
  };

  const funnelBarStyle = function(pct, color) {
    return {
      height: '28px',
      background: color || '#5B8FF9',
      borderRadius: '4px',
      width: Math.max(pct, 3) + '%',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '8px',
      color: '#fff',
      fontSize: '12px',
      fontWeight: 'bold',
      minWidth: '40px',
      boxSizing: 'border-box',
    };
  };

  const badgeStyle = function(color) {
    return {
      display: 'inline-block',
      background: color + '22',
      color: color,
      borderRadius: '4px',
      padding: '2px 8px',
      fontSize: '11px',
      fontWeight: 'bold',
    };
  };

  const resultColors = {
    '有意向': '#52c41a',
    '待跟进': '#1677ff',
    '暂不考虑': '#faad14',
    '已成交': '#13c2c2',
    '已拒绝': '#ff4d4f',
  };

  const customerStatusColors = {
    '潜在客户': '#5B8FF9',
    '意向客户': '#F6BD16',
    '成交客户': '#5AD8A6',
    '流失客户': '#E86452',
  };

  if (state.loading) {
    return (
      <div style={styles.page}>
        <div style={{ display: 'none' }}>{timestamp}</div>
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <div>数据加载中...</div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={styles.page}>
        <div style={{ display: 'none' }}>{timestamp}</div>
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#ff4d4f' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>❌</div>
          <div>{state.error}</div>
          <button onClick={() => loadData.call(self)} style={{ ...styles.refreshBtn, marginTop: '16px' }}>
            重新加载
          </button>
        </div>
      </div>
    );
  }

  const maxStageCount = Math.max.apply(null, OPPORTUNITY_STAGES.map(function(s) {
    return state.opportunities.byStage[s] || 0;
  }).concat([1]));

  return (
    <div style={styles.page}>
      {/* 必须保留：用于触发重新渲染 */}
      <div style={{ display: 'none' }}>{timestamp}</div>

      {/* 顶部标题 */}
      <div style={styles.header}>
        <h1 style={styles.title}>📊 CRM 数据看板</h1>
        <button onClick={() => loadData.call(self)} style={styles.refreshBtn}>
          🔄 刷新
        </button>
      </div>

      {/* 核心指标卡片 */}
      <div style={styles.grid}>
        <div style={statCardStyle('#1677ff')}>
          <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 'bold', lineHeight: 1, marginBottom: '6px' }}>{state.customers.total}</div>
          <div style={{ fontSize: '13px', opacity: 0.85 }}>👥 客户总数</div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>成交: {state.customers.byStatus['成交客户'] || 0} 家</div>
        </div>
        <div style={statCardStyle('#52c41a')}>
          <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 'bold', lineHeight: 1, marginBottom: '6px' }}>{state.opportunities.total}</div>
          <div style={{ fontSize: '13px', opacity: 0.85 }}>💼 商机总数</div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>赢单: {state.opportunities.byStage['赢单'] || 0} 个</div>
        </div>
        <div style={statCardStyle('#fa8c16')}>
          <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 'bold', lineHeight: 1, marginBottom: '6px' }}>{state.followups.total}</div>
          <div style={{ fontSize: '13px', opacity: 0.85 }}>📞 跟进总数</div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>本周: {state.followups.thisWeek} 次</div>
        </div>
        <div style={statCardStyle('#722ed1')}>
          <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 'bold', lineHeight: 1, marginBottom: '6px' }}>{state.contracts.total}</div>
          <div style={{ fontSize: '13px', opacity: 0.85 }}>📄 合同总数</div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>商机金额: {state.opportunities.totalAmount.toFixed(1)} 万</div>
        </div>
      </div>

      {/* 商机漏斗 + 客户状态 */}
      <div style={styles.twoCol}>
        {/* 商机漏斗 */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>🔻 商机漏斗</div>
          {OPPORTUNITY_STAGES.map(function(stage) {
            var count = state.opportunities.byStage[stage] || 0;
            var pct = maxStageCount > 0 ? Math.round(count / maxStageCount * 100) : 0;
            var color = STAGE_COLORS[stage] || '#5B8FF9';
            return (
              <div key={stage} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  <span>{stage}</span>
                  <span style={{ color: color, fontWeight: 'bold' }}>{count} 个</span>
                </div>
                <div style={funnelBarStyle(pct, color)}>
                  {count > 0 ? count : ''}
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666' }}>
            <span>预计总金额</span>
            <span style={{ color: '#1677ff', fontWeight: 'bold' }}>{state.opportunities.totalAmount.toFixed(1)} 万元</span>
          </div>
        </div>

        {/* 客户状态分布 */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>👥 客户状态分布</div>
          {['潜在客户', '意向客户', '成交客户', '流失客户'].map(function(status) {
            var count = state.customers.byStatus[status] || 0;
            var total = state.customers.total || 1;
            var pct = Math.round(count / total * 100);
            var color = customerStatusColors[status] || '#999';
            return (
              <div key={status} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <span style={{ color: '#333' }}>{status}</span>
                  <span style={{ color: color, fontWeight: 'bold' }}>{count} 家 ({pct}%)</span>
                </div>
                <div style={{ height: '8px', background: '#f0f2f5', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: pct + '%', background: color, borderRadius: '4px' }} />
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f0f2f5' }}>
            <div style={styles.sectionTitle}>📞 跟进结果分布</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.keys(state.followups.byResult).length === 0 ? (
                <span style={{ color: '#999', fontSize: '13px' }}>暂无数据</span>
              ) : (
                Object.keys(state.followups.byResult).map(function(result) {
                  var count = state.followups.byResult[result];
                  var color = resultColors[result] || '#999';
                  return (
                    <div key={result} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={badgeStyle(color)}>{result}</span>
                      <span style={{ fontSize: '13px', color: '#666' }}>{count}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 最近跟进记录 */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>🕐 最近跟进动态</div>
        {state.recentFollowups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#999', fontSize: '14px' }}>暂无跟进记录</div>
        ) : (
          state.recentFollowups.map(function(f, idx) {
            var result = (f.formData && f.formData.selectField_r8rxqzmg) || '';
            var color = resultColors[result] || '#999';
            var content = (f.formData && f.formData.textareaField_r8rxmb46) || '无内容';
            var customer = (f.formData && f.formData.textField_r8rwmvu9) || '未知客户';
            var method = (f.formData && f.formData.selectField_r8rwz0ir) || '';
            return (
              <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, marginTop: '5px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{customer}</span>
                    {method && <span style={{ fontSize: '11px', color: '#999', background: '#f5f5f5', padding: '1px 6px', borderRadius: '3px' }}>{method}</span>}
                    {result && <span style={badgeStyle(color)}>{result}</span>}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
                    {content.length > 60 ? content.slice(0, 60) + '...' : content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
