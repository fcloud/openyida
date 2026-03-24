// ============================================================
// IPD 芯片生产管理系统 - 管控中心
// ============================================================

var MOCK_PROJECTS = [
  { id: 'PRJ-2026-0001', name: 'Phoenix-7nm SoC', type: '新品开发', status: '进行中', stage: '开发阶段', product: 'PX7200', process: '7nm', progress: 68, manager: '张明远', budget: 12000, startDate: '2025-09-01', endDate: '2026-06-30', members: 24, risks: 2 },
  { id: 'PRJ-2026-0002', name: 'Dragon-5nm AP', type: '新品开发', status: '进行中', stage: '验证阶段', product: 'DG5100', process: '5nm', progress: 82, manager: '李思华', budget: 28000, startDate: '2025-03-15', endDate: '2026-03-31', members: 36, risks: 1 },
  { id: 'PRJ-2026-0003', name: 'Falcon-14nm MCU', type: '版本迭代', status: '进行中', stage: '量产阶段', product: 'FC1400', process: '14nm', progress: 95, manager: '王建国', budget: 4500, startDate: '2025-06-01', endDate: '2026-01-31', members: 12, risks: 0 },
  { id: 'PRJ-2026-0004', name: 'Eagle-28nm IoT', type: '工艺优化', status: '进行中', stage: '开发阶段', product: 'EG2800', process: '28nm', progress: 45, manager: '陈晓峰', budget: 2800, startDate: '2025-11-01', endDate: '2026-08-30', members: 8, risks: 3 },
  { id: 'PRJ-2026-0005', name: 'Titan-3nm GPU', type: '新品开发', status: '立项中', stage: '概念阶段', product: 'TT3000', process: '3nm', progress: 12, manager: '赵雅琴', budget: 56000, startDate: '2026-01-15', endDate: '2027-06-30', members: 48, risks: 5 },
  { id: 'PRJ-2026-0006', name: 'Spark-7nm RF', type: '新品开发', status: '进行中', stage: '计划阶段', product: 'SP7100', process: '7nm', progress: 28, manager: '刘伟强', budget: 8500, startDate: '2026-02-01', endDate: '2027-01-31', members: 18, risks: 1 },
];

var MOCK_REQUIREMENTS = [
  { id: 'REQ-0001', title: 'PX7200 低功耗模式优化', type: '性能需求', priority: 'P0', status: '开发中', product: 'PX7200', owner: '张明远' },
  { id: 'REQ-0002', title: 'DG5100 AI加速单元扩展', type: '功能需求', priority: 'P1', status: '已通过', product: 'DG5100', owner: '李思华' },
  { id: 'REQ-0003', title: 'FC1400 工业温度范围扩展', type: '工艺需求', priority: 'P1', status: '已完成', product: 'FC1400', owner: '王建国' },
  { id: 'REQ-0004', title: 'EG2800 BLE 5.3协议支持', type: '功能需求', priority: 'P2', status: '评审中', product: 'EG2800', owner: '陈晓峰' },
  { id: 'REQ-0005', title: 'TT3000 光追核心架构设计', type: '功能需求', priority: 'P0', status: '待评审', product: 'TT3000', owner: '赵雅琴' },
  { id: 'REQ-0006', title: 'PX7200 ESD防护等级提升', type: '良率需求', priority: 'P2', status: '开发中', product: 'PX7200', owner: '张明远' },
  { id: 'REQ-0007', title: 'SP7100 5G毫米波频段支持', type: '功能需求', priority: 'P0', status: '已通过', product: 'SP7100', owner: '刘伟强' },
  { id: 'REQ-0008', title: 'DG5100 视频编解码性能提升', type: '性能需求', priority: 'P1', status: '开发中', product: 'DG5100', owner: '李思华' },
];

