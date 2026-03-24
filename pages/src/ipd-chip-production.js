// ============================================================
// 芯片任务管理系统 - 任务看板主页
// 支持：Jira 式看板视图 + 列表视图 + 多级 BOM 树形展示
// ============================================================

var TASK_FORM_UUID = 'FORM-B99CCB1284774999A94BE95E990E3A71T8HJ';
var PROJECT_FORM_UUID = 'FORM-C7DD9D17149147B1A4ABE31470A94F138B36';
var BOM_FORM_UUID = 'FORM-44BF80BFC27C40098A3212442B6CF1C6XYJX';

var TASK_STATUS_LIST = ['待开始', '进行中', '已完成', '已取消', '已阻塞'];
var PRIORITY_LIST = ['P0-紧急', 'P1-高', 'P2-中', 'P3-低'];
var BOM_LEVELS = ['L0-成品', 'L1-组件', 'L2-子组件', 'L3-零件', 'L4-原材料'];

var STATUS_COLORS = {
  '待开始': '#8C8C8C',
  '进行中': '#1890FF',
  '已完成': '#52C41A',
  '已取消': '#FF4D4F',
  '已阻塞': '#FA8C16'
};

var PRIORITY_COLORS = {
  'P0-紧急': '#FF4D4F',
  'P1-高': '#FA8C16',
  'P2-中': '#1890FF',
  'P3-低': '#8C8C8C'
};

// ============================================================
// 状态管理
// ============================================================

var _customState = {
  activeTab: 'kanban',
  tasks: [],
  projects: [],
  bomItems: [],
  taskFieldMap: {},
  projectFieldMap: {},
  bomFieldMap: {},
  fieldsLoaded: false,
  loading: true,
  filterProject: '',
  filterPriority: '',
  filterAssignee: '',
  searchKeyword: '',
  showCreateTask: false,
  showCreateBom: false,
  showTaskDetail: null,
  expandedBomNodes: {},
  taskCurrentPage: 1,
  taskTotalCount: 0,
  bomCurrentPage: 1,
  bomTotalCount: 0
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
  var self = this;
  self.loadFieldMaps().then(function() {
    return Promise.all([
      self.loadTasks(),
      self.loadProjects(),
      self.loadBomItems()
    ]);
  }).then(function() {
    self.setCustomState({ loading: false });
  }).catch(function(err) {
    console.error('初始化失败:', err);
    self.utils.toast({ title: '数据加载失败: ' + err.message, type: 'error' });
    self.setCustomState({ loading: false });
  });
}

export function didUnmount() {}

// ============================================================
// 数据加载
// ============================================================

export function loadFieldMaps() {
  var self = this;
  return Promise.all([
    self.utils.yida.getFormComponentDefinationList({ formUuid: TASK_FORM_UUID }),
    self.utils.yida.getFormComponentDefinationList({ formUuid: PROJECT_FORM_UUID }),
    self.utils.yida.getFormComponentDefinationList({ formUuid: BOM_FORM_UUID })
  ]).then(function(results) {
    var taskMap = buildFieldMap(results[0]);
    var projectMap = buildFieldMap(results[1]);
    var bomMap = buildFieldMap(results[2]);
    _customState.taskFieldMap = taskMap;
    _customState.projectFieldMap = projectMap;
    _customState.bomFieldMap = bomMap;
    _customState.fieldsLoaded = true;
  });
}

function buildFieldMap(definitions) {
  var map = {};
  if (definitions && Array.isArray(definitions)) {
    definitions.forEach(function(def) {
      if (def.label && def.fieldId) {
        map[def.label] = def.fieldId;
      }
    });
  }
  return map;
}

export function loadTasks() {
  var self = this;
  var searchParams = { formUuid: TASK_FORM_UUID, currentPage: _customState.taskCurrentPage, pageSize: 100 };
  var searchFieldJson = {};
  var taskMap = _customState.taskFieldMap;

  if (_customState.filterProject && taskMap['所属项目']) {
    searchFieldJson[taskMap['所属项目']] = _customState.filterProject;
  }
  if (_customState.filterPriority && taskMap['优先级']) {
    searchFieldJson[taskMap['优先级']] = _customState.filterPriority;
  }
  if (_customState.searchKeyword && taskMap['任务标题']) {
    searchFieldJson[taskMap['任务标题']] = _customState.searchKeyword;
  }

  if (Object.keys(searchFieldJson).length > 0) {
    searchParams.searchFieldJson = JSON.stringify(searchFieldJson);
  }

  return self.utils.yida.searchFormDatas(searchParams).then(function(res) {
    _customState.tasks = res.data || [];
    _customState.taskTotalCount = res.totalCount || 0;
  });
}

export function loadProjects() {
  var self = this;
  return self.utils.yida.searchFormDatas({
    formUuid: PROJECT_FORM_UUID,
    currentPage: 1,
    pageSize: 100
  }).then(function(res) {
    _customState.projects = res.data || [];
  });
}

export function loadBomItems() {
  var self = this;
  return self.utils.yida.searchFormDatas({
    formUuid: BOM_FORM_UUID,
    currentPage: _customState.bomCurrentPage,
    pageSize: 100
  }).then(function(res) {
    _customState.bomItems = res.data || [];
    _customState.bomTotalCount = res.totalCount || 0;
  });
}

// ============================================================
// 任务操作
// ============================================================

