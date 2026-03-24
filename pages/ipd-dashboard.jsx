/**
 * IPD 数据看板 - 芯片生产全流程管理
 */
function IPDDashboard() {
  // 表单 UUID 配置
  var FORMS = {
    requirements: 'FORM-1E85DDCFBE3B45C6A154339B3C6BC73EC1EM',
    projects: 'FORM-5607B147555442DA8221D958B3AEA0D2KK85',
    versions: 'FORM-6824D79AA3074887A5A2562B02DBAF0APC3T',
    tasks: 'FORM-19E4CA2FE24049548C6AE9739368EBC2AIPR',
    bugs: 'FORM-EBB7D61DFF4A439CBD5FECE2340CB7EBXD05',
    reviews: 'FORM-9CDD829F31684E2894C84641BC3D05AB90WL'
  };

  var appType = window.pageConfig && window.pageConfig.appType || 'APP_NUFG88GKGEY2FE1QZKU0';

  // 状态数据
  var [stats, setStats] = window.useState({
    requirements: { total: 0, pending: 0, completed: 0 },
    projects: { total: 0, inProgress: 0, completed: 0 },
    versions: { total: 0, released: 0 },
    tasks: { total: 0, pending: 0, completed: 0 },
    bugs: { total: 0, open: 0, closed: 0 },
    reviews: { total: 0, pending: 0, passed: 0 }
  });

  var [loading, setLoading] = window.useState(true);
  var [recentProjects, setRecentProjects] = window.useState([]);

  // 加载数据统计
  window.useEffect(function() {
    loadAllStats();
  }, []);

  function loadAllStats() {
    setLoading(true);
    
    // 并行加载所有表单数据
    Promise.all([
      loadFormStats(FORMS.requirements, 'requirements'),
      loadFormStats(FORMS.projects, 'projects'),
      loadFormStats(FORMS.versions, 'versions'),
      loadFormStats(FORMS.tasks, 'tasks'),
      loadFormStats(FORMS.bugs, 'bugs'),
      loadFormStats(FORMS.reviews, 'reviews')
    ]).then(function(results) {
      var newStats = {};
      results.forEach(function(result) {
        newStats[result.key] = result.stats;
      });
      setStats(newStats);
      setLoading(false);
    }).catch(function(err) {
      console.error('加载数据失败:', err);
      setLoading(false);
    });

    // 加载最近项目
    loadRecentProjects();
  }

  function loadFormStats(formUuid, key) {
    return window.YidaAPI.searchFormDatas({
      formUuid: formUuid,
      appType: appType,
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

  function loadRecentProjects() {
    window.YidaAPI.searchFormDatas({
      formUuid: FORMS.projects,
      appType: appType,
      currentPage: 1,
      pageSize: 5
    }).then(function(res) {
      var projects = (res.data || []).map(function(item) {
        return {
          instId: item.formInstId,
          name: item.formData && (item.formData.textField_lzrq80h1 || item.formData.textField_q96ibpco),
          status: item.formData && (item.formData.selectField_lzrq80h4 || item.formData.selectField_q96iseth),
          stage: item.formData && item.formData.selectField_lzrq80h9
        };
      });
      setRecentProjects(projects);
    });
  }

  // 渲染统计卡片
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

  // 渲染最近项目列表
  function renderRecentProjects() {
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

  // 渲染流程进度
  function renderProcessFlow() {
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
                {index < stages.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    right: '-20px',
                    top: '24px',
                    color: '#ddd',
                    fontSize: '20px'
                  }}>→</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <div style={{ marginTop: '12px', color: '#666' }}>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f5f7fa', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        color: '#fff'
      }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
          🏭 芯片生产 IPD 管理看板
        </h1>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
          Integrated Product Development - 集成产品开发全流程管理
        </p>
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
        {renderProcessFlow()}
        {renderRecentProjects()}
      </div>
    </div>
  );
}

// 导出组件
IPDDashboard;
