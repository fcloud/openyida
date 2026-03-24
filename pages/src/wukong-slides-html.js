// ── 状态管理 ─────────────────────────────────────────────────
var _customState = {
  currentIndex: 0,
};

// ── 幻灯片数据 ────────────────────────────────────────────────
var SLIDES = [
  {
    type: 'cover',
    bg: '#0a0a0f',
    accent: '#6366f1',
    eyebrow: '2026 AI Agent 实战分享',
    title: '龙虾（OpenClaw）vs 悟空',
    subtitle: 'AI Agent 时代的人机协作新范式',
    meta: '杭远 · 钉钉华中区域解决方案总经理 · 2026.03',
  },
  {
    type: 'chapter',
    bg: '#0a0a0f',
    accent: '#6366f1',
    partNum: 'PART 01',
    title: '什么是 AI Agent？',
    subtitle: '从"问答机器"到"自主执行者"的进化',
  },
  {
    type: 'content',
    bg: '#0a0a0f',
    accent: '#6366f1',
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
    bg: '#0a0a0f',
    accent: '#0ea5e9',
    partNum: 'PART 02',
    title: 'OpenClaw 龙虾',
    subtitle: '开源 Agent 框架，三周超越 Linux 三十年',
  },
  {
    type: 'content',
    bg: '#0a0a0f',
    accent: '#0ea5e9',
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
    bg: '#0a0a0f',
    accent: '#d97706',
    partNum: 'PART 03',
    title: '安全与企业级挑战',
    subtitle: '权限管不住、操作查不到、成本算不清',
  },
  {
    type: 'content',
    bg: '#0a0a0f',
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
    bg: '#0a0a0f',
    accent: '#00c9a7',
    partNum: 'PART 04',
    title: '悟空：企业级 AI Agent',
    subtitle: '安全、可控、算得清账',
  },
  {
    type: 'content',
    bg: '#0a0a0f',
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
    bg: '#0a0a0f',
    accent: '#00c9a7',
    eyebrow: '谢谢观看',
    title: 'Q&A',
    subtitle: '让我们一起迎接 AI Agent 时代',
    meta: '杭远 · 钉钉华中区域解决方案总经理',
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
  if (index < 0) index = 0;
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
  var childrenArray = [];
  
  childrenArray.push({
    type: 'div',
    props: {
      style: { color: slide.accent, fontSize: '18px', marginBottom: '20px', fontWeight: '600', letterSpacing: '0.2em', textTransform: 'uppercase' },
      children: String(slide.eyebrow || ''),
    },
  });
  
  childrenArray.push({
    type: 'h1',
    props: {
      style: { fontSize: '48px', margin: '20px 0', color: '#ffffff', lineHeight: '1.2' },
      children: String(slide.title || ''),
    },
  });
  
  childrenArray.push({
    type: 'p',
    props: {
      style: { fontSize: '22px', color: '#a0a0b0', margin: '20px 0' },
      children: String(slide.subtitle || ''),
    },
  });
  
  if (slide.meta) {
    childrenArray.push({
      type: 'div',
      props: {
        style: { marginTop: '40px', paddingTop: '30px', borderTop: '2px solid ' + slide.accent },
        children: [{
          type: 'p',
          props: {
            style: { color: '#6b6b7b', fontSize: '16px' },
            children: String(slide.meta),
          },
        }],
      },
    });
  }
  
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
          children: childrenArray,
        },
      }],
    },
  };
}

function renderChapter(slide) {
  var partNumberStyle = {};
  if (slide.partNum) {
    partNumberStyle = {
      fontSize: '120px',
      fontWeight: '600',
      color: slide.accent + '33',
      lineHeight: '1',
      marginBottom: '-40px',
    };
  }
  
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
                style: partNumberStyle,
                children: String(slide.partNum || ''),
              },
            },
            {
              type: 'h1',
              props: {
                style: { fontSize: '48px', color: '#ffffff', marginBottom: '20px', lineHeight: '1.2' },
                children: String(slide.title || ''),
              },
            },
            {
              type: 'p',
              props: {
                style: { fontSize: '22px', color: '#a0a0b0' },
                children: String(slide.subtitle || ''),
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
          padding: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '16px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { fontSize: '32px', marginBottom: '12px' },
              children: String(point.icon || ''),
            },
          },
          {
            type: 'h3',
            props: {
              style: { fontSize: '18px', color: '#ffffff', marginBottom: '8px', fontWeight: '600' },
              children: String(point.label || ''),
            },
          },
          {
            type: 'p',
            props: {
              style: { fontSize: '14px', color: '#a0a0b0', lineHeight: '1.6', margin: 0 },
              children: String(point.desc || ''),
            },
          },
        ],
      },
    });
  }
  
  var chapterLabel = '';
  if (slide.chapter) {
    chapterLabel = {
      type: 'p',
      props: {
        style: { color: slide.accent, fontSize: '14px', marginBottom: '12px', letterSpacing: '0.15em', textTransform: 'uppercase' },
        children: String(slide.chapter),
      },
    };
  }
  
  var titleElement = {
    type: 'h2',
    props: {
      style: { fontSize: '32px', color: '#ffffff', marginBottom: '30px' },
      children: String(slide.title || ''),
    },
  };
  
  var contentChildren = chapterLabel ? [chapterLabel, titleElement] : [titleElement];
  contentChildren.push({
    type: 'div',
    props: {
      children: pointsChildren,
    },
  });
  
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
          children: contentChildren,
        },
      }],
    },
  };
}

export function renderJsx() {
  var slideElements = [];
  for (var i = 0; i < SLIDES.length; i++) {
    var rendered = renderSlide(SLIDES[i], i);
    if (rendered !== null && rendered !== undefined) {
      slideElements.push(rendered);
    }
  }
  
  // 添加导航按钮
  var prevDisabled = _customState.currentIndex === 0;
  var nextDisabled = _customState.currentIndex === SLIDES.length - 1;
  
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
            disabled: prevDisabled,
            style: {
              padding: '12px 20px',
              backgroundColor: prevDisabled ? '#333' : '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: prevDisabled ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              opacity: prevDisabled ? 0.5 : 1,
            },
            children: '← 上一页',
          },
        },
        {
          type: 'span',
          props: {
            style: {
              padding: '12px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#a0a0b0',
            },
            children: String((_customState.currentIndex + 1) + ' / ' + SLIDES.length),
          },
        },
        {
          type: 'button',
          props: {
            onClick: function() { goToSlide(_customState.currentIndex + 1); },
            disabled: nextDisabled,
            style: {
              padding: '12px 20px',
              backgroundColor: nextDisabled ? '#333' : '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: nextDisabled ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              opacity: nextDisabled ? 0.5 : 1,
            },
            children: '下一页 →',
          },
        },
      ],
    },
  };
  
  slideElements.push(navButtons);
  
  // 添加页码显示
  var counterElement = {
    type: 'div',
    props: {
      style: {
        position: 'fixed',
        bottom: '30px',
        left: '30px',
        fontSize: '14px',
        color: '#6b6b7b',
        zIndex: 1000,
      },
      children: String((_customState.currentIndex + 1) + ' / ' + SLIDES.length),
    },
  };
  
  slideElements.push(counterElement);
  
  return {
    type: 'div',
    props: {
      style: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#0a0a0f',
        color: '#ffffff',
      },
      children: slideElements,
    },
  };
}
