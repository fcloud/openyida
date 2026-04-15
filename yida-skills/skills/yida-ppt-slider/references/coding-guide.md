# yida-ppt-slider 代码参考

本文档包含 PPT 幻灯片开发中的完整代码示例，按功能模块组织。

## 1. 生命周期方法 {#1}

在 `componentDidMount` 中注册事件监听，在 `componentWillUnmount` 中清理：

```javascript
componentDidMount: function() {
  _customState.total = SLIDES.length;

  // 键盘翻页（支持演讲笔 PageDown/PageUp）
  this._handleKeyDown = function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
      this.handleNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      this.handlePrev();
    }
  }.bind(this);
  document.addEventListener('keydown', this._handleKeyDown);

  // 触摸滑动（移动端）
  this._touchStartX = 0;
  this._handleTouchStart = function(e) {
    this._touchStartX = e.changedTouches[0].screenX;
  }.bind(this);
  this._handleTouchEnd = function(e) {
    var touchEndX = e.changedTouches[0].screenX;
    if (this._touchStartX - touchEndX > 50) this.handleNext();
    if (touchEndX - this._touchStartX > 50) this.handlePrev();
  }.bind(this);
  document.addEventListener('touchstart', this._handleTouchStart);
  document.addEventListener('touchend', this._handleTouchEnd);
},

componentWillUnmount: function() {
  document.removeEventListener('keydown', this._handleKeyDown);
  document.removeEventListener('touchstart', this._handleTouchStart);
  document.removeEventListener('touchend', this._handleTouchEnd);
}
```

## 2. 状态管理规范 {#2}

```javascript
// ✅ 正确：直接修改 _customState，然后调用 forceUpdate()
handleNext: function() {
  if (_customState.currentIndex < SLIDES.length - 1) {
    _customState.currentIndex++;
    this.forceUpdate();
  }
},
handlePrev: function() {
  if (_customState.currentIndex > 0) {
    _customState.currentIndex--;
    this.forceUpdate();
  }
},
handleGoTo: function(index) {
  _customState.currentIndex = index;
  this.forceUpdate();
}

// ❌ 错误：不要通过 setState 来间接更新业务状态
// this.setState({ currentIndex: index });  // 不要这样做
```

## 3. 分页导航 {#3}

在 `renderJsx` 顶部定义事件处理函数，避免每次渲染创建新函数：

```javascript
var handleDotClick = function(idx) {
  return function() { this.handleGoTo(idx); }.bind(this);
}.bind(this);

// 精简分页点（最多显示5个）
var dots = [];
var maxVisible = 5;
var dotStart = Math.max(0, Math.min(state.currentIndex - Math.floor(maxVisible / 2), total - maxVisible));
var dotEnd = Math.min(total, dotStart + maxVisible);

for (var i = dotStart; i < dotEnd; i++) {
  var isActive = i === state.currentIndex;
  dots.push(
    <div
      key={i}
      style={{
        width: isActive ? '24px' : '7px',
        height: '7px',
        borderRadius: '4px',
        background: isActive ? accent : 'rgba(26,26,46,0.2)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onClick={handleDotClick(i)}
    />
  );
}
```

## 4. 多端适配 {#4}

```javascript
// ✅ 使用 this.utils.isMobile() 判断设备类型
var isMobile = this.utils.isMobile();

var styles = {
  container: {
    padding: isMobile ? '20px 16px' : '48px 80px',
    minHeight: '100vh',
  },
  title: {
    fontSize: isMobile ? '24px' : '38px',
    fontWeight: '800',
    color: '#1a1a2e',
  },
  image: {
    maxWidth: '100%',
    maxHeight: isMobile ? '200px' : '400px',
    objectFit: 'contain',  // 确保图片完整显示
  },
};
```

## 5. 清除宜搭默认样式 {#5}

宜搭自定义页面容器有默认 padding 和圆角，需要强制覆盖：

```javascript
var styles = {
  wrapper: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    padding: '0 !important',
    borderRadius: '0 !important',
    margin: '0 !important',
    overflow: 'hidden',
    background: slide.bg,
  },
};
```

## 6. 数字键快速跳页 {#6}

使用 300ms 延迟缓冲区分单位数和双位数输入（如连按 `1` `2` 跳到第 12 页）：

