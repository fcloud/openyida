// ── 状态管理 ─────────────────────────────────────────────────
var _customState = {
  currentIndex: 0,
};

// ── 幻灯片数据 ────────────────────────────────────────────────
var SLIDES = [
  {
    type: 'cover',
    bg: '#ffffff',
    accent: '#c084fc',
    eyebrow: '2026 AI Agent 实战分享',
    title: '龙虾（OpenClaw）vs 悟空',
    subtitle: 'AI Agent 时代的人机协作新范式',
    meta: '杭远 · 钉钉华中区域解决方案总经理 · 2026.03',
  },
  {
    type: 'chapter',
    bg: '#f8f9fa',
    accent: '#c084fc',
    partNum: 'PART 01',
    title: '什么是 AI Agent？',
    subtitle: '从"问答机器"到"自主执行者"的进化',
  },
  {
    type: 'content',
    bg: '#f8f9fa',
    accent: '#c084fc',
    chapter: 'PART 01 · 什么是 AI Agent',
    title: 'Agent = 感知 + 规划 + 执行',
    points: [
      { icon: '👁️', label: '感知 Perceive', desc: '理解你的意图、读取上下文、分析当前状态' },
      { icon: '🧠', label: '规划 Plan', desc: '拆解任务、制定步骤、选择合适的工具' },
      { icon: '⚡', label: '执行 Act', desc: '调用 API、操作系统、生成内容、完成交付' },
      { icon: '🔄', label: '反思 Reflect', desc: '检查结果、发现错误、自动修正重试' },
    ],
  },
  {
    type: 'chapter',
    bg: '#f0f4f8',
    accent: '#0089ff',
    partNum: 'PART 02',
    title: 'OpenClaw 龙虾',
    subtitle: '开源 Agent 框架，三周超越 Linux 三十年',
  },
  {
    type: 'content',
    bg: '#f0f4f8',
    accent: '#0089ff',
    chapter: 'PART 02 · OpenClaw 龙虾',
    title: 'OpenClaw 爆火时间线',
    points: [
      { icon: '🛠️', label: '2025 年 11 月 · 诞生', desc: '独立开发者发布 OpenClaw，Logo 是只龙虾' },
      { icon: '🚀', label: '2026 年 3 月 6 日 · 引爆', desc: '腾讯云组织现场排队安装，话题席卷全网' },
      { icon: '📈', label: '3 周内 · 超越 Linux', desc: 'GitHub Stars 60 天斩获 28 万，史上增长最快' },
      { icon: '🏆', label: '黄仁勋 GTC 大会 · 封神', desc: '每家公司都需要制定龙虾战略' },
    ],
  },
  {
    type: 'chapter',
    bg: '#fefefe',
    accent: '#d97706',
    partNum: 'PART 03',
    title: '安全与企业级挑战',
    subtitle: '权限管不住、操作查不到、成本算不清',
  },
  {
    type: 'content',
    bg: '#fefefe',
    accent: '#d97706',
    chapter: 'PART 03 · 安全与企业级',
    title: '企业级 Agent 的不可能三角',
    points: [
      { icon: '🔓', label: '权限失控', desc: '可能爬取内网机密数据' },
      { icon: '🕳️', label: '黑盒不可审计', desc: '操作无日志，出问题无法溯源' },
      { icon: '💸', label: '成本算不清', desc: '死循环导致巨额 API 账单' },
    ],
  },
  {
    type: 'chapter',
    bg: '#f5f7fa',
    accent: '#00c9a7',
    partNum: 'PART 04',
    title: '悟空：企业级 AI Agent',
    subtitle: '安全、可控、算得清账',
  },
  {
    type: 'content',
    bg: '#f5f7fa',
    accent: '#00c9a7',
    chapter: 'PART 04 · 悟空',
    title: '悟空的三重安全防线',
    points: [
      { icon: '🔐', label: '原生权限继承', desc: '员工看不了的数据，Agent 也碰不到' },
      { icon: '📜', label: '全链路审计', desc: '每一步操作都有完整日志' },
      { icon: '⚙️', label: 'CLI 化底层重构', desc: '细粒度权限控制' },
    ],
  },
  {
    type: 'cover',
    bg: '#f5f7fa',
    accent: '#00c9a7',
    eyebrow: '谢谢观看',
    title: 'Q&A',
    subtitle: '让我们一起迎接 AI Agent 时代',
  },
];

// ── 辅助函数 ────────────────────────────────────────────────
export function setCustomState(newState) {
  for (var key in newState) {
    _customState[key] = newState[key];
  }
}

export function didMount() {
  setCustomState({ currentIndex: 0 });
}

export function didUnmount() {}

function goToSlide(index) {
  if (index< 0) index = 0;
  if (index >= SLIDES.length) index = SLIDES.length - 1;
  setCustomState({ currentIndex: index });
}

// ── 渲染函数 ────────────────────────────────────────────────
function renderSlide(slide, index) {
  var isActive = index === _customState.currentIndex;
  if (!isActive) {
    return null;
  }

  if (slide.type === 'cover') {
    return renderCover(slide);
  } else if (slide.type === 'chapter') {
    return renderChapter(slide);
  } else if (slide.type === 'content') {
    return renderContent(slide);
  }
  
  return null;
}

