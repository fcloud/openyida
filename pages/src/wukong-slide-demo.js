// ── 状态管理 ─────────────────────────────────────────────────
var _customState = {
  currentIndex: 0,
  total: 0,
  isMobile: false,
};

// ── 幻灯片数据 ────────────────────────────────────────────────
var SLIDES = [
  // ── 封面 ──────────────────────────────────────────────────
  {
    type: 'cover',
    bg: '#ffffff',
    accent: '#c084fc',
    eyebrow: '2026 AI Agent 实战分享',
    title: '龙虾（OpenClaw）vs 悟空',
    subtitle: 'AI Agent 时代的人机协作新范式',
    meta: '杭远 · 钉钉华中区域解决方案总经理 · 2026.03',
    tags: ['AI Agent', 'OpenClaw', '悟空', '宜搭', 'ATH'],
  },

  // ── 目录 ──────────────────────────────────────────────────
  {
    type: 'toc',
    bg: '#ffffff',
    accent: '#c084fc',
    title: '今日分享',
    items: [
      { num: '01', title: '什么是 AI Agent', desc: '从概念到实践，理解 Agent 的本质' },
      { num: '02', title: 'OpenClaw 龙虾', desc: '开源 Agent 框架，三周超越 Linux 三十年' },
      { num: '03', title: '安全与企业级', desc: '机遇与风险并存，国家怎么看龙虾' },
      { num: '04', title: '悟空', desc: '阿里企业 AI 原生工作平台，重新定义人机协作' },
    ],
  },

  // ── 关于我 ────────────────────────────────────────────────
  {
    type: 'key-points',
    bg: '#ffffff',
    accent: '#c084fc',
    chapter: '演讲者介绍',
    title: '杭远',
    subtitle: '钉钉华中区域解决方案总经理',
    points: [
      { icon: '🏢', label: '钉钉华中区域解决方案总经理', desc: '负责钉钉在华中区域的企业数字化解决方案，推动 AI 与企业管理深度融合' },
      { icon: '🤖', label: '企业 AI 实践者', desc: '深度参与企业智能场景落地，探索 AI Agent 在企业服务中的创新应用' },
      { icon: '🦞', label: 'OpenYida + 宜搭 CLI 推动者', desc: '让 AI 驱动低代码，让每个企业都能快速构建智能化应用' },
    ],
  },

  // ── Vibe Coding ───────────────────────────────────────────
  {
    type: 'image-text',
    bg: '#ffffff',
    accent: '#c084fc',
    chapter: '开发方式',
    title: '这个 PPT，是在悟空上做的',
    subtitle: 'Vibe Coding：用 AI 对话驱动开发，随时随地',
    body: '通过悟空平台 + OpenYida 技能，对话式完成了整套演讲 PPT 的开发和发布。\n\n这就是 AI Agent 的力量——不是未来，是现在。',
    imageUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01TB05pI1HpekqOi75D_!!6000000000807-2-tps-2190-1470.png',
    imageLabel: '悟空 Vibe Coding',
  },

  // ── Part 1 章节页 ─────────────────────────────────────────
  {
    type: 'chapter',
    bg: '#f8f9fa',
    accent: '#c084fc',
    partNum: 'PART 01',
    title: '什么是 AI Agent？',
    subtitle: '从"问答机器"到"自主执行者"的进化',
  },

  // ── Agent 定义 ────────────────────────────────────────────
  {
    type: 'key-points',
    bg: '#f8f9fa',
    accent: '#c084fc',
    chapter: 'PART 01 · 什么是 AI Agent',
    title: 'Agent = 感知 + 规划 + 执行',
    subtitle: '不只是聊天，而是真正帮你把事情做完',
    points: [
      { icon: '👁️', label: '感知 Perceive', desc: '理解你的意图、读取上下文、分析当前状态' },
      { icon: '🧠', label: '规划 Plan', desc: '拆解任务、制定步骤、选择合适的工具' },
      { icon: '⚡', label: '执行 Act', desc: '调用 API、操作系统、生成内容、完成交付' },
      { icon: '🔄', label: '反思 Reflect', desc: '检查结果、发现错误、自动修正重试' },
    ],
  },

  // ── Part 2 章节页：OpenClaw 龙虾 ─────────────────────────
  {
    type: 'chapter',
    bg: '#f0f4f8',
    accent: '#0089ff',
    partNum: 'PART 02',
    title: 'OpenClaw 龙虾',
    subtitle: '开放的 AI Agent，让每个人都能用上超级助手',
    desc: '从个人效率到团队协作，龙虾正在改变工作方式',
  },

  // ── OpenClaw 爆火时间线 ──────────────────────────────────
  {
    type: 'key-points',
    bg: '#f0f4f8',
    accent: '#0089ff',
    chapter: 'PART 02 · OpenClaw 龙虾',
    title: 'OpenClaw 是怎么火起来的？',
    subtitle: '从一个开源项目，到改变世界的软件——只用了三周',
    points: [
      { icon: '🛠️', label: '2025 年 11 月 · 诞生', desc: '一位独立开发者发布 OpenClaw，一个让 AI 真正操控电脑的开源 Agent 框架。Logo 是只龙虾，中文圈戏称"养龙虾"' },
      { icon: '🚀', label: '2026 年 3 月 6 日 · 引爆', desc: '腾讯云在深圳腾讯大厦门前广场组织现场排队安装活动，"养龙虾"话题席卷全网，全民跟风入局' },
      { icon: '📈', label: '3 周内 · 超越 Linux', desc: 'GitHub Stars 60 天斩获 28 万，下载量在三周内超越 Linux 三十年的积累——史上增长最快的开源项目' },
      { icon: '🏆', label: '黄仁勋 GTC 大会 · 封神', desc: '英伟达 CEO 黄仁勋在 GTC 大会上高度评价："这是我们这个时代最重要的软件发布，每家公司都需要制定龙虾战略"' },
    ],
  },

  // ── 场景 1：Mac Mini 本地部署 ──────────────────────────────
  {
    type: 'scene-image',
    bg: '#f0f4f8',
    accent: '#0089ff',
    chapter: 'PART 02 · OpenClaw 龙虾',
    sceneNum: 'SCENE 01',
    title: 'Mac Mini M4：最佳本地 AI 实验平台',
    subtitle: '低成本、低功耗、高性能，7×24 小时在线',
    body: '在部署龙虾的过程中，我尝试了云服务器、Windows PC、Linux 主机，最终发现 Mac Mini M4 是最优解：\n\n38 TOPS ANE 算力 → 7B-13B 模型推理 19-20 tokens/s\n待机仅 3-6W，年电费不足 50 元，静音被动散热\n16GB 统一内存，实际可用性接近传统 PC 的 32GB\n\nMac Mini M4 + 龙虾 = 完美的本地 AI 实验平台。',
    imageUrl: 'https://img.alicdn.com/imgextra/i3/O1CN014yYsDR1jS7dzzVtin_!!6000000004546-0-tps-1320-2231.jpg',
    imageLabel: 'Mac Mini M4 本地 AI 工作站',
    tag: '🖥️ 本地部署',
  },

  // ── 场景 2：SAP → 宜搭迁移 ────────────────────────────────
  {
    type: 'scene-image',
    bg: '#f0f4f8',
    accent: '#0089ff',
    chapter: 'PART 02 · OpenClaw 龙虾',
    sceneNum: 'SCENE 02',
    title: '用 OpenYida 复刻 SAP 系统',
    subtitle: 'AI 自动学习 SAP 架构，宜搭快速复刻 + 数据迁移',
    body: '企业用了十几年的 SAP，想换但迁移成本太高？\n\nOpenYida 自动分析 SAP 系统架构和业务逻辑 → 在宜搭上快速复刻对应的表单、流程和权限体系 → 历史数据一键迁移 → 通过 HTTP 连接器与 SAP 保持实时数据连接\n\n不是推倒重来，而是平滑过渡——新系统上线，旧系统数据不丢失。',
    imageUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01fs5WhH1m1VTW9ZMhK_!!6000000004894-0-tps-1320-2051.jpg',
    imageLabel: 'SAP → 宜搭系统迁移',
    tag: '🏗️ 系统迁移',
  },

  // ── 场景 3：自动提需求 ─────────────────────────────────────
  {
    type: 'scene-image',
    bg: '#f0f4f8',
    accent: '#0089ff',
    chapter: 'PART 02 · OpenClaw 龙虾',
    sceneNum: 'SCENE 03',
    title: 'Agent 自动提需求',
    subtitle: '从"用户反馈"到"需求工单"全自动',
    body: 'Agent 持续监控用户反馈渠道：\n\n聚类相似问题 → 分析优先级 → 生成标准需求文档 → 自动创建工单\n\n产品经理从"整理反馈"中解放出来。',
    imageUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01YgmZx126P8DjenDGD_!!6000000007653-0-tps-1320-1160.jpg',
    imageLabel: 'Agent 自动提需求工单',
    tag: '📋 流程自动化',
  },

  // ── 场景 4：小红书 ─────────────────────────────────────────
  {
    type: 'scene-image',
    bg: '#f0f4f8',
    accent: '#0089ff',
    chapter: 'PART 02 · OpenClaw 龙虾',
    sceneNum: 'SCENE 04',
    title: '一键生成小红书笔记',
    subtitle: '输入主题，输出爆款格式内容',
    body: '告诉 Agent 你想分享什么，它自动：\n\n分析爆款结构 → 生成标题 + 正文 + 标签 → 配图建议 → 发布时间推荐\n\n内容创作效率提升 10 倍。',
    imageUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01BS7oDq1haFRJB7PoG_!!6000000004293-0-tps-1076-2103.jpg',
    imageLabel: '小红书内容自动生成',
    tag: '✍️ 内容创作',
  },

  // ── 场景 5：微信公众号 NotebookLM ─────────────────────────
  {
    type: 'scene-image',
    bg: '#f0f4f8',
    accent: '#0089ff',
    chapter: 'PART 02 · OpenClaw 龙虾',
    sceneNum: 'SCENE 05',
    title: '把公众号当 NotebookLM 用',
    subtitle: '让 OpenClaw 帮你消化所有订阅内容',
    body: '关注了几百个公众号，但根本看不完？\n\nOpenClaw 自动抓取订阅公众号的最新文章 → 提炼核心观点 → 建立个人知识库 → 随时问随时答\n\n就像 NotebookLM，但内容来源是你精心挑选的公众号。\n\n"帮我总结今天 AI 领域的公众号更新" → 一句话搞定。',
    imageUrl: 'https://img.alicdn.com/imgextra/i1/O1CN01Rie0TX1Q22O4coira_!!6000000001917-0-tps-1320-2168.jpg',
    imageLabel: '公众号内容知识库',
    tag: '📚 知识管理',
  },

  // ── 过渡：安全边界 ────────────────────────────────────────
  {
    type: 'chapter',
    bg: '#fefefe',
    accent: '#d97706',
    partNum: 'PART 03',
    title: '但是……安全呢？',
    subtitle: '开放的 Agent 能力越强，企业级顾虑越多',
    desc: '数据安全、权限管控、合规审计——这些是企业无法绕过的门槛',
  },

  // ── 企业不可能三角 ───────────────────────────────────────
  {
    type: 'key-points',
    bg: '#fefefe',
    accent: '#d97706',
    chapter: 'PART 03 · 安全与企业级',
    title: '企业级 Agent 的"不可能三角"',
    subtitle: '"权限管不住、操作查不到、成本算不清" — 无招',
    points: [
      { icon: '🔓', label: '权限失控', desc: '龙虾为了完成任务，可能顺着内网爬取 CFO 电脑里的核心财务报表，机密数据发给未知第三方模型' },
      { icon: '🕳️', label: '黑盒不可审计', desc: 'Meta 安全总监亲测：安装龙虾后，200 多封重要邮件瞬间被删得干干净净，找都找不回来' },
      { icon: '💸', label: '成本算不清', desc: 'Agent 陷入死循环，不断发起万次无效 API 请求，月底云计算账单老板根本搞不清钱花在哪' },
      { icon: '⚠️', label: '企业的结论', desc: '大厂 IT 部门和合规团队正在下达死命令：严禁任何员工在真实业务系统中接入龙虾' },
    ],
  },

  // ── AI 安全 ───────────────────────────────────────────────
  {
    type: 'key-points',
    bg: '#fefefe',
    accent: '#d97706',
    chapter: 'PART 03 · 安全与企业级',
    title: 'AI 安全：不可忽视的红线',
    subtitle: '自主执行能力越强，风险管控越重要',
    points: [
      { icon: '🔑', label: '权限最小化原则', desc: 'Agent 只能访问完成任务所必需的最小权限范围，员工看不了的数据，他的 Agent 也绝对碰不到' },
      { icon: '📋', label: '操作全链路可审计', desc: '每一步操作都有完整日志记录，出了问题可以精确溯源，不再是黑盒' },
      { icon: '🛑', label: '关键步骤人工确认', desc: '涉及删除、转账、外发等高风险操作，必须人工二次确认，不允许 Agent 自主执行' },
      { icon: '⚡', label: '异常自动熔断', desc: '检测到死循环、异常调用频率或可疑行为时，立即中断 Agent 执行，保护系统安全' },
    ],
  },

  // ── 国家政策：龙虾的官方态度 ─────────────────────────────
  {
    type: 'key-points',
    bg: '#fefefe',
    accent: '#d97706',
    chapter: 'PART 03 · 安全与企业级',
    title: '国家怎么看"龙虾"？',
    subtitle: '鼓励与警惕并行，监管正在跟上',
    points: [
      { icon: '🏛️', label: '深圳龙岗"龙虾十条"', desc: '鼓励推出"龙虾服务区"，免费提供 OpenClaw 部署服务，最高补贴 500 万元——地方政府率先入场' },
      { icon: '⚠️', label: '工信部发出安全警示', desc: '工信部网络安全平台监测发现：OpenClaw 部分实例在默认或不当配置下存在严重安全风险，提醒警惕' },
      { icon: '🔒', label: 'CNNVD：82 个漏洞，12 个超危', desc: '国家信息安全漏洞库统计，2026 年 1-3 月 OpenClaw 已发现漏洞 82 个，其中超危 12 个、高危 21 个' },
      { icon: '🚫', label: '国企和政府机关：非必要不部署', desc: '多家央企、国企 IT 部门下达禁令，严禁员工在真实业务系统中接入龙虾，合规压力倒逼企业级方案' },
    ],
  },

  // ── Part 4 章节页：悟空 ──────────────────────────────────
  {
    type: 'chapter',
    bg: '#f5f7fa',
    accent: '#00c9a7',
    partNum: 'PART 04',
    title: '悟空：企业级 AI Agent',
    subtitle: '龙虾是"野生 Agent"，悟空是"正规军"',
    desc: '阿里巴巴出品，专为企业场景设计——安全、可控、算得清账',
  },

  // ── 无招金句 ──────────────────────────────────────────────
  {
    type: 'key-points',
    bg: '#fefefe',
    accent: '#d97706',
    chapter: 'PART 04 · 悟空',
    title: '阿里无招说',
    subtitle: '悟空发布会现场金句',
    points: [
      { icon: '💥', label: '"今天，我们把钉钉打碎，用 AI 重建，炼出悟空。"', desc: '2026.03.17 悟空发布会开场' },
      { icon: '🔮', label: '"过去是人用钉钉来工作，未来是 AI 用钉钉来工作。"', desc: '重新定义人机协作的底层逻辑' },
      { icon: '🦞', label: '"龙虾关在主机里，是因为我们还没准备好放生它。"', desc: '解释为何悟空晚于龙虾发布' },
      { icon: '🛡️', label: '"宁愿晚生，也要把安全做到极致。"', desc: '悟空安全设计理念' },
    ],
  },

  // ── ATH 事业群 ────────────────────────────────────────────
  {
    type: 'key-points',
    bg: '#f5f7fa',
    accent: '#00c9a7',
    chapter: 'PART 04 · 悟空',
    title: 'ATH 事业群：阿里 AI 战略全面升级',
    subtitle: '2026 年 3 月 16 日，吴泳铭直接挂帅，Token 成为新型"水电煤"',
    points: [
      { icon: '🧬', label: '通义实验室', desc: '创造领先的多模态模型，追求基础模型能力上限' },
      { icon: '☁️', label: 'MaaS 业务线', desc: '构建高效开放的模型服务平台，支撑全行业 AI 生态' },
      { icon: '👤', label: '千问事业部', desc: '打造最好的个人 AI 助手（To C），面向亿级用户' },
      { icon: '🏢', label: '悟空事业部', desc: '打造 B 端 AI 原生工作平台（To B），覆盖 2000 万企业' },
    ],
  },

  // ── 悟空三大安全杀器 ──────────────────────────────────────
  {
    type: 'key-points',
    bg: '#fefefe',
    accent: '#00c9a7',
    chapter: 'PART 04 · 悟空',
    title: '悟空的三重安全防线',
    subtitle: '企业级 Agent 的安全基石',
    points: [
      { icon: '🔐', label: '原生权限继承', desc: 'Agent 自动继承员工在钉钉/宜搭中的现有权限，员工看不了的数据，Agent 也绝对碰不到' },
      { icon: '📜', label: '全链路审计', desc: '每一步操作都有完整日志记录，支持精确溯源和责任认定' },
      { icon: '⚙️', label: 'CLI 化底层重构', desc: '通过命令行接口实现细粒度权限控制，确保企业数据绝对可控' },
    ],
  },

  // ── 结束页 ────────────────────────────────────────────────
  {
    type: 'cover',
    bg: '#f5f7fa',
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
  setCustomState({
    currentIndex: 0,
    total: SLIDES.length,
    isMobile: typeof window !== 'undefined' && window.innerWidth< 768,
  });
  
  // 键盘导航
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeyDown);
  }
}