```javascript
// ── 在 _customState 中新增数字键缓冲字段 ──
var _customState = {
  currentIndex: 0,
  total: 0,
  numBuffer: '',        // 数字键输入缓冲
  numTimer: null,       // 延迟定时器
};

// ── 在 didMount 的 _handleKeyDown 中新增数字键处理 ──
var digit = null;
if (e.key >= '0' && e.key <= '9') {
  digit = e.key;
} else if (e.code && e.code.indexOf('Numpad') === 0 && e.key >= '0' && e.key <= '9') {
  digit = e.key;
}

if (digit !== null) {
  if (_customState.numTimer) {
    clearTimeout(_customState.numTimer);
  }
  _customState.numBuffer += digit;

  _customState.numTimer = setTimeout(function() {
    var targetPage = parseInt(_customState.numBuffer, 10);
    var targetIndex = targetPage - 1;  // 页码从1开始，索引从0开始
    if (targetIndex >= 0 && targetIndex < SLIDES.length) {
      _customState.currentIndex = targetIndex;
      self.forceUpdate();
    }
    _customState.numBuffer = '';
    _customState.numTimer = null;
  }, 300);
  return;
}
```

## 7. 隐藏宜搭平台导航 {#7}

发布后执行命令隐藏宜搭顶部导航栏：

```bash
openyida update-form-config <appType> <formUuid> false "<页面标题>"
```

PPT 内部翻页导航栏默认隐藏，鼠标移到底部区域时自动显示：

```javascript
// ── 在 _customState 中新增导航可见性字段 ──
var _customState = {
  currentIndex: 0,
  navVisible: false,    // 翻页导航栏默认隐藏
};

// ── 在 didMount 中注册鼠标移动事件 ──
this._handleMouseMove = function(e) {
  var isNearBottom = e.clientY > window.innerHeight - 80;
  if (isNearBottom !== _customState.navVisible) {
    _customState.navVisible = isNearBottom;
    self.forceUpdate();
  }
};
document.addEventListener('mousemove', this._handleMouseMove);

// ── 在 didUnmount 中清理 ──
document.removeEventListener('mousemove', this._handleMouseMove);

// ── 在 renderJsx 中根据 navVisible 控制翻页导航栏显隐 ──
var navStyle = {
  position: 'absolute',
  bottom: 0, left: 0, right: 0,
  padding: '16px 0',
  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px',
  background: 'linear-gradient(transparent, rgba(0,0,0,0.05))',
  opacity: state.navVisible ? 1 : 0,
  transform: state.navVisible ? 'translateY(0)' : 'translateY(10px)',
  transition: 'opacity 0.3s ease, transform 0.3s ease',
  pointerEvents: state.navVisible ? 'auto' : 'none',
};
```

## 8. 全屏按钮 {#8}

使用浏览器 Fullscreen API 实现一键进入/退出全屏：

```javascript
// ── 在 _customState 中新增全屏状态字段 ──
var _customState = {
  currentIndex: 0,
  isFullscreen: false,
};

// ── 在 didMount 中监听全屏状态变化 ──
this._handleFullscreenChange = function() {
  _customState.isFullscreen = !!document.fullscreenElement;
  self.forceUpdate();
};
document.addEventListener('fullscreenchange', this._handleFullscreenChange);

// ── 在 didUnmount 中清理 ──
document.removeEventListener('fullscreenchange', this._handleFullscreenChange);

// ── 在 renderJsx 中定义全屏切换函数 ──
var handleToggleFullscreen = function() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(function() {});
  } else {
    document.exitFullscreen().catch(function() {});
  }
};

// ── 全屏按钮 JSX（放在页面右上角）──
<div
  onClick={function() { handleToggleFullscreen(); }}
  style={{
    position: 'absolute', top: '16px', right: '16px',
    width: '36px', height: '36px', borderRadius: '8px',
    background: 'rgba(26,26,46,0.06)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', zIndex: 100, transition: 'background 0.2s',
  }}
  title={state.isFullscreen ? '退出全屏' : '全屏'}
>
  <span style={{ fontSize: '16px' }}>
    {state.isFullscreen ? '⊡' : '⛶'}
  </span>
</div>
```

> 部分浏览器限制 Fullscreen API 必须由用户手势触发，确保在 `onClick` 中调用。

## 9. 中英文切换 {#9}

PPT 内置 UI 文案支持中英文双语切换：

