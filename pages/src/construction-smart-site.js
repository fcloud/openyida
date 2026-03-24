const _customState = {
  checkinList: [],
  stats: { total: 0, violations: 0, normal: 0 },
  loading: false,
  showForm: false,
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
    formUuid: 'FORM-7BA2301F2EB848F4867D3FF7974BE8939DBV',
    appType: window.pageConfig.appType,
    searchFieldJson: JSON.stringify({}),
    currentPage: 1,
    pageSize: 100,
  }).then(res => {
    console.log('打卡数据:', JSON.stringify(res.data, null, 2));
    const list = (res.data || []).map(item => ({
      ...item.formData,
      formInstId: item.formInstId,
    }));
    const violations = list.filter(i => {
      const v = i.multiSelectField_z4bzq11i;
      return v && (typeof v === 'string' ? v.length > 0 : v.length > 0);
    }).length;
    _customState.checkinList = list;
    _customState.stats = { total: list.length, violations, normal: list.length - violations };
    _customState.loading = false;
    page.setState({ timestamp: new Date().getTime() });
  }).catch(err => {
    console.log('加载失败:', err);
    _customState.loading = false;
    page.setState({ timestamp: new Date().getTime() });
    page.utils.toast({ title: '加载失败', type: 'error' });
  });
}

