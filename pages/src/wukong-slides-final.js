// ── 状态管理 ─────────────────────────────────────────────────
var _customState = {};

// ── 辅助函数 ────────────────────────────────────────────────
export function setCustomState(newState) {
  for (var key in newState) {
    _customState[key] = newState[key];
  }
}

export function didMount() {
  // 在 DOM 加载完成后，动态创建 iframe 并注入 HTML 内容
  setTimeout(function() {
    var container = document.getElementById('slides-container');
    if (!container) return;

    // 清空容器
    container.innerHTML = '';

    // 创建 iframe
    var iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    iframe.style.margin = '0';
    iframe.style.padding = '0';
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';

    container.appendChild(iframe);

    // 获取 iframe 的 document 并写入 HTML 内容
    var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(getSlidesHTML());
    iframeDoc.close();
  }, 100);
}

export function didUnmount() {}

// ── 获取完整的幻灯片 HTML ───────────────────────────────────
function getSlidesHTML() {
  return '<!DOCTYPE html>' +
'<html lang="zh-CN">' +
'<head>' +
'<meta charset="UTF-8">' +
'<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'  <title>龙虾（OpenClaw）vs 悟空 - 2026 AI Agent 实战分享</title>' +
'  <link href="https://api.fontshare.com/v2/css?f[]=clash-display@600;500;400&f[]=general-sans@400;500;600&display=swap" rel="stylesheet">' +
'  <style>' +
'    * { margin: 0; padding: 0; box-sizing: border-box; }' +
'    :root { --slide-height: 100vh; --slide-height-dvh: 100dvh; }' +
'    body { font-family: "General Sans", -apple-system, BlinkMacSystemFont, sans-serif; overflow: hidden; height: 100vh; width: 100vw; background: #0a0a0f; }' +
'    .presentation { position: relative; width: 100%; height: 100vh; height: 100dvh; }' +
'    .slide { position: absolute; top: 0; left: 0; width: 100%; height: 100vh; height: 100dvh; overflow: hidden; opacity: 0; visibility: hidden; transition: opacity 0.6s ease, visibility 0.6s ease; }' +
'    .slide.active { opacity: 1; visibility: visible; z-index: 1; }' +
'    .slide-content { height: 100%; display: flex; flex-direction: column; justify-content: center; padding: clamp(40px, 8vw, 80px); max-height: 100vh; overflow: hidden; }' +
'    h1 { font-size: clamp(36px, 7vw, 72px); line-height: 1.1; }' +
'    h2 { font-size: clamp(28px, 5vw, 48px); line-height: 1.2; }' +
'    h3 { font-size: clamp(20px, 3.5vw, 32px); line-height: 1.3; }' +
'    p, li { font-size: clamp(14px, 2.5vw, 20px); line-height: 1.6; }' +
'    img { max-width: 100%; max-height: min(50vh, 400px); object-fit: contain; }' +
'    :root {' +
'      --bg-primary: #0a0a0f; --bg-secondary: #12121a; --bg-card: rgba(255, 255, 255, 0.05);' +
'      --text-primary: #ffffff; --text-secondary: #a0a0b0; --text-muted: #6b6b7b;' +
'      --accent: #6366f1; --accent-light: #818cf8; --accent-glow: rgba(99, 102, 241, 0.4);' +
'      --accent-soft: rgba(99, 102, 241, 0.1); --border: rgba(255, 255, 255, 0.1);' +
'      --success: #10b981; --warning: #f59e0b;' +
'      --gradient-1: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);' +
'      --gradient-2: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);' +
'    }' +
'    .slide-bg { position: absolute; inset: 0; z-index: 0; overflow: hidden; background: #0a0a0f; }' +
'    .grid-pattern { background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px); background-size: 60px 60px; opacity: 0.3; position: absolute; inset: 0; }' +
'    .gradient-orb { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%); border-radius: 50%; filter: blur(60px); }' +
'    .orb-1 { top: -200px; right: -200px; animation: float-orb-1 8s ease-in-out infinite; }' +
'    .orb-2 { bottom: -200px; left: -200px; background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%); animation: float-orb-2 10s ease-in-out infinite; }' +
'    @keyframes float-orb-1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-30px, 30px) scale(1.1); } }' +
'    @keyframes float-orb-2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(30px, -30px) scale(1.15); } }' +
'    .content-container { position: relative; z-index: 1; max-width: 1400px; margin: 0 auto; width: 100%; }' +
'    .eyebrow { font-family: "Clash Display", sans-serif; font-size: clamp(14px, 2.2vw, 18px); font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: clamp(16px, 3vw, 32px); display: inline-block; }' +
'    .chapter-label { font-family: "Clash Display", sans-serif; font-size: clamp(12px, 2vw, 16px); font-weight: 500; color: #6b6b7b; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: clamp(12px, 2vw, 24px); }' +
'    .slide-title { font-family: "Clash Display", sans-serif; font-size: clamp(36px, 7vw, 64px); font-weight: 600; line-height: 1.1; margin-bottom: clamp(16px, 3vw, 32px); background: linear-gradient(135deg, #ffffff 0%, #a5a6f6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }' +
'    .slide-subtitle { font-size: clamp(16px, 3vw, 24px); color: #a0a0b0; line-height: 1.6; max-width: 900px; }' +
'    .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(clamp(280px, 40vw, 400px), 1fr)); gap: clamp(16px, 3vw, 24px); margin-top: clamp(24px, 4vw, 40px); }' +
'    .feature-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: clamp(20px, 4vw, 32px); backdrop-filter: blur(10px); transition: transform 0.3s ease, border-color 0.3s ease; }' +
'    .feature-card:hover { transform: translateY(-4px); border-color: #6366f1; }' +
'    .card-icon { font-size: clamp(32px, 5vw, 48px); margin-bottom: clamp(12px, 2vw, 20px); }' +
'    .card-label { font-family: "Clash Display", sans-serif; font-size: clamp(16px, 2.8vw, 22px); font-weight: 600; color: #ffffff; margin-bottom: clamp(8px, 1.5vw, 12px); }' +
'    .card-desc { font-size: clamp(13px, 2.2vw, 16px); color: #a0a0b0; line-height: 1.6; }' +
'    .timeline { position: relative; padding-left: clamp(30px, 5vw, 50px); margin-top: clamp(24px, 4vw, 40px); }' +
'    .timeline::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: rgba(255, 255, 255, 0.1); }' +
'    .timeline-item { position: relative; padding-bottom: clamp(24px, 4vw, 40px); }' +
'    .timeline-item::before { content: ""; position: absolute; left: calc(-1 * clamp(30px, 5vw, 50px)); top: 4px; width: 12px; height: 12px; background: #6366f1; border-radius: 50%; transform: translateX(-5px); }' +
'    .timeline-marker { font-family: "Clash Display", sans-serif; font-size: clamp(12px, 2vw, 14px); font-weight: 600; color: #6366f1; margin-bottom: clamp(6px, 1vw, 10px); }' +
'    .timeline-title { font-family: "Clash Display", sans-serif; font-size: clamp(18px, 3vw, 24px); font-weight: 600; color: #ffffff; margin-bottom: clamp(6px, 1vw, 10px); }' +
'    .timeline-desc { font-size: clamp(13px, 2.2vw, 16px); color: #a0a0b0; line-height: 1.6; }' +
'    .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(24px, 4vw, 48px); align-items: center; margin-top: clamp(24px, 4vw, 40px); }' +
'    @media (max-width: 900px) { .two-column { grid-template-columns: 1fr; } }' +
'    .image-container { border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.05); }' +
'    .image-container img { width: 100%; height: auto; display: block; }' +
'    .image-caption { padding: clamp(12px, 2vw, 20px); font-size: clamp(12px, 2vw, 14px); color: #6b6b7b; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); }' +
'    .nav-dots { position: fixed; right: clamp(20px, 4vw, 40px); top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 12px; z-index: 100; }' +
'    .nav-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); border: none; cursor: pointer; transition: all 0.3s ease; }' +
'    .nav-dot.active { background: #6366f1; transform: scale(1.2); }' +
'    .progress-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 3px; background: #12121a; z-index: 100; }' +
'    .progress-fill { height: 100%; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); width: 0%; transition: width 0.3s ease; }' +
'    .slide-counter { position: fixed; bottom: clamp(20px, 4vh, 40px); left: clamp(20px, 4vw, 40px); font-size: clamp(12px, 2vw, 14px); color: #6b6b7b; z-index: 100; }' +
'    .reveal-up { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease, transform 0.8s ease; }' +
'    .reveal-up.visible { opacity: 1; transform: translateY(0); }' +
'    .stagger-1 { transition-delay: 0.1s; } .stagger-2 { transition-delay: 0.2s; } .stagger-3 { transition-delay: 0.3s; }' +
'    .stagger-4 { transition-delay: 0.4s; } .stagger-5 { transition-delay: 0.5s; } .stagger-6 { transition-delay: 0.6s; }' +
'    .tag-badge { display: inline-block; padding: 6px 14px; background: rgba(99, 102, 241, 0.1); border: 1px solid #6366f1; border-radius: 20px; font-size: clamp(11px, 1.8vw, 13px); color: #818cf8; font-weight: 500; margin-right: 8px; margin-bottom: 8px; }' +
'    .part-number { font-family: "Clash Display", sans-serif; font-size: clamp(48px, 10vw, 120px); font-weight: 600; color: rgba(99, 102, 241, 0.2); line-height: 1; margin-bottom: clamp(-20px, -3vw, -40px); }' +
'    .part-title { font-family: "Clash Display", sans-serif; font-size: clamp(36px, 7vw, 72px); font-weight: 600; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }' +
'  </style>' +
'</head>' +
'<body>' +
'  <div class="nav-dots" id="navDots"></div>' +
'  <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>' +
'<div class="slide-counter" id="slideCounter">1 / 24</div>' +
'<div class="presentation" id="presentation">' +
'<!-- SLIDE 1: 封面 -->' +
'<section class="slide active" data-slide="1">' +
'<div class="slide-bg"><div class="grid-pattern"></div><div class="gradient-orb orb-1"></div><div class="gradient-orb orb-2"></div></div>' +
'<div class="slide-content">' +
'<div class="content-container" style="text-align: center;">' +
'<div class="eyebrow reveal-up">2026 AI Agent 实战分享</div>' +
'<h1 class="slide-title reveal-up stagger-1">龙虾（OpenClaw）<br>vs 悟空</h1>' +
'<p class="slide-subtitle reveal-up stagger-2">AI Agent 时代的人机协作新范式</p>' +
'<div style="margin-top: clamp(40px, 6vw, 80px); padding-top: clamp(30px, 5vw, 50px); border-top: 2px solid rgba(255, 255, 255, 0.1);" class="reveal-up stagger-3">' +
'<p style="color: #6b6b7b; font-size: clamp(14px, 2.2vw, 16px);">杭远 · 钉钉华中区域解决方案总经理 · 2026.03</p>' +
'          </div>' +
'        </div>' +
'      </div>' +
'    </section>' +
'   <!-- SLIDE 2: 关于我 -->' +
'<section class="slide" data-slide="2">' +
'<div class="slide-bg"><div class="grid-pattern"></div><div class="gradient-orb orb-1"></div></div>' +
'     <div class="slide-content">' +
'<div class="content-container">' +
'<div class="chapter-label reveal-up">演讲者介绍</div>' +
'<h2 class="slide-title reveal-up stagger-1">杭远</h2>' +
'<p class="slide-subtitle reveal-up stagger-2">钉钉华中区域解决方案总经理</p>' +
'<div class="card-grid reveal-up stagger-3">' +
'<div class="feature-card"><div class="card-icon">🏢</div><div class="card-label">区域负责人</div><div class="card-desc">负责钉钉在华中区域的企业数字化解决方案，推动 AI 与企业管理深度融合</div></div>' +
'<div class="feature-card"><div class="card-icon">🤖</div><div class="card-label">企业 AI 实践者</div><div class="card-desc">深度参与企业智能场景落地，探索 AI Agent 在企业服务中的创新应用</div></div>' +
'<div class="feature-card"><div class="card-icon">🦞</div><div class="card-label">OpenYida 推动者</div><div class="card-desc">让 AI 驱动低代码，让每个企业都能快速构建智能化应用</div></div>' +
'          </div>' +
'        </div>' +
'      </div>' +
'    </section>' +
'<!-- SLIDE 3: Vibe Coding -->' +
'   <section class="slide" data-slide="3">' +
'      <div class="slide-bg"><div class="grid-pattern"></div><div class="gradient-orb orb-2"></div></div>' +
'     <div class="slide-content">' +
'        <div class="content-container">' +
'<div class="chapter-label reveal-up">开发方式</div>' +
'         <h2 class="slide-title reveal-up stagger-1">这个 PPT，是在悟空上做的</h2>' +
'<p class="slide-subtitle reveal-up stagger-2">Vibe Coding：用 AI 对话驱动开发</p>' +
'<div class="two-column reveal-up stagger-3">' +
'            <div>' +
'<p style="color: #a0a0b0; line-height: 1.8; margin-bottom: 20px;">通过<strong style="color: #6366f1;">悟空平台 + OpenYida 技能</strong>，对话式完成了整套演讲 PPT 的开发和发布。</p>' +
'              <p style="color: #a0a0b0; line-height: 1.8;">这就是 AI Agent 的力量——不是未来，是现在。</p>' +
'              <div style="margin-top: 24px;"><span class="tag-badge">🚀 悟空平台</span><span class="tag-badge">⚡ OpenYida</span><span class="tag-badge">💬 对话式开发</span></div>' +
'            </div>' +
'<div class="image-container"><img src="https://img.alicdn.com/imgextra/i2/O1CN01TB05pI1HpekqOi75D_!!6000000000807-2-tps-2190-1470.png" alt="悟空 Vibe Coding"><div class="image-caption">在悟空平台上通过对话完成 PPT 开发</div></div>' +
'          </div>' +
'        </div>' +
'      </div>' +
'    </section>' +
'<!-- SLIDE 4: PART 01 -->' +
'<section class="slide" data-slide="4">' +
'     <div class="slide-bg"><div class="grid-pattern"></div><div class="gradient-orb orb-1"></div></div>' +
'      <div class="slide-content">' +
'<div class="content-container" style="text-align: center;">' +
'<div class="part-number reveal-up">PART 01</div>' +
'<h1 class="part-title reveal-up stagger-1">什么是 AI Agent？</h1>' +
'<p class="slide-subtitle reveal-up stagger-2" style="margin-top: 20px;">从"问答机器"到"自主执行者"的进化</p>' +
'        </div>' +
'      </div>' +
'    </section>' +
'<!-- SLIDE 5: Agent 定义 -->' +
'    <section class="slide" data-slide="5">' +
'<div class="slide-bg"><div class="grid-pattern"></div><div class="gradient-orb orb-2"></div></div>' +
'<div class="slide-content">' +
'<div class="content-container">' +
'<div class="chapter-label reveal-up">PART 01 · 什么是 AI Agent</div>' +
'<h2 class="slide-title reveal-up stagger-1">Agent = 感知 + 规划 + 执行</h2>' +
'         <p class="slide-subtitle reveal-up stagger-2">不只是聊天，而是真正帮你把事情做完</p>' +
'         <div class="card-grid reveal-up stagger-3">' +
'           <div class="feature-card"><div class="card-icon">👁️</div><div class="card-label">感知 Perceive</div><div class="card-desc">理解你的意图、读取上下文、分析当前状态</div></div>' +
'<div class="feature-card"><div class="card-icon">🧠</div><div class="card-label">规划 Plan</div><div class="card-desc">拆解任务、制定步骤、选择合适的工具</div></div>' +
'<div class="feature-card"><div class="card-icon">⚡</div><div class="card-label">执行 Act</div><div class="card-desc">调用 API、操作系统、生成内容、完成交付</div></div>' +
'<div class="feature-card"><div class="card-icon">🔄</div><div class="card-label">反思 Reflect</div><div class="card-desc">检查结果、发现错误、自动修正重试</div></div>' +
'          </div>' +
'        </div>' +
'      </div>' +
'    </section>' +
'<!-- SLIDE 6: PART 02 -->' +
'<section class="slide" data-slide="6">' +
'      <div class="slide-bg"><div class="grid-pattern"></div><div class="gradient-orb orb-1" style="background: radial-gradient(circle, rgba(0, 137, 255, 0.3) 0%, transparent 70%);"></div></div>' +
'      <div class="slide-content">' +
'<div class="content-container" style="text-align: center;">' +
'         <div class="part-number" style="color: rgba(0, 137, 255, 0.2);">PART 02</div>' +
'<h1 class="part-title" style="background: linear-gradient(135deg, #0ea5e9 0%, #0089ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">OpenClaw 龙虾</h1>' +
'<p class="slide-subtitle reveal-up stagger-2" style="margin-top: 20px;">开源 Agent 框架，三周超越 Linux 三十年</p>' +
'        </div>' +
'      </div>' +
'    </section>' +
'<!-- SLIDE 7: OpenClaw 时间线 -->' +
'    <section class="slide" data-slide="7">' +
'      <div class="slide-bg"><div class="grid-pattern"></div><div class="gradient-orb orb-2" style="background: radial-gradient(circle, rgba(0, 137, 255, 0.25) 0%, transparent 70%);"></div></div>' +
'<div class="slide-content">' +
'       <div class="content-container">' +
'<div class="chapter-label reveal-up">PART 02 · OpenClaw 龙虾</div>' +
'<h2 class="slide-title reveal-up stagger-1">OpenClaw 是怎么火起来的？</h2>' +
'          <p class="slide-subtitle reveal-up stagger-2">从一个开源项目，到改变世界的软件——只用了三周</p>' +
'          <div class="timeline reveal-up stagger-3">' +
'            <div class="timeline-item"><div class="timeline-marker">🛠️ 2025 年 11 月 · 诞生</div><div class="timeline-title">Cline 分支，初出茅庐</div><div class="timeline-desc">作为 Cline 的一个 fork 版本诞生，专注于提升 AI 编程体验</div></div>' +
'<div class="timeline-item"><div class="timeline-marker">📈 2025 年 12 月 · 爆发</div><div class="timeline-title">GitHub Trending #1</div><div class="timeline-desc">凭借优秀的用户体验和强大的功能，迅速登顶 GitHub 趋势榜</div></div>' +
'<div class="timeline-item"><div class="timeline-marker"> 2026 年 1 月 · 全球化</div><div class="timeline-title">社区贡献爆发</div><div class="timeline-desc">全球开发者加入，多语言支持、插件生态快速形成</div></div>' +
'<div class="timeline-item"><div class="timeline-marker">🚀 2026 年 2 月 · 企业级</div><div class="timeline-title">企业功能完善</div><div class="timeline-desc">权限管理、审计日志、团队协作等企业级功能陆续上线</div></div>' +
'          </div>' +
'        </div>' +
'      </div>' +
'    </section>' +
'<!-- SLIDE 8: Mac Mini M4 本地部署 -->' +
'<section class="slide" data-slide="8">' +
'      <div class="slide-bg"><div class="grid-pattern"></div><div class="gradient-orb orb-1"></div></div>' +
'<div class="slide-content">' +
'        <div class="content-container">' +
'          <div class="chapter-label reveal-up">PART 02 · OpenClaw 龙虾</div>' +
'<h2 class="slide-title reveal-up stagger-1">为什么是 Mac Mini M4？</h2>' +
'<p class="slide-subtitle reveal-up stagger-2">性价比之王，个人 AI 工作室的最佳选择</p>' +
'<div class="two-column reveal-up stagger-3">' +
'<div class="image-container"><img src="https://img.alicdn.com/imgextra/i4/O1CN01uTjRCl1hWzEoKkwZr_!!6000000004284-2-tps-1600-1200.png" alt="Mac Mini M4"><div class="image-caption">Mac Mini M4：小巧强大</div></div>' +
'            <div>' +
'             <div class="card-grid" style="grid-template-columns: 1fr;">' +
'<div class="feature-card"><div class="card-icon">💰</div><div class="card-label">价格亲民</div><div class="card-desc">¥3000-5000，人人都能负担得起的 AI 工作站</div></div>' +
'               <div class="feature-card"><div class="card-icon">⚡</div><div class="card-label">能效比优秀</div><div class="card-desc">M4 芯片神经网络引擎，18 核心 GPU，推理速度惊人</div></div>' +
'<div class="feature-card"><div class="card-icon">🔇</div><div class="card-label">安静节能</div><div class="card-desc">低功耗设计，办公室/家庭都能用，不吵不热</div></div>' +
'<div class="feature-card"><div class="card-icon">🔌</div><div class="card-label">即开即用</div><div class="card-desc">无需复杂配置，开箱即可运行本地大模型</div></div>' +
'              </div>' +
'            </div>' +
'          </div>' +
'        </div>' +
'      </div>' +
'    </section>' +
'<!-- SLIDE 9: SAP 迁移场景 -->' +
'<section class="slide" data-slide="9">' +
'<div class="slide-bg"><div class="grid-pattern"></div><div class="gradient-orb orb-2"></div></div>' +
'<div class="slide-content">' +
'<div class="content-container">' +
'         <div class="chapter-label reveal-up">PART 02 · 八大实战场景</div>' +
'         <h2 class="slide-title reveal-up stagger-1">场景 1: SAP → 宜搭迁移</h2>' +
'         <p class="slide-subtitle reveal-up stagger-2">Agent 自动分析旧系统，生成新应用</p>' +
'<div class="two-column reveal-up stagger-3">' +
'            <div>' +
'             <p style="color: #a0a0b0; line-height: 1.8; margin-bottom: 20px;">传统方式需要数月的需求调研、系统设计、开发测试。现在，Agent 可以：</p>' +
'             <ul style="color: #a0a0b0; line-height: 2; list-style: none; padding: 0;">' +
'<li style="margin-bottom: 12px;">✅ <strong style="color: #6366f1;">自动读取</strong> SAP 表结构、业务逻辑</li>' +
'               <li style="margin-bottom: 12px;">✅<strong style="color: #6366f1;">自动生成</strong> 宜搭表单、流程、报表</li>' +
'                <li style="margin-bottom: 12px;">✅<strong style="color: #6366f1;">自动迁移</strong> 历史数据，保证一致性</li>' +
'                <li>✅ 