```javascript
// ── 国际化文案定义 ──
var I18N = {
  zh: {
    prev: '← 上一页',
    next: '下一页 →',
    pageOf: function(current, total) { return current + ' / ' + total; },
    fullscreen: '全屏',
    exitFullscreen: '退出全屏',
    langSwitch: 'EN',
  },
  en: {
    prev: '← Prev',
    next: 'Next →',
    pageOf: function(current, total) { return current + ' / ' + total; },
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    langSwitch: '中',
  },
};

// ── 在 _customState 中新增语言字段 ──
var _customState = {
  currentIndex: 0,
  lang: 'zh',  // 默认中文，可选 'en'
};

// ── 在 renderJsx 中使用 ──
var lang = I18N[state.lang] || I18N.zh;

var handleLangSwitch = function() {
  state.lang = state.lang === 'zh' ? 'en' : 'zh';
  self.forceUpdate();
};

// 语言切换按钮 JSX（放在全屏按钮左侧）
<div
  onClick={function() { handleLangSwitch(); }}
  style={{
    position: 'absolute', top: '16px', right: '60px',
    height: '36px', padding: '0 12px', borderRadius: '8px',
    background: 'rgba(26,26,46,0.06)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#1a1a2e',
    zIndex: 100,
  }}
>
  {lang.langSwitch}
</div>

// 导航按钮使用 lang 对象
<button ...>{lang.prev}</button>
<span ...>{lang.pageOf(state.currentIndex + 1, SLIDES.length)}</span>
<button ...>{lang.next}</button>
```

> 如果幻灯片内容也需要中英文，可在 `SLIDES` 中为每个 slide 提供 `title_en`、`subtitle_en` 等字段，在 `renderSlideContent` 中根据 `state.lang` 选择对应文案。

## 10. 深色/浅色模式切换 {#10}

右上角工具栏提供主题切换按钮：

```javascript
// ── 在 _customState 中新增主题模式字段 ──
var _customState = {
  currentIndex: 0,
  lang: 'zh',
  themeMode: 'light',  // 'light' 或 'dark'
};

// ── 主题配置（深色/浅色配色方案）──
var THEME_CONFIG = {
  light: {
    bg: '#ffffff',
    text: '#1a1a2e',
    textSecondary: 'rgba(26,26,46,0.7)',
    border: 'rgba(26,26,46,0.08)',
    toolbarBg: 'rgba(26,26,46,0.06)',
    navBg: 'linear-gradient(transparent, rgba(0,0,0,0.05))',
  },
  dark: {
    bg: '#1a1a2e',
    text: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.7)',
    border: 'rgba(255,255,255,0.1)',
    toolbarBg: 'rgba(255,255,255,0.1)',
    navBg: 'linear-gradient(transparent, rgba(255,255,255,0.05))',
  },
};

// ── 在 renderJsx 中 ──
var handleThemeToggle = function() {
  state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
  self.forceUpdate();
};
var theme = THEME_CONFIG[state.themeMode] || THEME_CONFIG.light;

// ── 主题切换按钮 JSX ──
<div
  onClick={function() { handleThemeToggle(); }}
  style={{
    position: 'absolute', top: '16px', right: '104px',
    width: '36px', height: '36px', borderRadius: '8px',
    background: theme.toolbarBg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: '18px', zIndex: 100,
    transition: 'background 0.2s',
  }}
  title={state.themeMode === 'light' ? '切换深色模式' : '切换浅色模式'}
>
  {state.themeMode === 'light' ? '🌙' : '☀️'}
</div>

// ── 使用主题配置设置样式 ──
<div style={{
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: theme.bg, color: theme.text,
}}>
  <h1 style={{ color: theme.text }}>{slide.title}</h1>
  <p style={{ color: theme.textSecondary }}>{slide.subtitle}</p>
</div>
```

**要点**：所有颜色值从 `theme` 对象动态获取，右上角工具栏从左到右：主题切换 → 语言切换 → 全屏按钮。

## 11. URL hash 定位 {#11}

支持 URL hash 定位，实现页面加载时自动跳转、翻页时同步更新 URL、浏览器前进后退：

```javascript
// ── 在 didMount 中初始化 hash 定位 ──
this._handleHashChange = function() {
  var hash = window.location.hash;
  if (hash && hash.startsWith('#')) {
    var pageNum = parseInt(hash.substring(1), 10);
    var targetIndex = pageNum - 1;  // 页码从1开始，索引从0开始
    if (targetIndex >= 0 && targetIndex < SLIDES.length) {
      _customState.currentIndex = targetIndex;
      self.forceUpdate();
    }
  }
};
this._handleHashChange();  // 初始加载时检查
window.addEventListener('hashchange', this._handleHashChange);

// ── 在 didUnmount 中清理 ──
window.removeEventListener('hashchange', this._handleHashChange);

// ── 在翻页函数中同步更新 URL hash ──
var handlePrev = function() {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    window.location.hash = state.currentIndex + 1;
    self.forceUpdate();
  }
};
var handleNext = function() {
  if (state.currentIndex < SLIDES.length - 1) {
    state.currentIndex++;
    window.location.hash = state.currentIndex + 1;
    self.forceUpdate();
  }
};
var handleGoTo = function(index) {
  state.currentIndex = index;
  window.location.hash = index + 1;
  self.forceUpdate();
};
```

