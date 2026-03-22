var _customState = {
  activeTab: 'overview',
  currentTime: '',
  clockTimer: null,
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

export function didMount() {
  var self = this;
  _customState.currentTime = _formatTime(new Date());
  self.setState({ timestamp: new Date().getTime() });
  _customState.clockTimer = setInterval(function() {
    _customState.currentTime = _formatTime(new Date());
    self.setState({ timestamp: new Date().getTime() });
  }, 1000);
}

export function didUnmount() {
  if (_customState.clockTimer) {
    clearInterval(_customState.clockTimer);
    _customState.clockTimer = null;
  }
}

function _pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function _formatTime(d) {
  return d.getFullYear() + '-' + _pad(d.getMonth() + 1) + '-' + _pad(d.getDate())
    + '  ' + _pad(d.getHours()) + ':' + _pad(d.getMinutes()) + ':' + _pad(d.getSeconds());
}

var MOCK_DATA = {
  kpi: {
    revenue2024: '924.7',
    shipment2024: '92.87',
    topconEfficiency: '26.6',
    overseasRevenuePct: '70',
    cumulativeShipment: '350',
    globalMarkets: '160',
    employees: '42000',
    patents: '3800',
  },
  monthlyShipment: [
    { month: '24-01', value: 6.2, is2025: false },
    { month: '24-02', value: 5.8, is2025: false },
    { month: '24-03', value: 7.9, is2025: false },
    { month: '24-04', value: 7.5, is2025: false },
    { month: '24-05', value: 8.1, is2025: false },
    { month: '24-06', value: 8.4, is2025: false },
    { month: '24-07', value: 8.0, is2025: false },
    { month: '24-08', value: 8.6, is2025: false },
    { month: '24-09', value: 7.8, is2025: false },
    { month: '24-10', value: 8.9, is2025: false },
    { month: '24-11', value: 9.2, is2025: false },
    { month: '24-12', value: 6.4, is2025: false },
    { month: '25-01', value: 6.8, is2025: true },
    { month: '25-02', value: 6.2, is2025: true },
    { month: '25-03', value: 7.4, is2025: true },
    { month: '25-04', value: 7.1, is2025: true },
    { month: '25-05', value: 7.5, is2025: true },
    { month: '25-06', value: 6.8, is2025: true },
  ],
  globalMarketShare: [
    { region: '欧洲', pct: 32, color: '#00C48C', gwValue: '29.7' },
    { region: '中国', pct: 28, color: '#0089FF', gwValue: '26.0' },
    { region: '美洲', pct: 18, color: '#FF7357', gwValue: '16.7' },
    { region: '亚太', pct: 14, color: '#FFA200', gwValue: '13.0' },
    { region: '中东非', pct: 8, color: '#8F66FF', gwValue: '7.4' },
  ],
  productMix: [
    { name: 'N型 TOPCon Tiger Neo', pct: 78, color: '#00C48C' },
    { name: 'P型 PERC', pct: 15, color: '#0089FF' },
    { name: '储能系统 ESS', pct: 7, color: '#FF7357' },
  ],
  storage: {
    revenue2024: '38.5',
    revenue2025E: '85',
    growthRate: '121',
    projects: [
      { name: '意大利 TERNA 电网调频', capacity: '200MWh', status: '交付中', region: '欧洲' },
      { name: '澳大利亚 Neoen 储能站', capacity: '500MWh', status: '在建', region: '亚太' },
      { name: '美国德州 ERCOT 项目', capacity: '300MWh', status: '签约', region: '美洲' },
      { name: '沙特 NEOM 绿色城市', capacity: '1GWh', status: '规划', region: '中东' },
      { name: '西班牙 Iberdrola 合作', capacity: '400MWh', status: '交付中', region: '欧洲' },
    ],
  },
  techRoadmap: [
    { year: '2023', milestone: 'TOPCon 量产效率突破 25.4%', icon: '⚡', done: true },
    { year: '2024', milestone: 'Tiger Neo 3.0 发布，效率 26.1%', icon: '🚀', done: true },
    { year: '2025', milestone: 'TOPCon 量产效率达 26.6%，主流功率 630W+', icon: '🔬', done: true },
    { year: '2026', milestone: '主流功率 650-670W，钙钛矿叠层中试', icon: '🌟', done: false },
    { year: '2027', milestone: '钙钛矿/TOPCon 叠层组件量产，效率 30%+', icon: '💎', done: false },
    { year: '2030', milestone: '组件效率突破 35%，光储一体化解决方案', icon: '🌍', done: false },
  ],
  competitors: [
    { name: '晶科能源', value: 92.87, color: '#00C48C', isJinko: true },
    { name: '隆基绿能', value: 81.2, color: '#0089FF', isJinko: false },
    { name: '天合光能', value: 79.3, color: '#FFA200', isJinko: false },
    { name: '晶澳科技', value: 75.1, color: '#FF7357', isJinko: false },
    { name: '阿特斯', value: 52.4, color: '#8F66FF', isJinko: false },
  ],
  strategy2026: [
    {
      title: '技术领先',
      icon: '🔬',
      color: '#00C48C',
      items: ['650-670W 主流功率段量产', '钙钛矿叠层中试线建设', 'TOPCon 效率持续提升至 27%+'],
    },
    {
      title: '储能扩张',
      icon: '⚡',
      color: '#0089FF',
      items: ['蓝鲸 G2 系列全球推广', '欧洲电网调频市场深耕', '光储一体化解决方案'],
    },
    {
      title: '全球化布局',
      icon: '🌍',
      color: '#FF7357',
      items: ['美国本土化产能建设', '东南亚制造基地扩产', '中东非新兴市场开拓'],
    },
    {
      title: 'AI 智造',
      icon: '🤖',
      color: '#FFA200',
      items: ['AI 质检系统全面落地', '数字化供应链升级', '智慧工厂 2.0 建设'],
    },
  ],
};

function _buildConicGradient(segments) {
  var cumulative = 0;
  var parts = segments.map(function(seg) {
    var start = cumulative * 3.6;
    cumulative += seg.pct;
    var end = cumulative * 3.6;
    return seg.color + ' ' + start + 'deg ' + end + 'deg';
  });
  return 'conic-gradient(' + parts.join(', ') + ')';
}

function _renderDonutChart(segments) {
  return (
    <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 14px' }}>
      <div style={{ width: 120, height: 120, borderRadius: '50%', background: _buildConicGradient(segments) }} />
      <div style={{ position: 'absolute', top: 26, left: 26, width: 68, height: 68, borderRadius: '50%', background: '#0a1628' }} />
    </div>
  );
}

function _renderProgressBar(pct, color) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', height: 6 }}>
      <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 4 }} />
    </div>
  );
}

