/**
 * IPD 数据看板 - 芯片生产全流程管理
 * 宜搭自定义页面 - 符合 React 16 类组件规范
 */

// ============================================================
// 状态管理
// ============================================================

var _customState = {
  loading: true,
  stats: {
    requirements: { total: 0, pending: 0, completed: 0 },
    projects: { total: 0, inProgress: 0, completed: 0 },
    versions: { total: 0, released: 0 },
    tasks: { total: 0, pending: 0, completed: 0 },
    bugs: { total: 0, open: 0, closed: 0 },
    reviews: { total: 0, pending: 0, passed: 0 }
  },
  recentProjects: []
};

export function getCustomState(key) {
  if (key) {
    return _customState[key];
  }
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
// 配置
// ============================================================

var APP_TYPE = 'APP_NUFG88GKGEY2FE1QZKU0';

var FORMS = {
  requirements: 'FORM-1E85DDCFBE3B45C6A154339B3C6BC73EC1EM',
  projects: 'FORM-5607B147555442DA8221D958B3AEA0D2KK85',
  versions: 'FORM-6824D79AA3074887A5A2562B02DBAF0APC3T',
  tasks: 'FORM-19E4CA2FE24049548C6AE9739368EBC2AIPR',
  bugs: 'FORM-EBB7D61DFF4A439CBD5FECE2340CB7EBXD05',
  reviews: 'FORM-9CDD829F31684E2894C84641BC3D05AB90WL'
};

// ============================================================
// 数据加载函数
// ============================================================

function loadFormStats(self, formUuid, key) {
  return self.utils.yida.searchFormDatas({
    formUuid: formUuid,
    appType: APP_TYPE,
    currentPage: 1,
    pageSize: 100
  }).then(function(res) {
    var total = res.totalCount || 0;
    var stats = { total: total };

    // 根据不同表单类型计算统计数据
    if (key === 'requirements') {
      var pending = 0, completed = 0;
      (res.data || []).forEach(function(item) {
        var status = item.formData && item.formData.selectField_lzrq80h3;
        if (status === '已完成' || status === '已关闭') completed++;
        else pending++;
      });
      stats.pending = pending;
      stats.completed = completed;
    } else if (key === 'projects') {
      var inProgress = 0, completed = 0;
      (res.data || []).forEach(function(item) {
        var status = item.formData && item.formData.selectField_lzrq80h4;
        if (status === '已完成') completed++;
        else if (status === '进行中') inProgress++;
      });
      stats.inProgress = inProgress;
      stats.completed = completed;
    } else if (key === 'versions') {
      var released = 0;
      (res.data || []).forEach(function(item) {
        var status = item.formData && item.formData.selectField_lzrq80h5;
        if (status === '已发布') released++;
      });
      stats.released = released;
    } else if (key === 'tasks') {
      var pending = 0, completed = 0;
      (res.data || []).forEach(function(item) {
        var status = item.formData && item.formData.selectField_lzrq80h6;
        if (status === '已完成') completed++;
        else if (status === '待开始' || status === '进行中') pending++;
      });
      stats.pending = pending;
      stats.completed = completed;
    } else if (key === 'bugs') {
      var open = 0, closed = 0;
      (res.data || []).forEach(function(item) {
        var status = item.formData && item.formData.selectField_lzrq80h7;
        if (status === '已关闭' || status === '已验证') closed++;
        else open++;
      });
      stats.open = open;
      stats.closed = closed;
    } else if (key === 'reviews') {
      var pending = 0, passed = 0;
      (res.data || []).forEach(function(item) {
        var status = item.formData && item.formData.selectField_lzrq80h8;
        if (status === '已通过' || status === '有条件通过') passed++;
        else if (status === '待评审' || status === '评审中') pending++;
      });
      stats.pending = pending;
      stats.passed = passed;
    }

    return { key: key, stats: stats };
  }).catch(function() {
    return { key: key, stats: { total: 0 } };
  });
}

function loadAllStats(self) {
  _customState.loading = true;
  self.forceUpdate();

  Promise.all([
    loadFormStats(self, FORMS.requirements, 'requirements'),
    loadFormStats(self, FORMS.projects, 'projects'),
    loadFormStats(self, FORMS.versions, 'versions'),
    loadFormStats(self, FORMS.tasks, 'tasks'),
    loadFormStats(self, FORMS.bugs, 'bugs'),
    loadFormStats(self, FORMS.reviews, 'reviews')
  ]).then(function(results) {
    var newStats = {};
    results.forEach(function(result) {
      newStats[result.key] = result.stats;
    });
    _customState.stats = newStats;
    _customState.loading = false;
    self.forceUpdate();
  }).catch(function(err) {
    console.error('加载数据失败:', err);
    _customState.loading = false;
    self.forceUpdate();
  });

  // 加载最近项目
  self.utils.yida.searchFormDatas({
    formUuid: FORMS.projects,
    appType: APP_TYPE,
    currentPage: 1,
    pageSize: 5
  }).then(function(res) {
    var projects = (res.data || []).map(function(item) {
      return {
        instId: item.formInstId,
        name: item.formData && item.formData.textField_lzrq80h1,
        status: item.formData && item.formData.selectField_lzrq80h4,
        stage: item.formData && item.formData.selectField_lzrq80h9
      };
    });
    _customState.recentProjects = projects;
    self.forceUpdate();
  }).catch(function(err) {
    console.error('加载项目失败:', err);
  });
}

// ============================================================
// 生命周期
// ============================================================

export function didMount() {
  loadAllStats(this);
}

export function didUnmount() {
  // 清理逻辑
}

// ============================================================
// 渲染辅助函数
// ============================================================

function renderStatCard(title, icon, data, color) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderLeft: '4px solid ' + color
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '24px', marginRight: '8px' }}>{icon}</span>
        <span style={{ fontSize: '16px', color: '#333', fontWeight: 500 }}>{title}</span>
      </div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: color, marginBottom: '8px' }}>
        {data.total}
      </div>
      <div style={{ fontSize: '12px', color: '#999' }}>
        {data.pending !== undefined && <span>待处理: {data.pending}</span>}
        {data.inProgress !== undefined && <span>进行中: {data.inProgress}</span>}
        {data.open !== undefined && <span>未解决: {data.open}</span>}
        {data.released !== undefined && <span>已发布: {data.released}</span>}
        {data.completed !== undefined && <span style={{ marginLeft: '12px' }}>已完成: {data.completed}</span>}
        {data.passed !== undefined && <span style={{ marginLeft: '12px' }}>已通过: {data.passed}</span>}
      </div>
    </div>
  );
}