**要点**：URL hash 格式 `#页码`（如 `#3`），页码从1开始。`hashchange` 事件监听浏览器前进后退，无效 hash 被忽略。

## 12. ECharts Bar Chart Race 动态柱状图 {#12}

PPT 支持集成 ECharts 动态柱状图，展示中国历代经济排名变化：

```javascript
// ── 在 SLIDES 数组中新增 echarts-race 类型幻灯片 ──
{
  type: 'echarts-race',
  bg: '#ffffff',
  accent: '#d97706',
  title: '中国历代经济排名变化',
  subtitle: '公元前 2000 年 - 公元 2025 年',
}

// ── ECharts 数据（8 个实体 + 中国朝代名动态切换）──
var RACE_DATA = {
  entities: [
    { name: '中国', color: '#ff4444' },
    { name: '印度', color: '#3b82f6' },
    { name: '欧洲', color: '#10b981' },
    { name: '中东', color: '#f59e0b' },
    { name: '美国', color: '#8b5cf6' },
    { name: '日本', color: '#ec4899' },
    { name: '俄罗斯', color: '#6366f1' },
    { name: '其他', color: '#9ca3af' },
  ],
  chinaNames: {
    '-2000': '华夏', '-770': '春秋列国', '-221': '大秦',
    '-206': '大汉', '581': '大隋', '618': '大唐',
    '960': '北宋', '1127': '南宋', '1368': '大明',
    '1644': '大清', '1912': '中华民国', '1949': '新中国', '2025': '中国',
  },
  timeline: [
    { year: -2000, values: [120, 80, 40, 30, 10, 5, 5, 20] },
    { year: -770, values: [150, 90, 50, 40, 10, 8, 8, 25] },
    { year: -221, values: [200, 100, 60, 50, 15, 10, 10, 30] },
    { year: -206, values: [300, 120, 80, 60, 20, 15, 15, 40] },
    { year: 581, values: [400, 150, 100, 80, 30, 20, 20, 50] },
    { year: 618, values: [500, 180, 120, 100, 40, 25, 25, 60] },
    { year: 960, values: [600, 200, 150, 120, 50, 30, 30, 70] },
    { year: 1127, values: [550, 220, 180, 140, 60, 35, 35, 80] },
    { year: 1368, values: [700, 250, 200, 160, 80, 40, 40, 90] },
    { year: 1644, values: [800, 280, 250, 180, 100, 50, 50, 100] },
    { year: 1912, values: [600, 300, 300, 200, 150, 60, 60, 120] },
    { year: 1949, values: [500, 320, 350, 220, 200, 80, 80, 150] },
    { year: 2025, values: [18000, 3500, 20000, 3000, 25000, 4000, 1800, 5000] },
  ],
};

// ── 在 renderSlideContent 中处理 echarts-race 类型 ──
if (slide.type === 'echarts-race') {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: isMobile ? '20px' : '28px', color: '#1a1a2e', margin: 0 }}>
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p style={{ fontSize: isMobile ? '14px' : '18px', color: 'rgba(26,26,46,0.7)', marginTop: '8px' }}>
            {slide.subtitle}
          </p>
        )}
      </div>
      <div id="echarts-race-container" style={{ flex: 1, width: '100%', minHeight: '400px', position: 'relative' }} />
      <script
        src="https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js"
        onLoad={function() { self.initBarChartRace(); }}
      />
    </div>
  );
}

// ── 初始化 Bar Chart Race ──
export function initBarChartRace() {
  var self = this;
  var container = document.getElementById('echarts-race-container');
  if (!container) return;

  var chart = echarts.init(container);
  var entities = RACE_DATA.entities;
  var timeline = RACE_DATA.timeline;
  var chinaNames = RACE_DATA.chinaNames;
  var currentIndex = 0;
  var timer = null;

  // 线性插值
  var lerp = function(start, end, t) { return start + (end - start) * t; };

  // 生成插值帧（每年20帧，每帧50ms）
  var framesPerYear = 20;
  var allFrames = [];
  for (var i = 0; i < timeline.length - 1; i++) {
    var cur = timeline[i], next = timeline[i + 1];
    var yearDiff = next.year - cur.year;
    var totalFrames = yearDiff * framesPerYear;
    for (var f = 0; f < totalFrames; f++) {
      var t = f / totalFrames;
      var frameValues = [];
      for (var j = 0; j < 8; j++) {
        frameValues.push(lerp(cur.values[j], next.values[j], t));
      }
      allFrames.push({ year: Math.round(cur.year + yearDiff * t), values: frameValues });
    }
  }
  allFrames.push({ year: timeline[timeline.length - 1].year, values: timeline[timeline.length - 1].values });

  // 获取中国朝代名
  var getChinaName = function(year) {
    var names = [];
    for (var key in chinaNames) {
      if (year >= parseInt(key, 10)) names.push({ year: parseInt(key, 10), name: chinaNames[key] });
    }
    return names.length > 0 ? names[names.length - 1].name : '中国';
  };

  // 更新图表
  var updateChart = function() {
    var frame = allFrames[currentIndex];
    var data = entities.map(function(entity, idx) {
      return {
        name: entity.name === '中国' ? getChinaName(frame.year) : entity.name,
        value: frame.values[idx],
        itemStyle: { color: entity.color },
      };
    }).sort(function(a, b) { return b.value - a.value; });

    chart.setOption({
      grid: { top: '10%', right: '15%', bottom: '15%', left: '15%' },
      xAxis: { show: false },
      yAxis: { type: 'category', data: data.map(function(d) { return d.name; }), axisLabel: { fontSize: 14 } },
      series: [{
        type: 'bar', data: data.map(function(d) { return d.value; }),
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right', formatter: function(p) { return p.value.toLocaleString(); } },
        barWidth: '60%',
      }],
      graphic: [
        { type: 'text', right: '5%', bottom: '10%', style: {
          text: frame.year < 0 ? Math.abs(frame.year) + ' BC' : frame.year + ' AD',
          fontSize: 48, fontWeight: 'bold', fill: 'rgba(26,26,46,0.1)',
        }},
        currentIndex === allFrames.length - 1 ? {
          type: 'text', left: 'center', top: 'center',
          style: { text: '🔄 重播', fontSize: 24, fill: '#d97706', cursor: 'pointer' },
          onclick: function() { currentIndex = 0; play(); },
        } : null,
      ].filter(Boolean),
    });
  };

  // 播放动画
  var play = function() {
    if (timer) clearInterval(timer);
    timer = setInterval(function() {
      if (currentIndex < allFrames.length - 1) { currentIndex++; updateChart(); }
      else { clearInterval(timer); }
    }, 50);
  };

  updateChart();
  play();

  this._chartRaceCleanup = function() {
    if (timer) clearInterval(timer);
    if (chart) chart.dispose();
  };
}

// ── 在 didUnmount 中清理 ──
if (this._chartRaceCleanup) { this._chartRaceCleanup(); }
```