function renderCover(slide) {
  var childrenList = [];
  
  // eyebrow
  childrenList.push({
    type: 'div',
    props: {
      style: { color: slide.accent, fontSize: '18px', marginBottom: '20px', fontWeight: '500' },
      children: slide.eyebrow,
    },
  });
  
  // title
  childrenList.push({
    type: 'h1',
    props: {
      style: { fontSize: '42px', margin: '20px 0', color: '#1a1a1a', lineHeight: '1.2' },
      children: slide.title,
    },
  });
  
  // subtitle
  childrenList.push({
    type: 'p',
    props: {
      style: { fontSize: '22px', color: '#666', margin: '20px 0' },
      children: slide.subtitle,
    },
  });
  
  // meta
  childrenList.push({
    type: 'div',
    props: {
      style: { marginTop: '40px', paddingTop: '30px', borderTop: '2px solid ' + slide.accent },
      children: [{
        type: 'p',
        props: {
          style: { color: '#999', fontSize: '16px' },
          children: slide.meta,
        },
      }],
    },
  });
  
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '40px 20px',
        backgroundColor: slide.bg,
      },
      children: [{
        type: 'div',
        props: {
          style: { textAlign: 'center', maxWidth: '800px' },
          children: childrenList,
        },
      }],
    },
  };
}

function renderChapter(slide) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '40px 20px',
        backgroundColor: slide.bg,
      },
      children: [{
        type: 'div',
        props: {
          style: { textAlign: 'center', maxWidth: '800px' },
          children: [
            {
              type: 'p',
              props: {
                style: { fontSize: '18px', color: slide.accent, marginBottom: '20px', fontWeight: '600', letterSpacing: '3px' },
                children: slide.partNum,
              },
            },
            {
              type: 'h1',
              props: {
                style: { fontSize: '48px', color: '#1a1a1a', marginBottom: '20px', lineHeight: '1.2' },
                children: slide.title,
              },
            },
            {
              type: 'p',
              props: {
                style: { fontSize: '22px', color: '#666' },
                children: slide.subtitle,
              },
            },
          ],
        },
      }],
    },
  };
}

function renderContent(slide) {
  var pointsChildren = [];
  for (var i = 0; i < slide.points.length; i++) {
    var point = slide.points[i];
    pointsChildren.push({
      type: 'div',
      props: {
        style: {
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '16px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { fontSize: '28px', marginBottom: '10px' },
              children: point.icon,
            },
          },
          {
            type: 'h3',
            props: {
              style: { fontSize: '16px', color: '#1a1a1a', marginBottom: '6px', fontWeight: '600' },
              children: point.label,
            },
          },
          {
            type: 'p',
            props: {
              style: { fontSize: '14px', color: '#666', lineHeight: '1.5', margin: 0 },
              children: point.desc,
            },
          },
        ],
      },
    });
  }
  
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        padding: '40px 20px',
        backgroundColor: slide.bg,
      },
      children: [{
        type: 'div',
        props: {
          style: { maxWidth: '1000px', width: '100%', margin: '0 auto' },
          children: [
            {
              type: 'p',
              props: {
                style: { color: slide.accent, fontSize: '14px', marginBottom: '12px' },
                children: slide.chapter,
              },
            },
            {
              type: 'h2',
              props: {
                style: { fontSize: '32px', color: '#1a1a1a', marginBottom: '30px' },
                children: slide.title,
              },
            },
            {
              type: 'div',
              props: {
                children: pointsChildren,
              },
            },
          ],
        },
      }],
    },
  };
}

export function renderJsx() {
  var slideElements = [];
  for (var i = 0; i < SLIDES.length; i++) {
    var rendered = renderSlide(SLIDES[i], i);
    if (rendered) {
      slideElements.push(rendered);
    }
  }
  
  // 添加导航按钮
  var navButtons = {
    type: 'div',
    props: {
      style: {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        display: 'flex',
        gap: '12px',
        zIndex: 1000,
      },
      children: [
        {
          type: 'button',
          props: {
            onClick: function() { goToSlide(_customState.currentIndex - 1); },
            style: {
              padding: '12px 20px',
              backgroundColor: _customState.currentIndex === 0 ? '#ccc' : '#c084fc',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            },
            children: '← 上一页',
          },
        },
        {
          type: 'span',
          props: {
            style: {
              padding: '12px 20px',
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#666',
            },
            children: (_customState.currentIndex + 1) + ' / ' + SLIDES.length,
          },
        },
        {
          type: 'button',
          props: {
            onClick: function() { goToSlide(_customState.currentIndex + 1); },
            style: {
              padding: '12px 20px',
              backgroundColor: _customState.currentIndex === SLIDES.length - 1 ? '#ccc' : '#c084fc',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            },
            children: '下一页 →',
          },
        },
      ],
    },
  };
  
  slideElements.push(navButtons);
  
  return {
    type: 'div',
    props: {
      style: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      children: slideElements,
    },
  };
}