function renderRecentProjects(recentProjects) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#333' }}>
        📋 最近项目
      </h3>
      {recentProjects.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
          暂无项目数据
        </div>
      ) : (
        <div>
          {recentProjects.map(function(project, index) {
            return (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: index < recentProjects.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#333', fontWeight: 500 }}>
                    {project.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {project.stage || '未设置阶段'}
                  </div>
                </div>
                <div style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  background: project.status === '已完成' ? '#e6f7ff' : 
                             project.status === '进行中' ? '#fff7e6' : '#f5f5f5',
                  color: project.status === '已完成' ? '#1890ff' : 
                         project.status === '进行中' ? '#fa8c16' : '#666'
                }}>
                  {project.status || '未知'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function renderProcessFlow(stats) {
  var stages = [
    { name: '需求管理', icon: '📝', count: stats.requirements.total },
    { name: '项目立项', icon: '🎯', count: stats.projects.total },
    { name: '版本规划', icon: '📦', count: stats.versions.total },
    { name: '任务执行', icon: '⚙️', count: stats.tasks.total },
    { name: '缺陷修复', icon: '🔧', count: stats.bugs.total },
    { name: '评审决策', icon: '✅', count: stats.reviews.total }
  ];

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#333' }}>
        🔄 IPD 流程概览
      </h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {stages.map(function(stage, index) {
          return (
            <div key={index} style={{
              textAlign: 'center',
              flex: '1',
              minWidth: '80px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                fontSize: '20px'
              }}>
                {stage.icon}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>{stage.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginTop: '4px' }}>
                {stage.count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var self = this;
  var timestamp = this.state && this.state.timestamp;
  var loading = _customState.loading;
  var stats = _customState.stats;
  var recentProjects = _customState.recentProjects;

  // 刷新按钮处理
  var handleRefresh = function() {
    loadAllStats(self);
  };

  // 加载状态
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        background: '#f5f7fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f0f0f0',
            borderTop: '3px solid #1890ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <div style={{ marginTop: '12px', color: '#666' }}>加载中...</div>
        </div>
        <div style={{ display: 'none' }}>{timestamp}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0', background: '#f5f7fa', minHeight: '100vh' }}>
      {/* 隐藏的 timestamp 用于触发重渲染 */}
      <div style={{ display: 'none' }}>{timestamp}</div>

      {/* 页面标题 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        color: '#fff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
              🏭 芯片生产 IPD 管理看板
            </h1>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
              Integrated Product Development - 集成产品开发全流程管理
            </p>
          </div>
          <div 
            onClick={handleRefresh}
            style={{
              cursor: 'pointer',
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            🔄 刷新数据
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {renderStatCard('需求管理', '📝', stats.requirements, '#1890ff')}
        {renderStatCard('项目管理', '🎯', stats.projects, '#52c41a')}
        {renderStatCard('版本管理', '📦', stats.versions, '#722ed1')}
        {renderStatCard('任务管理', '⚙️', stats.tasks, '#fa8c16')}
        {renderStatCard('缺陷管理', '🔧', stats.bugs, '#eb2f96')}
        {renderStatCard('评审决策', '✅', stats.reviews, '#13c2c2')}
      </div>

      {/* 流程概览和最近项目 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px'
      }}>
        {renderProcessFlow(stats)}
        {renderRecentProjects(recentProjects)}
      </div>

      {/* 底部信息 */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        color: '#999',
        fontSize: '12px'
      }}>
        数据更新时间: {new Date().toLocaleString('zh-CN')}
      </div>
    </div>
  );
}