**实现要点**：
- ECharts CDN：`https://g.alicdn.com/code/lib/echarts/5.6.0/echarts.min.js`
- 新增 slide 类型 `echarts-race`，含 `title` 和 `subtitle`
- 8 个实体，中国固定红色 `#ff4444`，朝代名随年份动态切换
- 逐帧线性插值实现平滑动画，每 50ms 更新一帧
- 右下角大字年份水印，播放完毕显示重播按钮
- 在 `didUnmount` 中清理定时器和 ECharts 实例

## 13. 隐藏调试工具 {#13}

宜搭平台会注入 `__lowcode_devtool_switch__` 调试工具，可通过内联 style 标签隐藏：

```javascript
<style>{`
  #__lowcode_devtool_switch__,
  [id="__lowcode_devtool_switch__"] {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
`}</style>
```

## 14. 样式规范 {#14}

### 白色主题配色

```javascript
bg: '#ffffff'                       // 主背景
color: '#1a1a2e'                    // 主文字
color: 'rgba(26,26,46,0.7)'        // 次要文字
border: '1px solid rgba(26,26,46,0.08)'  // 边框/分割线

// 推荐主题色
accent: '#d97706'  // 琥珀色（醒目）
accent: '#0089ff'  // 蓝色（科技）
accent: '#c084fc'  // 紫色（创新）
```

### 图片展示

```javascript
<img src={slide.imageUrl} style={{
  maxWidth: '100%', maxHeight: '100%',
  width: 'auto', height: 'auto',
  objectFit: 'contain',
  display: 'block'
}} />
```
