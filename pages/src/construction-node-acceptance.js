const _customState = {
  projectList: [],
  acceptanceList: [],
  selectedProject: null,
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
    formUuid: 'FORM-7D36E0A50BC4404ABE4B5785E92723B924UF',
    appType: window.pageConfig.appType,
    searchFieldJson: JSON.stringify({}),
    currentPage: 1,
    pageSize: 100,
  }).then(res => {
    console.log('项目数据:', JSON.stringify(res.data, null, 2));
    _customState.projectList = res.data || [];
    page.setState({ timestamp: new Date().getTime() });
  }).catch(err => {
    console.log('加载项目失败:', err);
    page.utils.toast({ title: '加载项目失败', type: 'error' });
  });

  page.utils.yida.searchFormDatas({
    formUuid: 'FORM-7908C2084E5347B18B3B6B3397919F00QZFK',
    appType: window.pageConfig.appType,
    searchFieldJson: JSON.stringify({}),
    currentPage: 1,
    pageSize: 100,
  }).then(res => {
    console.log('验收数据:', JSON.stringify(res.data, null, 2));
    _customState.acceptanceList = (res.data || []).map(item => ({
      ...item.formData,
      formInstId: item.formInstId,
    }));
    page.setState({ timestamp: new Date().getTime() });
  }).catch(err => {
    console.log('加载验收记录失败:', err);
    page.utils.toast({ title: '加载验收记录失败', type: 'error' });
  });
}

export function didUnmount() {}

function getAssocProjectName(val) {
  if (!val) return '';
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return parsed.title || '';
    } catch {
      return val;
    }
  }
  if (typeof val === 'object') return val.title || val.name || '';
  return String(val);
}

function getProjectNameFromData(data) {
  if (!data) return '';
  return data.textField_y4zd1d16 || '';
}