export function didUnmount() {}

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
  const { checkinList, stats, loading, showForm } = _customState;
  const isMobile = this.utils.isMobile();

  const styles = {
    container: { padding: isMobile ? '12px' : '16px', minHeight: '100vh', background: '#f5f5f5' },
    header: { background: '#1890ff', color: '#fff', padding: '16px', borderRadius: '8px', marginBottom: '16px' },
    headerTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' },
    headerSub: { fontSize: '12px', opacity: 0.9 },
    statsRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' },
    statCard: { flex: 1, background: '#fff', padding: isMobile ? '12px' : '16px', borderRadius: '8px', marginRight: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    statNum: { fontSize: '24px', fontWeight: 'bold', color: '#1890ff' },
    statLabel: { fontSize: '12px', color: '#666', marginTop: '4px' },
    card: { background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    cardTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#333' },
    btn: { background: '#1890ff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
    listItem: { padding: '12px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    listItemLeft: { flex: 1 },
    listItemName: { fontSize: '14px', fontWeight: 'bold', color: '#333' },
    listItemTime: { fontSize: '12px', color: '#999', marginTop: '4px' },
    tag: { padding: '2px 8px', borderRadius: '4px', fontSize: '12px' },
    tagWarning: { background: '#fff2e8', color: '#fa8c16' },
    tagSuccess: { background: '#f6ffed', color: '#52c41a' },
    empty: { textAlign: 'center', padding: '40px', color: '#999', fontSize: '14px' },
    formContainer: { background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '16px' },
    formTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' },
    formRow: { marginBottom: '12px' },
    formLabel: { fontSize: '14px', color: '#666', marginBottom: '4px' },
    formInput: { width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
    formActions: { display: 'flex', gap: '8px', marginTop: '16px' },
    closeBtn: { background: '#fff', color: '#666', border: '1px solid #d9d9d9', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' },
  };

  const handleCheckin = () => {
    _customState.showForm = true;
    this.setState({ timestamp: new Date().getTime() });
  };

  const reloadData = () => {
    this.utils.yida.searchFormDatas({
      formUuid: 'FORM-7BA2301F2EB848F4867D3FF7974BE8939DBV',
      appType: window.pageConfig.appType,
      searchFieldJson: JSON.stringify({}),
      currentPage: 1,
      pageSize: 100,
    }).then(res => {
      const list = (res.data || []).map(item => ({
        ...item.formData,
        formInstId: item.formInstId,
      }));
      const violations = list.filter(i => {
        const v = i.multiSelectField_z4bzq11i;
        return v && (typeof v === 'string' ? v.length > 0 : v.length > 0);
      }).length;
      _customState.checkinList = list;
      _customState.stats = { total: list.length, violations, normal: list.length - violations };
      this.setState({ timestamp: new Date().getTime() });
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectName = document.getElementById('projectName').value;
    const checkinUser = document.getElementById('checkinUser').value;
    const remarks = document.getElementById('remarks').value;

    if (!projectName || !checkinUser) {
      this.utils.toast({ title: '请填写必填项', type: 'warn' });
      return;
    }

    _customState.loading = true;
    this.setState({ timestamp: new Date().getTime() });

    const formData = {
      associationFormField_z4bzck9i: projectName,
      employeeField_z4bzqmgd: checkinUser,
      dateField_z4bz2ec3: new Date().getTime(),
      multiSelectField_z4bzq11i: [],
      textareaField_z4bz3fj7: remarks,
    };

    this.utils.yida.saveFormData({
      formUuid: 'FORM-7BA2301F2EB848F4867D3FF7974BE8939DBV',
      appType: window.pageConfig.appType,
      formDataJson: JSON.stringify(formData),
    }).then(res => {
      console.log('保存结果:', res);
      _customState.loading = false;
      _customState.showForm = false;
      this.utils.toast({ title: '打卡成功', type: 'success' });
      reloadData();
    }).catch(err => {
      console.log('保存失败:', err);
      _customState.loading = false;
      this.setState({ timestamp: new Date().getTime() });
      this.utils.toast({ title: '打卡失败', type: 'error' });
    });
  };

  const handleCancel = () => {
    _customState.showForm = false;
    this.setState({ timestamp: new Date().getTime() });
  };

  const formatTime = (ts) => {
    if (!ts) return '-';
    return new Date(ts).toLocaleString('zh-CN');
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'none' }}>{timestamp}</div>

      <div style={styles.header}>
        <div style={styles.headerTitle}>🏗️ 智慧工地</div>
        <div style={styles.headerSub}>每日打卡 · AI 违规检测 · 实时监管</div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{stats.total}</div>
          <div style={styles.statLabel}>今日打卡</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNum, color: '#52c41a' }}>{stats.normal}</div>
          <div style={styles.statLabel}>正常</div>
        </div>
        <div style={{ ...styles.statCard, marginRight: 0 }}>
          <div style={{ ...styles.statNum, color: '#ff4d4f' }}>{stats.violations}</div>
          <div style={styles.statLabel}>违规</div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={styles.cardTitle}>📋 打卡记录</div>
          <button style={styles.btn} onClick={handleCheckin}>每日打卡</button>
        </div>

        {showForm && (
          <div style={styles.formContainer}>
            <div style={styles.formTitle}>新建打卡</div>
            <form onSubmit={handleSubmit}>
              <div style={styles.formRow}>
                <div style={styles.formLabel}>项目名称 *</div>
                <input id="projectName" style={styles.formInput} placeholder="请输入项目名称" />
              </div>
              <div style={styles.formRow}>
                <div style={styles.formLabel}>打卡人 *</div>
                <input id="checkinUser" style={styles.formInput} placeholder="请输入打卡人" />
              </div>
              <div style={styles.formRow}>
                <div style={styles.formLabel}>备注</div>
                <input id="remarks" style={styles.formInput} placeholder="可选" />
              </div>
              <div style={styles.formActions}>
                <button type="submit" style={styles.btn} disabled={loading}>
                  {loading ? '提交中...' : '提交打卡'}
                </button>
                <button type="button" style={styles.closeBtn} onClick={handleCancel}>取消</button>
              </div>
            </form>
          </div>
        )}

        {checkinList.length === 0 ? (
          <div style={styles.empty}>暂无打卡记录</div>
        ) : (
          checkinList.map((item, idx) => {
            const projectName = getProjectName(item.associationFormField_z4bzck9i);
            const violations = item.multiSelectField_z4bzq11i;
            const hasViolation = violations && (typeof violations === 'string' ? violations.length > 0 : violations.length > 0);
            
            return (
              <div key={idx} style={styles.listItem}>
                <div style={styles.listItemLeft}>
                  <div style={styles.listItemName}>{projectName || '未知项目'}</div>
                  <div style={styles.listItemTime}>{formatTime(item.dateField_z4bz2ec3)} · {item.employeeField_z4bzqmgd}</div>
                </div>
                {hasViolation ? (
                  <span style={{ ...styles.tag, ...styles.tagWarning }}>
                    ⚠️ {typeof violations === 'string' ? violations : violations.join(', ')}
                  </span>
                ) : (
                  <span style={{ ...styles.tag, ...styles.tagSuccess }}>✓ 正常</span>
                )}
              </div>
            );
          })
        )}
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>🤖 AI 违规检测说明</div>
        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
          <p>系统支持自动识别以下违规行为：</p>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>未佩戴安全帽</li>
            <li>工艺不达标</li>
            <li>其他安全隐患</li>
          </ul>
          <p>如发现违规，系统将自动标记并通知项目负责人。</p>
        </div>
      </div>
    </div>
  );
}
