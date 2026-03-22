// 访客管理系统 - 前台工作台
// appType: APP_LJTQCC0QSVT6YR2OH472

// ── 字段 ID 别名常量 ──────────────────────────────────
var RECORD_FORM_UUID = 'FORM-B8767A464B414A1DBF44494AF1E2293A1TF8';
var APPLY_FORM_UUID = 'FORM-F0DCCC6CEC814EDD878A39A8BC9538819LKP';
var APP_TYPE = 'APP_LJTQCC0QSVT6YR2OH472';
var REPORT_ID = 'REPORT-V0A667D1SK64084VHRYR95J7D4K62WXUK1ZMM2';

// 签到记录表字段
var RECORD_FIELDS = {
  visitorName: 'textField_fm611xvc5',
  phone: 'textField_fm612zove',
  visitReason: 'selectField_fm613ujbc',
  hostName: 'textField_fm614wthb',
  actualArrivalTime: 'dateField_fm615omvq',
  actualLeaveTime: 'dateField_fm616wmiv',
  status: 'radioField_fm617eeid',
  photo: 'imageField_fm618l6l1',
  remark: 'textareaField_fm619nixe',
};

// 申请表字段
var APPLY_FIELDS = {
  visitorName: 'textField_czzz1kspi',
  phone: 'textField_czzz2y6xu',
  idCard: 'textField_czzz324p4',
  visitReason: 'selectField_czzz45vn2',
  hostName: 'textField_czzz52iea',
  department: 'textField_czzz6anjl',
  expectedArrival: 'dateField_czzz7d5gk',
  expectedLeave: 'dateField_czzz872ok',
  companions: 'numberField_czzz9hhqo',
  remark: 'textareaField_d000ahxr3',
};

// ── 模块级状态（不触发重渲染） ─────────────────────────
var _customState = {
  loading: true,
  activeTab: 'today',
  todayRecords: [],
  pendingCount: 0,
  arrivedCount: 0,
  leftCount: 0,
  searchKeyword: '',
  actionLoading: false,
  showNewRecordModal: false,
  newRecord: {
    visitorName: '',
    phone: '',
    visitReason: '',
    hostName: '',
  },
};

export function getCustomState() {
  return _customState;
}

export function setCustomState(newState) {
  _customState = Object.assign({}, _customState, newState);
}

export function forceUpdate() {
  this.setState({});
}

// ── 生命周期 ──────────────────────────────────────────
export function didMount() {
  this.loadTodayRecords();
}

export function didUnmount() {}

// ── 数据加载 ──────────────────────────────────────────
export function loadTodayRecords() {
  var self = this;
  var todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  var todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  _customState.loading = true;
  self.forceUpdate();

  this.utils.yida.searchFormDatas({
    formUuid: RECORD_FORM_UUID,
    appType: APP_TYPE,
    searchFieldJson: JSON.stringify({}),
    currentPage: 1,
    pageSize: 100,
  }).then(function(res) {
    var records = (res && res.data) ? res.data : [];
    var todayRecords = records.filter(function(record) {
      var arrivalTime = record.formData && record.formData[RECORD_FIELDS.actualArrivalTime];
      if (!arrivalTime) return false;
      var ts = Number(arrivalTime);
      return ts >= todayStart.getTime() && ts <= todayEnd.getTime();
    });

    var arrivedCount = 0;
    var leftCount = 0;
    todayRecords.forEach(function(record) {
      var status = record.formData && record.formData[RECORD_FIELDS.status];
      if (status === '已到访') arrivedCount++;
      if (status === '已离开') leftCount++;
    });

    _customState.todayRecords = todayRecords;
    _customState.arrivedCount = arrivedCount;
    _customState.leftCount = leftCount;
    _customState.pendingCount = arrivedCount - leftCount;
    _customState.loading = false;
    self.forceUpdate();
  }).catch(function(err) {
    console.error('加载今日访客失败:', err);
    _customState.loading = false;
    self.forceUpdate();
    self.utils.toast({ title: '加载数据失败，请刷新重试', type: 'error' });
  });
}