export function renderJsx() {
  const { timestamp } = this.state;
  const { projectList, acceptanceList, selectedProject, loading, showForm } = _customState;
  const isMobile = this.utils.isMobile();

  const nodeTypes = ['开工', '交底', '隐蔽', '竣工'];
  const nodeColors = { '开工': '#1890ff', '交底': '#52c41a', '隐蔽': '#fa8c16', '竣工': '#722ed1' };

  const styles = {
    container: { padding: isMobile ? '12px' : '16px', minHeight: '100vh', background: '#f5f5f5' },
    header: { background: '#1890ff', color: '#fff', padding: '16px', borderRadius: '8px', marginBottom: '16px' },
    headerTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' },
    headerSub: { fontSize: '12px', opacity: 0.9 },
    board: { display: 'flex', justifyContent: 'space-between', background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    nodeItem: { textAlign: 'center', flex: 1 },
    nodeCircle: { width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: '16px', fontWeight: 'bold', color: '#fff' },
    nodeLabel: { fontSize: '12px', color: '#666' },
    card: { background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    cardTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#333' },
    select: { width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: '4px', fontSize: '14px', marginBottom: '12px' },
    listItem: { padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
    listItemHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
    listItemTitle: { fontSize: '14px', fontWeight: 'bold', color: '#333' },
    listItemMeta: { fontSize: '12px', color: '#999' },
    badge: { padding: '2px 8px', borderRadius: '4px', fontSize: '12px', color: '#fff' },
    btn: { background: '#1890ff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
    btnSuccess: { background: '#52c41a' },
    formContainer: { background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '16px' },
    formTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' },
    formRow: { marginBottom: '12px' },
    formLabel: { fontSize: '14px', color: '#666', marginBottom: '4px' },
    formInput: { width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
    formActions: { display: 'flex', gap: '8px', marginTop: '16px' },
    closeBtn: { background: '#fff', color: '#666', border: '1px solid #d9d9d9', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' },
    empty: { textAlign: 'center', padding: '40px', color: '#999', fontSize: '14px' },
  };

  const getNodeStatus = (projectName, nodeType) => {
    const record = acceptanceList.find(a => {
      const aProjectName = getAssocProjectName(a.associationFormField_yy23bu9d);
      return aProjectName === projectName && a.radioField_yy23du9k === nodeType;
    });
    return record ? '已验收' : '待验收';
  };

  const handleProjectChange = (e) => {
    const projectName = e.target.value;
    _customState.selectedProject = projectName;
    this.setState({ timestamp: new Date().getTime() });
  };

  const handleNewAcceptance = () => {
    _customState.showForm = true;
    this.setState({ timestamp: new Date().getTime() });
  };

  const reloadData = () => {
    this.utils.yida.searchFormDatas({
      formUuid: 'FORM-7908C2084E5347B18B3B6B3397919F00QZFK',
      appType: window.pageConfig.appType,
      searchFieldJson: JSON.stringify({}),
      currentPage: 1,
      pageSize: 100,
    }).then(res => {
      _customState.acceptanceList = (res.data || []).map(item => ({
        ...item.formData,
        formInstId: item.formInstId,
      }));
      this.setState({ timestamp: new Date().getTime() });
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectName = document.getElementById('acceptProject').value;
    const nodeType = document.getElementById('nodeType').value;
    const ownerSign = document.getElementById('ownerSign').value;
    const supervisorSign = document.getElementById('supervisorSign').value;
    const acceptRemarks = document.getElementById('acceptRemarks').value;

    if (!projectName || !nodeType) {
      this.utils.toast({ title: '请填写必填项', type: 'warn' });
      return;
    }

    _customState.loading = true;
    this.setState({ timestamp: new Date().getTime() });

    const formData = {
      associationFormField_yy23bu9d: projectName,
      radioField_yy23du9k: nodeType,
      employeeField_yy23zr2a: ownerSign,
      employeeField_yy23s1dg: supervisorSign,
      radioField_yy23r8co: '已确认',
      dateField_yy234yqu: new Date().getTime(),
      textareaField_yy23ne2r: acceptRemarks,
    };

    this.utils.yida.saveFormData({
      formUuid: 'FORM-7908C2084E5347B18B3B6B3397919F00QZFK',
      appType: window.pageConfig.appType,
      formDataJson: JSON.stringify(formData),
    }).then(res => {
      console.log('验收保存结果:', res);
      _customState.loading = false;
      _customState.showForm = false;
      this.utils.toast({ title: '验收提交成功', type: 'success' });
      reloadData();
    }).catch(err => {
      console.log('验收保存失败:', err);
      _customState.loading = false;
      this.setState({ timestamp: new Date().getTime() });
      this.utils.toast({ title: '提交失败', type: 'error' });
    });
  };

  const handleCancel = () => {
    _customState.showForm = false;
    this.setState({ timestamp: new Date().getTime() });
  };

  const renderBoard = () => {
    if (!selectedProject) {
      return <div style={{ ...styles.card, textAlign: 'center', color: '#999' }}>请先选择项目查看节点状态</div>;
    }

    return (
      <div style={styles.board}>
        {nodeTypes.map(type => {
          const status = getNodeStatus(selectedProject, type);
          const isCompleted = status === '已验收';
          return (
            <div key={type} style={styles.nodeItem}>
              <div style={{ ...styles.nodeCircle, background: isCompleted ? nodeColors[type] : '#d9d9d9' }}>
                {isCompleted ? '✓' : '○'}
              </div>
              <div style={{ ...styles.nodeLabel, color: isCompleted ? nodeColors[type] : '#999' }}>{type}</div>
              <div style={{ fontSize: '10px', color: '#999' }}>{status}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'none' }}>{timestamp}</div>

      <div style={styles.header}>
        <div style={styles.headerTitle}>📋 节点验收</div>
        <div style={styles.headerSub}>开工 · 交底 · 隐蔽 · 竣工</div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>选择项目</div>
        <select style={styles.select} onChange={handleProjectChange} value={selectedProject || ''}>
          <option value="">请选择项目</option>
          {projectList.map((p, idx) => (
            <option key={idx} value={getProjectNameFromData(p.formData)}>{getProjectNameFromData(p.formData)}</option>
          ))}
        </select>
        {renderBoard()}
      </div>

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={styles.cardTitle}>📑 验收记录</div>
          <button style={{ ...styles.btn, ...styles.btnSuccess }} onClick={handleNewAcceptance}>新建验收</button>
        </div>

        {showForm && (
          <div style={styles.formContainer}>
            <div style={styles.formTitle}>新建验收</div>
            <form onSubmit={handleSubmit}>
              <div style={styles.formRow}>
                <div style={styles.formLabel}>项目名称 *</div>
                <select id="acceptProject" style={styles.formInput}>
                  <option value="">请选择项目</option>
                  {projectList.map((p, idx) => (
                    <option key={idx} value={getProjectNameFromData(p.formData)}>{getProjectNameFromData(p.formData)}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formLabel}>节点类型 *</div>
                <select id="nodeType" style={styles.formInput}>
                  <option value="">请选择节点</option>
                  {nodeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formLabel}>业主签字</div>
                <input id="ownerSign" style={styles.formInput} placeholder="请输入业主姓名" />
              </div>
              <div style={styles.formRow}>
                <div style={styles.formLabel}>监理签字</div>
                <input id="supervisorSign" style={styles.formInput} placeholder="请输入监理姓名" />
              </div>
              <div style={styles.formRow}>
                <div style={styles.formLabel}>备注</div>
                <input id="acceptRemarks" style={styles.formInput} placeholder="可选" />
              </div>
              <div style={styles.formActions}>
                <button type="submit" style={styles.btn} disabled={loading}>
                  {loading ? '提交中...' : '确认验收'}
                </button>
                <button type="button" style={styles.closeBtn} onClick={handleCancel}>取消</button>
              </div>
            </form>
          </div>
        )}

        {acceptanceList.length === 0 ? (
          <div style={styles.empty}>暂无验收记录</div>
        ) : (
          acceptanceList.map((item, idx) => (
            <div key={idx} style={styles.listItem}>
              <div style={styles.listItemHeader}>
                <span style={styles.listItemTitle}>{getAssocProjectName(item.associationFormField_yy23bu9d)}</span>
                <span style={{ ...styles.badge, background: item.radioField_yy23r8co === '已确认' ? '#52c41a' : '#fa8c16' }}>
                  {item.radioField_yy23du9k} · {item.radioField_yy23r8co}
                </span>
              </div>
              <div style={styles.listItemMeta}>
                验收日期: {item.dateField_yy234yqu ? new Date(item.dateField_yy234yqu).toLocaleDateString('zh-CN') : '-'}
                {item.employeeField_yy23zr2a && ` | 业主: ${item.employeeField_yy23zr2a}`}
                {item.employeeField_yy23s1dg && ` | 监理: ${item.employeeField_yy23s1dg}`}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