var MOCK_TASKS = [
  { id: 'TASK-0001', title: 'PX7200 RTL设计-CPU核心', project: 'Phoenix-7nm SoC', type: '设计任务', status: '进行中', priority: 'P0', assignee: '孙志强', estimated: 320, actual: 245 },
  { id: 'TASK-0002', title: 'DG5100 后端物理验证', project: 'Dragon-5nm AP', type: '验证任务', status: '进行中', priority: 'P0', assignee: '周丽萍', estimated: 160, actual: 140 },
  { id: 'TASK-0003', title: 'FC1400 量产测试程序开发', project: 'Falcon-14nm MCU', type: '测试任务', status: '已完成', priority: 'P1', assignee: '吴明辉', estimated: 80, actual: 72 },
  { id: 'TASK-0004', title: 'EG2800 BLE协议栈移植', project: 'Eagle-28nm IoT', type: '开发任务', status: '进行中', priority: 'P1', assignee: '郑海涛', estimated: 200, actual: 85 },
  { id: 'TASK-0005', title: 'TT3000 架构可行性分析', project: 'Titan-3nm GPU', type: '设计任务', status: '待开始', priority: 'P0', assignee: '赵雅琴', estimated: 120, actual: 0 },
  { id: 'TASK-0006', title: 'PX7200 功耗仿真与优化', project: 'Phoenix-7nm SoC', type: '验证任务', status: '进行中', priority: 'P1', assignee: '林小燕', estimated: 240, actual: 180 },
  { id: 'TASK-0007', title: 'SP7100 射频前端设计', project: 'Spark-7nm RF', type: '设计任务', status: '进行中', priority: 'P0', assignee: '黄志远', estimated: 280, actual: 60 },
  { id: 'TASK-0008', title: 'DG5100 AI推理引擎优化', project: 'Dragon-5nm AP', type: '开发任务', status: '已完成', priority: 'P1', assignee: '马晓东', estimated: 160, actual: 148 },
];

var MOCK_DEFECTS = [
  { id: 'BUG-0001', title: 'PX7200 时钟树综合时序违例', project: 'Phoenix-7nm SoC', severity: '严重', status: '处理中', handler: '林小燕', date: '2026-02-18' },
  { id: 'BUG-0002', title: 'DG5100 DDR控制器稳定性问题', project: 'Dragon-5nm AP', severity: '致命', status: '已解决', handler: '马晓东', date: '2026-01-25' },
  { id: 'BUG-0003', title: 'FC1400 高温漏电流超标', project: 'Falcon-14nm MCU', severity: '一般', status: '已验证', handler: '王建国', date: '2025-12-08' },
  { id: 'BUG-0004', title: 'EG2800 SPI接口信号完整性', project: 'Eagle-28nm IoT', severity: '严重', status: '新建', handler: '陈晓峰', date: '2026-03-05' },
  { id: 'BUG-0005', title: 'PX7200 电源域隔离不完整', project: 'Phoenix-7nm SoC', severity: '严重', status: '处理中', handler: '孙志强', date: '2026-03-01' },
  { id: 'BUG-0006', title: 'DG5100 GPU着色器精度问题', project: 'Dragon-5nm AP', severity: '一般', status: '已解决', handler: '李思华', date: '2026-02-10' },
];

var MOCK_REVIEWS = [
  { id: 'REV-0001', title: 'Phoenix-7nm SoC 开发阶段评审', project: 'Phoenix-7nm SoC', type: '技术评审', status: '已通过', result: '有条件通过', date: '2026-02-20', host: '张明远' },
  { id: 'REV-0002', title: 'Dragon-5nm AP 验证阶段评审', project: 'Dragon-5nm AP', type: '里程碑评审', status: '已通过', result: '通过', date: '2026-01-15', host: '李思华' },
  { id: 'REV-0003', title: 'Falcon-14nm MCU 发布评审', project: 'Falcon-14nm MCU', type: '发布评审', status: '已通过', result: '通过', date: '2025-12-28', host: '王建国' },
  { id: 'REV-0004', title: 'Titan-3nm GPU 概念阶段评审', project: 'Titan-3nm GPU', type: '需求评审', status: '评审中', result: '', date: '2026-03-10', host: '赵雅琴' },
  { id: 'REV-0005', title: 'Spark-7nm RF 计划阶段评审', project: 'Spark-7nm RF', type: '设计评审', status: '待评审', result: '', date: '2026-03-25', host: '刘伟强' },
];

var IPD_STAGES = ['概念', '计划', '开发', '验证', '发布', '量产'];
var STAGE_ICONS = ['💡', '📋', '⚙️', '🔬', '🚀', '🏭'];

