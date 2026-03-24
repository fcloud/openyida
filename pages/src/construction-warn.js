const _customState = {
  scheduleList: [],
  warningList: [],
  filterStatus: 'all',
  loading: false,
};

export function getCustomState(key) {
  if (key) return _customState[key];
  return { ..._customState };
}

export function setCustomState(newState) {
  Object.keys(newState).forEach(function(k) { _customState[k] = newState[k]; });
  this.setState({ timestamp: new Date().getTime() });
}

export function didMount() {
  const page = this;
  
  page.utils.yida.searchFormDatas({
    formUuid: 'FORM-AF5512DC6CD244E5BCA2136A3806EE9AQ7B5',
    appType: window.pageConfig.appType,
    searchFieldJson: JSON.stringify({}),
    currentPage: 1,
    pageSize: 100,
  }).then(res => {
    console.log('工期数据:', JSON.stringify(res.data, null, 2));
    _customState.scheduleList = (res.data || []).map(item => ({
      ...item.formData,
      formInstId: item.formInstId,
    }));
    updateWarningList();
    page.setState({ timestamp: new Date().getTime() });
  }).catch(err => {
    console.log('加载失败:', err);
    page.utils.toast({ title: '加载失败', type: 'error' });
  });
}

export function didUnmount() {}

const updateWarningList = () => {
  const delayed = _customState.scheduleList.filter(s => 
    s.radioField_zau8qu8a === '是' || 
    (s.dateField_zau89n1e && s.dateField_zau8juuo && s.dateField_zau8juuo > s.dateField_zau89n1e)
  );
  _customState.warningList = delayed;
};

function getProjectName(val) {
  if (!val) return '';
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return parsed.title || parsed.name || '';
    } catch {
      return val;
    }
  }
  if (typeof val === 'object') return val.name || val.title || val.id || '';
  return String(val);
}

