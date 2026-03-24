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
    title: '龙虾（OpenClaw） vs 悟空',
    subtitle: 'AI Agent 时代的人机协作新范式',
    meta: '邵寒超（九神）· 阿里巴巴 · 2026.03',
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
    title: '九神',
    subtitle: '宜搭联合创始人 · 商业化负责人 · AI Geeker',
    points: [
      { icon: '🏗️', label: '宜搭联合创始人 & 商业化负责人', desc: '从 0 到 1 参与构建宜搭低代码平台，负责商业化全链路，见证宜搭从产品到生态的完整历程' },
      { icon: '🧠', label: '阿里企业智能全域实践者', desc: '深度参与阿里企业智能几乎所有系统建设——人、财、法、事、物、场，横跨企业数字化全场景。现任阿里巴巴 ATH 事业群 · 悟空事业部' },
      { icon: '🤖', label: '有 AI 信仰的 Geeker', desc: '相信 AI 会重塑每一个工作流，用技术人的方式亲身实践、验证、分享' },
      { icon: '🦞', label: '最近在做：OpenYida + 宜搭 CLI', desc: '解决"宜搭不会搭、搭出来效果不够好"的问题——让 AI 驱动低代码，让每个人都能搭出好应用' },
    ],
  },

  // ── Vibe Coding ───────────────────────────────────────────
  {
    type: 'image-text',
    bg: '#ffffff',
    accent: '#c084fc',
    chapter: '演讲者介绍',
    title: '这个 PPT，是在高铁上做的',
    subtitle: 'Vibe Coding：用 AI 对话驱动开发，随时随地',
    body: '从杭州到上海，50 分钟高铁。再加 40 分钟的地铁。\n\n用 AI 对话 + OpenYida 技能，对话式完成了整套演讲 PPT 的开发和发布。\n\n这就是 AI Agent 的力量——不是未来，是现在。',
    imageUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01TB05pI1HpekqOi75D_!!6000000000807-2-tps-2190-1470.png',
    imageLabel: '高铁上 Vibe Coding',
  },

  // ── Part 1 章节页 ─────────────────────────────────────────
  {
    type: 'image-text',
    bg: '#f8f9fa',
    accent: '#c084fc',
    chapter: 'PART 01',
    title: '什么是 AI Agent？',
    subtitle: '从"问答机器"到"自主执行者"的进化',
    body: '"We are on the verge of the Singularity" — Vernor Vinge\n\n我们正站在奇点的边缘。\n\nAI 不再只是回答问题的工具——它开始感知环境、制定计划、自主执行任务。\n\n这是一次比互联网更深刻的变革。',
    imageUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01wg57vF1Exx54R0SlB_!!6000000000419-2-tps-1376-1124.png',
    imageLabel: '我们正处于奇点边缘',
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
      { icon: '🛠️', label: '2025年11月 · 诞生', desc: '一位独立开发者发布 OpenClaw，一个让 AI 真正操控电脑的开源 Agent 框架。Logo 是只龙虾，中文圈戏称"养龙虾"' },
      { icon: '🚀', label: '2026年3月6日 · 引爆', desc: '腾讯云在深圳腾讯大厦门前广场组织现场排队安装活动，"养龙虾"话题席卷全网，全民跟风入局' },
      { icon: '📈', label: '3周内 · 超越Linux', desc: 'GitHub Stars 60天斩获28万，下载量在三周内超越 Linux 三十年的积累——史上增长最快的开源项目' },
      { icon: '🏆', label: '黄仁勋 GTC 大会 · 封神', desc: '英伟达 CEO 黄仁勋在 GTC 大会上高度评价："这是我们这个时代最重要的软件发布，每家公司都需要制定龙虾战略"' },
    ],
  },

  // ── 龙虾隐喻 ─────────────────────────────────────────────
  {
    type: 'image-text',
    bg: '#f0f4f8',
    accent: '#0089ff',
    chapter: 'PART 02 · OpenClaw 龙虾',
    title: '为什么叫"龙虾"？',
    subtitle: '一个关于蜕变与成长的隐喻',
    body: '龙虾每次蜕壳都要经历脆弱期——旧壳脱落，新壳未硬。\n\nOpenClaw 也在经历这样的蜕变：从单纯的"问答"进化为"自主执行"，从工具变成伙伴。\n\n我们正处在这个蜕变的关键时刻。',
    imageUrl: 'https://img.alicdn.com/imgextra/i1/O1CN01NwBVEw1JtteWnHD5L_!!6000000001087-0-tps-1320-2302.jpg',
    imageLabel: '龙虾：蜕变与进化的隐喻',
  },

  // ── 场景1：Mac Mini 本地部署 ──────────────────────────────
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

  // ── 场景：彩票 ──────────────────────────────────────────
  {
    type: 'scene-image',
    bg: '#f0f4f8',
    accent: '#0089ff',
    chapter: 'PART 02 · OpenClaw 龙虾',
    sceneNum: 'SCENE 06',
    title: '2块钱中了150',
    subtitle: '用 Mac Mini M4 的 ANE 训练大乐透历史数据',
    body: '用 Mac Mini M4 的 ANE 神经网络引擎，训练了 2007 到 2026 年所有大乐透开奖数据。\n\nAgent 分析规律 → 生成号码组合 → 下注 2 元\n\n结果：中了 150 元。\n\n这不是玄学，这是 AI 真实跑出来的结果。',
    imageUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01ATc9WJ1sMvhBTzze4_!!6000000005753-0-tps-621-775.jpg',
    imageLabel: '真实中奖彩票',
    tag: '🎰 AI 选号',
  },

  // ── 场景2：SAP → 宜搭迁移 ────────────────────────────────
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

  // ── 场景3：自动提需求 ─────────────────────────────────────
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

  // ── 场景4：小红书 ─────────────────────────────────────────
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

  // ── 场景5：微信公众号 NotebookLM ─────────────────────────
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

  // ── Mac Mini M4 参数对比 ──────────────────────────────────
  {
    type: 'key-points',
    bg: '#f0f4f8',
    accent: '#0089ff',
    chapter: 'PART 02 · OpenClaw 龙虾',
    title: '为什么选 Mac Mini M4？',
    subtitle: '低成本、低功耗、高性能的本地 AI 实验平台',
    points: [
      { icon: '⚡', label: '38 TOPS 神经网络引擎', desc: 'M4 芯片集成 16 核 ANE，AI 算力较 M3 提升约 35%，7B-13B 模型推理稳定 19-20 tokens/s' },
      { icon: '🧠', label: '统一内存架构 UMA', desc: 'CPU/GPU/NPU 共享同一内存池，16GB 统一内存实际可用性接近传统 PC 的 32GB' },
      { icon: '🌿', label: '能效比惊人', desc: '待机功耗仅 3-6W，满载约 10-20W，7×24 小时运行年电费不足 50 元' },
      { icon: '🔇', label: '静音被动散热', desc: '噪音低于 25dB，适合办公室或家庭长期部署，随时在线不打扰' },
    ],
  },

  // ── 场景7：微博热搜推送 ───────────────────────────────────
  {
    type: 'scene-image',
    bg: '#f0f4f8',
    accent: '#0089ff',
    chapter: 'PART 02 · OpenClaw 龙虾',
    sceneNum: 'SCENE 07',
    title: '微博热搜定时推送',
    subtitle: '每天三次，只推你感兴趣的内容',
    body: '九神亲测好用的日常工作流：\n\n定时爬取热搜前 50 → 按兴趣标签过滤（科技/AI/创业 > 娱乐）→ 生成精简摘要 → 推送到钉钉\n\n每天 9 点、14 点、20 点准时送达，信息焦虑从此消失。',
    imageUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01smwjpu1rXAwLUXrhU_!!6000000005640-0-tps-813-862.jpg',
    imageLabel: '钉钉热搜推送效果',
    tag: '📰 信息管理',
  },

  // ── 场景8：生活管家 ───────────────────────────────────────
  {
    type: 'two-images',
    bg: '#f0f4f8',
    accent: '#0089ff',
    chapter: 'PART 02 · OpenClaw 龙虾',
    sceneNum: 'SCENE 08',
    title: '家庭智能管家',
    subtitle: '行程、发票、体检报告，一站式管理',
    leftImage: {
      url: 'https://img.alicdn.com/imgextra/i3/O1CN01Pmxds31G0zK2xDvf3_!!6000000000561-0-tps-1320-1776.jpg',
      label: '行程 & 发票管理',
      desc: '自动提取信息，按月生成报销清单',
    },
    rightImage: {
      url: 'https://img.alicdn.com/imgextra/i2/O1CN01bBbmQm28hZOh3gw0n_!!6000000007964-0-tps-816-2337.jpg',
      label: '健康档案追踪',
      desc: '对比历年体检数据，异常趋势主动提醒',
    },
  },

  // ── 家庭智能管家详细功能 ────────────────────────────────
  {
    type: 'key-points',
    bg: '#f0f4f8',
    accent: '#0089ff',
    chapter: 'PART 02 · OpenClaw 龙虾',
    title: '家庭智能管家：它知道关于我的一切',
    subtitle: '我把龙虾打造成了专属的家庭智能管家',
    points: [
      { icon: '👨‍👩‍👦', label: '家庭成员全掌握', desc: '知道每个人的生日、纪念日、喜好习惯——比如我儿子是 SpaceX 火箭迷 🚀' },
      { icon: '🎁', label: '生日提醒 + 礼物建议', desc: '"下周三是你儿子的生日，你看下要送他什么礼物了"' },
      { icon: '📅', label: '日程智能安排', desc: '根据家庭成员喜好自动规划周末活动，不再纠结"去哪玩"' },
      { icon: '💡', label: '个性化推荐', desc: '"你太太喜欢的书店上了新书，要看看吗？"' },
    ],
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

  // ── 龙虾对比：两面性 ─────────────────────────────────────
  {
    type: 'two-images',
    bg: '#fefefe',
    accent: '#d97706',
    chapter: 'PART 03 · 安全与企业级',
    title: '龙虾的两面：机遇与风险并存',
    subtitle: '开放带来能力，也带来了需要认真对待的风险',
    leftImage: {
      url: 'https://img.alicdn.com/imgextra/i4/O1CN01d9KktG1sGW9OqTZkF_!!6000000005739-0-tps-1320-2186.jpg',
      label: '视角一：脆弱与风险',
      desc: '蜕壳期最脆弱，新能力需要新的安全框架',
    },
    rightImage: {
      url: 'https://img.alicdn.com/imgextra/i1/O1CN01NwBVEw1JtteWnHD5L_!!6000000001087-0-tps-1320-2302.jpg',
      label: '视角二：蜕变与进化',
      desc: 'Agent 正在突破旧有边界，进入全新能力层次',
    },
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

  // ── 悟空产品介绍图 ───────────────────────────────────────
  {
    type: 'scene-image-top',
    bg: '#fefefe',
    accent: '#d97706',
    chapter: 'PART 04 · 悟空',
    sceneNum: '',
    tag: '产品发布',
    title: '悟空：重新定义企业 AI',
    subtitle: '2026.03.17 悟空发布会现场',
    imageUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01N5FCZX1HZctMW36yj_!!6000000000772-0-tps-3024-1898.jpg',
    body: '把钉钉打碎，用 AI 重建——悟空不是钉钉的 AI 助手，而是全新的企业 AI 原生工作平台。',
    imageLabel: '悟空发布会现场',
  },
  {
    type: 'scene-image-top',
    bg: '#fefefe',
    accent: '#d97706',
    chapter: 'PART 04 · 悟空',
    sceneNum: '',
    tag: '核心能力',
    title: '悟空的核心能力',
    subtitle: '企业级 AI Agent 的完整形态',
    imageUrl: 'https://img.alicdn.com/imgextra/i1/O1CN01xj42K11yKXJvqWtcc_!!6000000006560-0-tps-3024-1898.jpg',
    body: '过去是人用钉钉来工作，未来是 AI 用钉钉来工作——悟空让每个员工都拥有自己的 AI 分身。',
    imageLabel: '悟空核心能力展示',
  },
  {
    type: 'scene-image-top',
    bg: '#fefefe',
    accent: '#d97706',
    chapter: 'PART 04 · 悟空',
    sceneNum: '',
    tag: '安全体系',
    title: '安全是悟空的底线',
    subtitle: '宁愿晚生，也要把安全做到极致',
    imageUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01hfFISl1m8NPrCSYwe_!!6000000004909-0-tps-3024-1898.jpg',
    body: '原生权限继承 + 全链路审计 + CLI 化底层重构，三重安全杀器确保企业数据绝对可控。',
    imageLabel: '悟空安全体系',
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
    bg: '#f5f7fa',
    accent: '#00c9a7',
    chapter: 'PART 04 · 悟空',
    title: '三大安全杀器',
    subtitle: '无招：宁愿晚生，也要把安全做到极致',
    points: [
      { icon: '🔑', label: '原生权限继承', desc: '员工唤醒悟空时，Agent 自动继承钉钉账号权限。员工看不了的文档，他的 Agent 也绝对爬取不到' },
      { icon: '🛡️', label: '企业级安全沙箱', desc: '所有自动化操作均在沙箱中运行，即使遭遇恶意代码注入，也绝无可能穿透感染核心业务系统' },
      { icon: '📋', label: 'RealDoc 原生文件系统', desc: '每秒上千次快照保存，Agent 每一步推理过程完整记录，彻底解决企业最担忧的"黑盒操作"审计问题' },
      { icon: '⚡', label: 'CLI 化底层重构', desc: '把钉钉底座彻底打碎，全面 CLI/API 化——龙虾学人操作电脑，悟空直接把钉钉变成 AI 可高效操作的平台' },
    ],
  },

  // ── 悟空场景：企业级宜搭低代码 ──────────────────────────
  {
    type: 'scene-image-top',
    bg: '#f5f7fa',
    accent: '#00c9a7',
    chapter: 'PART 04 · 悟空',
    sceneNum: 'DEMO 01',
    title: '用悟空驱动宜搭低代码',
    subtitle: '对话即开发，企业应用 10 分钟上线',
    body: '告诉悟空你的业务需求：自动创建表单 → 配置审批流程 → 设置权限规则 → 一键发布上线\n\n无需写代码，无需懂低代码，企业数字化从未如此简单。数据留在企业内网，安全合规，开箱即用。\n\n※ 本页数据均来源于公开资料',
    imageUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01iLBCH61hqjhKt425r_!!6000000004329-2-tps-3024-1622.png',
    imageLabel: '悟空 × 宜搭企业级演示',
    tag: '🏢 企业级',
  },

  // ── 宜搭小游戏 ───────────────────────────────────────────
  {
    type: 'scene-image',
    bg: '#f5f7fa',
    accent: '#00c9a7',
    chapter: 'PART 04 · 悟空',
    sceneNum: 'DEMO 02',
    title: '宜搭能做小游戏？',
    subtitle: '低代码的上限，远超你的想象',
    body: '这是一个完全用宜搭搭建的小游戏。\n\n没有一行传统代码，没有独立服务器，没有复杂部署——纯宜搭自定义页面实现。\n\n当 AI 驱动宜搭，低代码的边界就是你的想象力边界。\n\n游戏只是起点，CRM、ERP、数据看板……都可以这样做。',
    imageUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01nKA6VD1KANuY7WZTN_!!6000000001123-2-tps-600-600.png',
    imageLabel: '宜搭自定义页面小游戏',
    tag: '🎮 宜搭出品',
  },

  // ── 悟空 + OpenYida ───────────────────────────────────────
  {
    type: 'scene-image-top',
    bg: '#f5f7fa',
    accent: '#00c9a7',
    chapter: 'PART 04 · 悟空',
    sceneNum: 'DEMO 03',
    title: '悟空 × OpenYida：AI 驱动低代码的完整闭环',
    subtitle: '用自然语言许愿，AI 自动完成从需求到上线的全流程',
    body: '悟空理解业务意图，OpenYida 执行宜搭操作——两者协同，让"一句话做应用"真正落地。创建表单、配置流程、设置权限、发布上线，全程无需人工干预。',
    imageUrl: 'https://img.alicdn.com/imgextra/i4/O1CN017uyK3q1UUfbv7Z8oh_!!6000000002521-2-tps-2648-1382.png',
    imageLabel: '悟空 × OpenYida 协作全流程',
    tag: '🤝 AI 协同',
  },

  // ── 许愿式 AI 交互 ────────────────────────────────────────
  {
    type: 'key-points',
    bg: '#f5f7fa',
    accent: '#00c9a7',
    chapter: 'PART 04 · 悟空',
    title: '许愿式 AI 交互',
    subtitle: '从"对话生成内容"到"自主执行任务"——一句话直接交付',
    points: [
      { icon: '💬', label: '传统 AI 交互', desc: '"请问您说的是哪个客户？" → "您希望做什么类型的应用？" → 5 轮对话后还没开始' },
      { icon: '🪄', label: '许愿式交互', desc: '"帮我搭建一个客户管理系统，包含客户信息、跟进记录、商机管理，还要一个数据看板。" → 直接交付' },
      { icon: '🔑', label: '许愿词的精髓', desc: '背景完整 + 目标明确 + 技术约束 + 授权充分。最后一句：不要问我，你自己实现' },
      { icon: '🚀', label: 'OPT 一人团队', desc: '人类只负责定义"要什么"和"为什么"，AI 负责所有"怎么做"。一个人 + 一个 AI = 一支完整项目团队' },
    ],
  },

  // ── Part 5 章节页：如何开始 ──────────────────────────────
  {
    type: 'chapter',
    bg: '#ffffff',
    accent: '#e84545',
    partNum: 'PART 05',
    title: '如何开始？',
    subtitle: '普通人的 AI Agent 入门路径',
    desc: '不需要懂技术，从今天就可以开始',
  },

  // ── 入门路径 ─────────────────────────────────────────────
  {
    type: 'key-points',
    bg: '#ffffff',
    accent: '#e84545',
    chapter: 'PART 05 · 如何开始',
    title: '四步上手 AI Agent',
    subtitle: '从使用者到驾驭者的进阶路径',
    points: [
      { icon: '🎯', label: 'Step 1：先用起来', desc: '选一个你最痛的日常任务，让 Agent 帮你做一遍，感受差异' },
      { icon: '🔧', label: 'Step 2：学会提示', desc: '掌握"目标 + 约束 + 格式"的提示框架，让 Agent 更精准' },
      { icon: '🚀', label: 'Step 3：构建工作流', desc: '把多个 Agent 能力串联，打造属于你的自动化流水线' },
      { icon: '🌱', label: 'Step 4：持续迭代', desc: '记录哪些有效、哪些失败，不断优化你的 Agent 使用策略' },
    ],
  },

  // ── 结语 ─────────────────────────────────────────────────
  {
    type: 'ending',
    bg: '#ffffff',
    accent: '#c084fc',
    title: '龙虾蜕壳，悟空破界',
    subtitle: '过去是人用钉钉来工作，未来是 AI 用钉钉来工作',
    quote: '龙虾可以火遍全世界，但它抵不过悟空一场盛大的修行。因为修行意味着沉淀、实践、成长、蜕变。而火，只是一时的热闹。',
    cta: '现在就开始，让 Agent 成为你的超级搭档',
    contacts: [
      { imageUrl: 'https://img.alicdn.com/imgextra/i1/O1CN01eSeRlM1EhvDbdc4S5_!!6000000000384-2-tps-816-1236.png', label: '钉钉（推荐）' },
      { imageUrl: 'https://img.alicdn.com/imgextra/i1/O1CN01QXk0rh24ZXzpddf8p_!!6000000007405-2-tps-1224-1605.png', label: '微信' },
    ],
    tags: ['#AIAgent', '#OpenClaw', '#悟空', '#ATH', '#宜搭', '#人机协作'],
  },
];

// ── 初始化 ────────────────────────────────────────────────────
// 将页码同步到 URL hash，方便分享和浏览器前进/后退
function pushSlideHistory(index) {
  if (window.history && window.history.pushState) {
    window.history.pushState({ slideIndex: index }, '', '#slide-' + (index + 1));
  }
}

// 从 URL hash 解析初始页码（如 #slide-5 → 4）
function getInitialIndexFromHash() {
  var hash = window.location.hash;
  var match = hash.match(/^#slide-(\d+)$/);
  if (match) {
    var page = parseInt(match[1], 10) - 1;
    if (page >= 0 && page < SLIDES.length) {
      return page;
    }
  }
  return 0;
}

export function didMount() {
  // 从 URL hash 恢复初始页码
  _customState.currentIndex = getInitialIndexFromHash();

  // 检测移动端
  _customState.isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768;

  var self = this;
  function handleKey(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      self.goNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      self.goPrev();
    }
  }
  window.addEventListener('keydown', handleKey);
  this._keyHandler = handleKey;

  // 监听浏览器前进/后退，同步页码
  var self3 = this;
  function handlePopState(e) {
    var index = (e.state && typeof e.state.slideIndex === 'number')
      ? e.state.slideIndex
      : getInitialIndexFromHash();
    if (index >= 0 && index < SLIDES.length) {
      _customState.currentIndex = index;
      self3.setState({ timestamp: Date.now() });
    }
  }
  window.addEventListener('popstate', handlePopState);
  this._popStateHandler = handlePopState;

  // 监听屏幕方向变化，自动更新 isMobile 状态
  var self2 = this;
  function handleResize() {
    _customState.isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768;
    self2.setState({ timestamp: Date.now() });
  }
  window.addEventListener('resize', handleResize);
  this._resizeHandler = handleResize;

  // 初始化时替换当前 history 条目，记录初始页码
  if (window.history && window.history.replaceState) {
    window.history.replaceState({ slideIndex: _customState.currentIndex }, '', '#slide-' + (_customState.currentIndex + 1));
  }

  this.setState({ timestamp: Date.now() });
}

export function didUnmount() {
  if (this._keyHandler) {
    window.removeEventListener('keydown', this._keyHandler);
  }
  if (this._resizeHandler) {
    window.removeEventListener('resize', this._resizeHandler);
  }
  if (this._popStateHandler) {
    window.removeEventListener('popstate', this._popStateHandler);
  }
}

export function goNext() {
  if (_customState.currentIndex < SLIDES.length - 1) {
    _customState.currentIndex += 1;
    pushSlideHistory(_customState.currentIndex);
    this.setState({ timestamp: Date.now() });
  }
}

export function goPrev() {
  if (_customState.currentIndex > 0) {
    _customState.currentIndex -= 1;
    pushSlideHistory(_customState.currentIndex);
    this.setState({ timestamp: Date.now() });
  }
}

export function goTo(index) {
  if (index >= 0 && index < SLIDES.length) {
    _customState.currentIndex = index;
    pushSlideHistory(index);
    this.setState({ timestamp: Date.now() });
  }
}

// ── 幻灯片内容渲染 ────────────────────────────────────────────
export function renderSlideContent(slide, accent) {
  var type = slide.type;
  var isMobile = _customState.isMobile;
  var isPortraitMobile = isMobile;

  // ── 封面 ──────────────────────────────────────────────────
  if (type === 'cover') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', padding: isPortraitMobile ? '32px 24px' : '60px 80px', textAlign: 'center' }}>
        <div style={{ fontSize: isPortraitMobile ? '10px' : '13px', color: accent, letterSpacing: '4px', fontWeight: '700', marginBottom: isPortraitMobile ? '16px' : '32px', opacity: 0.9, textTransform: 'uppercase' }}>{slide.eyebrow}</div>
        <div style={{ fontSize: isPortraitMobile ? '42px' : '72px', fontWeight: '900', color: '#1a1a2e', lineHeight: '1.1', marginBottom: isPortraitMobile ? '12px' : '24px', background: 'linear-gradient(135deg, #1a1a2e 0%, ' + accent + ' 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{slide.title}</div>
        <div style={{ fontSize: isPortraitMobile ? '14px' : '22px', color: 'rgba(26,26,46,0.85)', marginBottom: isPortraitMobile ? '20px' : '48px', fontWeight: '400' }}>{slide.subtitle}</div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: isPortraitMobile ? '20px' : '48px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {slide.tags.map(function(tag, idx) {
            return (
              <div key={idx} style={{ padding: isPortraitMobile ? '4px 10px' : '6px 16px', borderRadius: '20px', border: '1px solid ' + accent + '55', color: accent, fontSize: isPortraitMobile ? '11px' : '13px', fontWeight: '600' }}>{tag}</div>
            );
          })}
        </div>
        <div style={{ fontSize: isPortraitMobile ? '11px' : '14px', color: 'rgba(26,26,46,0.75)', letterSpacing: '2px' }}>{slide.meta}</div>
      </div>
    );
  }

  // ── 目录页 ────────────────────────────────────────────────
  if (type === 'toc') {
    if (isPortraitMobile) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', padding: '32px 24px' }}>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#1a1a2e', marginBottom: '32px', background: 'linear-gradient(135deg, #1a1a2e 0%, ' + accent + ' 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{slide.title}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {slide.items.map(function(item, idx) {
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: accent, opacity: 0.9, minWidth: '36px' }}>{item.num}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ fontSize: '18px', color: 'rgba(26,26,46,0.8)' }}>{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', padding: '60px 100px' }}>
        <div style={{ fontSize: '48px', fontWeight: '900', color: '#1a1a2e', marginBottom: '48px', background: 'linear-gradient(135deg, #1a1a2e 0%, ' + accent + ' 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{slide.title}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px 48px' }}>
          {slide.items.map(function(item, idx) {
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                <div style={{ fontSize: '48px', fontWeight: '900', color: accent, opacity: 0.85, minWidth: '60px' }}>{item.num}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '33px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' }}>{item.title}</div>
                  <div style={{ fontSize: '21px', color: 'rgba(26,26,46,0.8)' }}>{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 章节页 ────────────────────────────────────────────────
  if (type === 'chapter') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', padding: isPortraitMobile ? '40px 28px' : '60px 100px' }}>
        <div style={{ width: '48px', height: '4px', background: accent, marginBottom: isPortraitMobile ? '20px' : '32px', borderRadius: '2px' }} />
        <div style={{ fontSize: isPortraitMobile ? '11px' : '13px', color: accent, letterSpacing: '4px', fontWeight: '700', marginBottom: isPortraitMobile ? '12px' : '20px', opacity: 0.9 }}>{slide.partNum}</div>
        <div style={{ fontSize: isPortraitMobile ? '32px' : '56px', fontWeight: '900', color: '#1a1a2e', lineHeight: '1.15', marginBottom: isPortraitMobile ? '12px' : '20px' }}>{slide.title}</div>
        <div style={{ fontSize: isPortraitMobile ? '14px' : '20px', color: 'rgba(26,26,46,0.75)', marginBottom: isPortraitMobile ? '16px' : '32px', fontWeight: '400' }}>{slide.subtitle}</div>
        <div style={{ fontSize: isPortraitMobile ? '12px' : '15px', color: 'rgba(26,26,46,0.7)', fontStyle: 'italic', paddingLeft: '12px', borderLeft: '3px solid ' + accent + '44' }}>{slide.desc}</div>
      </div>
    );
  }

  // ── 要点卡片 ──────────────────────────────────────────────
  if (type === 'key-points') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: isPortraitMobile ? '24px 20px' : '48px 80px', overflow: isPortraitMobile ? 'auto' : 'hidden' }}>
        <div style={{ fontSize: '11px', color: accent, letterSpacing: '3px', fontWeight: '700', marginBottom: '6px', opacity: 0.8 }}>{slide.chapter}</div>
        <div style={{ fontSize: isPortraitMobile ? '22px' : '36px', fontWeight: '800', color: '#1a1a2e', marginBottom: '4px', lineHeight: '1.2' }}>{slide.title}</div>
        <div style={{ fontSize: isPortraitMobile ? '12px' : '15px', color: 'rgba(26,26,46,0.8)', marginBottom: isPortraitMobile ? '16px' : '36px', fontStyle: 'italic' }}>{slide.subtitle}</div>
        <div style={{ display: 'grid', gridTemplateColumns: isPortraitMobile ? '1fr' : '1fr 1fr', gap: isPortraitMobile ? '10px' : '16px', flex: isPortraitMobile ? 'none' : 1 }}>
          {slide.points.map(function(point, idx) {
            return (
              <div key={idx} style={{ background: 'rgba(26,26,46,0.03)', border: '1px solid ' + accent + '22', borderRadius: '12px', padding: isPortraitMobile ? '14px 16px' : '28px 24px', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: isPortraitMobile ? '12px' : '12px' }}>
                <div style={{ fontSize: isPortraitMobile ? '24px' : '36px', flexShrink: 0 }}>{point.icon}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                  <div style={{ fontSize: isPortraitMobile ? '14px' : '27px', fontWeight: '700', color: accent }}>{point.label}</div>
                  <div style={{ fontSize: isPortraitMobile ? '13px' : '21px', color: 'rgba(26,26,46,0.75)', lineHeight: '1.7' }}>{point.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'scene-image') {
    var sceneImgPadding = isPortraitMobile ? '16px 20px' : '32px 80px 24px 80px';

    if (isPortraitMobile) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', justifyContent: 'center', padding: '16px 20px' }}>
          <div style={{ flexShrink: 0, marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', color: accent, letterSpacing: '3px', fontWeight: '700', marginBottom: '4px', opacity: 0.7 }}>{slide.chapter}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <div style={{ fontSize: '10px', color: accent, fontWeight: '700', letterSpacing: '2px', opacity: 0.9 }}>{slide.sceneNum}</div>
              <div style={{ padding: '2px 8px', borderRadius: '10px', background: accent + '22', border: '1px solid ' + accent + '44', fontSize: '10px', color: accent, fontWeight: '600' }}>{slide.tag}</div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a2e', lineHeight: '1.2', marginBottom: '4px' }}>{slide.title}</div>
            <div style={{ fontSize: '11px', color: 'rgba(26,26,46,0.8)', fontStyle: 'italic', paddingLeft: '8px', borderLeft: '2px solid ' + accent + '55' }}>{slide.subtitle}</div>
          </div>
          <div style={{ flexShrink: 0, height: '180px', borderRadius: '12px', overflow: 'hidden', border: '1px solid ' + accent + '33', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(26,26,46,0.03)' }}>
            <img src={slide.imageUrl} style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }} />
          </div>
          <div style={{ flexShrink: 0, fontSize: '11px', color: 'rgba(26,26,46,0.85)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{slide.body}</div>
        </div>
      );
    }

    // PC 端：左文右图
    return (
      <div style={{ display: 'flex', height: '100%', padding: sceneImgPadding }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '40px' }}>
          <div style={{ fontSize: '11px', color: accent, letterSpacing: '3px', fontWeight: '700', marginBottom: '8px', opacity: 0.7 }}>{slide.chapter}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: accent, fontWeight: '700', letterSpacing: '2px', opacity: 0.9 }}>{slide.sceneNum}</div>
            <div style={{ padding: '3px 10px', borderRadius: '10px', background: accent + '22', border: '1px solid ' + accent + '44', fontSize: '11px', color: accent, fontWeight: '600' }}>{slide.tag}</div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#1a1a2e', lineHeight: '1.2', marginBottom: '8px' }}>{slide.title}</div>
          <div style={{ fontSize: '15px', color: 'rgba(26,26,46,0.8)', marginBottom: '24px', fontStyle: 'italic', paddingLeft: '12px', borderLeft: '3px solid ' + accent + '55' }}>{slide.subtitle}</div>
          <div style={{ fontSize: '14px', color: 'rgba(26,26,46,0.72)', lineHeight: '1.9', whiteSpace: 'pre-line' }}>{slide.body}</div>
        </div>
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid ' + accent + '33', boxShadow: '0 4px 20px rgba(26,26,46,0.1)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          <img src={slide.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        </div>
      </div>
    );
  }

  // ── 场景图文页（图在上，文在下） ────────────────────────
  if (type === 'scene-image-top') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: isPortraitMobile ? '16px 20px 12px 20px' : '32px 80px 24px 80px' }}>
        {/* 顶部标题行 */}
        <div style={{ flexShrink: 0, marginBottom: isPortraitMobile ? '10px' : '16px' }}>
          <div style={{ fontSize: '10px', color: accent, letterSpacing: '3px', fontWeight: '700', marginBottom: '4px', opacity: 0.7 }}>{slide.chapter}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <div style={{ fontSize: '10px', color: accent, fontWeight: '700', letterSpacing: '2px', opacity: 0.9 }}>{slide.sceneNum}</div>
            <div style={{ padding: '2px 8px', borderRadius: '10px', background: accent + '22', border: '1px solid ' + accent + '44', fontSize: '10px', color: accent, fontWeight: '600' }}>{slide.tag}</div>
          </div>
          <div style={{ fontSize: isPortraitMobile ? '18px' : '30px', fontWeight: '800', color: '#1a1a2e', lineHeight: '1.2', marginBottom: '4px' }}>{slide.title}</div>
          <div style={{ fontSize: isPortraitMobile ? '11px' : '14px', color: 'rgba(26,26,46,0.8)', fontStyle: 'italic', paddingLeft: '8px', borderLeft: '2px solid ' + accent + '55' }}>{slide.subtitle}</div>
        </div>
        {/* 图片区（横版，占主要空间） */}
        <div style={{ flex: 1, minHeight: 0, borderRadius: '12px', overflow: 'hidden', border: '1px solid ' + accent + '33', boxShadow: '0 4px 20px rgba(26,26,46,0.1)', marginBottom: isPortraitMobile ? '8px' : '12px', background: 'rgba(26,26,46,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={slide.imageUrl} style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }} />
        </div>
        {/* 底部文字 */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: isPortraitMobile ? '11px' : '13px', color: 'rgba(26,26,46,0.75)', lineHeight: '1.7', whiteSpace: 'pre-line', flex: 1 }}>{slide.body}</div>
          <div style={{ fontSize: '10px', color: 'rgba(26,26,46,0.5)', flexShrink: 0 }}>{slide.imageLabel}</div>
        </div>
      </div>
    );
  }

  // ── 图文页（图在右，无场景编号） ─────────────────────────
  if (type === 'image-text') {
    // 移动端竖屏：上文下图，整体居中
    if (isPortraitMobile) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', padding: '20px 20px 16px 20px', overflow: 'hidden' }}>
          <div style={{ flexShrink: 0, marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: accent, letterSpacing: '3px', fontWeight: '700', marginBottom: '10px', opacity: 0.7 }}>{slide.chapter}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a2e', lineHeight: '1.2', marginBottom: '8px' }}>{slide.title}</div>
            <div style={{ fontSize: '12px', color: 'rgba(26,26,46,0.8)', marginBottom: '12px', fontStyle: 'italic', paddingLeft: '8px', borderLeft: '2px solid ' + accent + '55' }}>{slide.subtitle}</div>
            <div style={{ fontSize: '12px', color: 'rgba(26,26,46,0.72)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>{slide.body}</div>
          </div>
          <div style={{ flexShrink: 0, height: '180px', borderRadius: '12px', overflow: 'hidden', border: '1px solid ' + accent + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(26,26,46,0.03)' }}>
            <img src={slide.imageUrl} style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }} />
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px 48px 80px' }}>
          <div style={{ fontSize: '11px', color: accent, letterSpacing: '4px', fontWeight: '700', marginBottom: '16px', opacity: 0.7 }}>{slide.chapter}</div>
          <div style={{ fontSize: '38px', fontWeight: '800', color: '#1a1a2e', lineHeight: '1.2', marginBottom: '10px' }}>{slide.title}</div>
          <div style={{ fontSize: '16px', color: 'rgba(26,26,46,0.8)', marginBottom: '28px', fontStyle: 'italic', paddingLeft: '12px', borderLeft: '3px solid ' + accent + '55' }}>{slide.subtitle}</div>
          <div style={{ fontSize: '15px', color: 'rgba(26,26,46,0.72)', lineHeight: '1.9', whiteSpace: 'pre-line' }}>{slide.body}</div>
        </div>
        <div style={{ width: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 60px 32px 16px', gap: '10px' }}>
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid ' + accent + '33', boxShadow: '0 4px 20px rgba(26,26,46,0.1)', flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
            <img src={slide.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(26,26,46,0.7)', textAlign: 'center', flexShrink: 0 }}>{slide.imageLabel}</div>
        </div>
      </div>
    );
  }

  // ── 双图对比页 ────────────────────────────────────────────
  if (type === 'two-images') {
    var twoImgPadding = isPortraitMobile ? '20px 16px' : '32px 80px 24px 80px';
    var twoImgTitleSize = isPortraitMobile ? '20px' : '32px';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: twoImgPadding }}>
        <div style={{ fontSize: '11px', color: accent, letterSpacing: '4px', fontWeight: '700', marginBottom: '6px', opacity: 0.85, flexShrink: 0 }}>{slide.chapter}</div>
        <div style={{ fontSize: twoImgTitleSize, fontWeight: '800', color: '#1a1a2e', marginBottom: '4px', lineHeight: '1.2', flexShrink: 0 }}>{slide.title}</div>
        <div style={{ fontSize: isPortraitMobile ? '12px' : '14px', color: 'rgba(26,26,46,0.35)', marginBottom: isPortraitMobile ? '14px' : '20px', fontStyle: 'italic', flexShrink: 0 }}>{slide.subtitle}</div>
        <div style={{ display: 'flex', gap: isPortraitMobile ? '12px' : '24px', flex: 1, minHeight: 0 }}>
          {[slide.leftImage, slide.rightImage].map(function(img, idx) {
            return (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0, alignItems: 'center' }}>
                {/* 图片完整展示，居中，不裁切 */}
                <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', overflow: 'hidden', border: '1px solid ' + accent + '33', boxShadow: '0 4px 20px rgba(26,26,46,0.1)' }}>
                  <img src={img.url} style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', display: 'block', objectFit: 'contain' }} />
                </div>
                <div style={{ fontSize: isPortraitMobile ? '11px' : '13px', fontWeight: '700', color: accent, textAlign: 'center', flexShrink: 0 }}>{img.label}</div>
                <div style={{ fontSize: isPortraitMobile ? '11px' : '13px', color: 'rgba(26,26,46,0.7)', textAlign: 'center', lineHeight: '1.6', flexShrink: 0 }}>{img.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 结语页 ────────────────────────────────────────────────
  if (type === 'ending') {
    if (isPortraitMobile) {
      // 移动端：上下布局，内容紧凑
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: '32px 24px 24px 24px', boxSizing: 'border-box' }}>
          {/* 标题区 */}
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#1a1a2e', lineHeight: '1.2', marginBottom: '10px', background: 'linear-gradient(135deg, #1a1a2e 0%, ' + accent + ' 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{slide.title}</div>
          <div style={{ fontSize: '13px', color: 'rgba(26,26,46,0.7)', marginBottom: '16px' }}>{slide.subtitle}</div>
          {/* 引用 */}
          <div style={{ background: accent + '15', border: '1px solid ' + accent + '33', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: 'rgba(26,26,46,0.8)', lineHeight: '1.7', fontStyle: 'italic' }}>"{slide.quote}"</div>
          </div>
          <div style={{ fontSize: '13px', color: accent, fontWeight: '600', marginBottom: '14px' }}>{slide.cta}</div>
          {/* 标签 */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {slide.tags.map(function(tag, idx) {
              return (
                <div key={idx} style={{ padding: '4px 10px', borderRadius: '12px', border: '1px solid ' + accent + '44', color: 'rgba(26,26,46,0.8)', fontSize: '11px' }}>{tag}</div>
              );
            })}
          </div>
          {/* 二维码区：两张并排居中，缩小尺寸 */}
          {slide.contacts && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '12px', color: accent, fontWeight: '700', letterSpacing: '2px' }}>加我联系方式</div>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', justifyContent: 'center' }}>
                {slide.contacts.map(function(contact, idx) {
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '8px', boxShadow: '0 0 20px ' + accent + '33' }}>
                        <img src={contact.imageUrl} style={{ width: '130px', height: 'auto', display: 'block', borderRadius: '4px' }} />
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(26,26,46,0.85)', textAlign: 'center', fontWeight: '600' }}>{contact.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    // PC 端：三列布局（钉钉 | 内容 | 微信）
    return (
      <div style={{ display: 'flex', height: '100%' }}>
        {/* 左侧：钉钉二维码 */}
        {slide.contacts && slide.contacts[0] && (
          <div style={{ width: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0px 48px 60px', flexShrink: 0 }}>
            <div style={{ fontSize: '13px', color: accent, fontWeight: '700', letterSpacing: '2px', marginBottom: '12px' }}>{slide.contacts[0].label}</div>
            <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '10px', boxShadow: '0 0 30px ' + accent + '33' }}>
              <img src={slide.contacts[0].imageUrl} style={{ width: '140px', height: 'auto', display: 'block', borderRadius: '4px' }} />
            </div>
          </div>
        )}
        {/* 中间：主内容 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', textAlign: 'center' }}>
          <div style={{ fontSize: '52px', fontWeight: '900', color: '#1a1a2e', lineHeight: '1.2', marginBottom: '16px', background: 'linear-gradient(135deg, #1a1a2e 0%, ' + accent + ' 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{slide.title}</div>
          <div style={{ fontSize: '18px', color: 'rgba(26,26,46,0.7)', marginBottom: '36px' }}>{slide.subtitle}</div>
          <div style={{ background: accent + '15', border: '1px solid ' + accent + '33', borderRadius: '16px', padding: '24px 32px', marginBottom: '36px', maxWidth: '560px' }}>
            <div style={{ fontSize: '18px', color: 'rgba(26,26,46,0.8)', lineHeight: '1.8', fontStyle: 'italic' }}>"{slide.quote}"</div>
          </div>
          <div style={{ fontSize: '15px', color: accent, fontWeight: '600', marginBottom: '28px' }}>{slide.cta}</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {slide.tags.map(function(tag, idx) {
              return (
                <div key={idx} style={{ padding: '5px 14px', borderRadius: '16px', border: '1px solid ' + accent + '44', color: 'rgba(26,26,46,0.8)', fontSize: '13px' }}>{tag}</div>
              );
            })}
          </div>
        </div>
        {/* 右侧：微信二维码 */}
        {slide.contacts && slide.contacts[1] && (
          <div style={{ width: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 60px 48px 0px', flexShrink: 0 }}>
            <div style={{ fontSize: '13px', color: accent, fontWeight: '700', letterSpacing: '2px', marginBottom: '12px' }}>{slide.contacts[1].label}</div>
            <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '10px', boxShadow: '0 0 30px ' + accent + '33' }}>
              <img src={slide.contacts[1].imageUrl} style={{ width: '140px', height: 'auto', display: 'block', borderRadius: '4px' }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return <div style={{ color: '#1a1a2e', padding: '40px', fontSize: '20px' }}>未知类型: {type}</div>;
}

// ── 主渲染函数 ────────────────────────────────────────────────
export function renderJsx() {
  var timestamp = this.state.timestamp;
  var state = _customState;
  var slide = SLIDES[state.currentIndex];
  var accent = slide.accent || '#a855f7';
  var total = SLIDES.length;
  var progress = ((state.currentIndex + 1) / total) * 100;
  var canPrev = state.currentIndex > 0;
  var canNext = state.currentIndex < total - 1;

  // 进度点
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
          flexShrink: 0,
        }}
        onClick={(function(idx) {
          return function() { this.goTo(idx); }.bind(this);
        }.bind(this))(i)}
      />
    );
  }

  var btnStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid rgba(26,26,46,0.1)',
    background: 'rgba(26,26,46,0.05)',
    color: '#1a1a2e',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    flexShrink: 0,
  };

  var isMobile = state.isMobile;

  var landscapeWrapStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: slide.bg, overflow: 'hidden' }}>
      {/* 隐藏宜搭低代码开发工具开关 */}
      <style>{`
        #__lowcode_devtool_switch__,
        [id="__lowcode_devtool_switch__"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
      {/* 必须保留：触发重新渲染 */}
      <div style={{ display: 'none' }}>{timestamp}</div>


      {/* 内容区（支持横屏旋转） */}
      <div style={Object.assign({}, landscapeWrapStyle, { background: slide.bg, display: 'flex', flexDirection: 'column', fontFamily: '"Microsoft YaHei", "PingFang SC", -apple-system, sans-serif' })}>
        {/* 背景光晕 */}
        <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, ' + accent + '1a 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-8%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, ' + accent + '0f 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* 顶部进度条 */}
        <div style={{ position: 'absolute', top: 0, left: 0, height: '3px', width: progress + '%', background: 'linear-gradient(90deg, ' + accent + ', ' + accent + 'aa)', transition: 'width 0.4s ease', zIndex: 10 }} />

        {/* 幻灯片内容 */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {this.renderSlideContent(slide, accent)}
        </div>

        {/* 底部导航栏 */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 48px', background: 'rgba(26,26,46,0.04)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(26,26,46,0.08)' }}>
          <div
            style={Object.assign({}, btnStyle, { opacity: canPrev ? 1 : 0.2, cursor: canPrev ? 'pointer' : 'default' })}
            onClick={function() { this.goPrev(); }.bind(this)}
          >←</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'center', padding: '0 20px' }}>
            {dots}
          </div>

          <div style={{ fontSize: '12px', color: 'rgba(26,26,46,0.7)', minWidth: '56px', textAlign: 'center', letterSpacing: '1px' }}>
            {state.currentIndex + 1} / {total}
          </div>

          <div
            style={Object.assign({}, btnStyle, { opacity: canNext ? 1 : 0.2, cursor: canNext ? 'pointer' : 'default' })}
            onClick={function() { this.goNext(); }.bind(this)}
          >→</div>
        </div>
      </div>
    </div>
  );
}
