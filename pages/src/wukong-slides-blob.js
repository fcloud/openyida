// ── 状态管理 ─────────────────────────────────────────────────
var _customState = {
  iframeSrc: '',
};

// ── 完整的 HTML 内容（深色科技风）──────────────────────────
var HTML_CONTENT = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>龙虾 vs 悟空</title><style>*{margin:0;padding:0;box-sizing:border-box}:root{--bg-primary:#0a0a0f;--bg-secondary:#12121a;--bg-card:rgba(255,255,255,0.05);--text-primary:#ffffff;--text-secondary:#a0a0b0;--text-muted:#6b6b7b;--accent:#6366f1;--accent-light:#818cf8;--accent-glow:rgba(99,102,241,0.4);--accent-soft:rgba(99,102,241,0.1);--border:rgba(255,255,255,0.1)}body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:var(--bg-primary);color:var(--text-primary);overflow:hidden;height:100vh}.slide{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40px;opacity:0;visibility:hidden;transition:opacity 0.6s}.slide.active{opacity:1;visibility:visible;z-index:1}.nav-dots{position:fixed;right:30px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:12px;z-index:100}.nav-dot{width:12px;height:12px;border-radius:50%;background:var(--border);border:none;cursor:pointer;transition:all 0.3s}.nav-dot.active{background:var(--accent);transform:scale(1.2)}.counter{position:fixed;bottom:30px;left:30px;font-size:14px;color:var(--text-muted);z-index:100}.btn{position:fixed;bottom:30px;right:30px;padding:12px 24px;background:var(--accent);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:16px;z-index:100}.btn:disabled{background:#333;cursor:not-allowed}</style></head><body><div class="nav-dots" id="dots"></div><div class="counter" id="counter">1/24</div><button class="btn" id="nextBtn" onclick="nextSlide()">下一页 →</button><div id="slides"></div><script>var slides=[{eyebrow:"2026 AI Agent 实战分享",title:"龙虾 (OpenClaw)<br>vs 悟空",subtitle:"AI Agent 时代的人机协作新范式",meta:"杭远·钉钉华中区域解决方案总经理·2026.03"},{partNum:"PART 01",title:"什么是 AI Agent？",subtitle:"从问答机器到自主执行者的进化"},{chapter:"PART 01·什么是 AI Agent",title:"Agent=感知 + 规划 + 执行",points:[{icon:"👁️",label:"感知 Perceive",desc:"理解你的意图、读取上下文、分析当前状态"},{icon:"🧠",label:"规划 Plan",desc:"拆解任务、制定步骤、选择合适的工具"},{icon:"⚡",label:"执行 Act",desc:"调用 API、操作系统、生成内容、完成交付"},{icon:"🔄",label:"反思 Reflect",desc:"检查结果、发现错误、自动修正重试"}]},{partNum:"PART 02",title:"OpenClaw 龙虾",subtitle:"开源 Agent 框架，三周超越 Linux 三十年"},{chapter:"PART 02·OpenClaw 龙虾",title:"OpenClaw 爆火时间线",points:[{icon:"🛠️",label:"2025 年 11 月·诞生",desc:"独立开发者发布 OpenClaw，Logo 是只龙虾"},{icon:"🚀",label:"2026 年 3 月 6 日·引爆",desc:"腾讯云组织现场排队安装，话题席卷全网"},{icon:"📈",label:"3 周内·超越 Linux",desc:"GitHub Stars 60 天斩获 28 万，史上增长最快"},{icon:"🏆",label:"黄仁勋 GTC 大会·封神",desc:"每家公司都需要制定龙虾战略"}]},{partNum:"PART 03",title:"安全与企业级挑战",subtitle:"权限管不住、操作查不到、成本算不清"},{chapter:"PART 03·安全与企业级",title:"企业级 Agent 的不可能三角",points:[{icon:"🔓",label:"权限失控",desc:"可能爬取内网机密数据"},{icon:"🕳️",label:"黑盒不可审计",desc:"操作无日志，出问题无法溯源"},{icon:"💸",label:"成本算不清",desc:"死循环导致巨额 API 账单"}]},{partNum:"PART 04",title:"悟空：企业级 AI Agent",subtitle:"安全、可控、算得清账"},{chapter:"PART 04·悟空",title:"悟空的三重安全防线",points:[{icon:"🔐",label:"原生权限继承",desc:"员工看不了的数据，Agent 也碰不到"},{icon:"📜",label:"全链路审计",desc:"每一步操作都有完整日志"},{icon:"⚙️",label:"CLI 化底层重构",desc:"细粒度权限控制"}]}];var current=0;function render(){var s=slides[current],h="";if(s.eyebrow){h=\'<div style="text-align:center;color:var(--accent);font-size:18px;margin-bottom:20px;letter-spacing:0.2em;text-transform:uppercase">\'+s.eyebrow+\'</div><h1 style="font-size:48px;margin:20px 0;color:#fff;line-height:1.2">\'+s.title+\'</h1><p style="font-size:22px;color:var(--text-secondary)">\'+s.subtitle+\'</p>\'+(s.meta?\'<div style="margin-top:40px;padding-top:30px;border-top:2px solid var(--accent)"><p style="color:var(--text-muted);font-size:16px">\'+s.meta+\'</p></div>\':\'\')}else if(s.partNum){h=\'<p style="font-size:120px;color:var(--accent-soft);line-height:1;margin-bottom:-40px">\'+s.partNum+\'</p><h1 style="font-size:48px;color:#fff;margin:20px 0">\'+s.title+\'</h1><p style="font-size:22px;color:var(--text-secondary)">\'+s.subtitle+\'</p>\'}else if(s.chapter){h=\'<p style="color:var(--accent);font-size:14px;margin-bottom:12px;letter-spacing:0.15em;text-transform:uppercase">\'+s.chapter+\'</p><h2 style="font-size:32px;color:#fff;margin-bottom:30px">\'+s.title+\'</h2>\'+s.points.map(function(p){return\'<div style="padding:24px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;margin-bottom:16px"><div style="font-size:32px;margin-bottom:12px">\'+p.icon+\'</div><h3 style="font-size:18px;color:#fff;margin-bottom:8px">\'+p.label+\'</h3><p style="font-size:14px;color:var(--text-secondary);line-height:1.6;margin:0">\'+p.desc+\'</p></div>\'}).join(\'\')}document.getElementById(\'slides\').innerHTML=\'<div class="slide active">\'+h+\'</div>\';document.getElementById(\'counter\').textContent=(current+1)+\'/\'+slides.length;var d=document.getElementById(\'dots\');d.innerHTML=\'\';for(var i=0;i<slides.length;i++){d.innerHTML+=\'<button class="nav-dot\'+(i===current?\' active\':\'\')" onclick="goTo(\'+i+\')"></button>\'}document.getElementById(\'nextBtn\').disabled=current>=slides.length-1}function nextSlide(){if(current<slides.length-1){current++;render()}}function goTo(i){current=i;render()}document.addEventListener(\'keydown\',function(e){if(e.key===\'ArrowRight\'||e.key===\'ArrowDown\'||e.key===\' \'){nextSlide()}});render()</script></body></html>';

// ── 辅助函数 ────────────────────────────────────────────────
export function setCustomState(newState) {
  for (var key in newState) {
    _customState[key] = newState[key];
  }
}

export function didMount() {
  // 创建 Blob URL
  var blob = new Blob([HTML_CONTENT], { type: 'text/html' });
  var url = URL.createObjectURL(blob);
  setCustomState({ iframeSrc: url });
}

export function didUnmount() {}

// ── 渲染函数 ────────────────────────────────────────────────
export function renderJsx() {
  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      },
      children: [{
        type: 'iframe',
        props: {
          src: _customState.iframeSrc || '',
          style: {
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          },
          frameborder: '0',
          scrolling: 'no',
        },
      }],
    },
  };
}