// ── 签到操作 ──────────────────────────────────────────
export function handleCheckIn(record) {
  var self = this;
  if (_customState.actionLoading) return;

  this.utils.dialog({
    type: 'confirm',
    title: '确认签到',
    content: '确认 ' + (record.formData[RECORD_FIELDS.visitorName] || '该访客') + ' 已到访？',
    onOk: function() {
      _customState.actionLoading = true;
      self.forceUpdate();

      self.utils.yida.updateFormData({
        formInstId: record.formInstId,
        appType: APP_TYPE,
        updateFormDataJson: JSON.stringify({
          [RECORD_FIELDS.status]: '已到访',
          [RECORD_FIELDS.actualArrivalTime]: new Date().getTime(),
        }),
      }).then(function() {
        _customState.actionLoading = false;
        self.utils.toast({ title: '签到成功', type: 'success' });
        self.loadTodayRecords();
      }).catch(function(err) {
        _customState.actionLoading = false;
        self.forceUpdate();
        self.utils.toast({ title: '签到失败，请重试', type: 'error' });
      });
    },
  });
}

// ── 签退操作 ──────────────────────────────────────────
export function handleCheckOut(record) {
  var self = this;
  if (_customState.actionLoading) return;

  this.utils.dialog({
    type: 'confirm',
    title: '确认签退',
    content: '确认 ' + (record.formData[RECORD_FIELDS.visitorName] || '该访客') + ' 已离开？',
    onOk: function() {
      _customState.actionLoading = true;
      self.forceUpdate();

      self.utils.yida.updateFormData({
        formInstId: record.formInstId,
        appType: APP_TYPE,
        updateFormDataJson: JSON.stringify({
          [RECORD_FIELDS.status]: '已离开',
          [RECORD_FIELDS.actualLeaveTime]: new Date().getTime(),
        }),
      }).then(function() {
        _customState.actionLoading = false;
        self.utils.toast({ title: '签退成功', type: 'success' });
        self.loadTodayRecords();
      }).catch(function(err) {
        _customState.actionLoading = false;
        self.forceUpdate();
        self.utils.toast({ title: '签退失败，请重试', type: 'error' });
      });
    },
  });
}

// ── 新建签到记录 ──────────────────────────────────────
export function handleNewRecord() {
  _customState.showNewRecordModal = true;
  _customState.newRecord = { visitorName: '', phone: '', visitReason: '', hostName: '' };
  this.forceUpdate();
}

export function handleNewRecordSubmit() {
  var self = this;
  var newRecord = _customState.newRecord;

  if (!newRecord.visitorName || !newRecord.phone || !newRecord.hostName) {
    self.utils.toast({ title: '请填写访客姓名、手机号和被访人', type: 'warning' });
    return;
  }

  _customState.actionLoading = true;
  self.forceUpdate();

  var formDataJson = {};
  formDataJson[RECORD_FIELDS.visitorName] = newRecord.visitorName;
  formDataJson[RECORD_FIELDS.phone] = newRecord.phone;
  formDataJson[RECORD_FIELDS.visitReason] = newRecord.visitReason || '其他';
  formDataJson[RECORD_FIELDS.hostName] = newRecord.hostName;
  formDataJson[RECORD_FIELDS.actualArrivalTime] = new Date().getTime();
  formDataJson[RECORD_FIELDS.status] = '已到访';

  self.utils.yida.saveFormData({
    formUuid: RECORD_FORM_UUID,
    appType: APP_TYPE,
    formDataJson: JSON.stringify(formDataJson),
  }).then(function() {
    _customState.actionLoading = false;
    _customState.showNewRecordModal = false;
    self.utils.toast({ title: '签到记录创建成功', type: 'success' });
    self.loadTodayRecords();
  }).catch(function(err) {
    _customState.actionLoading = false;
    self.forceUpdate();
    self.utils.toast({ title: '创建失败，请重试', type: 'error' });
  });
}