export function didUnmount() {
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleKeyDown);
  }
}

function handleKeyDown(e) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
    e.preventDefault();
    goToSlide(_customState.currentIndex + 1);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    goToSlide(_customState.currentIndex - 1);
  }
}

function goToSlide(index) {
  if (index < 0) index = 0;
  if (index >= SLIDES.length) index = SLIDES.length - 1;
  setCustomState({ currentIndex: index });
}

function renderNavigation() {
  return {
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
            disabled: _customState.currentIndex === 0,
            style: {
              padding: '12px 20px',
              backgroundColor: _customState.currentIndex === 0 ? '#ccc' : '#c084fc',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: _customState.currentIndex === 0 ? 'not-allowed' : 'pointer',
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
            disabled: _customState.currentIndex === SLIDES.length - 1,
            style: {
              padding: '12px 20px',
              backgroundColor: _customState.currentIndex === SLIDES.length - 1 ? '#ccc' : '#c084fc',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: _customState.currentIndex === SLIDES.length - 1 ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            },
            children: '下一页 →',
          },
        },
      ],
    },
  };
}

function renderSlide(slide, index) {
  var isActive = index === _customState.currentIndex;
  var style = {
    display: isActive ? 'flex' : 'none',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '40px 20px',
    backgroundColor: slide.bg || '#ffffff',
    transition: 'all 0.3s ease',
  };

  if (slide.type === 'cover') {
    return renderCover(slide, style);
  } else if (slide.type === 'toc') {
    return renderToc(slide, style);
  } else if (slide.type === 'key-points') {
    return renderKeyPoints(slide, style);
  } else if (slide.type === 'image-text') {
    return renderImageText(slide, style);
  } else if (slide.type === 'chapter') {
    return renderChapter(slide, style);
  } else if (slide.type === 'scene-image') {
    return renderSceneImage(slide, style);
  }
  
  return null;
}

