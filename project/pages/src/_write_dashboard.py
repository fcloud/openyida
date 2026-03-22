#!/usr/bin/env python3
import os

content = r'''// 气象服务公众反馈与舆情洞察平台 - 数据大屏 v3
// 所有渲染逻辑内联到 renderJsx，零外部辅助函数调用

var APP_TYPE = 'APP_GS34UYWEWE11O1K4LPNK';
var FORM_UUID = 'FORM-1F5B622B156C4F67873AD045CB8C290BCEJG';
var BASE_URL = 'https://www.aliwork.com';

var SATISFACTION_TREND = [
  { year: '2021', score: 91.2 },
  { year: '2022', score: 91.8 },
  { year: '2023', score: 92.1 },
  { year: '2024', score: 92.1 },
  { year: '2025', score: 92.2 }
];

var WARNING_TIMELINESS = [
  { label: '\u975e\u5e38\u53ca\u65f6', value: 38, color: '#00C853' },
  { label: '\u6bd4\u8f83\u53ca\u65f6', value: 34, color: '#64DD17' },
  { label: '\u4e00\u822c', value: 16, color: '#FFD600' },
  { label: '\u4e0d\u591f\u53ca\u65f6', value: 9, color: '#FF6D00' },
  { label: '\u4e25\u91cd\u6ede\u540e', value: 3, color: '#D50000' }
];

var ACCURACY = [
  { label: '\u975e\u5e38\u51c6\u786e', value: 29, color: '#00B0FF' },
  { label: '\u6bd4\u8f83\u51c6\u786e', value: 41, color: '#40C4FF' },
  { label: '\u4e00\u822c', value: 19, color: '#B3E5FC' },
  { label: '\u4e0d\u591f\u51c6\u786e', value: 8, color: '#FF8A65' },
  { label: '\u7ecf\u5e38\u4e0d\u51c6', value: 3, color: '#FF5252' }
];

var CHANNELS = [
  { label: '\u5929\u6c14APP', value: 78 },
  { label: '\u7535\u89c6\u5929\u6c14\u9884\u62a5', value: 65 },
  { label: '\u5fae\u4fe1\u516c\u4f17\u53f7', value: 58 },
  { label: '\u77ed\u4fe1\u9884\u8b66', value: 42 },
  { label: '\u5e7f\u64ad', value: 28 },
  { label: '\u653f\u5e9c\u5b98\u7f51', value: 22 },
  { label: '12121\u7535\u8bdd', value: 15 }
];

var REGIONS = [
  { label: '\u534e\u4e1c', value: 26 },
  { label: '\u534e\u5317', value: 18 },
  { label: '\u534e\u5357', value: 16 },
  { label: '\u534e\u4e2d', value: 14 },
  { label: '\u897f\u5357', value: 12 },
  { label: '\u897f\u5317', value: 8 },
  { label: '\u4e1c\u5317', value: 6 }
];

var HOT_WORDS = [
  { text: '\u53ca\u65f6\u9884\u8b66', weight: 95, color: '#00E5FF' },
  { text: '\u51c6\u786e\u7387\u9ad8', weight: 88, color: '#69F0AE' },
  { text: '\u670d\u52a1\u8d34\u5fc3', weight: 82, color: '#40C4FF' },
  { text: '\u8986\u76d6\u5e7f\u6cdb', weight: 76, color: '#B388FF' },
  { text: '\u4fe1\u606f\u6743\u5a01', weight: 71, color: '#FFD740' },
  { text: '\u66f4\u65b0\u53ca\u65f6', weight: 68, color: '#FF6E40' },
  { text: '\u519c\u4e1a\u6c14\u8c61', weight: 62, color: '#69F0AE' },
  { text: '\u9632\u707e\u51cf\u707e', weight: 58, color: '#00E5FF' },
  { text: '\u7cbe\u7ec6\u5316\u9884\u62a5', weight: 54, color: '#40C4FF' },
  { text: '\u79fb\u52a8\u7aef\u4f53\u9a8c', weight: 49, color: '#FFD740' },
  { text: '\u9884\u8b66\u77ed\u4fe1', weight: 45, color: '#B388FF' },
  { text: '\u6570\u5b57\u5316\u8f6c\u578b', weight: 42, color: '#FF6E40' },
  { text: '\u516c\u4f17\u6ee1\u610f', weight: 38, color: '#69F0AE' },
  { text: '\u6c14\u5019\u53d8\u5316', weight: 35, color: '#00E5FF' },
  { text: '\u667a\u6167\u6c14\u8c61', weight: 32, color: '#40C4FF' }
];

var METRICS = [
  { label: '\u516c\u4f17\u6ee1\u610f\u5ea6', value: '92.2', unit: '\u5206', icon: '\u2B50', trend: '+0.1', color: '#00E5FF' },
  { label: '\u9884\u8b66\u53ca\u65f6\u6027', value: '94.1', unit: '\u5206', icon: '\u26A1', trend: '+2.3', color: '#69F0AE' },
  { label: '\u8986\u76d6\u4eba\u53e3', value: '14.1', unit: '\u4ebf', icon: '\uD83D\uDC65', trend: '\u5168\u8986\u76d6', color: '#FFD740' },
  { label: '\u5e74\u53d1\u5e03\u9884\u8b66', value: '10\u4e07+', unit: '\u6761', icon: '\uD83D\uDCE1', trend: '\u6301\u7eed\u589e\u957f', color: '#FF6E40' }
];

var INSIGHTS = [
  '\uD83D\uDCCA 2025\u5e74\u516c\u4f17\u6c14\u8c61\u670d\u52a1\u6ee1\u610f\u5ea6\u8fbe92.2\u5206\uff0c\u201c\u5341\u56db\u4e94\u201d\u671f\u95f4\u7a33\u5b9a\u572892\u5206\u4ee5\u4e0a',
  '\u26A1 \u6c14\u8c61\u707e\u5bb3\u9884\u8b66\u670d\u52a1\u6ee1\u610f\u5ea6\u9996\u6b21\u7a81\u780194\u5206\uff0c\u9884\u8b66\u53ca\u65f6\u6027\u8bc4\u4ef7\u9996\u780192\u5206',
  '\uD83D\uDCF1 \u5929\u6c14APP\u5df2\u6210\u4e3a78%\u516c\u4f17\u9996\u9009\u6c14\u8c61\u670d\u52a1\u6e20\u9053\uff0c\u79fb\u52a8\u7aef\u9700\u6c42\u6301\u7eed\u589e\u957f',
  '\uD83C\uDF3E \u519c\u4e1a\u4ece\u4e1a\u8005\u5bf9\u7cbe\u7ec6\u5316\u6c14\u8c61\u9884\u62a5\u9700\u6c42\u6700\u4e3a\u8feb\u5207\uff0c\u5efa\u8bae\u52a0\u5f3a\u519c\u4e1a\u4e13\u9879\u670d\u52a1',
  '\uD83D\uDD14 \u516c\u4f17\u5bf9\u9884\u8b66\u4fe1\u606f\u8986\u76d6\u8303\u56f4\u6ee1\u610f\u5ea6\u63d0\u5347\uff0c\u4f46\u897f\u5317\u3001\u4e1c\u5317\u5730\u533a\u4ecd\u6709\u6539\u5584\u7a7a\u95f4'
];

var _customState = {
  animationFrame: 0,
  totalFeedbacks: 2847,
  currentTime: ''
};

var _clockTimer = null;
var _animTimer = null;

export function getCustomState() {
  return _customState;
}

export function setCustomState(newState) {
  Object.keys(newState).forEach(function(k) { _customState[k] = newState[k]; });
  this.forceUpdate();
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
  var isMobile = self.utils.isMobile();
  var frame = _customState.animationFrame;
  var formUrl = BASE_URL + '/' + APP_TYPE + '/submission/' + FORM_UUID + '?isRenderNav=false';

  // donut builder (pure function, no this)
  function buildDonut(data, title, accent) {
    var sz = 130; var cx = sz / 2; var cy = sz / 2;
    var outerR = sz / 2 - 14; var innerR = outerR * 0.6;
    var total = 0; var i;
    for (i = 0; i < data.length; i++) { total += data[i].value; }
    var angle = -Math.PI / 2; var slices = [];
    for (i = 0; i < data.length; i++) {
      var sweep = (data[i].value / total) * 2 * Math.PI;
      var sa = angle; var ea = angle + sweep; angle = ea;
      var x1 = cx + outerR * Math.cos(sa); var y1 = cy + outerR * Math.sin(sa);
      var x2 = cx + outerR * Math.cos(ea); var y2 = cy + outerR * Math.sin(ea);
      var ix1 = cx + innerR * Math.cos(ea); var iy1 = cy + innerR * Math.sin(ea);
      var ix2 = cx + innerR * Math.cos(sa); var iy2 = cy + innerR * Math.sin(sa);
      var large = sweep > Math.PI ? 1 : 0;
      slices.push({ d: 'M' + x1.toFixed(2) + ',' + y1.toFixed(2) + ' A' + outerR + ',' + outerR + ' 0 ' + large + ' 1 ' + x2.toFixed(2) + ',' + y2.toFixed(2) + ' L' + ix1.toFixed(2) + ',' + iy1.toFixed(2) + ' A' + innerR + ',' + innerR + ' 0 ' + large + ' 0 ' + ix2.toFixed(2) + ',' + iy2.toFixed(2) + ' Z', color: data[i].color });
    }
    var positivePercent = data[0].value + data[1].value;
    return (
      <div style={{ background: 'linear-gradient(135deg, rgba(13,33,55,0.9), rgba(10,22,40,0.95))', border: '1px solid rgba(0,229,255,0.18)', borderRadius: '10px', padding: '14px' }}>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: accent, boxShadow: '0 0 6px ' + accent }}></div>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width={sz} height={sz} style={{ flexShrink: 0 }}>
            {slices.map(function(s, idx) { return <path key={idx} d={s.d} fill={s.color} style={{ filter: 'drop-shadow(0 0 3px ' + s.color + '50)' }} />; })}
            <text x={cx} y={cy - 5} fill="rgba(255,255,255,0.9)" fontSize="17" fontWeight="800" textAnchor="middle">{positivePercent}%</text>
            <text x={cx} y={cy + 11} fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">{'\u6b63\u5411\u8bc4\u4ef7'}</text>
          </svg>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {data.map(function(item, idx) {
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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

  // line chart data
  var cW = isMobile ? 300 : 360; var cH = 130;
  var pL = 38; var pR = 16; var pT = 14; var pB = 28;
  var iW = cW - pL - pR; var iH = cH - pT - pB;
  var minS = 90; var maxS = 93;
  var trendPts = SATISFACTION_TREND.map(function(item, idx) {
    return { x: pL + (idx / (SATISFACTION_TREND.length - 1)) * iW, y: pT + (1 - (item.score - minS) / (maxS - minS)) * iH, score: item.score, year: item.year };
  });
  var linePath = trendPts.map(function(p, idx) { return (idx === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ');
  var areaPath = linePath + ' L' + trendPts[trendPts.length - 1].x.toFixed(1) + ',' + (cH - pB) + ' L' + trendPts[0].x.toFixed(1) + ',' + (cH - pB) + ' Z';

  // channel max
  var maxCh = 0; var ci;
  for (ci = 0; ci < CHANNELS.length; ci++) { if (CHANNELS[ci].value > maxCh) maxCh = CHANNELS[ci].value; }

  // insight
  var currentInsight = INSIGHTS[Math.floor(frame / 20) % INSIGHTS.length];

  return (
    <div style={{ background: '#060e1a', minHeight: '100vh', fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif', color: '#fff' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)', borderBottom: '1px solid rgba(0,229,255,0.3)', padding: isMobile ? '12px 16px' : '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #00E5FF, #0089FF)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 0 16px rgba(0,229,255,0.5)' }}>{'\uD83C\uDF24'}</div>
          <div>
            <div style={{ color: '#fff', fontSize: isMobile ? '14px' : '20px', fontWeight: '700', letterSpacing: '2px', textShadow: '0 0 16px rgba(0,229,255,0.8)' }}>{'\u6c14\u8c61\u670d\u52a1\u516c\u4f17\u53cd\u9988\u4e0e\u8206\u60c5\u6d1e\u5bdf\u5e73\u53f0'}</div>
            <div style={{ color: 'rgba(0,229,255,0.65)', fontSize: '10px', letterSpacing: '2px', marginTop: '2px' }}>NATIONAL METEOROLOGICAL SERVICE · PUBLIC FEEDBACK INTELLIGENCE</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{ color: '#00E5FF', fontSize: '12px', fontFamily: 'monospace', letterSpacing: '1px' }}>{_customState.currentTime}</div>
          <div style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.35)', borderRadius: '20px', padding: '2px 10px', color: '#00E5FF', fontSize: '10px' }}>{'\u6570\u636e\u5b9e\u65f6\u66f4\u65b0 \u00b7 \u5341\u56db\u4e94\u6210\u679c\u5c55\u793a'}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #00E5FF, #69F0AE, #00E5FF, transparent)' }}></div>
      </div>

      <div style={{ padding: isMobile ? '10px' : '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Insight banner */}
        <div style={{ background: 'linear-gradient(90deg, rgba(0,229,255,0.07), rgba(105,240,174,0.07))', border: '1px solid rgba(0,229,255,0.18)', borderRadius: '8px', padding: '9px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ color: '#00E5FF', fontSize: '10px', fontWeight: '700', letterSpacing: '2px', background: 'rgba(0,229,255,0.13)', padding: '2px 8px', borderRadius: '4px', flexShrink: 0 }}>{'\u6d1e\u5bdf\u64ad\u62a5'}</div>
          <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '12px' }}>{currentInsight}</div>
        </div>

        {/* Metrics */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
          {METRICS.map(function(m, idx) {
            var pulse = 0.5 + 0.5 * Math.sin((frame / 100) * 2 * Math.PI + idx * 1.5);
            return (
              <div key={idx} style={{ background: 'linear-gradient(135deg, rgba(13,33,55,0.9), rgba(10,22,40,0.95))', border: '1px solid ' + m.color + '38', borderRadius: '10px', padding: '16px', flex: '1', position: 'relative', overflow: 'hidden', minWidth: isMobile ? 'calc(50% - 5px)' : 'auto' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{m.icon}</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', letterSpacing: '1px', marginBottom: '4px' }}>{m.label}</div>
                <div>
                  <span style={{ color: m.color, fontSize: '28px', fontWeight: '800', textShadow: '0 0 16px ' + m.color + '70' }}>{m.value}</span>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginLeft: '3px' }}>{m.unit}</span>
                </div>
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#69F0AE', opacity: pulse }}></div>
                  <span style={{ color: '#69F0AE', fontSize: '10px' }}>{m.trend}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Three column charts */}
        <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          {/* Trend chart */}
          <div style={{ background: 'linear-gradient(135deg, rgba(13,33,55,0.9), rgba(10,22,40,0.95))', border: '1px solid rgba(0,229,255,0.18)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 6px #00E5FF' }}></div>
              {'\u516c\u4f17\u6ee1\u610f\u5ea6\u4e94\u5e74\u8d8b\u52bf\uff08\u201c\u5341\u56db\u4e94\u201d\uff09'}
            </div>
            <svg width={cW} height={cH} style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {[0, 0.25, 0.5, 0.75, 1].map(function(r, idx) {
                var y = pT + r * iH;
                return (
                  <g key={idx}>
                    <line x1={pL} y1={y} x2={cW - pR} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <text x={pL - 4} y={y + 4} fill="rgba(255,255,255,0.38)" fontSize="9" textAnchor="end">{(maxS - r * (maxS - minS)).toFixed(1)}</text>
                  </g>
                );
              })}
              <path d={areaPath} fill="url(#ag)" />
              <path d={linePath} fill="none" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 5px #00E5FF)' }} />
              {trendPts.map(function(p, idx) {
                return (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="5" fill="#0a1628" stroke="#00E5FF" strokeWidth="2" />
                    <circle cx={p.x} cy={p.y} r="2" fill="#00E5FF" />
                    <text x={p.x} y={p.y - 9} fill="#00E5FF" fontSize="10" textAnchor="middle" fontWeight="600">{p.score}</text>
                    <text x={p.x} y={cH - pB + 13} fill="rgba(255,255,255,0.45)" fontSize="9" textAnchor="middle">{p.year}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          {buildDonut(WARNING_TIMELINESS, '\u9884\u8b66\u4fe1\u606f\u53ca\u65f6\u6027\u8bc4\u4ef7', '#69F0AE')}
          {buildDonut(ACCURACY, '\u6c14\u8c61\u9884\u62a5\u51c6\u786e\u6027\u8bc4\u4ef7', '#00B0FF')}
        </div>

        {/* Two column bottom */}
        <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Channel bar chart */}
          <div style={{ background: 'linear-gradient(135deg, rgba(13,33,55,0.9), rgba(10,22,40,0.95))', border: '1px solid rgba(0,229,255,0.18)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 6px #00E5FF' }}></div>
              {'\u516c\u4f17\u5e38\u7528\u6c14\u8c61\u670d\u52a1\u6e20\u9053 TOP7'}
            </div>
            {CHANNELS.map(function(ch, idx) {
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '7px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', width: '68px', flexShrink: 0, textAlign: 'right' }}>{ch.label}</div>
                  <div style={{ flex: 1, height: '9px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: (ch.value / maxCh * 100).toFixed(1) + '%', height: '100%', background: 'linear-gradient(90deg, #00E5FF60, #00E5FF)', borderRadius: '5px' }}></div>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '10px', width: '28px', textAlign: 'right' }}>{ch.value}%</div>
                </div>
              );
            })}
          </div>

          {/* Right: feedback + regions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Feedback entry */}
            <div style={{ background: 'linear-gradient(135deg, rgba(13,33,55,0.9), rgba(10,22,40,0.95))', border: '1px solid rgba(105,240,174,0.25)', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#69F0AE', boxShadow: '0 0 6px #69F0AE' }}></div>
                {'\u53c2\u4e0e\u6ee1\u610f\u5ea6\u8c03\u67e5'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: '11px', textAlign: 'center', lineHeight: '1.6' }}>
                {'\u60a8\u7684\u6bcf\u4e00\u6761\u53cd\u9988\u90fd\u5c06\u63a8\u52a8\u6c14\u8c61\u670d\u52a1\u6301\u7eed\u6539\u8fdb'}
              </div>
              <button
                style={{ background: 'linear-gradient(135deg, #00B853, #00E5FF)', border: 'none', borderRadius: '22px', padding: '9px 24px', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', letterSpacing: '1px', boxShadow: '0 4px 16px rgba(0,229,255,0.35)' }}
                onClick={function() { self.utils.openPage({ pageUrl: formUrl, openMode: 'blank' }); }}
              >
                {'\u7acb\u5373\u53c2\u4e0e\u53cd\u9988'}
              </button>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '10px' }}>
                {'\u5df2\u6709 '}<span style={{ color: '#69F0AE', fontWeight: '700' }}>{_customState.totalFeedbacks.toLocaleString()}</span>{' \u4eba\u53c2\u4e0e'}
              </div>
            </div>

            {/* Region distribution */}
            <div style={{ background: 'linear-gradient(135deg, rgba(13,33,55,0.9), rgba(10,22,40,0.95))', border: '1px solid rgba(0,229,255,0.18)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#B388FF', boxShadow: '0 0 6px #B388FF' }}></div>
                {'\u5404\u5730\u533a\u53cd\u9988\u5360\u6bd4\u5206\u5e03'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '7px' }}>
                {REGIONS.map(function(r, idx) {
                  return (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '7px', padding: '8px 6px', textAlign: 'center' }}>
                      <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '10px', marginBottom: '3px' }}>{r.label}</div>
                      <div style={{ color: '#B388FF', fontSize: '17px', fontWeight: '800' }}>{r.value}</div>
                      <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '9px' }}>%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Word cloud */}
        <div style={{ background: 'linear-gradient(135deg, rgba(13,33,55,0.9), rgba(10,22,40,0.95))', border: '1px solid rgba(0,229,255,0.18)', borderRadius: '10px', padding: '14px' }}>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FFD740', boxShadow: '0 0 6px #FFD740' }}></div>
            {'\u516c\u4f17\u8206\u60c5\u70ed\u8bcd\u4e91\uff08\u8fd130\u5929\uff09'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'center', minHeight: '90px' }}>
            {HOT_WORDS.map(function(w, idx) {
              var fs = Math.round(10 + (w.weight / 95) * 13);
              return (
                <span key={idx} style={{ color: w.color, fontSize: fs + 'px', fontWeight: w.weight > 70 ? '700' : '500', opacity: 0.55 + (w.weight / 95) * 0.45, textShadow: '0 0 ' + Math.round(w.weight / 12) + 'px ' + w.color + '70', cursor: 'default', padding: '2px 3px' }}>
                  {w.text}
                </span>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
'''

target = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'weather-dashboard.js')
with open(target, 'w', encoding='utf-8') as f:
    f.write(content)
print('OK: wrote ' + str(len(content)) + ' bytes to ' + target)