export function handleNewRecordCancel() {
  _customState.showNewRecordModal = false;
  this.forceUpdate();
}

// ── 跳转到申请表 ──────────────────────────────────────
export function goToApplyForm() {
  this.utils.router.push(APPLY_FORM_UUID, {}, true);
}

// ── 跳转到报表 ────────────────────────────────────────
export function goToReport() {
  this.utils.router.push(REPORT_ID, {}, true);
}

// ── 格式化时间 ────────────────────────────────────────
function formatTime(timestamp) {
  if (!timestamp) return '-';
  var date = new Date(Number(timestamp));
  var hours = date.getHours().toString().padStart(2, '0');
  var minutes = date.getMinutes().toString().padStart(2, '0');
  return hours + ':' + minutes;
}

// ── 渲染 ──────────────────────────────────────────────
export function renderJsx() {
  var state = _customState;
  var self = this;
  var isMobile = this.utils.isMobile();

  var styles = {
    container: {
      minHeight: '100vh',
      background: '#f0f2f5',
      padding: isMobile ? '12px' : '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    header: {
      background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
      borderRadius: '12px',
      padding: isMobile ? '16px' : '24px',
      marginBottom: '16px',
      color: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
    },
    headerTitle: {
      fontSize: isMobile ? '18px' : '22px',
      fontWeight: '700',
      margin: 0,
    },
    headerSubtitle: {
      fontSize: '13px',
      opacity: 0.85,
      marginTop: '4px',
    },
    headerActions: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    },
    btnPrimary: {
      background: 'rgba(255,255,255,0.2)',
      border: '1px solid rgba(255,255,255,0.4)',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      backdropFilter: 'blur(4px)',
    },
    statsRow: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
      gap: '12px',
      marginBottom: '16px',
    },
    statCard: {
      background: '#fff',
      borderRadius: '12px',
      padding: isMobile ? '14px' : '20px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    statNumber: {
      fontSize: isMobile ? '28px' : '36px',
      fontWeight: '700',
      lineHeight: 1,
      marginBottom: '6px',
    },
    statLabel: {
      fontSize: '12px',
      color: '#8c8c8c',
    },
    card: {
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    },
    cardHeader: {
      padding: '16px 20px',
      borderBottom: '1px solid #f0f0f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardTitle: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#1a1a1a',
      margin: 0,
    },
    addBtn: {
      background: '#1677ff',
      color: '#fff',
      border: 'none',
      padding: '7px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
    },
    tableWrapper: {
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '13px',
    },
    th: {
      padding: '12px 16px',
      textAlign: 'left',
      background: '#fafafa',
      color: '#595959',
      fontWeight: '500',
      borderBottom: '1px solid #f0f0f0',
      whiteSpace: 'nowrap',
    },
    td: {
      padding: '14px 16px',
      borderBottom: '1px solid #f5f5f5',
      color: '#262626',
      verticalAlign: 'middle',
    },
    statusBadge: function(status) {
      var colorMap = {
        '已到访': { bg: '#e6f4ff', color: '#1677ff' },
        '已离开': { bg: '#f6ffed', color: '#52c41a' },
      };
      var colors = colorMap[status] || { bg: '#f5f5f5', color: '#8c8c8c' };
      return {
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        background: colors.bg,
        color: colors.color,
      };
    },
    actionBtn: function(type) {
      var colorMap = {
        checkin: { bg: '#1677ff', color: '#fff' },
        checkout: { bg: '#52c41a', color: '#fff' },
      };
      var colors = colorMap[type] || { bg: '#f0f0f0', color: '#595959' };
      return {
        padding: '5px 12px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        background: colors.bg,
        color: colors.color,
        marginRight: '6px',
      };
    },
    emptyState: {
      padding: '48px 20px',
      textAlign: 'center',
      color: '#bfbfbf',
    },
    emptyIcon: {
      fontSize: '40px',
      marginBottom: '12px',
    },
    emptyText: {
      fontSize: '14px',
    },
    // 弹窗样式
    modalOverlay: {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    },
    modalBox: {
      background: '#fff',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '480px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    },
    modalHeader: {
      padding: '20px 24px 16px',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '16px',
      fontWeight: '600',
      color: '#1a1a1a',
    },
    modalBody: {
      padding: '20px 24px',
    },
    modalFooter: {
      padding: '16px 24px',
      borderTop: '1px solid #f0f0f0',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '8px',
    },
    formGroup: {
      marginBottom: '16px',
    },
    formLabel: {
      display: 'block',
      fontSize: '13px',
      color: '#595959',
      marginBottom: '6px',
      fontWeight: '500',
    },
    formInput: {
      width: '100%',
      padding: '9px 12px',
      border: '1px solid #d9d9d9',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box',
    },
    formSelect: {
      width: '100%',
      padding: '9px 12px',
      border: '1px solid #d9d9d9',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box',
      background: '#fff',
    },
    cancelBtn: {
      padding: '8px 20px',
      border: '1px solid #d9d9d9',
      borderRadius: '8px',
      background: '#fff',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#595959',
    },
    submitBtn: {
      padding: '8px 20px',
      border: 'none',
      borderRadius: '8px',
      background: '#1677ff',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
    loadingWrapper: {
      padding: '60px 20px',
      textAlign: 'center',
      color: '#8c8c8c',
      fontSize: '14px',
    },
    quickActions: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
      gap: '12px',
      marginBottom: '16px',
    },
    quickActionCard: {
      background: '#fff',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'transform 0.1s',
    },
    quickActionIcon: {
      fontSize: '28px',
      marginBottom: '8px',
    },
    quickActionLabel: {
      fontSize: '13px',
      color: '#595959',
      fontWeight: '500',
    },
  };

  // 今日日期
  var today = new Date();
  var dateStr = today.getFullYear() + '年' + (today.getMonth() + 1) + '月' + today.getDate() + '日';
  var weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  var weekStr = weekDays[today.getDay()];

  // 过滤后的记录
  var keyword = _customState.searchKeyword.trim().toLowerCase();
  var filteredRecords = state.todayRecords.filter(function(record) {
    if (!keyword) return true;
    var name = (record.formData[RECORD_FIELDS.visitorName] || '').toLowerCase();
    var host = (record.formData[RECORD_FIELDS.hostName] || '').toLowerCase();
    var phone = (record.formData[RECORD_FIELDS.phone] || '').toLowerCase();
    return name.indexOf(keyword) >= 0 || host.indexOf(keyword) >= 0 || phone.indexOf(keyword) >= 0;
  });

  return (
    <div style={styles.container}>
      {/* 顶部 Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>🏢 前台工作台</div>
          <div style={styles.headerSubtitle}>{dateStr} {weekStr} · 访客管理系统</div>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.btnPrimary} onClick={() => { self.handleNewRecord(); }}>
            ＋ 快速签到
          </button>
          <button style={styles.btnPrimary} onClick={() => { self.goToApplyForm(); }}>
            📋 访客申请
          </button>
          <button style={styles.btnPrimary} onClick={() => { self.goToReport(); }}>
            📊 数据报表
          </button>
        </div>
      </div>

      {/* 数据统计卡片 */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={Object.assign({}, styles.statNumber, { color: '#1677ff' })}>{state.arrivedCount}</div>
          <div style={styles.statLabel}>今日到访</div>
        </div>
        <div style={styles.statCard}>
          <div style={Object.assign({}, styles.statNumber, { color: '#fa8c16' })}>{state.pendingCount}</div>
          <div style={styles.statLabel}>在场访客</div>
        </div>
        <div style={styles.statCard}>
          <div style={Object.assign({}, styles.statNumber, { color: '#52c41a' })}>{state.leftCount}</div>
          <div style={styles.statLabel}>已离开</div>
        </div>
      </div>

      {/* 今日访客列表 */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={styles.cardTitle}>今日访客记录</span>
            <input
              placeholder="搜索访客姓名/手机/被访人"
              defaultValue=""
              onChange={function(e) { _customState.searchKeyword = e.target.value; self.forceUpdate(); }}
              style={Object.assign({}, styles.formInput, { width: isMobile ? '160px' : '220px', padding: '6px 10px', fontSize: '13px' })}
            />
          </div>
          <button style={styles.addBtn} onClick={() => { self.handleNewRecord(); }}>
            ＋ 新增记录
          </button>
        </div>

        {state.loading ? (
          <div style={styles.loadingWrapper}>⏳ 加载中...</div>
        ) : filteredRecords.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <div style={styles.emptyText}>{keyword ? '未找到匹配的访客记录' : '今日暂无访客记录'}</div>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>访客姓名</th>
                  <th style={styles.th}>手机号码</th>
                  <th style={styles.th}>来访事由</th>
                  <th style={styles.th}>被访人</th>
                  <th style={styles.th}>到访时间</th>
                  <th style={styles.th}>离开时间</th>
                  <th style={styles.th}>状态</th>
                  <th style={styles.th}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(function(record, index) {
                  var fd = record.formData || {};
                  var status = fd[RECORD_FIELDS.status] || '-';
                  var isArrived = status === '已到访';
                  var isLeft = status === '已离开';
                  return (
                    <tr key={record.formInstId || index} style={{ background: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={styles.td}><strong>{fd[RECORD_FIELDS.visitorName] || '-'}</strong></td>
                      <td style={styles.td}>{fd[RECORD_FIELDS.phone] || '-'}</td>
                      <td style={styles.td}>{fd[RECORD_FIELDS.visitReason] || '-'}</td>
                      <td style={styles.td}>{fd[RECORD_FIELDS.hostName] || '-'}</td>
                      <td style={styles.td}>{formatTime(fd[RECORD_FIELDS.actualArrivalTime])}</td>
                      <td style={styles.td}>{formatTime(fd[RECORD_FIELDS.actualLeaveTime])}</td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge(status)}>{status}</span>
                      </td>
                      <td style={styles.td}>
                        {!isArrived && !isLeft && (
                          <button
                            style={styles.actionBtn('checkin')}
                            onClick={() => { self.handleCheckIn(record); }}
                          >签到</button>
                        )}
                        {isArrived && (
                          <button
                            style={styles.actionBtn('checkout')}
                            onClick={() => { self.handleCheckOut(record); }}
                          >签退</button>
                        )}
                        {isLeft && (
                          <span style={{ color: '#bfbfbf', fontSize: '12px' }}>已完成</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 新建签到记录弹窗 */}
      {state.showNewRecordModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>📝 新增访客签到记录</div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>访客姓名 *</label>
                <input
                  style={styles.formInput}
                  placeholder="请输入访客姓名"
                  defaultValue=""
                  onChange={function(e) { _customState.newRecord.visitorName = e.target.value; }}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>手机号码 *</label>
                <input
                  style={styles.formInput}
                  placeholder="请输入手机号码"
                  defaultValue=""
                  onChange={function(e) { _customState.newRecord.phone = e.target.value; }}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>来访事由</label>
                <select
                  style={styles.formSelect}
                  defaultValue=""
                  onChange={function(e) { _customState.newRecord.visitReason = e.target.value; }}
                >
                  <option value="">请选择</option>
                  <option value="商务洽谈">商务洽谈</option>
                  <option value="面试">面试</option>
                  <option value="参观访问">参观访问</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>被访人姓名 *</label>
                <input
                  style={styles.formInput}
                  placeholder="请输入被访人姓名"
                  defaultValue=""
                  onChange={function(e) { _customState.newRecord.hostName = e.target.value; }}
                />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => { self.handleNewRecordCancel(); }}>取消</button>
              <button
                style={Object.assign({}, styles.submitBtn, state.actionLoading ? { opacity: 0.6, cursor: 'not-allowed' } : {})}
                onClick={() => { self.handleNewRecordSubmit(); }}
              >
                {state.actionLoading ? '提交中...' : '确认签到'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