function renderCover(slide, style) {
  return {
    type: 'div',
    props: {
      style: style,
      children: [
        {
          type: 'div',
          props: {
            style: { textAlign: 'center', maxWidth: '800px' },
            children: [
              {
                type: 'div',
                props: {
                  style: { color: slide.accent, fontSize: '18px', marginBottom: '20px', fontWeight: '500' },
                  children: slide.eyebrow,
                },
              },
              {
                type: 'h1',
                props: {
                  style: { fontSize: '48px', margin: '20px 0', color: '#1a1a1a', lineHeight: '1.2' },
                  children: slide.title,
                },
              },
              {
                type: 'p',
                props: {
                  style: { fontSize: '24px', color: '#666', margin: '20px 0' },
                  children: slide.subtitle,
                },
              },
              {
                type: 'div',
                props: {
                  style: { marginTop: '40px', paddingTop: '30px', borderTop: '2px solid ' + slide.accent },
                  children: [
                    {
                      type: 'p',
                      props: {
                        style: { color: '#999', fontSize: '16px' },
                        children: slide.meta,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' },
                        children: (slide.tags || []).map(function(tag) {
                          return {
                            type: 'span',
                            props: {
                              style: { padding: '6px 16px', backgroundColor: slide.accent + '20', color: slide.accent, borderRadius: '20px', fontSize: '14px' },
                              children: tag,
                            },
                          };
                        }),
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        renderNavigation(),
      ],
    },
  };
}

function renderToc(slide, style) {
  return {
    type: 'div',
    props: {
      style: style,
      children: [
        {
          type: 'div',
          props: {
            style: { textAlign: 'center', maxWidth: '800px', width: '100%' },
            children: [
              {
                type: 'h2',
                props: {
                  style: { fontSize: '42px', color: '#1a1a1a', marginBottom: '50px' },
                  children: slide.title,
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'grid', gap: '24px' },
                  children: slide.items.map(function(item, idx) {
                    return {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '24px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: { fontSize: '32px', fontWeight: 'bold', color: slide.accent, minWidth: '60px' },
                              children: item.num,
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: { textAlign: 'left' },
                              children: [
                                {
                                  type: 'h3',
                                  props: {
                                    style: { fontSize: '20px', color: '#1a1a1a', margin: '0 0 8px 0' },
                                    children: item.title,
                                  },
                                },
                                {
                                  type: 'p',
                                  props: {
                                    style: { fontSize: '15px', color: '#666', margin: 0 },
                                    children: item.desc,
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    };
                  }),
                },
              },
            ],
          },
        },
        renderNavigation(),
      ],
    },
  };
}

function renderKeyPoints(slide, style) {
  return {
    type: 'div',
    props: {
      style: style,
      children: [
        {
          type: 'div',
          props: {
            style: { maxWidth: '1000px', width: '100%' },
            children: [
              slide.chapter && {
                type: 'p',
                props: {
                  style: { color: slide.accent, fontSize: '14px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' },
                  children: slide.chapter,
                },
              },
              {
                type: 'h2',
                props: {
                  style: { fontSize: '36px', color: '#1a1a1a', marginBottom: '12px' },
                  children: slide.title,
                },
              },
              slide.subtitle && {
                type: 'p',
                props: {
                  style: { fontSize: '18px', color: '#666', marginBottom: '40px' },
                  children: slide.subtitle,
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
                  children: (slide.points || []).map(function(point, idx) {
                    return {
                      type: 'div',
                      props: {
                        style: { padding: '24px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: { fontSize: '32px', marginBottom: '12px' },
                              children: point.icon,
                            },
                          },
                          {
                            type: 'h3',
                            props: {
                              style: { fontSize: '18px', color: '#1a1a1a', marginBottom: '8px', fontWeight: '600' },
                              children: point.label,
                            },
                          },
                          {
                            type: 'p',
                            props: {
                              style: { fontSize: '14px', color: '#666', lineHeight: '1.6', margin: 0 },
                              children: point.desc,
                            },
                          },
                        ],
                      },
                    };
                  }),
                },
              },
            ],
          },
        },
        renderNavigation(),
      ],
    },
  };
}

function renderImageText(slide, style) {
  return {
    type: 'div',
    props: {
      style: style,
      children: [
        {
          type: 'div',
          props: {
            style: { maxWidth: '1200px', width: '100%', display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap' },
            children: [
              {
                type: 'div',
                props: {
                  style: { flex: '1', minWidth: '300px' },
                  children: [
                    slide.chapter && {
                      type: 'p',
                      props: {
                        style: { color: slide.accent, fontSize: '14px', marginBottom: '12px' },
                        children: slide.chapter,
                      },
                    },
                    {
                      type: 'h2',
                      props: {
                        style: { fontSize: '32px', color: '#1a1a1a', marginBottom: '12px' },
                        children: slide.title,
                      },
                    },
                    slide.subtitle && {
                      type: 'p',
                      props: {
                        style: { fontSize: '18px', color: '#666', marginBottom: '24px' },
                        children: slide.subtitle,
                      },
                    },
                    {
                      type: 'p',
                      props: {
                        style: { fontSize: '16px', color: '#444', lineHeight: '1.8', whiteSpace: 'pre-line' },
                        children: slide.body,
                      },
                    },
                  ],
                },
              },
              slide.imageUrl && {
                type: 'div',
                props: {
                  style: { flex: '1', minWidth: '300px' },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: slide.imageUrl,
                        alt: slide.imageLabel || '',
                        style: { width: '100%', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
                      },
                    },
                    slide.imageLabel && {
                      type: 'p',
                      props: {
                        style: { textAlign: 'center', fontSize: '14px', color: '#999', marginTop: '12px' },
                        children: slide.imageLabel,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        renderNavigation(),
      ],
    },
  };
}

function renderChapter(slide, style) {
  return {
    type: 'div',
    props: {
      style: Object.assign({}, style, { backgroundColor: slide.bg }),
      children: [
        {
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
                  style: { fontSize: '56px', color: '#1a1a1a', marginBottom: '20px', lineHeight: '1.2' },
                  children: slide.title,
                },
              },
              {
                type: 'p',
                props: {
                  style: { fontSize: '24px', color: '#666', marginBottom: '30px' },
                  children: slide.subtitle,
                },
              },
              slide.desc && {
                type: 'p',
                props: {
                  style: { fontSize: '16px', color: '#999', maxWidth: '600px' },
                  children: slide.desc,
                },
              },
            ],
          },
        },
        renderNavigation(),
      ],
    },
  };
}

function renderSceneImage(slide, style) {
  return {
    type: 'div',
    props: {
      style: style,
      children: [
        {
          type: 'div',
          props: {
            style: { maxWidth: '1200px', width: '100%' },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '14px', color: slide.accent, fontWeight: '600' },
                        children: slide.chapter,
                      },
                    },
                    slide.sceneNum && {
                      type: 'span',
                      props: {
                        style: { fontSize: '12px', color: '#999', backgroundColor: '#f0f0f0', padding: '4px 12px', borderRadius: '12px' },
                        children: slide.sceneNum,
                      },
                    },
                    slide.tag && {
                      type: 'span',
                      props: {
                        style: { fontSize: '12px', color: slide.accent, backgroundColor: slide.accent + '15', padding: '4px 12px', borderRadius: '12px' },
                        children: slide.tag,
                      },
                    },
                  ],
                },
              },
              {
                type: 'h2',
                props: {
                  style: { fontSize: '32px', color: '#1a1a1a', marginBottom: '8px' },
                  children: slide.title,
                },
              },
              {
                type: 'p',
                props: {
                  style: { fontSize: '18px', color: '#666', marginBottom: '30px' },
                  children: slide.subtitle,
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { flex: '1', minWidth: '300px' },
                        children: [
                          {
                            type: 'p',
                            props: {
                              style: { fontSize: '16px', color: '#444', lineHeight: '1.8', whiteSpace: 'pre-line' },
                              children: slide.body,
                            },
                          },
                        ],
                      },
                    },
                    slide.imageUrl && {
                      type: 'div',
                      props: {
                        style: { flex: '1', minWidth: '300px' },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: slide.imageUrl,
                              alt: slide.imageLabel || '',
                              style: { width: '100%', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
                            },
                          },
                          slide.imageLabel && {
                            type: 'p',
                            props: {
                              style: { textAlign: 'center', fontSize: '14px', color: '#999', marginTop: '12px' },
                              children: slide.imageLabel,
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        renderNavigation(),
      ],
    },
  };
}

export function renderJsx() {
  return {
    type: 'div',
    props: {
      style: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
      children: SLIDES.map(function(slide, index) {
        return renderSlide(slide, index);
      }),
    },
  };
}