var COLORS = {
  primary: '#3B5BDB', primaryLight: '#5C7CFA', primaryBg: 'rgba(59,91,219,0.08)',
  success: '#2B8A3E', successBg: 'rgba(43,138,62,0.08)',
  warning: '#E67700', warningBg: 'rgba(230,119,0,0.08)',
  danger: '#C92A2A', dangerBg: 'rgba(201,42,42,0.08)',
  info: '#1971C2', infoBg: 'rgba(25,113,194,0.08)',
  purple: '#7048E8', purpleBg: 'rgba(112,72,232,0.08)',
  text1: '#1A1A2E', text2: '#6B7280', text3: '#9CA3AF',
  border: '#E5E7EB', borderL: '#F3F4F6', card: '#FFF', page: '#F0F2F5',
};

var _customState = {
  activeTab: 'dashboard',
  selectedProject: null,
};

export function getCustomState(key) {
  if (key) return _customState[key];
  return Object.assign({}, _customState);
}

export function setCustomState(newState) {
  Object.keys(newState).forEach(function(k) { _customState[k] = newState[k]; });
  this.forceUpdate();
}

export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

export function didMount() {}
export function didUnmount() {}

// 辅助函数
function getStatusBadge(status) {
  var map = {
    '进行中': { bg: 'rgba(25,113,194,0.1)', color: '#1971C2' },
    '已完成': { bg: 'rgba(43,138,62,0.1)', color: '#2B8A3E' },
    '立项中': { bg: 'rgba(230,119,0,0.1)', color: '#E67700' },
    '已暂停': { bg: 'rgba(201,42,42,0.1)', color: '#C92A2A' },
    '待开始': { bg: 'rgba(156,163,175,0.15)', color: '#6B7280' },
    '开发中': { bg: 'rgba(25,113,194,0.1)', color: '#1971C2' },
    '已通过': { bg: 'rgba(43,138,62,0.1)', color: '#2B8A3E' },
    '待评审': { bg: 'rgba(230,119,0,0.1)', color: '#E67700' },
    '评审中': { bg: 'rgba(112,72,232,0.1)', color: '#7048E8' },
    '已拒绝': { bg: 'rgba(201,42,42,0.1)', color: '#C92A2A' },
    '已关闭': { bg: 'rgba(156,163,175,0.15)', color: '#6B7280' },
    '处理中': { bg: 'rgba(230,119,0,0.1)', color: '#E67700' },
    '已解决': { bg: 'rgba(43,138,62,0.1)', color: '#2B8A3E' },
    '已验证': { bg: 'rgba(25,113,194,0.1)', color: '#1971C2' },
    '新建': { bg: 'rgba(201,42,42,0.1)', color: '#C92A2A' },
    '有条件通过': { bg: 'rgba(230,119,0,0.1)', color: '#E67700' },
    '通过': { bg: 'rgba(43,138,62,0.1)', color: '#2B8A3E' },
    '不通过': { bg: 'rgba(201,42,42,0.1)', color: '#C92A2A' },
    '测试中': { bg: 'rgba(112,72,232,0.1)', color: '#7048E8' },
    '已发布': { bg: 'rgba(43,138,62,0.1)', color: '#2B8A3E' },
    '规划中': { bg: 'rgba(156,163,175,0.15)', color: '#6B7280' },
  };
  return map[status] || { bg: 'rgba(156,163,175,0.15)', color: '#6B7280' };
}

function getPriorityBadge(priority) {
  var map = {
    'P0': { bg: 'rgba(201,42,42,0.1)', color: '#C92A2A', label: 'P0 紧急' },
    'P1': { bg: 'rgba(230,119,0,0.1)', color: '#E67700', label: 'P1 高' },
    'P2': { bg: 'rgba(25,113,194,0.1)', color: '#1971C2', label: 'P2 中' },
    'P3': { bg: 'rgba(156,163,175,0.15)', color: '#6B7280', label: 'P3 低' },
  };
  return map[priority] || { bg: 'rgba(156,163,175,0.15)', color: '#6B7280', label: priority };
}

function getSeverityBadge(severity) {
  var map = {
    '致命': { bg: 'rgba(201,42,42,0.15)', color: '#C92A2A' },
    '严重': { bg: 'rgba(230,119,0,0.1)', color: '#E67700' },
    '一般': { bg: 'rgba(25,113,194,0.1)', color: '#1971C2' },
    '轻微': { bg: 'rgba(156,163,175,0.15)', color: '#6B7280' },
  };
  return map[severity] || { bg: 'rgba(156,163,175,0.15)', color: '#6B7280' };
}

