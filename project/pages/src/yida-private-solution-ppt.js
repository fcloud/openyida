import { Component } from 'react';

var _customState = {
  currentSlide: 1,
  totalSlides: 12,
  isFullscreen: false,
};

var CSS_ANIMATIONS = [
  '@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap");',
  '@keyframes cineZoom{0%{opacity:0;transform:scale(1.4);filter:blur(30px) brightness(1.8)}40%{opacity:.7;transform:scale(1.08);filter:blur(8px) brightness(1.2)}100%{opacity:1;transform:scale(1);filter:blur(0) brightness(1)}}',
  '@keyframes cineParallax{0%{opacity:0;transform:translateX(-80px) scale(1.05);filter:blur(12px)}100%{opacity:1;transform:translateX(0) scale(1);filter:blur(0)}}',
  '@keyframes cineRise{0%{opacity:0;transform:translateY(60px) scale(.97);filter:blur(10px)}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}',
  '@keyframes cineGlitch{0%{opacity:0;transform:skewX(-8deg) scale(1.1);filter:hue-rotate(90deg) blur(15px)}30%{opacity:.8;transform:skewX(4deg);filter:hue-rotate(0deg) blur(4px)}60%{transform:skewX(-2deg)}100%{opacity:1;transform:skewX(0) scale(1);filter:blur(0)}}',
  '@keyframes cineIris{0%{opacity:0;clip-path:circle(0% at 50% 50%);filter:blur(20px)}60%{clip-path:circle(60% at 50% 50%);filter:blur(4px)}100%{opacity:1;clip-path:circle(150% at 50% 50%);filter:blur(0)}}',
  '@keyframes cineGrand{0%{opacity:0;transform:scale(1.8);filter:blur(40px) brightness(2)}50%{opacity:.6;transform:scale(1.15);filter:blur(10px) brightness(1.3)}100%{opacity:1;transform:scale(1);filter:blur(0) brightness(1)}}',
  '@keyframes fadeIn{0%{opacity:0;transform:scale(.97)}100%{opacity:1;transform:scale(1)}}',
  '@keyframes titleCinematic{0%{opacity:0;transform:translateY(50px);filter:blur(10px);letter-spacing:12px}60%{letter-spacing:-1px}100%{opacity:1;transform:translateY(0);filter:blur(0);letter-spacing:-2px}}',
  '@keyframes subtitleCinematic{0%{opacity:0;transform:translateY(30px);filter:blur(8px)}100%{opacity:1;transform:translateY(0);filter:blur(0)}}',
  '@keyframes fu{0%{opacity:0;transform:translateY(30px)}100%{opacity:1;transform:translateY(0)}}',
  '@keyframes df{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}',
  '@keyframes gridMove{0%{background-position:0 0}100%{background-position:60px 60px}}',
  '@keyframes chapterGlow{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}',
  '@keyframes tagSlideIn{0%{opacity:0;transform:translateY(-25px) scale(.8);filter:blur(6px)}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}',
  '@keyframes pulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.8;transform:scale(1.08)}}',
  ':-webkit-full-screen{width:100vw!important;height:100vh!important}',
  ':fullscreen{width:100vw!important;height:100vh!important}'
].join('\n');

var slideTransitions = {
  1: 'cineZoom',
  2: 'cineGlitch',
  3: 'cineParallax',
  4: 'cineIris',
  5: 'cineRise',
  6: 'cineGrand',
  7: 'cineParallax',
  8: 'fadeIn',
  9: 'cineGlitch',
  10: 'cineRise',
  11: 'cineIris',
  12: 'cineGrand',
};

var chapterSlides = [2, 4, 6, 9, 11];

var chapterImages = {
  2: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1280&auto=format&fit=crop',
  4: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1280&auto=format&fit=crop',
  6: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1280&auto=format&fit=crop',
  9: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1280&auto=format&fit=crop',
  11: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1280&auto=format&fit=crop',
};