export function handleCreateTask(taskData) {
  var self = this;
  var taskMap = _customState.taskFieldMap;
  var formDataJson = {};

  if (taskData.title && taskMap['任务标题']) formDataJson[taskMap['任务标题']] = taskData.title;
  if (taskData.type && taskMap['任务类型']) formDataJson[taskMap['任务类型']] = taskData.type;
  if (taskData.status && taskMap['任务状态']) formDataJson[taskMap['任务状态']] = taskData.status;
  if (taskData.priority && taskMap['优先级']) formDataJson[taskMap['优先级']] = taskData.priority;
  if (taskData.project && taskMap['所属项目']) formDataJson[taskMap['所属项目']] = taskData.project;
  if (taskData.parentTaskId && taskMap['父任务ID']) formDataJson[taskMap['父任务ID']] = taskData.parentTaskId;
  if (taskData.description && taskMap['任务描述']) formDataJson[taskMap['任务描述']] = taskData.description;
  if (taskData.startDate && taskMap['开始日期']) formDataJson[taskMap['开始日期']] = new Date(taskData.startDate).getTime();
  if (taskData.dueDate && taskMap['截止日期']) formDataJson[taskMap['截止日期']] = new Date(taskData.dueDate).getTime();

  return self.utils.yida.saveFormData({
    formUuid: TASK_FORM_UUID,
    appType: window.pageConfig.appType,
    formDataJson: JSON.stringify(formDataJson)
  }).then(function() {
    self.utils.toast({ title: '任务创建成功', type: 'success' });
    self.setCustomState({ showCreateTask: false });
    return self.loadTasks();
  }).then(function() {
    self.forceUpdate();
  }).catch(function(err) {
    self.utils.toast({ title: '创建失败: ' + err.message, type: 'error' });
  });
}

export function handleUpdateTaskStatus(formInstId, newStatus) {
  var self = this;
  var taskMap = _customState.taskFieldMap;
  if (!taskMap['任务状态']) return;

  var updateData = {};
  updateData[taskMap['任务状态']] = newStatus;

  return self.utils.yida.updateFormData({
    formInstId: formInstId,
    updateFormDataJson: JSON.stringify(updateData)
  }).then(function() {
    self.utils.toast({ title: '状态已更新为: ' + newStatus, type: 'success' });
    return self.loadTasks();
  }).then(function() {
    self.forceUpdate();
  }).catch(function(err) {
    self.utils.toast({ title: '更新失败: ' + err.message, type: 'error' });
  });
}

export function handleDeleteTask(formInstId) {
  var self = this;
  return self.utils.yida.deleteFormData({
    formUuid: TASK_FORM_UUID,
    formInstId: formInstId
  }).then(function() {
    self.utils.toast({ title: '任务已删除', type: 'success' });
    return self.loadTasks();
  }).then(function() {
    self.forceUpdate();
  }).catch(function(err) {
    self.utils.toast({ title: '删除失败: ' + err.message, type: 'error' });
  });
}

// ============================================================
// BOM 操作
// ============================================================

export function handleCreateBom(bomData) {
  var self = this;
  var bomMap = _customState.bomFieldMap;
  var formDataJson = {};

  if (bomData.name && bomMap['物料名称']) formDataJson[bomMap['物料名称']] = bomData.name;
  if (bomData.code && bomMap['物料编码']) formDataJson[bomMap['物料编码']] = bomData.code;
  if (bomData.type && bomMap['物料类型']) formDataJson[bomMap['物料类型']] = bomData.type;
  if (bomData.level && bomMap['层级']) formDataJson[bomMap['层级']] = bomData.level;
  if (bomData.parentCode && bomMap['父级BOM编码']) formDataJson[bomMap['父级BOM编码']] = bomData.parentCode;
  if (bomData.project && bomMap['所属项目']) formDataJson[bomMap['所属项目']] = bomData.project;
  if (bomData.quantity && bomMap['数量']) formDataJson[bomMap['数量']] = Number(bomData.quantity);
  if (bomData.unit && bomMap['单位']) formDataJson[bomMap['单位']] = bomData.unit;
  if (bomData.supplier && bomMap['供应商']) formDataJson[bomMap['供应商']] = bomData.supplier;
  if (bomData.status && bomMap['状态']) formDataJson[bomMap['状态']] = bomData.status;
  if (bomData.spec && bomMap['规格描述']) formDataJson[bomMap['规格描述']] = bomData.spec;

  return self.utils.yida.saveFormData({
    formUuid: BOM_FORM_UUID,
    appType: window.pageConfig.appType,
    formDataJson: JSON.stringify(formDataJson)
  }).then(function() {
    self.utils.toast({ title: 'BOM物料创建成功', type: 'success' });
    self.setCustomState({ showCreateBom: false });
    return self.loadBomItems();
  }).then(function() {
    self.forceUpdate();
  }).catch(function(err) {
    self.utils.toast({ title: '创建失败: ' + err.message, type: 'error' });
  });
}

// ============================================================
// 辅助函数
// ============================================================

function getFieldValue(formData, fieldMap, fieldLabel) {
  if (!formData || !fieldMap || !fieldMap[fieldLabel]) return '';
  return formData[fieldMap[fieldLabel]] || '';
}

function formatDate(timestamp) {
  if (!timestamp) return '-';
  var date = new Date(Number(timestamp));
  var year = date.getFullYear();
  var month = ('0' + (date.getMonth() + 1)).slice(-2);
  var day = ('0' + date.getDate()).slice(-2);
  return year + '-' + month + '-' + day;
}

