#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""重写 weather-dashboard.js，修复宜搭自定义页面函数导出问题"""

TARGET = '/Users/js/workspace/openyida/openyida/project/pages/src/weather-dashboard.js'

CONTENT = '''\
// 气象服务公众反馈与舆情洞察平台 - 数据大屏
// 应用: APP_GS34UYWEWE11O1K4LPNK
// 页面: FORM-101F15CA5E6946059F2490D3B8362B560NRD
// 反馈表单: FORM-1F5B622B156C4F67873AD045CB8C290BCEJG
// 注意：宜搭自定义页面要求生命周期和渲染函数必须用 export function 导出

var APP_TYPE = 'APP_GS34UYWEWE11O1K4LPNK';
var FORM_UUID = 'FORM-1F5B622B156C4F67873AD045CB8C290BCEJG';
var BASE_URL = 'https://www.aliwork.com';

// ─── 数据（基于"十四五"公开数据及舆情研究） ──────────────────────────────────
var MOCK_SATISFACTION_TREND = [
  { year: '2021', score: 91.2 },
  { year: '2022', score: 91.8 },
  { year: '2023', score: 92.1 },
  { year: '2024', score: 92.1 },
  { year: '2025', score: 92.2 },
];
var MOCK_WARNING_TIMELINESS = [
  { label: '非常及时', value: 38, color: '#00C853' },
  { label: '比较及时', value: 34, color: '#64DD17' },
  { label: '一般', value: 16, color: '#FFD600' },
  { label: '不够及时', value: 9, color: '#FF6D00' },
  { label: '严重滞后', value: 3, color: '#D50000' },
];
var MOCK_CHANNELS = [
  { label: '天气APP', value: 78 },
  { label: '电视天气预报', value: 65 },
  { label: '微信公众号', value: 58 },
  { label: '短信预警', value: 42 },
  { label: '广播', value: 28 },
  { label: '政府官网', value: 22 },
  { label: '12121电话', value: 15 },
];
var MOCK_REGIONS = [
  { label: '华东', value: 26 },
  { label: '华北', value: 18 },
  { label: '华南', value: 16 },
  { label: '华中', value: 14 },
  { label: '西南', value: 12 },
  { label: '西北', value: 8 },
  { label: '东北', value: 6 },
];
var MOCK_ACCURACY = [
  { label: '非常准确', value: 29, color: '#00B0FF' },
  { label: '比较准确', value: 41, color: '#40C4FF' },
  { label: '一般', value: 19, color: '#B3E5FC' },
  { label: '不够准确', value: 8, color: '#FF8A65' },
  { label: '经常不准', value: 3, color: '#FF5252' },
];
var SENTIMENT_WORDS = [
  { text: '及时预警', weight: 95, color: '#00E5FF' },
  { text: '准确率高', weight: 88, color: '#69F0AE' },
  { text: '服务贴心', weight: 82, color: '#40C4FF' },
  { text: '覆盖广泛', weight: 76, color: '#B388FF' },
  { text: '信息权威', weight: 71, color: '#FFD740' },
  { text: '更新及时', weight: 68, color: '#FF6E40' },
  { text: '农业气象', weight: 62, color: '#69F0AE' },
  { text: '防灾减灾', weight: 58, color: '#00E5FF' },
  { text: '精细化预报', weight: 54, color: '#40C4FF' },
  { text: '移动端体验', weight: 49, color: '#FFD740' },
  { text: '预警短信', weight: 45, color: '#B388FF' },
  { text: '数字化转型', weight: 42, color: '#FF6E40' },
  { text: '公众满意', weight: 38, color: '#69F0AE' },
  { text: '气候变化', weight: 35, color: '#00E5FF' },
  { text: '智慧气象', weight: 32, color: '#40C4FF' },
];
var KEY_METRICS = [
  { label: '公众满意度', value: '92.2', unit: '分', icon: '⭐', trend: '+0.1', color: '#00E5FF' },
  { label: '预警及时性', value: '94.1', unit: '分', icon: '⚡', trend: '+2.3', color: '#69F0AE' },
  { label: '覆盖人口', value: '14.1', unit: '亿', icon: '👥', trend: '全覆盖', color: '#FFD740' },
  { label: '年发布预警', value: '10万+', unit: '条', icon: '📡', trend: '持续增长', color: '#FF6E40' },
];
var INSIGHTS = [
  '📊 2025年公众气象服务满意度达92.2分，"十四五"期间稳定在92.5分',
  '⚡ 气象灾害预警服务满意度首次突破94分，预警及时性评价首破92分',
  '📱 天气APP已成为78%公众首选气象服务渠道，移动端需求持续增长',
  '🌾 农业从业者对精细化气象预报需求最为迫切，建议加强农业专项服务',
  '🔔 公众对预警信息覆盖范围满意度提升，但西北、东北地区仍有改善空间',
];

// ─── 状态 ─────────────────────────────────────────────────────────────────────
var _customState = {
  animationFrame: 0,
  totalFeedbacks: 2847,
  currentTime: '',
};
var _clockTimer = null;
var _animTimer = null;

// ─── 宜搭必须 export 的函数 ───────────────────────────────────────────────────

export function getCustomState(key) {
  if (key) return _customState[key];
  return _customState;
}

export function setCustomState(newState) {
  Object.keys(newState).forEach(function(k) { _customState[k] = newState[k]; });
  this.forceUpdate();
}

export function forceUpdate() {
  this.setState({ _ts: Date.now() });
}

export function didMount() {
  var self = this;
  function tick() {
    var now = new Date();
    var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
    _customState.currentTime = now.getFullYear() + '-'
      + pad(now.getMonth() + 1) + '-' + pad(now.getDate())
      + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
    self.setState({ _ts: Date.now() });
  }
  tick();
  _clockTimer = setInterval(tick, 1000);
  _animTimer = setInterval(function() {
    _customState.animationFrame = (_customState.animationFrame + 1) % 100;
    self.setState({ _ts: Date.now() });
  }, 80);
}

export function didUnmount() {
  if (_clockTimer) { clearInterval(_clockTimer); _clockTimer = null; }
  if (_animTimer) { clearInterval(_animTimer); _animTimer = null; }
}

export function renderJsx() {
  var self = this;
  var isMobile = this.utils.isMobile();
  var frame = _customState.animationFrame;

  // ── Header ──
  var headerEl = (
    <div style={{
      background: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)',
      borderBottom: '1px solid rgba(0,229,255,0.3)',
      padding: isMobile ? '12px 16px' : '14px 28px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '44px', height: '44px',
          background: 'linear-gradient(135deg, #00E5FF, #0089FF)',
          borderRadius: '10px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '22px',
          boxShadow: '0 0 16px rgba(0,229,255,0.5)',
        }}>🌤</div>
        <div>
          <div style={{
            color: '#fff', fontSize: isMobile ? '14px' : '20px',
            fontWeight: '700', letterSpacing: '2px',
            textShadow: '0 0 16px rgba(0,229,255,0.8)',
          }}>气象服务公众反馈与舆情洞察平台</div>
          <div style={{ color: 'rgba(0,229,255,0.65)', fontSize: '10px', letterSpacing: '2px', marginTop: '2px' }}>
            NATIONAL METEOROLOGICAL SERVICE · PUBLIC FEEDBACK INTELLIGENCE
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
        <div style={{ color: '#00E5FF', fontSize: '12px', fontFamily: 'monospace', letterSpacing: '1px' }}>
          {_customState.currentTime}
        </div>
        <div style={{
          background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.35)',
          borderRadius: '20px', padding: '2px 10px', color: '#00E5FF', fontSize: '10px',
        }}>数据实时更新 · 十四五成果展示</div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, #00E5FF, #69F0AE, #00E5FF, transparent)',
      }}></div>
    </div>
  );

  // ── 洞察播报 ──
  var bannerEl = (
    <div style={{
      background: 'linear-gradient(90deg, rgba(0,229,255,0.07), rgba(105,240,174,0.07))',
      border: '1px solid rgba(0,229,255,0.18)', borderRadius: '8px',
      padding: '9px 16px', display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <div style={{
        color: '#00E5FF', fontSize: '10px', fontWeight: '700', letterSpacing: '2px',
        background: 'rgba(0,229,255,0.13)', padding: '2px 8px', borderRadius: '4px', flexShrink: 0,
      }}>洞察播报</div>
      <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '12px' }}>
        {INSIGHTS[Math.floor(frame / 20) % INSIGHTS.length]}
      </div>
    </div>
  );

  // ── 核心指标卡 ──
  var metricsEl = (
    <div style={{ display: 'flex', gap: '10px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
      {KEY_METRICS.map(function(metric, index) {
        var pulse = 0.5 + 0.5 * Math.sin((frame / 100) * 2 * Math.PI + index * 1.5);
        return (
          <div key={index} style={{
            background: 'linear-gradient(135deg, rgba(13,33,55,0.9), rgba(10,22,40,0.95))',
            border: '1px solid ' + metric.color + '38',
            borderRadius: '10px', padding: '16px', flex: '1',
            position: 'relative', overflow: 'hidden',
            minWidth: isMobile ? 'calc(50% - 5px)' : 'auto',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{metric.icon}</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', letterSpacing: '1px', marginBottom: '4px' }}>
              {metric.label}
            </div>
            <div>
              <span style={{
                color: metric.color, fontSize: '28px', fontWeight: '800',
                textShadow: '0 0 16px ' + metric.color + '70',
              }}>{metric.value}</span>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginLeft: '3px' }}>{metric.unit}</span>
            </div>
            <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#69F0AE', opacity: pulse }}></div>
              <span style={{ color: '#69F0AE', fontSize: '10px' }}>{metric.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── 满意度趋势折线图 ──
  var cW = isMobile ? 300 : 360; var cH = 130;
  var pL = 38; var pR = 16; var pT = 14; var pB = 28;
  var iW = cW - pL - pR; var iH = cH - pT - pB;
  var minS = 90; var maxS = 93;
  var trendPts = MOCK_SATISFACTION_TREND.map(function(item, i) {
    return {
      x: pL + (i / (MOCK_SATISFACTION_TREND.length - 1)) * iW,
      y: pT + (1 - (item.score - minS) / (maxS - minS)) * iH,
      item: item,
    };
  });
  var trendPath = trendPts.map(function(p, i) {
    return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1);
  }).join(' ');
  var areaPath = trendPath
    + ' L' + trendPts[trendPts.length - 1].x.toFixed(1) + ',' + (cH - pB)
    + ' L' + trendPts[0].x.toFixed(1) + ',' + (cH - pB) + ' Z';

  var trendEl = (
    <div style={{ background: 'linear-gradient(135deg, rgba(13,33,55,0.9), rgba(10,22,40,0.95))', border: '1px solid rgba(0,229,255,0.18)', borderRadius: '10px', padding: '14px' }}>
      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 6px #00E5FF' }}></div>
        公众满意度五年趋势（"十四五"）
      </div>
      <svg width={cW} height={cH} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map(function(r, i) {
          var y = pT + r * iH;
          return (
            <g key={i}>
              <line x1={pL} y1={y} x2={cW - pR} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x={pL - 4} y={y + 4} fill="rgba(255,255,255,0.38)" fontSize="9" textAnchor="end">
                {(maxS - r * (maxS - minS)).toFixed(1)}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="url(#ag)" />
        <path d={trendPath} fill="none" stroke="#00E5FF" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 5px #00E5FF)' }} />
        {trendPts.map(function(p, i) {
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill="#0a1628" stroke="#00E5FF" strokeWidth="2" />
              <circle cx={p.x} cy={p.y} r="2" fill="#00E5FF" />
              <text x={p.x} y={p.y - 9} fill="#00E5FF" fontSize="10" textAnchor="middle" fontWeight="600">
                {p.item.score}
              </text>
              <text x={p.x} y={cH - pB + 13} fill="rgba(255,255,255,0.45)" fontSize="9" textAnchor="middle">
                {p.item.year}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );

  // ── 环形图辅助（内联，无 this 依赖） ──
  function makeDonut(data, title, accentColor) {
    var sz = 130; var cx = sz / 2; var cy = sz / 2;
    var outerR = sz / 2 - 14; var innerR = outerR * 0.6;
    var total = data.reduce(function(s, d) { return s + d.value; }, 0);
    var angle = -Math.PI / 2;
    var slices = data.map(function(item) {
      var sweep = (item.value / total) * 2 * Math.PI;
      var sa = angle; var ea = angle + sweep; angle = ea;
      var x1 = cx + outerR * Math.cos(sa); var y1 = cy + outerR * Math.sin(sa);
      var x2 = cx + outerR * Math.cos(ea); var y2 = cy + outerR * Math.sin(ea);
      var ix1 = cx + innerR * Math.cos(ea); var iy1 = cy + innerR * Math.sin(ea);
      var ix2 = cx + innerR * Math.cos(sa); var iy2 = cy + innerR * Math.sin(sa);
      var large = sweep > Math.PI ? 1 : 0;
      return {
        pathD: ['M', x1.toFixed(2), y1.toFixed(2), 'A', outerR, outerR, 0, large, 1, x2.toFixed(2), y2.toFixed(2),
          'L', ix1.toFixed(2), iy1.toFixed(2), 'A', innerR, innerR, 0, large, 0, ix2.toFixed(2), iy2.toFixed(2), 'Z'].join(' '),
        item: item,
      };
    });
    var positiveTotal = data[0].value + data[1].value;
    return (
      <div style={{ background: 'linear-gradient(135deg, rgba(13,33,55,0.9), rgba(10,22,40,0.95))', border: '1px solid rgba(0,229,255,0.18)', borderRadius: '10px', padding: '14px' }}>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: accentColor, boxShadow: '0 0 6px ' + accentColor }}></div>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width={sz} height={sz} style={{ flexShrink: 0 }}>
            {slices.map(function(s, i) {
              return <path key={i} d={s.pathD} fill={s.item.color} style={{ filter: 'drop-shadow(0 0 3px ' + s.item.color + '50)' }} />;
            })}
            <text x={cx} y={cy - 5} fill="rgba(255,255,255,0.9)" fontSize="17" fontWeight="800" textAnchor="middle">{positiveTotal}%</text>
            <text x={cx} y={cy + 11} fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">正向评价</text>
          </svg>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {data.map(function(item, i) {
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '2px', background: item.color, flexShrink: 0 }}></div>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', flex: 1 }}>{item.label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '10px', fontWeight: '600' }}>{item.value}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── 渠道条形图 ──
  var maxCh = Math.max.apply(null, MOCK_CHANNELS.map(function(d) { return d.value; }));
  var channelEl = (
    <div style={{ background: 'linear-gradient(135deg, rgba(13,33,55,0.9), rgba(10,22,40,0.95))', border: '1px solid rgba(0,229,255,0.18)', borderRadius: '10px', padding: '14px' }}>
      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 6px #00E5FF' }}></div>
        公众常用气象服务渠道 TOP7
      </div>
      {MOCK_CHANNELS.map(function(item, i) {
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '7px' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', width: '68px', flexShrink: 0, textAlign: 'right' }}>{item.label}</div>
            <div style={{ flex: 1, height: '9px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: (item.value / maxCh * 100).toFixed(1) + '%', height: '100%', background: 'linear-gradient(90deg, #00E5FF60, #00E5FF)', borderRadius: '5px' }}></div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '10px', width: '28px', textAlign: 'right' }}>{item.value}%</div>
          </div>
        );
      })}
    </div>
  );

  // ── 地区分布 ──
  var regionEl = (
    <div style={{ background: 'linear-gradient(135deg, rgba(13,33,55,0.9), rgba(10,22,40,0.95))', border: '1px solid rgba(0,229,255,0.18)', borderRadius: '10px', padding: '14px' }}>
      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#B388FF', boxShadow: '0 0 6px #B388FF' }}></div>
        各地区反馈占比分布
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '7px' }}>
        {MOCK_REGIONS.map(function(region, i) {
          return (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '7px', padding: '8px 6px', textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '10px', marginBottom: '3px' }}>{region.label}</div>
              <div style={{ color: '#B388FF', fontSize: '17px', fontWeight: '800' }}>{region.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '9px' }}>%</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── 参与反馈入口 ──
  var formUrl = BASE_URL + '/' + APP_TYPE + '/submission/' + FORM_UUID + '?isRenderNav=false';
  var feedbackEl = (
    <div style={{ background: 'linear-gradient(135deg, rgba(13,33,55,0.9), rgba(10,22,40,0.95))', border: '1px solid rgba(105,240,174,0.25)', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#69F0AE', boxShadow: '0 0 6px #69F0AE' }}></div>
        参与满意度调查
      </div>
      <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: '11px', textAlign: 'center', lineHeight: '1.6' }}>
        您的每一条反馈都将推动<br />气象服务持续改进
      </div>
      <button
        style={{ background: 'linear-gradient(135deg, #00B853, #00E5FF)', border: 'none', borderRadius: '22px', padding: '9px 24px', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', letterSpacing: '1px', boxShadow: '0 4px 16px rgba(0,229,255,0.35)' }}
        onClick={function() { self.utils.openPage({ pageUrl: formUrl, openMode: 'blank' }); }}
      >
        立即参与反馈 →
      </button>
      <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '10px' }}>
        已有 <span style={{ color: '#69F0AE', fontWeight: '700' }}>{_customState.totalFeedbacks.toLocaleString()}</span> 人参与
      </div>
    </div>
  );

  // ── 热词云 ──
  var wordCloudEl = (
    <div style={{ background: 'linear-gradient(135deg, rgba(13,33,55,0.9), rgba(10,22,40,0.95))', border: '1px solid rgba(0,229,255,0.18)', borderRadius: '10px', padding: '14px' }}>
      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FFD740', boxShadow: '0 0 6px #FFD740' }}></div>
        公众舆情热词云（近30天）
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'center', minHeight: '90px' }}>
        {SENTIMENT_WORDS.map(function(word, i) {
          var fs = Math.round(10 + (word.weight / 95) * 13);
          return (
            <span key={i} style={{
              color: word.color, fontSize: fs + 'px',
              fontWeight: word.weight > 70 ? '700' : '500',
              opacity: 0.55 + (word.weight / 95) * 0.45,
              textShadow: '0 0 ' + Math.round(word.weight / 12) + 'px ' + word.color + '70',
              cursor: 'default', padding: '2px 3px',
            }}>
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );

  // ── 布局 ──
  var mainGrid = isMobile
    ? { display: 'flex', flexDirection: 'column', gap: '10px' }
    : { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' };
  var bottomGrid = isMobile
    ? { display: 'flex', flexDirection: 'column', gap: '10px' }
    : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };

  return (
    <div style={{
      background: '#060e1a', minHeight: '100vh',
      fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
      color: '#fff', borderRadius: '0 !important',
    }}>
      {headerEl}
      <div style={{ padding: isMobile ? '10px' : '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {bannerEl}
        {metricsEl}
        <div style={mainGrid}>
          {trendEl}
          {makeDonut(MOCK_WARNING_TIMELINESS, '预警信息及时性评价', '#69F0AE')}
          {makeDonut(MOCK_ACCURACY, '气象预报准确性评价', '#00B0FF')}
        </div>
        <div style={bottomGrid}>
          {channelEl}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {feedbackEl}
            {regionEl}
          </div>
        </div>
        {wordCloudEl}
      </div>
    </div>
  );
}
'''

with open(TARGET, 'w', encoding='utf-8') as f:
    f.write(CONTENT)

import os
size = os.path.getsize(TARGET)
print('OK: 写入成功，文件大小 =', size, '字节')

# 验证关键 export 函数存在
with open(TARGET, encoding='utf-8') as f:
    text = f.read()

required = ['export function getCustomState', 'export function setCustomState',
            'export function forceUpdate', 'export function didMount',
            'export function didUnmount', 'export function renderJsx']
for fn in required:
    status = 'OK' if fn in text else 'MISSING'
    print(status + ': ' + fn)
