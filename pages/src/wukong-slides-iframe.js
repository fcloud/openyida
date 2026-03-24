import { Component } from 'react';

export default class WukongSlidesIframe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blobUrl: null
    };
  }

  componentDidMount() {
    // 创建完整的 HTML 内容作为 Blob URL
    const htmlContent = this.getHtmlContent();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    this.setState({ blobUrl: url });
  }

  componentWillUnmount() {
    if (this.state.blobUrl) {
      URL.revokeObjectURL(this.state.blobUrl);
    }
  }

  getHtmlContent() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>龙虾（OpenClaw）vs 悟空 - 2026 AI Agent 实战分享</title>
  <link href="https://api.fontshare.com/v2/css?f[]=clash-display@600;500;400&f[]=general-sans@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'General Sans', sans-serif; overflow: hidden; height: 100vh; background: #0a0a0f; }
    .presentation { position: relative; width: 100%; height: 100vh; }
    .slide { position: absolute; top: 0; left: 0; width: 100%; height: 100vh; opacity: 0; visibility: hidden; transition: opacity 0.6s ease; }
    .slide.active { opacity: 1; visibility: visible; }
    .slide-content { height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 60px; }
    h1 { font-size: 56px; color: #fff; margin-bottom: 20px; }
    h2 { font-size: 40px; color: #fff; margin-bottom: 16px; }
    p { font-size: 18px; color: #a0a0b0; line-height: 1.6; }
    .card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 30px; }
    .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; }
    .card-icon { font-size: 36px; margin-bottom: 12px; }
    .card-label { font-size: 18px; color: #fff; font-weight: 600; margin-bottom: 8px; }
    .card-desc { font-size: 14px; color: #a0a0b0; }
    .nav-dots { position: fixed; right: 30px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 10px; z-index: 100; }
    .nav-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.2); border: none; cursor: pointer; }
    .nav-dot.active { background: #6366f1; }
    .progress-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 3px; background: #12121a; }
    .progress-fill { height: 100%; background: linear-gradient(135deg, #6366f1, #8b5cf6); width: 0%; transition: width 0.3s; }
    .slide-counter { position: fixed; bottom: 30px; left: 30px; font-size: 14px; color: #6b6b7b; }
  </style>
</head>
<body>
  <div class="nav-dots" id="navDots"></div>
  <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
  <div class="slide-counter" id="slideCounter">1 / 24</div>
  <div class="presentation" id="presentation">
    <section class="slide active" data-slide="1">
      <div class="slide-content" style="text-align:center;">
        <p style="color:#6366f1;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:20px;">2026 AI Agent 实战分享</p>
        <h1>龙虾（OpenClaw）<br>vs 悟空</h1>
        <p>AI Agent 时代的人机协作新范式</p>
        <div style="margin-top:60px;padding-top:40px;border-top:2px solid rgba(255,255,255,0.1);">
          <p style="color:#6b6b7b;font-size:14px;">杭远 · 钉钉华中区域解决方案总经理 · 2026.03</p>
        </div>
      </div>
    </section>
    <section class="slide" data-slide="2">
      <div class="slide-content">
        <p style="color:#6b6b7b;text-transform:uppercase;font-size:14px;margin-bottom:16px;">演讲者介绍</p>
        <h2>杭远</h2>
        <p>钉钉华中区域解决方案总经理</p>
        <div class="card-grid">
          <div class="card"><div class="card-icon">🏢</div><div class="card-label">区域负责人</div><div class="card-desc">负责钉钉在华中区域的企业数字化解决方案</div></div>
          <div class="card"><div class="card-icon">🤖</div><div class="card-label">企业 AI 实践者</div><div class="card-desc">深度参与企业智能场景落地</div></div>
          <div class="card"><div class="card-icon">🦞</div><div class="card-label">OpenYida 推动者</div><div class="card-desc">让 AI 驱动低代码</div></div>
        </div>
      </div>
    </section>
    <section class="slide" data-slide="3">
      <div class="slide-content">
        <p style="color:#6b6b7b;text-transform:uppercase;font-size:14px;margin-bottom:16px;">开发方式</p>
        <h2>这个 PPT，是在悟空上做的</h2>
        <p>Vibe Coding：用 AI 对话驱动开发</p>
        <p style="margin-top:20px;">通过<strong style="color:#6366f1;">悟空平台 + OpenYida 技能</strong>，对话式完成了整套演讲 PPT 的开发和发布。</p>
      </div>
    </section>
    <section class="slide" data-slide="4">
      <div class="slide-content" style="text-align:center;">
        <p style="font-size:120px;color:rgba(99,102,241,0.2);line-height:1;margin-bottom:-40px;">PART 01</p>
        <h1 style="background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">什么是 AI Agent？</h1>
      </div>
    </section>
    <section class="slide" data-slide="5">
      <div class="slide-content">
        <p style="color:#6b6b7b;text-transform:uppercase;font-size:14px;margin-bottom:16px;">PART 01 · 什么是 AI Agent</p>
        <h2>Agent = 感知 + 规划 + 执行</h2>
        <div class="card-grid">
          <div class="card"><div class="card-icon">👁️</div><div class="card-label">感知 Perceive</div><div class="card-desc">理解你的意图、读取上下文</div></div>
          <div class="card"><div class="card-icon">🧠</div><div class="card-label">规划 Plan</div><div class="card-desc">拆解任务、制定步骤</div></div>
          <div class="card"><div class="card-icon">⚡</div><div class="card-label">执行 Act</div><div class="card-desc">调用 API、完成交付</div></div>
          <div class="card"><div class="card-icon">🔄</div><div class="card-label">反思 Reflect</div><div class="card-desc">检查结果、自动修正</div></div>
        </div>
      </div>
    </section>
    <section class="slide" data-slide="6">
      <div class="slide-content" style="text-align:center;">
        <p style="font-size:120px;color:rgba(14,165,233,0.2);line-height:1;margin-bottom:-40px;">PART 02</p>
        <h1 style="background:linear-gradient(135deg,#0ea5e9,#0089ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">OpenClaw 龙虾</h1>
      </div>
    </section>
    <section class="slide" data-slide="7">
      <div class="slide-content">
        <p style="color:#6b6b7b;text-transform:uppercase;font-size:14px;margin-bottom:16px;">PART 02 · OpenClaw 龙虾</p>
        <h2>OpenClaw 是怎么火起来的？</h2>
        <p>从一个开源项目，到改变世界的软件——只用了三周</p>
        <div style="margin-top:30px;padding-left:30px;border-left:2px solid rgba(255,255,255,0.1);">
          <div style="margin-bottom:20px;"><p style="color:#6366f1;font-weight:600;">Day 1</p><p style="color:#fff;">项目启动</p></div>
          <div style="margin-bottom:20px;"><p style="color:#6366f1;font-weight:600;">Week 1</p><p style="color:#fff;">核心功能上线</p></div>
          <div style="margin-bottom:20px;"><p style="color:#6366f1;font-weight:600;">Week 2</p><p style="color:#fff;">社区爆发</p></div>
          <div><p style="color:#6366f1;font-weight:600;">Week 3</p><p style="color:#fff;">生态成型</p></div>
        </div>
      </div>
    </section>
    <section class="slide" data-slide="8">
      <div class="slide-content">
        <p style="color:#6b6b7b;text-transform:uppercase;font-size:14px;margin-bottom:16px;">PART 02 · OpenClaw 龙虾</p>
        <h2>OpenClaw 的八大实战场景</h2>
        <div class="card-grid">
          <div class="card"><div class="card-icon">📧</div><div class="card-label">邮件处理</div></div>
          <div class="card"><div class="card-icon">📊</div><div class="card-label">数据分析</div></div>
          <div class="card"><div class="card-icon">📝</div><div class="card-label">文档创作</div></div>
          <div class="card"><div class="card-icon">🔍</div><div class="card-label">信息检索</div></div>
          <div class="card"><div class="card-icon">💬</div><div class="card-label">客服对话</div></div>
          <div class="card"><div class="card-icon">📅</div><div class="card-label">日程管理</div></div>
          <div class="card"><div class="card-icon">🎯</div><div class="card-label">项目管理</div></div>
          <div class="card"><div class="card-icon">🔌</div><div class="card-label">系统集成</div></div>
        </div>
      </div>
    </section>
    <section class="slide" data-slide="9">
      <div class="slide-content" style="text-align:center;">
        <p style="font-size:120px;color:rgba(99,102,241,0.2);line-height:1;margin-bottom:-40px;">PART 03</p>
        <h1 style="background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">企业级挑战</h1>
      </div>
    </section>
    <section class="slide" data-slide="10">
      <div class="slide-content">
        <p style="color:#6b6b7b;text-transform:uppercase;font-size:14px;margin-bottom:16px;">PART 03 · 企业级挑战</p>
        <h2>企业级 AI 的三大痛点</h2>
        <div class="card-grid">
          <div class="card"><div class="card-label" style="color:#f59e0b;">🔒 权限失控</div><div class="card-desc">Agent 可能越权访问敏感数据</div></div>
          <div class="card"><div class="card-label" style="color:#f59e0b;">⚫ 黑盒不可审计</div><div class="card-desc">决策过程不透明</div></div>
          <div class="card"><div class="card-label" style="color:#f59e0b;">💰 成本不可控</div><div class="card-desc">Token 消耗无上限</div></div>
        </div>
      </div>
    </section>
    <section class="slide" data-slide="11">
      <div class="slide-content" style="text-align:center;">
        <p style="font-size:120px;color:rgba(99,102,241,0.2);line-height:1;margin-bottom:-40px;">PART 04</p>
        <h1 style="background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">悟空事业部</h1>
      </div>
    </section>
    <section class="slide" data-slide="12">
      <div class="slide-content">
        <p style="color:#6b6b7b;text-transform:uppercase;font-size:14px;margin-bottom:16px;">PART 04 · 悟空事业部</p>
        <h2>悟空平台的核心优势</h2>
        <div class="card-grid">
          <div class="card"><div class="card-icon">🛡️</div><div class="card-label">安全合规</div><div class="card-desc">企业级权限体系</div></div>
          <div class="card"><div class="card-icon">🔧</div><div class="card-label">低代码开发</div><div class="card-desc">可视化编排</div></div>
          <div class="card"><div class="card-icon">📈</div><div class="card-label">成本可控</div><div class="card-desc">Token 用量监控</div></div>
          <div class="card"><div class="card-icon">🔗</div><div class="card-label">生态集成</div><div class="card-desc">无缝对接钉钉</div></div>
        </div>
      </div>
    </section>
    <section class="slide" data-slide="13">
      <div class="slide-content">
        <p style="color:#6b6b7b;text-transform:uppercase;font-size:14px;margin-bottom:16px;">PART 04 · 悟空事业部</p>
        <h2>悟空 vs 龙虾：定位差异</h2>
        <div class="card-grid">
          <div class="card"><div class="card-label" style="color:#0ea5e9;">🦞 OpenClaw</div><p style="font-size:14px;">个人开发者、小团队快速原型</p></div>
          <div class="card"><div class="card-label" style="color:#6366f1;">🐵 悟空</div><p style="font-size:14px;">企业级应用、安全合规场景</p></div>
        </div>
      </div>
    </section>
    <section class="slide" data-slide="14">
      <div class="slide-content">
        <p style="color:#6b6b7b;text-transform:uppercase;font-size:14px;margin-bottom:16px;">总结</p>
        <h2>AI Agent 时代已来</h2>
        <p>选择适合你的工具，开启人机协作新篇章</p>
      </div>
    </section>
  </div>
  <script>
    let currentSlide = 1;
    const totalSlides = 14;
    function updateSlide(n) {
      document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.nav-dot').forEach(d => d.classList.remove('active'));
      const slide = document.querySelector('.slide[data-slide="' + n + '"]');
      if (slide) slide.classList.add('active');
      const dot = document.querySelector('.nav-dot[data-slide="' + n + '"]');
      if (dot) dot.classList.add('active');
      document.getElementById('slideCounter').textContent = n + ' / ' + totalSlides;
      document.getElementById('progressFill').style.width = ((n - 1) / (totalSlides - 1) * 100) + '%';
      currentSlide = n;
    }
    function initNav() {
      const navDots = document.getElementById('navDots');
      for (let i = 1; i<= totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = 'nav-dot' + (i === 1 ? ' active' : '');
        dot.setAttribute('data-slide', i);
        dot.onclick = function() { updateSlide(i); };
        navDots.appendChild(dot);
      }
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        if (currentSlide < totalSlides) updateSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (currentSlide > 1) updateSlide(currentSlide - 1);
      }
    });
    initNav();
    updateSlide(1);
  </script>
</body>
</html>`;
  }

  render() {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        {this.state.blobUrl && (
          <iframe
            src={this.state.blobUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              frameborder: '0'
            }}
          />
        )}
      </div>
    );
  }
}