function _renderKpiCard(title, value, unit, subtitle, color, icon) {
  var c = color || '#00C48C';
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderTop: '3px solid ' + c,
      borderRadius: 14,
      padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{title}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: c }}>{value}</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{unit}</span>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{subtitle}</div>
    </div>
  );
}

function _renderSectionTitle(text) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 14 }}>
      {text}
    </div>
  );
}

function _renderOverviewTab() {
  var kpi = MOCK_DATA.kpi;
  var data = MOCK_DATA.monthlyShipment;
  var maxVal = 10;
  var chartHeight = 110;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        {_renderKpiCard('2024年营业收入', kpi.revenue2024, '亿元', '《财富》中国500强第211位', '#00C48C', '💰')}
        {_renderKpiCard('2024年组件出货量', kpi.shipment2024, 'GW', '第6次蝉联全球冠军', '#0089FF', '🏆')}
        {_renderKpiCard('TOPCon量产效率', kpi.topconEfficiency, '%', '行业最高量产效率', '#FFA200', '⚡')}
        {_renderKpiCard('海外营收占比', kpi.overseasRevenuePct, '%', '覆盖全球160+国家/地区', '#FF7357', '🌍')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        {_renderKpiCard('累计出货量', kpi.cumulativeShipment, 'GW', '全球装机量持续领跑', '#8F66FF', '📦')}
        {_renderKpiCard('全球市场覆盖', kpi.globalMarkets, '国家/地区', '深耕六大洲市场', '#00C48C', '🌐')}
        {_renderKpiCard('全球员工数', kpi.employees, '人', '多元化国际化团队', '#0089FF', '👥')}
        {_renderKpiCard('专利数量', kpi.patents, '项', '持续加大研发投入', '#FFA200', '🔬')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 18 }}>
          {_renderSectionTitle('📈 月度出货趋势（GW）')}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: chartHeight, gap: 3 }}>
            {data.map(function(item, idx) {
              var barH = Math.round((item.value / maxVal) * chartHeight);
              var barColor = item.is2025 ? '#00C48C' : '#0089FF';
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', height: barH, background: barColor, borderRadius: '3px 3px 0 0', opacity: 0.85 }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>2024-01</span>
            <div style={{ display: 'flex', gap: 14 }}>
              <span style={{ fontSize: 11, color: '#0089FF', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: '#0089FF', display: 'inline-block' }} />
                2024年
              </span>
              <span style={{ fontSize: 11, color: '#00C48C', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: '#00C48C', display: 'inline-block' }} />
                2025年
              </span>
            </div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>2025-06</span>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 18 }}>
          {_renderSectionTitle('🌍 全球市场分布')}
          {_renderDonutChart(MOCK_DATA.globalMarketShare)}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {MOCK_DATA.globalMarketShare.map(function(item) {
              return (
                <div key={item.region} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{item.region}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 11, color: item.color, fontWeight: 600 }}>{item.pct}%</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{item.gwValue}GW</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 18 }}>
          {_renderSectionTitle('🔋 产品线结构（2025）')}
          {_renderDonutChart(MOCK_DATA.productMix)}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MOCK_DATA.productMix.map(function(item) {
              return (
                <div key={item.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{item.name}</span>
                    <span style={{ fontSize: 10, color: item.color, fontWeight: 600 }}>{item.pct}%</span>
                  </div>
                  {_renderProgressBar(item.pct, item.color)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function _renderStorageTab() {
  var storage = MOCK_DATA.storage;
  var statusColors = { '交付中': '#00C48C', '在建': '#0089FF', '签约': '#FFA200', '规划': '#8F66FF' };
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {_renderKpiCard('储能业务营收（2024）', storage.revenue2024, '亿元', '同比增长 121%', '#00C48C', '⚡')}
        {_renderKpiCard('储能营收预估（2025）', storage.revenue2025E, '亿元', '光储融合战略加速落地', '#0089FF', '🔋')}
        {_renderKpiCard('储能业务增速', storage.growthRate, '%', '蓝鲸 G2 系列全球热销', '#FF7357', '📈')}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 20, marginBottom: 14 }}>
        {_renderSectionTitle('🌍 全球重点储能项目')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {storage.projects.map(function(project, index) {
            var statusColor = statusColors[project.status] || '#888';
            return (
              <div key={index} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: 'rgba(0,196,140,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>🔋</div>
                  <div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{project.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{project.region}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#00C48C' }}>{project.capacity}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>装机容量</div>
                  </div>
                  <div style={{
                    padding: '3px 10px', borderRadius: 20,
                    background: statusColor + '22',
                    border: '1px solid ' + statusColor + '55',
                    fontSize: 11, color: statusColor, fontWeight: 500,
                  }}>{project.status}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background: 'rgba(0,196,140,0.06)', border: '1px solid rgba(0,196,140,0.2)', borderRadius: 14, padding: 18 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
          💡 蓝鲸 G2 系列 — 晶科储能旗舰产品，单柜容量 5MWh，液冷散热，支持电网调频、可再生能源消纳等多场景应用。已连续中标意大利、澳大利亚、美国等多个电网级项目，2026年将重点拓展欧洲南部市场。
        </div>
      </div>
    </div>
  );
}

function _renderTechTab() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {_renderKpiCard('TOPCon 量产效率', '26.6', '%', '行业最高，持续领跑', '#00C48C', '⚡')}
        {_renderKpiCard('实验室最高效率', '29.2', '%', '钙钛矿/TOPCon 叠层', '#FFA200', '🔬')}
        {_renderKpiCard('2026年目标功率', '650-670', 'W', '单瓦溢价 0.5-1 美分', '#0089FF', '🎯')}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 22 }}>
        {_renderSectionTitle('🚀 技术演进路线图')}
        <div style={{ position: 'relative', paddingLeft: 26 }}>
          <div style={{
            position: 'absolute', left: 9, top: 0, bottom: 0, width: 2,
            background: 'linear-gradient(180deg, #00C48C 0%, rgba(0,137,255,0.2) 100%)',
          }} />
          {MOCK_DATA.techRoadmap.map(function(item, index) {
            var isDone = item.done;
            return (
              <div key={index} style={{ display: 'flex', gap: 18, marginBottom: 24, position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: -26, top: 2,
                  width: 20, height: 20, borderRadius: '50%',
                  background: isDone ? '#00C48C' : 'rgba(255,255,255,0.08)',
                  border: '2px solid ' + (isDone ? '#00C48C' : 'rgba(255,255,255,0.2)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, color: isDone ? '#fff' : 'rgba(255,255,255,0.3)',
                }}>
                  {isDone ? '✓' : '○'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: isDone ? '#00C48C' : 'rgba(255,255,255,0.35)',
                      background: isDone ? 'rgba(0,196,140,0.12)' : 'rgba(255,255,255,0.05)',
                      padding: '2px 7px', borderRadius: 5,
                    }}>{item.year}</span>
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: isDone ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
                    fontWeight: isDone ? 500 : 400,
                    lineHeight: 1.5,
                  }}>{item.milestone}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function _renderCompetitorTab() {
  var maxVal = 100;
  var rankLabels = ['#1', '#2', '#3', '#4', '#5'];
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {_renderKpiCard('市场份额领先优势', '+14.3', '%', '领先第二名 11.67GW', '#00C48C', '🏆')}
        {_renderKpiCard('连续登顶次数', '6', '次', '全球组件出货量冠军', '#FFA200', '👑')}
        {_renderKpiCard('2025年出货目标', '85-90', 'GW', '继续稳居全球第一', '#0089FF', '🎯')}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 22 }}>
        {_renderSectionTitle('2024年全球组件出货量 TOP5（GW）')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {MOCK_DATA.competitors.map(function(comp, index) {
            var barPct = (comp.value / maxVal) * 100;
            var rankLabel = rankLabels[index] || '';
            return (
              <div key={comp.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', width: 18 }}>{rankLabel}</span>
                    <span style={{
                      fontSize: 13,
                      color: comp.isJinko ? '#00C48C' : 'rgba(255,255,255,0.75)',
                      fontWeight: comp.isJinko ? 700 : 400,
                    }}>{comp.name}</span>
                    {comp.isJinko && (
                      <span style={{
                        fontSize: 10, color: '#00C48C',
                        background: 'rgba(0,196,140,0.15)',
                        padding: '1px 6px', borderRadius: 10,
                      }}>全球冠军</span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 15, fontWeight: 700,
                    color: comp.isJinko ? '#00C48C' : 'rgba(255,255,255,0.6)',
                  }}>{comp.value} GW</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', height: 9 }}>
                  <div style={{
                    width: barPct + '%', height: '100%',
                    background: comp.isJinko ? '#00C48C' : comp.color + '88',
                    borderRadius: 4,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function _renderStrategyTab() {
  var targets = [
    { label: '2026年目标出货', value: '100+', unit: 'GW', color: '#00C48C' },
    { label: '储能目标营收', value: '150+', unit: '亿元', color: '#0089FF' },
    { label: '组件效率目标', value: '27+', unit: '%', color: '#FFA200' },
    { label: '全球市场覆盖', value: '180+', unit: '国家', color: '#FF7357' },
  ];
  return (
    <div>
      <div style={{
        background: 'rgba(0,196,140,0.08)',
        border: '1px solid rgba(0,196,140,0.25)',
        borderRadius: 14,
        padding: '18px 22px',
        marginBottom: 20,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 7 }}>
          🌟 2026 战略愿景
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
          以技术创新为核心驱动力，构建光储融合生态，实现从"全球出货量第一"到"全球综合能源解决方案领导者"的战略跃升
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 14 }}>
        {MOCK_DATA.strategy2026.map(function(strategy) {
          return (
            <div key={strategy.title} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderLeft: '3px solid ' + strategy.color,
              borderRadius: 14,
              padding: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                <span style={{ fontSize: 24 }}>{strategy.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: strategy.color }}>{strategy.title}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {strategy.items.map(function(item, i) {
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                      <div style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: strategy.color, flexShrink: 0, marginTop: 6,
                      }} />
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {targets.map(function(item) {
          return (
            <div key={item.label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: 14,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: item.color, marginBottom: 3 }}>
                {item.value}
                <span style={{ fontSize: 13 }}>{item.unit}</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function renderJsx() {
  var tabs = [
    { key: 'overview', label: '📊 运营总览' },
    { key: 'storage', label: '⚡ 储能业务' },
    { key: 'tech', label: '🔬 技术路线' },
    { key: 'competitor', label: '🏆 竞争格局' },
    { key: 'strategy', label: '🌟 2026战略' },
  ];
  var activeTab = _customState.activeTab || 'overview';
  var self = this;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 40%, #061020 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif',
      color: '#fff',
    }}>
      <div style={{
        background: 'linear-gradient(90deg, rgba(0,196,140,0.12) 0%, rgba(0,137,255,0.08) 50%, rgba(0,0,0,0) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 11,
            background: 'linear-gradient(135deg, #00C48C, #0089FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>☀️</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
              晶科能源 · 智慧运营驾驶舱
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              JinkoSolar Smart Operations Dashboard · Powered by 宜搭
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            padding: '4px 12px', borderRadius: 20,
            background: 'rgba(0,196,140,0.15)',
            border: '1px solid rgba(0,196,140,0.3)',
            fontSize: 11, color: '#00C48C', fontWeight: 500,
          }}>🏆 全球组件出货量 #1</div>
          <div style={{
            padding: '4px 12px', borderRadius: 20,
            background: 'rgba(0,196,140,0.15)',
            border: '1px solid rgba(0,196,140,0.3)',
            fontSize: 11, color: '#00C48C', fontWeight: 500,
          }}>N型 TOPCon 效率 26.6%</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            {_customState.currentTime || '加载中...'}
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', gap: 3,
        padding: '10px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.2)',
      }}>
        {tabs.map(function(tab) {
          var isActive = activeTab === tab.key;
          return (
            <div
              key={tab.key}
              onClick={function() {
                _customState.activeTab = tab.key;
                self.setState({ timestamp: new Date().getTime() });
              }}
              style={{
                padding: '7px 16px',
                borderRadius: 7,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#00C48C' : 'rgba(255,255,255,0.5)',
                background: isActive ? 'rgba(0,196,140,0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(0,196,140,0.25)' : '1px solid transparent',
              }}
            >
              {tab.label}
            </div>
          );
        })}
      </div>

      <div style={{ padding: '20px 28px 28px' }}>
        {activeTab === 'overview' && _renderOverviewTab()}
        {activeTab === 'storage' && _renderStorageTab()}
        {activeTab === 'tech' && _renderTechTab()}
        {activeTab === 'competitor' && _renderCompetitorTab()}
        {activeTab === 'strategy' && _renderStrategyTab()}
      </div>

      <div style={{
        textAlign: 'center',
        padding: '14px 28px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        fontSize: 11,
        color: 'rgba(255,255,255,0.2)',
      }}>
        晶科能源股份有限公司 · 数据来源：公司公告、年报及行业报告 · 部分数据为预测值 · Powered by 阿里云宜搭
      </div>
    </div>
  );
}