export function renderJsx() {
  const { timestamp } = this.state;
  const { scheduleList, warningList, filterStatus, loading } = _customState;
  const page = this;
  const isMobile = page.utils.isMobile();

  const nodeTypes = ['开工', '交底', '隐蔽', '竣工'];
  const statusColors = {
    '未预警': '#d9d9d9',
    '已预警': '#ff4d4f',
    '已处理': '#52c41a'
  };

  const styles = {
    container: { padding: isMobile ? '12px' : '16px', minHeight: '100vh', background: '#f5f5f5' },
    header: { background: '#ff4d4f', color: '#fff', padding: '16px', borderRadius: '8px', marginBottom: '16px' },
    headerTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' },
    headerSub: { fontSize: '12px', opacity: 0.9 },
    statsRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' },
    statCard: { flex: 1, background: '#fff', padding: isMobile ? '12px' : '16px', borderRadius: '8px', marginRight: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    statNum: { fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' },
    statLabel: { fontSize: '12px', color: '#666', marginTop: '4px' },
    card: { background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    cardTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#333' },
    filterBar: { display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' },
    filterBtn: { padding: '4px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', border: '1px solid #d9d9d9', background: '#fff' },
    filterBtnActive: { background: '#1890ff', color: '#fff', border: '1px solid #1890ff' },
    listItem: { padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
    listItemHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
    listItemTitle: { fontSize: '14px', fontWeight: 'bold', color: '#333' },
    listItemMeta: { fontSize: '12px', color: '#999', marginTop: '4px' },
    badge: { padding: '2px 8px', borderRadius: '4px', fontSize: '12px', color: '#fff' },
    btn: { background: '#1890ff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    btnWarning: { background: '#ff4d4f' },
    btnSuccess: { background: '#52c41a' },
    empty: { textAlign: 'center', padding: '40px', color: '#999', fontSize: '14px' },
    warningBox: { background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: '8px', padding: '12px', marginBottom: '12px' },
    warningTitle: { fontSize: '14px', fontWeight: 'bold', color: '#ff4d4f', marginBottom: '8px' },
    warningText: { fontSize: '12px', color: '#ff4d4f', lineHeight: '1.6' },
  };

  const getStats = () => {
    const total = scheduleList.length;
    const delayed = scheduleList.filter(s => s.radioField_zau8qu8a === '是').length;
    const warned = scheduleList.filter(s => s.radioField_zau8ircv === '已预警').length;
    const processed = scheduleList.filter(s => s.radioField_zau8ircv === '已处理').length;
    return { total, delayed, warned, processed };
  };

  const handleFilterChange = (status) => {
    _customState.filterStatus = status;
    page.setState({ timestamp: new Date().getTime() });
  };

  const reloadData = () => {
    page.utils.yida.searchFormDatas({
      formUuid: 'FORM-AF5512DC6CD244E5BCA2136A3806EE9AQ7B5',
      appType: window.pageConfig.appType,
      searchFieldJson: JSON.stringify({}),
      currentPage: 1,
      pageSize: 100,
    }).then(res => {
      _customState.scheduleList = (res.data || []).map(item => ({
        ...item.formData,
        formInstId: item.formInstId,
      }));
      updateWarningList();
      page.setState({ timestamp: new Date().getTime() });
    });
  };

  const handleSendWarning = (item) => {
    page.utils.yida.updateFormData({
      formInstId: item.formInstId,
      updateFormDataJson: JSON.stringify({ radioField_zau8ircv: '已预警' }),
    }).then(() => {
      page.utils.toast({ title: '预警已发送', type: 'success' });
      reloadData();
    }).catch(err => {
      page.utils.toast({ title: '发送失败', type: 'error' });
    });
  };

  const handleMarkProcessed = (item) => {
    page.utils.yida.updateFormData({
      formInstId: item.formInstId,
      updateFormDataJson: JSON.stringify({ radioField_zau8ircv: '已处理' }),
    }).then(() => {
      page.utils.toast({ title: '已标记处理', type: 'success' });
      reloadData();
    }).catch(err => {
      page.utils.toast({ title: '操作失败', type: 'error' });
    });
  };

  const getFilteredList = () => {
    if (filterStatus === 'all') return scheduleList;
    if (filterStatus === 'delayed') return scheduleList.filter(s => s.radioField_zau8qu8a === '是');
    return scheduleList.filter(s => s.radioField_zau8ircv === filterStatus);
  };

  const stats = getStats();
  const filteredList = getFilteredList();
  const isDelayed = (item) => item.radioField_zau8qu8a === '是' || 
    (item.dateField_zau89n1e && item.dateField_zau8juuo && item.dateField_zau8juuo > item.dateField_zau89n1e);

  return (
    <div style={styles.container}>
      <div style={{ display: 'none' }}>{timestamp}</div>

      <div style={styles.header}>
        <div style={styles.headerTitle}>⚠️ 工期预警</div>
        <div style={styles.headerSub}>智能监控 · 延期预警 · 推送提醒</div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{stats.total}</div>
          <div style={styles.statLabel}>总节点</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNum, color: '#fa8c16' }}>{stats.delayed}</div>
          <div style={styles.statLabel}>延期</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNum, color: '#ff4d4f' }}>{stats.warned}</div>
          <div style={styles.statLabel}>已预警</div>
        </div>
        <div style={{ ...styles.statCard, marginRight: 0 }}>
          <div style={{ ...styles.statNum, color: '#52c41a' }}>{stats.processed}</div>
          <div style={styles.statLabel}>已处理</div>
        </div>
      </div>

      {warningList.length > 0 && (
        <div style={styles.warningBox}>
          <div style={styles.warningTitle}>🚨 紧急预警</div>
          <div style={styles.warningText}>
            当前有 <strong>{warningList.length}</strong> 个节点存在延期风险，请及时处理！
          </div>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardTitle}>📊 工期节点</div>

        <div style={styles.filterBar}>
          <span
            style={{ ...styles.filterBtn, ...(filterStatus === 'all' ? styles.filterBtnActive : {}) }}
            onClick={() => handleFilterChange('all')}
          >全部 ({stats.total})</span>
          <span
            style={{ ...styles.filterBtn, ...(filterStatus === 'delayed' ? styles.filterBtnActive : {}) }}
            onClick={() => handleFilterChange('delayed')}
          >延期 ({stats.delayed})</span>
          <span
            style={{ ...styles.filterBtn, ...(filterStatus === '已预警' ? styles.filterBtnActive : {}) }}
            onClick={() => handleFilterChange('已预警')}
          >已预警 ({stats.warned})</span>
          <span
            style={{ ...styles.filterBtn, ...(filterStatus === '已处理' ? styles.filterBtnActive : {}) }}
            onClick={() => handleFilterChange('已处理')}
          >已处理 ({stats.processed})</span>
        </div>

        {filteredList.length === 0 ? (
          <div style={styles.empty}>暂无数据</div>
        ) : (
          filteredList.map((item, idx) => {
            const delayed = isDelayed(item);
            const projectName = getProjectName(item.associationFormField_zau7zuom);
            
            return (
              <div key={idx} style={styles.listItem}>
                <div style={styles.listItemHeader}>
                  <span style={styles.listItemTitle}>{projectName || '未知项目'}</span>
                  <span style={{ ...styles.badge, background: statusColors[item.radioField_zau8ircv] || '#d9d9d9' }}>
                    {item.radioField_zau8gvbm} · {item.radioField_zau8ircv}
                  </span>
                </div>
                <div style={styles.listItemMeta}>
                  计划: {item.dateField_zau89n1e ? new Date(item.dateField_zau89n1e).toLocaleDateString('zh-CN') : '-'}
                  {item.dateField_zau8juuo && ` | 实际: ${new Date(item.dateField_zau8juuo).toLocaleDateString('zh-CN')}`}
                  {delayed && ` | ⚠️ 延期`}
                </div>
                {delayed && item.radioField_zau8ircv !== '已处理' && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    {item.radioField_zau8ircv === '未预警' && (
                      <button style={{ ...styles.btn, ...styles.btnWarning }} onClick={() => handleSendWarning(item)}>
                        发送预警
                      </button>
                    )}
                    {item.radioField_zau8ircv === '已预警' && (
                      <button style={{ ...styles.btn, ...styles.btnSuccess }} onClick={() => handleMarkProcessed(item)}>
                        标记处理
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>📱 预警规则说明</div>
        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
          <p>当实际完成日期超过计划完成日期时，系统自动判定为延期：</p>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li><strong>未预警</strong>：发现延期，等待确认</li>
            <li><strong>已预警</strong>：已推送至分公司总经理和总部</li>
            <li><strong>已处理</strong>：延期问题已解决</li>
          </ul>
          <p>预警将推送至：分公司总经理 + 总部工程部</p>
        </div>
      </div>
    </div>
  );
}