function buildBomTree(bomItems, bomFieldMap) {
  var codeField = bomFieldMap['物料编码'];
  var parentField = bomFieldMap['父级BOM编码'];
  if (!codeField || !parentField) return bomItems.map(function(item) { return { item: item, children: [] }; });

  var codeMap = {};
  var roots = [];

  bomItems.forEach(function(bom) {
    var code = (bom.formData && bom.formData[codeField]) || '';
    codeMap[code] = { item: bom, children: [] };
  });

  bomItems.forEach(function(bom) {
    var parentCode = (bom.formData && bom.formData[parentField]) || '';
    var code = (bom.formData && bom.formData[codeField]) || '';
    if (parentCode && codeMap[parentCode]) {
      codeMap[parentCode].children.push(codeMap[code]);
    } else {
      roots.push(codeMap[code]);
    }
  });

  return roots;
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var self = this;
  var timestamp = this.state.timestamp;
  var isMobile = this.utils.isMobile();

  var activeTab = _customState.activeTab;
  var tasks = _customState.tasks;
  var projects = _customState.projects;
  var bomItems = _customState.bomItems;
  var taskFieldMap = _customState.taskFieldMap;
  var projectFieldMap = _customState.projectFieldMap;
  var bomFieldMap = _customState.bomFieldMap;
  var loading = _customState.loading;

  // ========== 样式定义 ==========
  var styles = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      background: '#F0F2F5',
      minHeight: '100vh',
      padding: 0,
      margin: 0
    },
    header: {
      background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
      padding: isMobile ? '16px' : '20px 32px',
      color: '#fff',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '12px' : '0'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    headerIcon: {
      fontSize: '28px',
      background: 'rgba(255,255,255,0.15)',
      borderRadius: '10px',
      width: '44px',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    headerTitle: {
      fontSize: isMobile ? '18px' : '22px',
      fontWeight: '700',
      letterSpacing: '1px'
    },
    headerSubtitle: {
      fontSize: '12px',
      color: 'rgba(255,255,255,0.6)',
      marginTop: '2px'
    },
    headerActions: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    primaryBtn: {
      background: '#5C72FF',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    secondaryBtn: {
      background: 'rgba(255,255,255,0.12)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '6px',
      padding: '8px 16px',
      fontSize: '13px',
      cursor: 'pointer'
    },
    tabBar: {
      display: 'flex',
      background: '#fff',
      borderBottom: '1px solid #E8E8E8',
      padding: '0 ' + (isMobile ? '12px' : '32px'),
      overflowX: 'auto'
    },
    tab: {
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#8C8C8C',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s'
    },
    tabActive: {
      color: '#5C72FF',
      borderBottom: '2px solid #5C72FF',
      fontWeight: '600'
    },
    filterBar: {
      display: 'flex',
      gap: '8px',
      padding: isMobile ? '12px' : '12px 32px',
      background: '#fff',
      borderBottom: '1px solid #F0F0F0',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    filterInput: {
      border: '1px solid #D9D9D9',
      borderRadius: '6px',
      padding: '6px 12px',
      fontSize: '13px',
      outline: 'none',
      minWidth: '140px'
    },
    filterSelect: {
      border: '1px solid #D9D9D9',
      borderRadius: '6px',
      padding: '6px 12px',
      fontSize: '13px',
      outline: 'none',
      background: '#fff',
      minWidth: '120px'
    },
    content: {
      padding: isMobile ? '12px' : '16px 32px'
    },
    kanbanContainer: {
      display: 'flex',
      gap: '12px',
      overflowX: 'auto',
      paddingBottom: '16px'
    },
    kanbanColumn: {
      minWidth: isMobile ? '260px' : '280px',
      maxWidth: '320px',
      flex: '1',
      background: '#F5F5F5',
      borderRadius: '8px',
      padding: '12px'
    },
    kanbanColumnHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px',
      padding: '4px 0'
    },
    kanbanColumnTitle: {
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    kanbanColumnCount: {
      background: 'rgba(0,0,0,0.06)',
      borderRadius: '10px',
      padding: '2px 8px',
      fontSize: '12px',
      color: '#8C8C8C'
    },
    taskCard: {
      background: '#fff',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      cursor: 'pointer',
      transition: 'box-shadow 0.2s',
      borderLeft: '3px solid transparent'
    },
    taskCardTitle: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#262626',
      marginBottom: '8px',
      lineHeight: '1.4'
    },
    taskCardMeta: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '11px',
      color: '#8C8C8C'
    },
    priorityBadge: {
      borderRadius: '4px',
      padding: '1px 6px',
      fontSize: '10px',
      fontWeight: '600',
      color: '#fff'
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      display: 'inline-block',
      marginRight: '6px'
    },
    tableContainer: {
      background: '#fff',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '13px'
    },
    tableHeader: {
      background: '#FAFAFA',
      borderBottom: '1px solid #F0F0F0'
    },
    th: {
      padding: '10px 12px',
      textAlign: 'left',
      fontWeight: '600',
      color: '#595959',
      fontSize: '12px',
      whiteSpace: 'nowrap'
    },
    td: {
      padding: '10px 12px',
      borderBottom: '1px solid #F5F5F5',
      color: '#262626'
    },
    bomTreeContainer: {
      background: '#fff',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    },
    bomNode: {
      padding: '8px 12px',
      borderRadius: '6px',
      marginBottom: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background 0.2s'
    },
    bomNodeExpander: {
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: '#8C8C8C',
      cursor: 'pointer',
      flexShrink: 0
    },
    bomNodeContent: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px'
    },
    bomNodeName: {
      fontWeight: '600',
      fontSize: '13px',
      color: '#262626'
    },
    bomNodeCode: {
      fontSize: '11px',
      color: '#8C8C8C',
      fontFamily: 'monospace'
    },
    bomLevelBadge: {
      borderRadius: '4px',
      padding: '2px 8px',
      fontSize: '10px',
      fontWeight: '600',
      background: '#F0F5FF',
      color: '#2F54EB'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: '#fff',
      borderRadius: '12px',
      padding: '24px',
      width: isMobile ? '90%' : '520px',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 8px 40px rgba(0,0,0,0.12)'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#262626',
      marginBottom: '20px'
    },
    formGroup: {
      marginBottom: '14px'
    },
    formLabel: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '500',
      color: '#595959',
      marginBottom: '4px'
    },
    formInput: {
      width: '100%',
      border: '1px solid #D9D9D9',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '13px',
      outline: 'none',
      boxSizing: 'border-box'
    },
    formTextarea: {
      width: '100%',
      border: '1px solid #D9D9D9',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '13px',
      outline: 'none',
      boxSizing: 'border-box',
      minHeight: '80px',
      resize: 'vertical'
    },
    formSelect: {
      width: '100%',
      border: '1px solid #D9D9D9',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '13px',
      outline: 'none',
      background: '#fff',
      boxSizing: 'border-box'
    },
    formActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '8px',
      marginTop: '20px'
    },
    cancelBtn: {
      background: '#fff',
      color: '#595959',
      border: '1px solid #D9D9D9',
      borderRadius: '6px',
      padding: '8px 20px',
      fontSize: '13px',
      cursor: 'pointer'
    },
    submitBtn: {
      background: '#5C72FF',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 20px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#BFBFBF'
    },
    emptyIcon: {
      fontSize: '40px',
      marginBottom: '12px'
    },
    statsBar: {
      display: 'flex',
      gap: isMobile ? '8px' : '16px',
      padding: isMobile ? '12px' : '16px 32px',
      flexWrap: 'wrap'
    },
    statCard: {
      background: '#fff',
      borderRadius: '8px',
      padding: isMobile ? '12px' : '16px 20px',
      flex: '1',
      minWidth: isMobile ? '140px' : '160px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    },
    statValue: {
      fontSize: isMobile ? '22px' : '28px',
      fontWeight: '700',
      color: '#262626'
    },
    statLabel: {
      fontSize: '12px',
      color: '#8C8C8C',
      marginTop: '4px'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      padding: '16px 0'
    },
    pageBtn: {
      background: '#fff',
      border: '1px solid #D9D9D9',
      borderRadius: '4px',
      padding: '4px 12px',
      fontSize: '13px',
      cursor: 'pointer'
    },
    statusActions: {
      display: 'flex',
      gap: '4px',
      flexWrap: 'wrap',
      marginTop: '6px'
    },
    statusBtn: {
      border: 'none',
      borderRadius: '4px',
      padding: '2px 8px',
      fontSize: '10px',
      cursor: 'pointer',
      background: '#F0F0F0',
      color: '#595959'
    }
  };

  // ========== 加载中 ==========
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'none' }}>{timestamp}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '40px' }}>⚙️</div>
          <div style={{ fontSize: '16px', color: '#8C8C8C' }}>正在加载芯片任务管理系统...</div>
        </div>
      </div>
    );
  }

  // ========== 统计数据 ==========
  var tasksByStatus = {};
  TASK_STATUS_LIST.forEach(function(s) { tasksByStatus[s] = []; });
  tasks.forEach(function(task) {
    var status = getFieldValue(task.formData, taskFieldMap, '任务状态') || '待开始';
    if (!tasksByStatus[status]) tasksByStatus[status] = [];
    tasksByStatus[status].push(task);
  });

  var totalTasks = tasks.length;
  var inProgressCount = (tasksByStatus['进行中'] || []).length;
  var completedCount = (tasksByStatus['已完成'] || []).length;
  var blockedCount = (tasksByStatus['已阻塞'] || []).length;

  // ========== 渲染看板视图 ==========
  var renderKanban = function() {
    return (
      <div style={styles.kanbanContainer}>
        {TASK_STATUS_LIST.map(function(status) {
          var columnTasks = tasksByStatus[status] || [];
          var statusColor = STATUS_COLORS[status] || '#8C8C8C';
          return (
            <div key={status} style={styles.kanbanColumn}>
              <div style={styles.kanbanColumnHeader}>
                <div style={styles.kanbanColumnTitle}>
                  <span style={Object.assign({}, styles.statusDot, { background: statusColor })}></span>
                  {status}
                </div>
                <span style={styles.kanbanColumnCount}>{columnTasks.length}</span>
              </div>
              {columnTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#BFBFBF', fontSize: '12px' }}>暂无任务</div>
              ) : (
                columnTasks.map(function(task) {
                  var title = getFieldValue(task.formData, taskFieldMap, '任务标题');
                  var priority = getFieldValue(task.formData, taskFieldMap, '优先级');
                  var project = getFieldValue(task.formData, taskFieldMap, '所属项目');
                  var dueDate = getFieldValue(task.formData, taskFieldMap, '截止日期');
                  var taskType = getFieldValue(task.formData, taskFieldMap, '任务类型');
                  var priorityColor = PRIORITY_COLORS[priority] || '#8C8C8C';
                  var otherStatuses = TASK_STATUS_LIST.filter(function(s) { return s !== status; });

                  return (
                    <div key={task.formInstId} style={Object.assign({}, styles.taskCard, { borderLeftColor: priorityColor })}>
                      <div style={styles.taskCardTitle}>{title || '未命名任务'}</div>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        {priority && (
                          <span style={Object.assign({}, styles.priorityBadge, { background: priorityColor })}>{priority}</span>
                        )}
                        {taskType && (
                          <span style={Object.assign({}, styles.priorityBadge, { background: '#E6F7FF', color: '#1890FF' })}>{taskType}</span>
                        )}
                      </div>
                      <div style={styles.taskCardMeta}>
                        <span>{project || '-'}</span>
                        <span>{formatDate(dueDate)}</span>
                      </div>
                      <div style={styles.statusActions}>
                        {otherStatuses.map(function(targetStatus) {
                          return (
                            <button
                              key={targetStatus}
                              style={Object.assign({}, styles.statusBtn, { color: STATUS_COLORS[targetStatus] })}
                              onClick={function(e) {
                                e.stopPropagation();
                                self.handleUpdateTaskStatus(task.formInstId, targetStatus);
                              }}
                            >
                              → {targetStatus}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ========== 渲染列表视图 ==========
  var renderList = function() {
    if (tasks.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <div>暂无任务数据，点击"新建任务"开始</div>
        </div>
      );
    }
    return (
      <div style={styles.tableContainer}>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>任务标题</th>
                <th style={styles.th}>状态</th>
                <th style={styles.th}>优先级</th>
                <th style={styles.th}>类型</th>
                <th style={styles.th}>所属项目</th>
                <th style={styles.th}>截止日期</th>
                <th style={styles.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(function(task) {
                var title = getFieldValue(task.formData, taskFieldMap, '任务标题');
                var status = getFieldValue(task.formData, taskFieldMap, '任务状态');
                var priority = getFieldValue(task.formData, taskFieldMap, '优先级');
                var taskType = getFieldValue(task.formData, taskFieldMap, '任务类型');
                var project = getFieldValue(task.formData, taskFieldMap, '所属项目');
                var dueDate = getFieldValue(task.formData, taskFieldMap, '截止日期');
                var statusColor = STATUS_COLORS[status] || '#8C8C8C';
                var priorityColor = PRIORITY_COLORS[priority] || '#8C8C8C';

                return (
                  <tr key={task.formInstId} style={{ transition: 'background 0.2s' }}>
                    <td style={Object.assign({}, styles.td, { fontWeight: '600', maxWidth: '240px' })}>{title || '-'}</td>
                    <td style={styles.td}>
                      <span style={Object.assign({}, styles.statusDot, { background: statusColor })}></span>
                      {status || '-'}
                    </td>
                    <td style={styles.td}>
                      {priority && <span style={Object.assign({}, styles.priorityBadge, { background: priorityColor })}>{priority}</span>}
                    </td>
                    <td style={styles.td}>{taskType || '-'}</td>
                    <td style={styles.td}>{project || '-'}</td>
                    <td style={styles.td}>{formatDate(dueDate)}</td>
                    <td style={styles.td}>
                      <select
                        style={Object.assign({}, styles.filterSelect, { minWidth: '80px', fontSize: '11px', padding: '2px 4px' })}
                        defaultValue=""
                        onChange={function(e) {
                          if (e.target.value) {
                            self.handleUpdateTaskStatus(task.formInstId, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">变更状态</option>
                        {TASK_STATUS_LIST.map(function(s) {
                          return <option key={s} value={s}>{s}</option>;
                        })}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ========== 渲染 BOM 树形视图 ==========
  var bomTree = buildBomTree(bomItems, bomFieldMap);

  var renderBomNode = function(node, depth) {
    var item = node.item;
    var children = node.children;
    var name = getFieldValue(item.formData, bomFieldMap, '物料名称');
    var code = getFieldValue(item.formData, bomFieldMap, '物料编码');
    var type = getFieldValue(item.formData, bomFieldMap, '物料类型');
    var level = getFieldValue(item.formData, bomFieldMap, '层级');
    var quantity = getFieldValue(item.formData, bomFieldMap, '数量');
    var unit = getFieldValue(item.formData, bomFieldMap, '单位');
    var supplier = getFieldValue(item.formData, bomFieldMap, '供应商');
    var status = getFieldValue(item.formData, bomFieldMap, '状态');
    var hasChildren = children && children.length > 0;
    var isExpanded = _customState.expandedBomNodes[code];

    var levelColors = {
      'L0-成品': { bg: '#FFF7E6', color: '#FA8C16' },
      'L1-组件': { bg: '#E6F7FF', color: '#1890FF' },
      'L2-子组件': { bg: '#F0F5FF', color: '#2F54EB' },
      'L3-零件': { bg: '#F6FFED', color: '#52C41A' },
      'L4-原材料': { bg: '#F9F0FF', color: '#722ED1' }
    };
    var levelStyle = levelColors[level] || { bg: '#F5F5F5', color: '#8C8C8C' };

    var statusColors = {
      '有效': '#52C41A',
      '待验证': '#FA8C16',
      '已停用': '#FF4D4F',
      '替代中': '#1890FF'
    };

    return (
      <div key={item.formInstId}>
        <div
          style={Object.assign({}, styles.bomNode, {
            paddingLeft: (depth * 24 + 12) + 'px',
            background: depth % 2 === 0 ? '#FAFAFA' : '#fff'
          })}
          onClick={function() {
            if (hasChildren) {
              var expanded = Object.assign({}, _customState.expandedBomNodes);
              expanded[code] = !expanded[code];
              self.setCustomState({ expandedBomNodes: expanded });
            }
          }}
        >
          <div style={styles.bomNodeExpander}>
            {hasChildren ? (isExpanded ? '▼' : '▶') : '•'}
          </div>
          <div style={styles.bomNodeContent}>
            <div>
              <span style={styles.bomNodeName}>{name || '-'}</span>
              <span style={Object.assign({}, styles.bomNodeCode, { marginLeft: '8px' })}>{code || '-'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {level && <span style={Object.assign({}, styles.bomLevelBadge, { background: levelStyle.bg, color: levelStyle.color })}>{level}</span>}
              {type && <span style={{ fontSize: '11px', color: '#8C8C8C' }}>{type}</span>}
              {quantity && <span style={{ fontSize: '12px', fontWeight: '600' }}>{quantity}{unit || ''}</span>}
              {supplier && <span style={{ fontSize: '11px', color: '#8C8C8C' }}>{supplier}</span>}
              {status && <span style={{ fontSize: '11px', color: statusColors[status] || '#8C8C8C' }}>{status}</span>}
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && children.map(function(child) {
          return renderBomNode(child, depth + 1);
        })}
      </div>
    );
  };

  var renderBomView = function() {
    if (bomItems.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔩</div>
          <div>暂无 BOM 物料数据，点击"新建物料"开始</div>
        </div>
      );
    }
    return (
      <div style={styles.bomTreeContainer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#262626' }}>
            🔩 多级 BOM 物料清单
            <span style={{ fontSize: '12px', color: '#8C8C8C', marginLeft: '8px' }}>共 {bomItems.length} 项</span>
          </div>
          <button
            style={Object.assign({}, styles.primaryBtn, { fontSize: '12px', padding: '6px 12px' })}
            onClick={function() { self.setCustomState({ showCreateBom: true }); }}
          >
            + 新建物料
          </button>
        </div>
        {bomTree.map(function(node) {
          return renderBomNode(node, 0);
        })}
      </div>
    );
  };

  // ========== 新建任务弹窗 ==========
  var renderCreateTaskModal = function() {
    if (!_customState.showCreateTask) return null;
    return (
      <div style={styles.modal} onClick={function() { self.setCustomState({ showCreateTask: false }); }}>
        <div style={styles.modalContent} onClick={function(e) { e.stopPropagation(); }}>
          <div style={styles.modalTitle}>📝 新建任务</div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>任务标题 *</label>
            <input id="create-task-title" style={styles.formInput} defaultValue="" placeholder="请输入任务标题" onChange={function(e) { _customState._newTaskTitle = e.target.value; }} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={Object.assign({}, styles.formGroup, { flex: 1 })}>
              <label style={styles.formLabel}>任务类型</label>
              <select id="create-task-type" style={styles.formSelect} defaultValue="" onChange={function(e) { _customState._newTaskType = e.target.value; }}>
                <option value="">请选择</option>
                {['设计任务', '开发任务', '验证任务', '测试任务', '文档任务', '评审任务'].map(function(t) {
                  return <option key={t} value={t}>{t}</option>;
                })}
              </select>
            </div>
            <div style={Object.assign({}, styles.formGroup, { flex: 1 })}>
              <label style={styles.formLabel}>优先级</label>
              <select id="create-task-priority" style={styles.formSelect} defaultValue="" onChange={function(e) { _customState._newTaskPriority = e.target.value; }}>
                <option value="">请选择</option>
                {PRIORITY_LIST.map(function(p) {
                  return <option key={p} value={p}>{p}</option>;
                })}
              </select>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>所属项目</label>
            <input id="create-task-project" style={styles.formInput} defaultValue="" placeholder="请输入所属项目" onChange={function(e) { _customState._newTaskProject = e.target.value; }} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>父任务ID（用于子任务关联）</label>
            <input id="create-task-parent" style={styles.formInput} defaultValue="" placeholder="留空表示顶级任务" onChange={function(e) { _customState._newTaskParent = e.target.value; }} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={Object.assign({}, styles.formGroup, { flex: 1 })}>
              <label style={styles.formLabel}>开始日期</label>
              <input id="create-task-start" type="date" style={styles.formInput} defaultValue="" onChange={function(e) { _customState._newTaskStart = e.target.value; }} />
            </div>
            <div style={Object.assign({}, styles.formGroup, { flex: 1 })}>
              <label style={styles.formLabel}>截止日期</label>
              <input id="create-task-due" type="date" style={styles.formInput} defaultValue="" onChange={function(e) { _customState._newTaskDue = e.target.value; }} />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>任务描述</label>
            <textarea id="create-task-desc" style={styles.formTextarea} defaultValue="" placeholder="请输入任务描述" onChange={function(e) { _customState._newTaskDesc = e.target.value; }}></textarea>
          </div>
          <div style={styles.formActions}>
            <button style={styles.cancelBtn} onClick={function() { self.setCustomState({ showCreateTask: false }); }}>取消</button>
            <button style={styles.submitBtn} onClick={function() {
              var title = _customState._newTaskTitle;
              if (!title) { self.utils.toast({ title: '请输入任务标题', type: 'error' }); return; }
              self.handleCreateTask({
                title: title,
                type: _customState._newTaskType || '',
                status: '待开始',
                priority: _customState._newTaskPriority || '',
                project: _customState._newTaskProject || '',
                parentTaskId: _customState._newTaskParent || '',
                startDate: _customState._newTaskStart || '',
                dueDate: _customState._newTaskDue || '',
                description: _customState._newTaskDesc || ''
              });
            }}>创建任务</button>
          </div>
        </div>
      </div>
    );
  };

  // ========== 新建 BOM 弹窗 ==========
  var renderCreateBomModal = function() {
    if (!_customState.showCreateBom) return null;
    return (
      <div style={styles.modal} onClick={function() { self.setCustomState({ showCreateBom: false }); }}>
        <div style={styles.modalContent} onClick={function(e) { e.stopPropagation(); }}>
          <div style={styles.modalTitle}>🔩 新建 BOM 物料</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={Object.assign({}, styles.formGroup, { flex: 1 })}>
              <label style={styles.formLabel}>物料名称 *</label>
              <input id="create-bom-name" style={styles.formInput} defaultValue="" placeholder="如：主控芯片" onChange={function(e) { _customState._newBomName = e.target.value; }} />
            </div>
            <div style={Object.assign({}, styles.formGroup, { flex: 1 })}>
              <label style={styles.formLabel}>物料编码 *</label>
              <input id="create-bom-code" style={styles.formInput} defaultValue="" placeholder="如：IC-MCU-001" onChange={function(e) { _customState._newBomCode = e.target.value; }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={Object.assign({}, styles.formGroup, { flex: 1 })}>
              <label style={styles.formLabel}>物料类型</label>
              <select id="create-bom-type" style={styles.formSelect} defaultValue="" onChange={function(e) { _customState._newBomType = e.target.value; }}>
                <option value="">请选择</option>
                {['芯片Die', '封装基板', '引线框架', '键合线', '塑封料', '晶圆', '光罩', '测试板', 'IP核', 'EDA工具', '其他'].map(function(t) {
                  return <option key={t} value={t}>{t}</option>;
                })}
              </select>
            </div>
            <div style={Object.assign({}, styles.formGroup, { flex: 1 })}>
              <label style={styles.formLabel}>层级</label>
              <select id="create-bom-level" style={styles.formSelect} defaultValue="" onChange={function(e) { _customState._newBomLevel = e.target.value; }}>
                <option value="">请选择</option>
                {BOM_LEVELS.map(function(l) {
                  return <option key={l} value={l}>{l}</option>;
                })}
              </select>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>父级 BOM 编码（用于多级关联）</label>
            <input id="create-bom-parent" style={styles.formInput} defaultValue="" placeholder="留空表示顶级物料" onChange={function(e) { _customState._newBomParent = e.target.value; }} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={Object.assign({}, styles.formGroup, { flex: 1 })}>
              <label style={styles.formLabel}>数量</label>
              <input id="create-bom-qty" type="number" style={styles.formInput} defaultValue="" placeholder="数量" onChange={function(e) { _customState._newBomQty = e.target.value; }} />
            </div>
            <div style={Object.assign({}, styles.formGroup, { flex: 1 })}>
              <label style={styles.formLabel}>单位</label>
              <input id="create-bom-unit" style={styles.formInput} defaultValue="" placeholder="如：个、片、米" onChange={function(e) { _customState._newBomUnit = e.target.value; }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={Object.assign({}, styles.formGroup, { flex: 1 })}>
              <label style={styles.formLabel}>供应商</label>
              <input id="create-bom-supplier" style={styles.formInput} defaultValue="" placeholder="供应商名称" onChange={function(e) { _customState._newBomSupplier = e.target.value; }} />
            </div>
            <div style={Object.assign({}, styles.formGroup, { flex: 1 })}>
              <label style={styles.formLabel}>状态</label>
              <select id="create-bom-status" style={styles.formSelect} defaultValue="有效" onChange={function(e) { _customState._newBomStatus = e.target.value; }}>
                {['有效', '待验证', '已停用', '替代中'].map(function(s) {
                  return <option key={s} value={s}>{s}</option>;
                })}
              </select>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>所属项目</label>
            <input id="create-bom-project" style={styles.formInput} defaultValue="" placeholder="所属项目名称" onChange={function(e) { _customState._newBomProject = e.target.value; }} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>规格描述</label>
            <textarea id="create-bom-spec" style={styles.formTextarea} defaultValue="" placeholder="物料规格参数描述" onChange={function(e) { _customState._newBomSpec = e.target.value; }}></textarea>
          </div>
          <div style={styles.formActions}>
            <button style={styles.cancelBtn} onClick={function() { self.setCustomState({ showCreateBom: false }); }}>取消</button>
            <button style={styles.submitBtn} onClick={function() {
              var name = _customState._newBomName;
              var code = _customState._newBomCode;
              if (!name || !code) { self.utils.toast({ title: '请填写物料名称和编码', type: 'error' }); return; }
              self.handleCreateBom({
                name: name,
                code: code,
                type: _customState._newBomType || '',
                level: _customState._newBomLevel || '',
                parentCode: _customState._newBomParent || '',
                project: _customState._newBomProject || '',
                quantity: _customState._newBomQty || '',
                unit: _customState._newBomUnit || '',
                supplier: _customState._newBomSupplier || '',
                status: _customState._newBomStatus || '有效',
                spec: _customState._newBomSpec || ''
              });
            }}>创建物料</button>
          </div>
        </div>
      </div>
    );
  };

  // ========== 主渲染 ==========
  return (
    <div style={styles.container}>
      <div style={{ display: 'none' }}>{timestamp}</div>

      {/* 顶部导航 */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>⚡</div>
          <div>
            <div style={styles.headerTitle}>芯片任务管理</div>
            <div style={styles.headerSubtitle}>Chip Task Management · IPD</div>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.primaryBtn} onClick={function() { self.setCustomState({ showCreateTask: true }); }}>
            + 新建任务
          </button>
          <button style={styles.secondaryBtn} onClick={function() { self.setCustomState({ showCreateBom: true }); }}>
            + 新建物料
          </button>
          <button style={styles.secondaryBtn} onClick={function() {
            self.setCustomState({ loading: true });
            Promise.all([self.loadTasks(), self.loadProjects(), self.loadBomItems()]).then(function() {
              self.setCustomState({ loading: false });
              self.utils.toast({ title: '数据已刷新', type: 'success' });
            });
          }}>
            🔄 刷新
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={styles.statsBar}>
        <div style={styles.statCard}>
          <div style={Object.assign({}, styles.statValue, { color: '#5C72FF' })}>{totalTasks}</div>
          <div style={styles.statLabel}>全部任务</div>
        </div>
        <div style={styles.statCard}>
          <div style={Object.assign({}, styles.statValue, { color: '#1890FF' })}>{inProgressCount}</div>
          <div style={styles.statLabel}>进行中</div>
        </div>
        <div style={styles.statCard}>
          <div style={Object.assign({}, styles.statValue, { color: '#52C41A' })}>{completedCount}</div>
          <div style={styles.statLabel}>已完成</div>
        </div>
        <div style={styles.statCard}>
          <div style={Object.assign({}, styles.statValue, { color: '#FA8C16' })}>{blockedCount}</div>
          <div style={styles.statLabel}>已阻塞</div>
        </div>
        <div style={styles.statCard}>
          <div style={Object.assign({}, styles.statValue, { color: '#722ED1' })}>{bomItems.length}</div>
          <div style={styles.statLabel}>BOM 物料</div>
        </div>
      </div>

      {/* Tab 栏 */}
      <div style={styles.tabBar}>
        {[
          { key: 'kanban', label: '📊 看板视图' },
          { key: 'list', label: '📋 列表视图' },
          { key: 'bom', label: '🔩 BOM 管理' }
        ].map(function(tab) {
          var isActive = activeTab === tab.key;
          return (
            <div
              key={tab.key}
              style={Object.assign({}, styles.tab, isActive ? styles.tabActive : {})}
              onClick={function() { self.setCustomState({ activeTab: tab.key }); }}
            >
              {tab.label}
            </div>
          );
        })}
      </div>

      {/* 筛选栏（任务视图时显示） */}
      {(activeTab === 'kanban' || activeTab === 'list') && (
        <div style={styles.filterBar}>
          <input
            id="filter-search"
            style={styles.filterInput}
            defaultValue=""
            placeholder="🔍 搜索任务标题..."
            onChange={function(e) { _customState.searchKeyword = e.target.value; }}
            onKeyDown={function(e) {
              if (e.key === 'Enter') {
                self.loadTasks().then(function() { self.forceUpdate(); });
              }
            }}
          />
          <select
            id="filter-priority"
            style={styles.filterSelect}
            defaultValue=""
            onChange={function(e) {
              _customState.filterPriority = e.target.value;
              self.loadTasks().then(function() { self.forceUpdate(); });
            }}
          >
            <option value="">全部优先级</option>
            {PRIORITY_LIST.map(function(p) {
              return <option key={p} value={p}>{p}</option>;
            })}
          </select>
          <select
            id="filter-project"
            style={styles.filterSelect}
            defaultValue=""
            onChange={function(e) {
              _customState.filterProject = e.target.value;
              self.loadTasks().then(function() { self.forceUpdate(); });
            }}
          >
            <option value="">全部项目</option>
            {projects.map(function(proj) {
              var projName = getFieldValue(proj.formData, projectFieldMap, '项目名称');
              return projName ? <option key={proj.formInstId} value={projName}>{projName}</option> : null;
            })}
          </select>
          <button
            style={Object.assign({}, styles.primaryBtn, { fontSize: '12px', padding: '6px 12px' })}
            onClick={function() {
              _customState.searchKeyword = '';
              _customState.filterPriority = '';
              _customState.filterProject = '';
              var searchEl = document.getElementById('filter-search');
              var priorityEl = document.getElementById('filter-priority');
              var projectEl = document.getElementById('filter-project');
              if (searchEl) searchEl.value = '';
              if (priorityEl) priorityEl.value = '';
              if (projectEl) projectEl.value = '';
              self.loadTasks().then(function() { self.forceUpdate(); });
            }}
          >
            重置
          </button>
        </div>
      )}

      {/* 内容区域 */}
      <div style={styles.content}>
        {activeTab === 'kanban' && renderKanban()}
        {activeTab === 'list' && renderList()}
        {activeTab === 'bom' && renderBomView()}
      </div>

      {/* 弹窗 */}
      {renderCreateTaskModal()}
      {renderCreateBomModal()}
    </div>
  );
}