var S = {
  st: { fontSize: '68px', fontWeight: 900, color: '#fff', marginBottom: '28px', letterSpacing: '-2px', lineHeight: 1.15, textShadow: '0 0 40px rgba(59,130,246,.5)', animation: 'titleCinematic 1.4s cubic-bezier(.25,.46,.45,.94) both' },
  stSts: { fontSize: '48px', fontWeight: 900, color: '#fff', marginBottom: '24px', letterSpacing: '-1px', lineHeight: 1.2, textShadow: '0 0 30px rgba(59,130,246,.4)' },
  ss: { fontSize: '24px', fontWeight: 300, color: '#9ca3af', marginBottom: '40px', letterSpacing: '2px', animation: 'subtitleCinematic 1.2s ease .4s both' },
  tg: { display: 'inline-block', background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.3)', borderRadius: '20px', padding: '8px 24px', fontSize: '16px', color: '#60a5fa', marginBottom: '24px', letterSpacing: '2px', fontWeight: 500, animation: 'tagSlideIn .8s ease both' },
  gt: { background: 'linear-gradient(90deg,#3b82f6,#a855f7,#10b981,#3b82f6)', backgroundSize: '300% 300%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'df 6s ease infinite' },
  cd: { background: 'rgba(255,255,255,.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '16px', padding: '28px 32px', textAlign: 'left' },
  cdHl: { background: 'rgba(59,130,246,.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(59,130,246,.25)', borderRadius: '16px', padding: '28px 32px', textAlign: 'left' },
  ct: { fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '10px' },
  cx: { fontSize: '18px', color: '#9ca3af', lineHeight: 1.7 },
  hl: { color: '#3b82f6', fontWeight: 700 },
  hs: { color: '#10b981', fontWeight: 700 },
  hp: { color: '#a855f7', fontWeight: 700 },
  hw: { color: '#f59e0b', fontWeight: 700 },
  hr: { color: '#ec4899', fontWeight: 700 },
};

export function getCustomState(key) {
  if (key) return _customState[key];
  return Object.assign({}, _customState);
}

export function setCustomState(newState) {
  Object.keys(newState).forEach(function(key) { _customState[key] = newState[key]; });
  this.forceUpdate();
}

export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

export function initParticles() {
  var canvas = document.getElementById('ppt-particles');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var COUNT = 50;
  var DIST = 130;
  var colors = ['59,130,246', '147,51,234', '16,185,129'];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

  function init() {
    resize();
    particles = [];
    for (var i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        c: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.c + ',.6)';
      ctx.fill();
    }
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(59,130,246,' + (0.08 * (1 - d / DIST)).toFixed(3) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    _customState._animFrame = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', function() { resize(); init(); });
  document.addEventListener('fullscreenchange', function() { setTimeout(function() { resize(); init(); }, 50); });
  document.addEventListener('webkitfullscreenchange', function() { setTimeout(function() { resize(); init(); }, 50); });
  init();
  draw();
}

export function renderBgLayers(isChapter) {
  return (
    <div>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 20% 30%,rgba(59,130,246,.15) 0%,transparent 50%),' +
                    'radial-gradient(ellipse at 80% 70%,rgba(139,92,246,.12) 0%,transparent 50%),' +
                    'radial-gradient(ellipse at 50% 50%,rgba(11,15,25,.8) 0%,rgba(0,0,0,1) 100%)'
      }} />
      {isChapter && <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(59,130,246,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.03) 1px,transparent 1px)',
        backgroundSize: '60px 60px', animation: 'gridMove 20s linear infinite'
      }} />}
      {isChapter && <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none',
        background: 'radial-gradient(circle at 50% 50%,rgba(59,130,246,.08) 0%,transparent 70%)',
        animation: 'chapterGlow 6s ease-in-out infinite'
      }} />}
    </div>
  );
}

export function renderSlideWrapper(slideNum, content) {
  var cur = _customState.currentSlide;
  if (cur !== slideNum) return null;
  var isChapter = chapterSlides.indexOf(slideNum) >= 0;
  var tr = slideTransitions[slideNum] || 'fadeIn';
  var trStyle = { animation: tr + ' 1.2s cubic-bezier(.25,.46,.45,.94) both' };
  var bgImg = chapterImages[slideNum];
  return (
    <div style={Object.assign({
      width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center'
    }, trStyle)}>
      {this.renderBgLayers(isChapter)}
      {bgImg && <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: 'url(' + bgImg + ')', backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: isChapter ? 0.15 : 0.08, zIndex: 0
      }} />}
      <div style={{
        position: 'relative', zIndex: 10, margin: 'auto', padding: '36px 72px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        textAlign: 'center', width: '100%', height: '100%', boxSizing: 'border-box'
      }}>
        {content}
      </div>
    </div>
  );
}