export function renderJsx() {
  var timestamp = this.state.timestamp;
  var self = this;
  var isMobile = this.utils.isMobile();
  var activeTab = _customState.activeTab;

  var badgeStyle = function(statusObj) {
    return { display: 'inline-block', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', background: statusObj.bg, color: statusObj.color };
  };

  var tabs = [
    { key: 'dashboard', label: '📊 管控大盘', icon: '📊' },
    { key: 'projects', label: '📁 项目管理', icon: '📁' },
    { key: 'requirements', label: '📝 需求管理', icon: '📝' },
    { key: 'tasks', label: '✅ 任务管理', icon: '✅' },
    { key: 'defects', label: '🐛 缺陷管理', icon: '🐛' },
    { key: 'reviews', label: '🔍 评审决策', icon: '🔍' },
  ];

  // 统计数据
  var activeProjects = MOCK_PROJECTS.filter(function(p) { return p.status === '进行中'; }).length;
  var totalTasks = MOCK_TASKS.length;
  var completedTasks = MOCK_TASKS.filter(function(t) { return t.status === '已完成'; }).length;
  var openDefects = MOCK_DEFECTS.filter(function(d) { return d.status !== '已解决' && d.status !== '已验证' && d.status !== '已关闭'; }).length;
  var pendingReviews = MOCK_REVIEWS.filter(function(r) { return r.status === '待评审' || r.status === '评审中'; }).length;
  var totalBudget = MOCK_PROJECTS.reduce(function(sum, p) { return sum + p.budget; }, 0);

  // 公共样式
  var cardStyle = {
    background: '#FFF', borderRadius: '12px', padding: isMobile ? '16px' : '20px 24px',
    marginBottom: isMobile ? '12px' : '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #F3F4F6',
  };
  var titleStyle = {
    fontSize: isMobile ? '15px' : '16px', fontWeight: '600', color: '#1A1A2E',
    marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
  };
  var thStyle = {
    padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600',
    color: '#6B7280', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
  };
  var tdStyle = {
    padding: '10px 12px', fontSize: '13px', color: '#1A1A2E', borderBottom: '1px solid #F3F4F6',
  };
  var progressBarBg = { height: '6px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden', width: '100%' };

  // ---- 渲染 Dashboard ----
  var renderDashboard = function() {
    return (
      <div>
        {/* 统计卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? '10px' : '16px', marginBottom: '16px' }}>
          <div style={Object.assign({}, cardStyle, { marginBottom: 0, borderLeft: '4px solid #3B5BDB' })}>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>📁 活跃项目</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A2E' }}>{activeProjects}</div>
            <div style={{ fontSize: '12px', color: '#2B8A3E', marginTop: '4px' }}>共 {MOCK_PROJECTS.length} 个项目</div>
          </div>
          <div style={Object.assign({}, cardStyle, { marginBottom: 0, borderLeft: '4px solid #2B8A3E' })}>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>✅ 任务完成率</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A2E' }}>{Math.round(completedTasks / totalTasks * 100)}%</div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{completedTasks}/{totalTasks} 已完成</div>
          </div>
          <div style={Object.assign({}, cardStyle, { marginBottom: 0, borderLeft: '4px solid #C92A2A' })}>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>🐛 待处理缺陷</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#C92A2A' }}>{openDefects}</div>
            <div style={{ fontSize: '12px', color: '#E67700', marginTop: '4px' }}>{pendingReviews} 个待评审</div>
          </div>
          <div style={Object.assign({}, cardStyle, { marginBottom: 0, borderLeft: '4px solid #7048E8' })}>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>💰 总预算(万元)</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A2E' }}>{(totalBudget / 10000).toFixed(1)}亿</div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>6个项目投入</div>
          </div>
        </div>

        {/* IPD 阶段流水线 */}
        <div style={cardStyle}>
          <div style={titleStyle}>🔄 IPD 阶段流水线</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto', paddingBottom: '8px' }}>
            {IPD_STAGES.map(function(stage, idx) {
              var projectsInStage = MOCK_PROJECTS.filter(function(p) { return p.stage.indexOf(stage) >= 0; });
              var isActive = projectsInStage.length > 0;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    background: isActive ? 'linear-gradient(135deg, #3B5BDB, #5C7CFA)' : '#F3F4F6',
                    color: isActive ? '#FFF' : '#9CA3AF',
                    borderRadius: '12px', padding: isMobile ? '12px' : '16px 20px',
                    minWidth: isMobile ? '100px' : '140px', textAlign: 'center',
                    boxShadow: isActive ? '0 4px 12px rgba(59,91,219,0.3)' : 'none',
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>{STAGE_ICONS[idx]}</div>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{stage}</div>
                    <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>{projectsInStage.length} 个项目</div>
                    {projectsInStage.map(function(p) {
                      return <div key={p.id} style={{ fontSize: '10px', marginTop: '3px', opacity: 0.7 }}>{p.product}</div>;
                    })}
                  </div>
                  {idx < IPD_STAGES.length - 1 && (
                    <div style={{ color: '#D1D5DB', fontSize: '18px', margin: '0 4px', flexShrink: 0 }}>→</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 项目进度概览 + 近期评审 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '16px' }}>
          <div style={cardStyle}>
            <div style={titleStyle}>📈 项目进度概览</div>
            {MOCK_PROJECTS.map(function(project) {
              var progressColor = project.progress >= 80 ? '#2B8A3E' : project.progress >= 50 ? '#E67700' : '#3B5BDB';
              return (
                <div key={project.id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{project.name}</span>
                      <span style={{ fontSize: '12px', color: '#6B7280', marginLeft: '8px' }}>{project.process}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={badgeStyle(getStatusBadge(project.status))}>{project.status}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: progressColor }}>{project.progress}%</span>
                    </div>
                  </div>
                  <div style={progressBarBg}>
                    <div style={{ height: '100%', width: project.progress + '%', background: 'linear-gradient(90deg, ' + progressColor + ', ' + progressColor + '99)', borderRadius: '3px', transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px', color: '#9CA3AF' }}>
                    <span>📋 {project.stage}</span>
                    <span>👤 {project.manager}</span>
                    <span>👥 {project.members}人</span>
                    {project.risks > 0 && <span style={{ color: '#C92A2A' }}>⚠️ {project.risks}个风险</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <div style={cardStyle}>
              <div style={titleStyle}>🔍 近期评审</div>
              {MOCK_REVIEWS.map(function(review) {
                return (
                  <div key={review.id} style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{review.title}</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={badgeStyle(getStatusBadge(review.status))}>{review.status}</span>
                      {review.result && <span style={badgeStyle(getStatusBadge(review.result))}>{review.result}</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                      {review.type} · {review.date} · {review.host}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={cardStyle}>
              <div style={titleStyle}>⚠️ 风险预警</div>
              {MOCK_PROJECTS.filter(function(p) { return p.risks > 0; }).map(function(project) {
                return (
                  <div key={project.id} style={{ marginBottom: '12px', padding: '10px 12px', background: 'rgba(201,42,42,0.04)', borderRadius: '8px', borderLeft: '3px solid #C92A2A' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{project.name}</div>
                    <div style={{ fontSize: '12px', color: '#C92A2A', marginTop: '2px' }}>{project.risks} 个风险项待处理</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{project.stage} · {project.manager}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---- 渲染项目管理 ----
  var renderProjects = function() {
    return (
      <div>
        <div style={cardStyle}>
          <div style={titleStyle}>📁 项目列表</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>项目编号</th>
                  <th style={thStyle}>项目名称</th>
                  <th style={thStyle}>工艺节点</th>
                  <th style={thStyle}>类型</th>
                  <th style={thStyle}>阶段</th>
                  <th style={thStyle}>状态</th>
                  <th style={thStyle}>进度</th>
                  <th style={thStyle}>项目经理</th>
                  <th style={thStyle}>预算(万)</th>
                  <th style={thStyle}>团队</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PROJECTS.map(function(p) {
                  var progressColor = p.progress >= 80 ? '#2B8A3E' : p.progress >= 50 ? '#E67700' : '#3B5BDB';
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={tdStyle}><span style={{ color: '#3B5BDB', fontWeight: '500' }}>{p.id}</span></td>
                      <td style={tdStyle}><span style={{ fontWeight: '600' }}>{p.name}</span><br/><span style={{ fontSize: '11px', color: '#9CA3AF' }}>{p.product}</span></td>
                      <td style={tdStyle}><span style={badgeStyle({ bg: 'rgba(112,72,232,0.1)', color: '#7048E8' })}>{p.process}</span></td>
                      <td style={tdStyle}>{p.type}</td>
                      <td style={tdStyle}>{p.stage}</td>
                      <td style={tdStyle}><span style={badgeStyle(getStatusBadge(p.status))}>{p.status}</span></td>
                      <td style={Object.assign({}, tdStyle, { minWidth: '120px' })}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={Object.assign({}, progressBarBg, { flex: 1 })}>
                            <div style={{ height: '100%', width: p.progress + '%', background: progressColor, borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: progressColor }}>{p.progress}%</span>
                        </div>
                      </td>
                      <td style={tdStyle}>{p.manager}</td>
                      <td style={tdStyle}>{p.budget.toLocaleString()}</td>
                      <td style={tdStyle}>{p.members}人</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 项目阶段分布 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '16px' }}>
          {MOCK_PROJECTS.slice(0, 3).map(function(project) {
            var stageIdx = IPD_STAGES.indexOf(project.stage.replace('阶段', ''));
            return (
              <div key={project.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600' }}>{project.name}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{project.product} · {project.process}</div>
                  </div>
                  <span style={badgeStyle(getStatusBadge(project.status))}>{project.status}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                  {IPD_STAGES.map(function(stage, idx) {
                    var isCurrent = project.stage.indexOf(stage) >= 0;
                    var isPast = idx < stageIdx;
                    return (
                      <div key={idx} style={{
                        flex: 1, height: '6px', borderRadius: '3px',
                        background: isCurrent ? '#3B5BDB' : isPast ? '#2B8A3E' : '#E5E7EB',
                      }} />
                    );
                  })}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  <div>📋 当前: {project.stage}</div>
                  <div style={{ marginTop: '4px' }}>👤 负责人: {project.manager}</div>
                  <div style={{ marginTop: '4px' }}>👥 团队: {project.members}人 · 💰 预算: {project.budget.toLocaleString()}万</div>
                  <div style={{ marginTop: '4px' }}>📅 {project.startDate} ~ {project.endDate}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ---- 渲染需求管理 ----
  var renderRequirements = function() {
    return (
      <div>
        {/* 需求统计 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: '全部需求', count: MOCK_REQUIREMENTS.length, color: '#3B5BDB' },
            { label: '开发中', count: MOCK_REQUIREMENTS.filter(function(r) { return r.status === '开发中'; }).length, color: '#1971C2' },
            { label: '待评审', count: MOCK_REQUIREMENTS.filter(function(r) { return r.status === '待评审' || r.status === '评审中'; }).length, color: '#E67700' },
            { label: '已完成', count: MOCK_REQUIREMENTS.filter(function(r) { return r.status === '已完成'; }).length, color: '#2B8A3E' },
          ].map(function(stat, idx) {
            return (
              <div key={idx} style={Object.assign({}, cardStyle, { marginBottom: 0, textAlign: 'center' })}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: stat.color }}>{stat.count}</div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div style={cardStyle}>
          <div style={titleStyle}>📝 需求列表</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>编号</th>
                  <th style={thStyle}>需求标题</th>
                  <th style={thStyle}>类型</th>
                  <th style={thStyle}>优先级</th>
                  <th style={thStyle}>状态</th>
                  <th style={thStyle}>关联产品</th>
                  <th style={thStyle}>负责人</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_REQUIREMENTS.map(function(req) {
                  var pBadge = getPriorityBadge(req.priority);
                  return (
                    <tr key={req.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={tdStyle}><span style={{ color: '#3B5BDB', fontWeight: '500' }}>{req.id}</span></td>
                      <td style={tdStyle}><span style={{ fontWeight: '500' }}>{req.title}</span></td>
                      <td style={tdStyle}>{req.type}</td>
                      <td style={tdStyle}><span style={badgeStyle({ bg: pBadge.bg, color: pBadge.color })}>{pBadge.label}</span></td>
                      <td style={tdStyle}><span style={badgeStyle(getStatusBadge(req.status))}>{req.status}</span></td>
                      <td style={tdStyle}>{req.product}</td>
                      <td style={tdStyle}>{req.owner}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ---- 渲染任务管理 ----
  var renderTasks = function() {
    return (
      <div>
        {/* 任务统计 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: '全部任务', count: MOCK_TASKS.length, icon: '📋', color: '#3B5BDB' },
            { label: '进行中', count: MOCK_TASKS.filter(function(t) { return t.status === '进行中'; }).length, icon: '🔄', color: '#1971C2' },
            { label: '待开始', count: MOCK_TASKS.filter(function(t) { return t.status === '待开始'; }).length, icon: '⏳', color: '#E67700' },
            { label: '已完成', count: MOCK_TASKS.filter(function(t) { return t.status === '已完成'; }).length, icon: '✅', color: '#2B8A3E' },
          ].map(function(stat, idx) {
            return (
              <div key={idx} style={Object.assign({}, cardStyle, { marginBottom: 0, textAlign: 'center' })}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: stat.color }}>{stat.count}</div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div style={cardStyle}>
          <div style={titleStyle}>✅ 任务列表</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>编号</th>
                  <th style={thStyle}>任务标题</th>
                  <th style={thStyle}>所属项目</th>
                  <th style={thStyle}>类型</th>
                  <th style={thStyle}>优先级</th>
                  <th style={thStyle}>状态</th>
                  <th style={thStyle}>执行人</th>
                  <th style={thStyle}>工时(预估/实际)</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TASKS.map(function(task) {
                  var pBadge = getPriorityBadge(task.priority);
                  var hoursRatio = task.estimated > 0 ? task.actual / task.estimated : 0;
                  var hoursColor = hoursRatio > 0.9 ? '#C92A2A' : hoursRatio > 0.7 ? '#E67700' : '#2B8A3E';
                  return (
                    <tr key={task.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={tdStyle}><span style={{ color: '#3B5BDB', fontWeight: '500' }}>{task.id}</span></td>
                      <td style={tdStyle}><span style={{ fontWeight: '500' }}>{task.title}</span></td>
                      <td style={tdStyle}><span style={{ fontSize: '12px', color: '#6B7280' }}>{task.project}</span></td>
                      <td style={tdStyle}>{task.type}</td>
                      <td style={tdStyle}><span style={badgeStyle({ bg: pBadge.bg, color: pBadge.color })}>{pBadge.label}</span></td>
                      <td style={tdStyle}><span style={badgeStyle(getStatusBadge(task.status))}>{task.status}</span></td>
                      <td style={tdStyle}>{task.assignee}</td>
                      <td style={tdStyle}>
                        <span style={{ color: hoursColor, fontWeight: '500' }}>{task.actual}</span>
                        <span style={{ color: '#9CA3AF' }}>/{task.estimated}h</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ---- 渲染缺陷管理 ----
  var renderDefects = function() {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: '全部缺陷', count: MOCK_DEFECTS.length, icon: '🐛', color: '#3B5BDB' },
            { label: '待处理', count: MOCK_DEFECTS.filter(function(d) { return d.status === '新建' || d.status === '处理中'; }).length, icon: '🔴', color: '#C92A2A' },
            { label: '已解决', count: MOCK_DEFECTS.filter(function(d) { return d.status === '已解决'; }).length, icon: '🟢', color: '#2B8A3E' },
            { label: '已验证', count: MOCK_DEFECTS.filter(function(d) { return d.status === '已验证'; }).length, icon: '✅', color: '#1971C2' },
          ].map(function(stat, idx) {
            return (
              <div key={idx} style={Object.assign({}, cardStyle, { marginBottom: 0, textAlign: 'center' })}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: stat.color }}>{stat.count}</div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div style={cardStyle}>
          <div style={titleStyle}>🐛 缺陷列表</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>编号</th>
                  <th style={thStyle}>缺陷标题</th>
                  <th style={thStyle}>所属项目</th>
                  <th style={thStyle}>严重程度</th>
                  <th style={thStyle}>状态</th>
                  <th style={thStyle}>处理人</th>
                  <th style={thStyle}>发现日期</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DEFECTS.map(function(defect) {
                  var sBadge = getSeverityBadge(defect.severity);
                  return (
                    <tr key={defect.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={tdStyle}><span style={{ color: '#C92A2A', fontWeight: '500' }}>{defect.id}</span></td>
                      <td style={tdStyle}><span style={{ fontWeight: '500' }}>{defect.title}</span></td>
                      <td style={tdStyle}><span style={{ fontSize: '12px', color: '#6B7280' }}>{defect.project}</span></td>
                      <td style={tdStyle}><span style={badgeStyle({ bg: sBadge.bg, color: sBadge.color })}>{defect.severity}</span></td>
                      <td style={tdStyle}><span style={badgeStyle(getStatusBadge(defect.status))}>{defect.status}</span></td>
                      <td style={tdStyle}>{defect.handler}</td>
                      <td style={tdStyle}>{defect.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ---- 渲染评审决策 ----
  var renderReviews = function() {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: '待评审', count: MOCK_REVIEWS.filter(function(r) { return r.status === '待评审'; }).length, icon: '⏳', color: '#E67700' },
            { label: '评审中', count: MOCK_REVIEWS.filter(function(r) { return r.status === '评审中'; }).length, icon: '🔍', color: '#7048E8' },
            { label: '已通过', count: MOCK_REVIEWS.filter(function(r) { return r.status === '已通过'; }).length, icon: '✅', color: '#2B8A3E' },
          ].map(function(stat, idx) {
            return (
              <div key={idx} style={Object.assign({}, cardStyle, { marginBottom: 0, textAlign: 'center' })}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: stat.color }}>{stat.count}</div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div style={cardStyle}>
          <div style={titleStyle}>🔍 评审记录</div>
          {MOCK_REVIEWS.map(function(review) {
            return (
              <div key={review.id} style={{ padding: '16px', marginBottom: '12px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{review.title}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>{review.type} · {review.project}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={badgeStyle(getStatusBadge(review.status))}>{review.status}</span>
                    {review.result && <span style={badgeStyle(getStatusBadge(review.result))}>{review.result}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', color: '#9CA3AF' }}>
                  <span>📅 {review.date}</span>
                  <span>👤 主持人: {review.host}</span>
                  <span>📋 {review.stage}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ---- 主渲染 ----
  var contentMap = {
    dashboard: renderDashboard,
    projects: renderProjects,
    requirements: renderRequirements,
    tasks: renderTasks,
    defects: renderDefects,
    reviews: renderReviews,
  };

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh', padding: 0, margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', borderRadius: '0 !important' }}>
      <div style={{ display: 'none' }}>{timestamp}</div>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
        padding: isMobile ? '16px' : '20px 32px',
        display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0', borderBottom: '3px solid #3B5BDB',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px',
            background: 'linear-gradient(135deg, #3B5BDB, #5C7CFA)', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isMobile ? '20px' : '24px', boxShadow: '0 4px 12px rgba(59,91,219,0.4)',
          }}>🔬</div>
          <div>
            <div style={{ color: '#FFF', fontSize: isMobile ? '18px' : '22px', fontWeight: '700', letterSpacing: '1px' }}>IPD 芯片生产管理系统</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: isMobile ? '11px' : '13px', marginTop: '2px' }}>Integrated Product Development · 芯片全流程管控中心</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
            🟢 系统运行正常
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
            📅 2026-03-15
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        background: '#FFF', padding: isMobile ? '0 12px' : '0 32px',
        display: 'flex', borderBottom: '1px solid #E5E7EB', overflowX: 'auto', whiteSpace: 'nowrap',
      }}>
        {tabs.map(function(tab) {
          var isActive = activeTab === tab.key;
          return (
            <div key={tab.key} onClick={function() { self.setCustomState({ activeTab: tab.key }); }}
              style={{
                padding: isMobile ? '12px 14px' : '14px 24px',
                fontSize: isMobile ? '13px' : '14px', fontWeight: isActive ? '600' : '500',
                color: isActive ? '#3B5BDB' : '#6B7280', cursor: 'pointer',
                borderBottom: isActive ? '2px solid #3B5BDB' : '2px solid transparent',
                flexShrink: 0,
              }}>
              {tab.label}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ padding: isMobile ? '16px' : '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>
        {contentMap[activeTab] ? contentMap[activeTab]() : renderDashboard()}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', padding: '20px', color: '#9CA3AF', fontSize: '12px',
        borderTop: '1px solid #E5E7EB', background: '#FFF',
      }}>
        IPD 芯片生产管理系统 v1.0 · Powered by 宜搭低代码平台 · © 2026
      </div>
    </div>
  );
}