// ===== 幻灯片 1：封面 =====
export function renderSlide1() {
  return this.renderSlideWrapper(1,
    <div style={{ textAlign: 'center' }}>
      <div style={S.tg}>阿里巴巴集团 · 钉钉低代码生态</div>
      <div style={S.st}>
        宜搭私有化
        <span style={S.gt}>解决方案</span>
      </div>
      <div style={S.ss}>安全合规 · 敏捷开发 · 自主可控</div>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', animation: 'fu 1s ease .8s both' }}>
        {['金融', '政务', '能源', '央国企', '制造业'].map(function(tag) {
          return (
            <div key={tag} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: '8px', padding: '8px 20px', fontSize: '16px', color: '#d1d5db' }}>
              {tag}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '48px', fontSize: '14px', color: 'rgba(255,255,255,.25)', letterSpacing: '3px', animation: 'fu 1s ease 1.2s both' }}>
        V2.0 · 对外版
      </div>
    </div>
  );
}

// ===== 幻灯片 2：章节页 - 产品定位 =====
export function renderSlide2() {
  return this.renderSlideWrapper(2,
    <div style={{ textAlign: 'center' }}>
      <div style={S.tg}>PART 01</div>
      <div style={S.stSts}>产品定位</div>
      <div style={{ fontSize: '20px', color: '#6b7280', letterSpacing: '4px' }}>PRODUCT POSITIONING</div>
    </div>
  );
}

// ===== 幻灯片 3：产品定位详情 =====
export function renderSlide3() {
  return this.renderSlideWrapper(3,
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      <div style={S.tg}>产品定位</div>
      <div style={Object.assign({}, S.stSts, { marginBottom: '32px' })}>
        低代码 × 私有化的<span style={S.gt}>数字化基座</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', animation: 'fu 1.2s ease .6s both' }}>
        <div style={S.cd}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
          <div style={S.ct}>安全合规</div>
          <div style={S.cx}>满足金融、政务、能源等关键行业对<span style={S.hl}>数据本地化</span>及<span style={S.hl}>信创合规</span>的严苛要求</div>
        </div>
        <div style={S.cd}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
          <div style={S.ct}>敏捷开发</div>
          <div style={S.cx}>低代码开发能力让业务团队<span style={S.hs}>自主搭建</span>应用，开发效率<span style={S.hs}>倍增</span></div>
        </div>
        <div style={S.cd}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏛️</div>
          <div style={S.ct}>自主可控</div>
          <div style={S.cx}>核心系统<span style={S.hp}>自主可控</span>，安全边界清晰，构建企业专属应用生态</div>
        </div>
      </div>
      <div style={{ marginTop: '24px', padding: '20px 28px', background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', borderRadius: '12px', fontSize: '18px', color: '#9ca3af', lineHeight: 1.7, animation: 'fu 1.2s ease 1s both', textAlign: 'left' }}>
        专为大型组织打造，深度融合<span style={S.hl}>低代码开发能力</span>与<span style={S.hl}>私有化安全体系</span>，助力企业构建安全边界清晰、开发效率倍增的专属应用生态
      </div>
    </div>
  );
}

// ===== 幻灯片 4：章节页 - 客户画像 =====
export function renderSlide4() {
  return this.renderSlideWrapper(4,
    <div style={{ textAlign: 'center' }}>
      <div style={S.tg}>PART 02</div>
      <div style={S.stSts}>客户画像 & 落地案例</div>
      <div style={{ fontSize: '20px', color: '#6b7280', letterSpacing: '4px' }}>CUSTOMER PROFILES</div>
    </div>
  );
}

// ===== 幻灯片 5：三类核心客户 =====
export function renderSlide5() {
  var customers = [
    {
      icon: '🏛️',
      type: '央国企',
      cases: '政务 · 烟草',
      color: '#3b82f6',
      colorRgb: '59,130,246',
      scene: '业务数字化转型',
      points: ['响应国家级发文，全员业务数字化创新', '烟草三大专线数据属国家级保密，不允许出网', '已有系统私有化部署，要求内网互联互通'],
    },
    {
      icon: '🏭',
      type: '企业类',
      cases: '新能源 · 制造业',
      color: '#10b981',
      colorRgb: '16,185,129',
      scene: '保密级生产资料 + AI私有化',
      points: ['保密级生产资料是核心竞争力，需私有化+信创保障', 'AI高采纳率，私有化AI模型对接私有化业务数据', '私有化AI应用搭建，是客户AI创新最佳范式'],
    },
    {
      icon: '🏦',
      type: '金融类',
      cases: '银行 · 保险',
      color: '#a855f7',
      colorRgb: '147,51,234',
      scene: 'OA应用',
      points: ['内部协同流程重，BPM类流程工具诉求强烈', '营销类业务客户数据属企业核心资产，不允许出网', '对私有化部署+信创有强诉求'],
    },
  ];
  return this.renderSlideWrapper(5,
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      <div style={S.tg}>客户画像</div>
      <div style={Object.assign({}, S.stSts, { marginBottom: '28px' })}>三类核心目标客户</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', animation: 'fu 1.2s ease .5s both' }}>
        {customers.map(function(c) {
          return (
            <div key={c.type} style={{ background: 'rgba(' + c.colorRgb + ',.06)', border: '1px solid rgba(' + c.colorRgb + ',.25)', borderRadius: '16px', padding: '28px', textAlign: 'left' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{c.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: c.color, marginBottom: '4px' }}>{c.type}</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', letterSpacing: '1px' }}>{c.cases}</div>
              <div style={{ fontSize: '13px', background: 'rgba(' + c.colorRgb + ',.15)', borderRadius: '6px', padding: '4px 10px', color: c.color, display: 'inline-block', marginBottom: '14px' }}>📌 {c.scene}</div>
              <div>
                {c.points.map(function(p, i) {
                  return <div key={i} style={{ fontSize: '15px', color: '#9ca3af', lineHeight: 1.6, marginBottom: '6px', paddingLeft: '12px', borderLeft: '2px solid rgba(' + c.colorRgb + ',.4)' }}>{p}</div>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== 幻灯片 6：章节页 - 私有化核心特性 =====
export function renderSlide6() {
  return this.renderSlideWrapper(6,
    <div style={{ textAlign: 'center' }}>
      <div style={S.tg}>PART 03</div>
      <div style={S.stSts}>私有化核心特性</div>
      <div style={{ fontSize: '20px', color: '#6b7280', letterSpacing: '4px' }}>CORE FEATURES</div>
    </div>
  );
}

// ===== 幻灯片 7：本地化部署 + 多云支持 =====
export function renderSlide7() {
  var localFeatures = ['设计态本地存储：应用设计和平台配置数据', '数据本地存储：业务数据存储在本地服务器', '文件本地存储：静态资源本地化，减少外网依赖', '应用服务本地运行：低延迟、高响应', '日志本地存储：便于管理和审计'];
  var clouds = ['阿里云', '华为云', '腾讯云', 'AWS', 'Azure', 'GCP', 'IBM Cloud', '自有机房'];
  return this.renderSlideWrapper(7,
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      <div style={S.tg}>核心特性 01 · 02</div>
      <div style={Object.assign({}, S.stSts, { marginBottom: '28px' })}>本地化部署 & 多云支持</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', animation: 'fu 1.2s ease .5s both' }}>
        <div style={S.cd}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6', marginBottom: '16px' }}>🏠 本地化部署运行</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '14px' }}>客户独占服务器资源，物理隔离，杜绝多租户风险</div>
          {localFeatures.map(function(f, i) {
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#10b981', fontSize: '14px', marginTop: '2px', flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: '15px', color: '#9ca3af', lineHeight: 1.5 }}>{f}</span>
              </div>
            );
          })}
        </div>
        <div style={S.cd}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981', marginBottom: '16px' }}>☁️ 支持多云环境部署</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {clouds.map(function(c) {
              return <span key={c} style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.25)', borderRadius: '6px', padding: '4px 12px', fontSize: '14px', color: '#34d399' }}>{c}</span>;
            })}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: '14px' }}>
            <div style={{ fontSize: '15px', color: '#9ca3af', lineHeight: 1.7 }}>
              <div style={{ marginBottom: '6px' }}>✓ 跨区域、跨可用区冗余部署</div>
              <div style={{ marginBottom: '6px' }}>✓ 高可用和容灾能力，保障业务连续性</div>
              <div>✓ 弹性扩缩容，动态调整资源</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 幻灯片 8：通讯录集成 + 信创支持 =====
export function renderSlide8() {
  var imList = [
    { name: '钉钉', color: '#3b82f6' },
    { name: '飞书', color: '#10b981' },
    { name: '企业微信', color: '#a855f7' },
    { name: 'IDAAS', color: '#f59e0b' },
    { name: '自建通讯录', color: '#ec4899' },
  ];
  var xinChuang = ['核心芯片', '基础硬件', '操作系统', '中间件', '数据服务器'];
  return this.renderSlideWrapper(8,
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      <div style={S.tg}>核心特性 03 · 04</div>
      <div style={Object.assign({}, S.stSts, { marginBottom: '28px' })}>通讯录集成 & 国产化信创</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', animation: 'fu 1.2s ease .5s both' }}>
        <div style={S.cd}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#a855f7', marginBottom: '16px' }}>🔗 支持三方通讯录集成</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {imList.map(function(im) {
              return <span key={im.name} style={{ background: 'rgba(168,85,247,.1)', border: '1px solid rgba(168,85,247,.25)', borderRadius: '6px', padding: '5px 14px', fontSize: '14px', color: im.color }}>{im.name}</span>;
            })}
          </div>
          <div style={{ fontSize: '15px', color: '#9ca3af', lineHeight: 1.8 }}>
            <div>✓ 组织架构通：通讯录数据同步</div>
            <div>✓ 统一登录：无缝打开，无需二次登录</div>
            <div>✓ 消息通知打通：消息发送到对应客户端</div>
            <div>✓ 支持成员多部门 & 直属主管关系</div>
          </div>
        </div>
        <div style={S.cd}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b', marginBottom: '16px' }}>🇨🇳 支持国产化信创</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {xinChuang.map(function(x) {
              return <span key={x} style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.25)', borderRadius: '6px', padding: '5px 14px', fontSize: '14px', color: '#fbbf24' }}>{x}</span>;
            })}
          </div>
          <div style={{ fontSize: '15px', color: '#9ca3af', lineHeight: 1.8 }}>
            <div>✓ 核心领域全面实现国产替代</div>
            <div>✓ 数据安全、网络安全的基础保障</div>
            <div>✓ 支持阿里云等主流云的信创硬件类型</div>
            <div>✓ 集群部署，更高性能与扩展性</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 幻灯片 9：章节页 - 交付与运维 =====
export function renderSlide9() {
  return this.renderSlideWrapper(9,
    <div style={{ textAlign: 'center' }}>
      <div style={S.tg}>PART 04</div>
      <div style={S.stSts}>交付与运维</div>
      <div style={{ fontSize: '20px', color: '#6b7280', letterSpacing: '4px' }}>DELIVERY & OPERATIONS</div>
    </div>
  );
}

// ===== 幻灯片 10：交付流程 + 版本更新 =====
export function renderSlide10() {
  var timeline = [
    { step: '01', title: '交付部署', color: '#3b82f6', desc: '前10～15+个落地客户由原厂提供交付，交付SOP成熟后可由伙伴进行交付' },
    { step: '02', title: '运维更新', color: '#10b981', desc: '统一版本迭代，每季度一个小版本，每年一个大版本同步到私有化版本' },
    { step: '03', title: '数据迁移', color: '#a855f7', desc: '提供公有云宜搭上的应用和数据迁移服务，可包含在整体项目预算中' },
    { step: '04', title: '版本升级', color: '#f59e0b', desc: '建议客户开放VPN由宜搭侧操作，或提供更新包下载地址由客户/伙伴安装' },
  ];
  return this.renderSlideWrapper(10,
    <div style={{ width: '100%', maxWidth: '1000px' }}>
      <div style={S.tg}>交付与运维</div>
      <div style={Object.assign({}, S.stSts, { marginBottom: '32px' })}>全生命周期服务保障</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', animation: 'fu 1.2s ease .5s both' }}>
        {timeline.map(function(t) {
          return (
            <div key={t.step} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '16px', padding: '24px', textAlign: 'left', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: t.color, opacity: 0.6, flexShrink: 0, lineHeight: 1 }}>{t.step}</div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: t.color, marginBottom: '8px' }}>{t.title}</div>
                <div style={{ fontSize: '15px', color: '#9ca3af', lineHeight: 1.7 }}>{t.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== 幻灯片 11：章节页 - Q&A =====
export function renderSlide11() {
  return this.renderSlideWrapper(11,
    <div style={{ textAlign: 'center' }}>
      <div style={S.tg}>PART 05</div>
      <div style={S.stSts}>常见问题 Q&A</div>
      <div style={{ fontSize: '20px', color: '#6b7280', letterSpacing: '4px' }}>FREQUENTLY ASKED QUESTIONS</div>
    </div>
  );
}

// ===== 幻灯片 12：Q&A 详情 + 封底 =====
export function renderSlide12() {
  var qaList = [
    { q: '私有化与公有云功能差异？', a: '基础能力保持一致，差异主要在外部依赖：钉钉专属能力、三方产品（e签宝/OCR等）、AI大模型能力（开发中）' },
    { q: '如何保持版本与主线一致？', a: '每季度一个小版本，每年一个大版本同步公有云最新能力，个性化能力单独维护' },
    { q: '是否支持多环境（POC+正式）？', a: '排期今年9月左右支持，届时可先在POC环境测试再升级正式环境' },
    { q: '是否有AI能力支持计划？', a: '有！AI辅助搭建/表单填报/AIBI等能力可对接客户自有大模型；AI知识库问答已有客户落地' },
    { q: '是否支持不限人数版本？', a: '可以支持，价格一客一议，欢迎联系商务洽谈' },
    { q: '附件预览是否额外收费？', a: '不额外收费，包含在产品费用中' },
  ];
  return this.renderSlideWrapper(12,
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      <div style={S.tg}>常见问题</div>
      <div style={Object.assign({}, S.stSts, { marginBottom: '28px', fontSize: '36px' })}>Q&A 快速解答</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', animation: 'fu 1.2s ease .4s both' }}>
        {qaList.map(function(qa, i) {
          return (
            <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', padding: '18px 20px', textAlign: 'left' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#60a5fa', marginBottom: '6px' }}>Q: {qa.q}</div>
              <div style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>A: {qa.a}</div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '20px', padding: '16px 24px', background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', borderRadius: '12px', display: 'flex', gap: '32px', justifyContent: 'center', animation: 'fu 1s ease 1s both' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>自建通讯录体验</div>
          <div style={{ fontSize: '15px', color: '#60a5fa' }}>yidapod.cloud</div>
        </div>
        <div style={{ width: '1px', background: 'rgba(255,255,255,.08)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>钉钉环境体验</div>
          <div style={{ fontSize: '15px', color: '#60a5fa' }}>yidapod.online</div>
        </div>
        <div style={{ width: '1px', background: 'rgba(255,255,255,.08)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>商务咨询</div>
          <div style={{ fontSize: '15px', color: '#10b981' }}>详询 pdsa</div>
        </div>
      </div>
    </div>
  );
}

export function goToSlide(n) {
  if (n < 1 || n > _customState.totalSlides) return;
  _customState.currentSlide = n;
  this.forceUpdate();
}

export function changeSlide(dir) {
  var next = _customState.currentSlide + dir;
  if (next < 1) next = 1;
  if (next > _customState.totalSlides) next = _customState.totalSlides;
  this.goToSlide(next);
}

export function toggleFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    var el = document.documentElement;
    if (el.requestFullscreen) { el.requestFullscreen(); }
    else if (el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); }
  } else {
    if (document.exitFullscreen) { document.exitFullscreen(); }
    else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
  }
  var self = this;
  setTimeout(function() { self.forceUpdate(); }, 100);
}

export function didMount() {
  var self = this;
  _customState.totalSlides = 12;

  var hideNavStyle = document.createElement('style');
  hideNavStyle.textContent = [
    '.china-area-header { display: none !important; }',
    '.yida-china-area-header { display: none !important; }',
    '.header-area { display: none !important; }',
    '.aliwork-header { display: none !important; }',
    '.next-shell-header { display: none !important; }',
    '#china-area-header { display: none !important; }',
    '.yida-header { display: none !important; }',
    '.china-area-content { padding-top: 0 !important; }',
    '.yida-china-area-content { padding-top: 0 !important; }',
  ].join(' ');
  document.head.appendChild(hideNavStyle);

  self._handleKeyDown = function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault(); self.changeSlide(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault(); self.changeSlide(-1);
    } else if (e.key === 'Home') {
      e.preventDefault(); self.goToSlide(1);
    } else if (e.key === 'End') {
      e.preventDefault(); self.goToSlide(_customState.totalSlides);
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault(); self.toggleFullscreen();
    }
  };
  document.addEventListener('keydown', self._handleKeyDown);

  self._handleFullscreenChange = function() {
    _customState.isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
    self.forceUpdate();
  };
  document.addEventListener('fullscreenchange', self._handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', self._handleFullscreenChange);

  self._touchStartX = 0;
  self._handleTouchStart = function(e) { self._touchStartX = e.changedTouches[0].screenX; };
  self._handleTouchEnd = function(e) {
    var diff = self._touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) { self.changeSlide(diff > 0 ? 1 : -1); }
  };
  document.addEventListener('touchstart', self._handleTouchStart);
  document.addEventListener('touchend', self._handleTouchEnd);

  setTimeout(function() { self.initParticles(); }, 500);
}

export function didUnmount() {
  document.removeEventListener('keydown', this._handleKeyDown);
  document.removeEventListener('touchstart', this._handleTouchStart);
  document.removeEventListener('touchend', this._handleTouchEnd);
  document.removeEventListener('fullscreenchange', this._handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', this._handleFullscreenChange);
  if (_customState._animFrame) cancelAnimationFrame(_customState._animFrame);
}

export function renderJsx() {
  var self = this;
  var cur = _customState.currentSlide;
  var total = _customState.totalSlides;
  var isFull = _customState.isFullscreen;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0B0F19', overflow: 'hidden', margin: 0, padding: 0, borderRadius: 0, fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}>
      <div style={{ display: 'none' }}>{this.state.timestamp}</div>
      <style dangerouslySetInnerHTML={{ __html: CSS_ANIMATIONS }} />
      <canvas id="ppt-particles" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, pointerEvents: 'none', opacity: 0.35 }} />
      <div style={{ position: 'relative', zIndex: 2, width: '100vw', height: '100vh' }}>
        {this.renderSlide1()}
        {this.renderSlide2()}
        {this.renderSlide3()}
        {this.renderSlide4()}
        {this.renderSlide5()}
        {this.renderSlide6()}
        {this.renderSlide7()}
        {this.renderSlide8()}
        {this.renderSlide9()}
        {this.renderSlide10()}
        {this.renderSlide11()}
        {this.renderSlide12()}
      </div>
      <div
        style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 102, opacity: 0.3, transition: 'opacity .3s ease', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={function() { self.toggleFullscreen(); }}
        onMouseEnter={function(e) { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={function(e) { e.currentTarget.style.opacity = '0.3'; }}
        title={isFull ? '退出全屏 (F)' : '全屏 (F)'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d={isFull ? 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z' : 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z'} /></svg>
      </div>
      <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '50px', padding: '10px 25px' }}>
        <button
          onClick={function() { self.changeSlide(-1); }}
          style={{ background: 'none', border: 'none', color: cur > 1 ? '#fff' : 'rgba(255,255,255,.2)', cursor: cur > 1 ? 'pointer' : 'default', fontSize: '18px', padding: '0 5px', transition: 'color .2s' }}
        >◀</button>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {Array.from({ length: total }, function(_, i) {
            var isActive = i + 1 === cur;
            var isChapter = chapterSlides.indexOf(i + 1) >= 0;
            return (
              <div
                key={i}
                onClick={function() { self.goToSlide(i + 1); }}
                style={{ width: isActive ? '24px' : (isChapter ? '8px' : '6px'), height: isActive ? '8px' : (isChapter ? '8px' : '6px'), borderRadius: '4px', background: isActive ? '#3b82f6' : (isChapter ? 'rgba(59,130,246,.5)' : 'rgba(255,255,255,.2)'), transition: 'all .3s ease', cursor: 'pointer' }}
              />
            );
          })}
        </div>
        <button
          onClick={function() { self.changeSlide(1); }}
          style={{ background: 'none', border: 'none', color: cur < total ? '#fff' : 'rgba(255,255,255,.2)', cursor: cur < total ? 'pointer' : 'default', fontSize: '18px', padding: '0 5px', transition: 'color .2s' }}
        >▶</button>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.4)', marginLeft: '5px', minWidth: '40px', textAlign: 'center' }}>{cur}/{total}</div>
      </div>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', zIndex: 101, background: 'rgba(255,255,255,.05)' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,#3b82f6,#a855f7)', width: ((cur / total) * 100) + '%', transition: 'width .5s cubic-bezier(.25,.46,.45,.94)', borderRadius: '0 2px 2px 0' }} />
      </div>
    </div>
  );
}