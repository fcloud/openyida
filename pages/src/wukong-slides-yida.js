// ============================================================
// 状态管理
// ============================================================

const _customState = {
  currentSlide: 0,
  totalSlides: 22,
  isEditMode: false
};

/**
 * 获取状态
 */
export function getCustomState(key) {
  if (key) {
    return _customState[key];
  }
  return { ..._customState };
}

/**
 * 设置状态
 */
export function setCustomState(newState) {
  Object.keys(newState).forEach(function(key) {
    _customState[key] = newState[key];
  });
  this.forceUpdate();
}

/**
 * 强制重新渲染
 */
export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

// ============================================================
// 生命周期
// ============================================================

export function didMount() {
  // 初始化
  console.log('演示文稿已加载');
  
  // 绑定键盘事件
  const self = this;
  this._keyHandler = function(e) {
    const currentSlide = _customState.currentSlide;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      if (currentSlide < SLIDES.length - 1) {
        self.setCustomState({ currentSlide: currentSlide + 1 });
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentSlide > 0) {
        self.setCustomState({ currentSlide: currentSlide - 1 });
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      self.setCustomState({ currentSlide: 0 });
    } else if (e.key === 'End') {
      e.preventDefault();
      self.setCustomState({ currentSlide: SLIDES.length - 1 });
    }
  };
  document.addEventListener('keydown', this._keyHandler);
}

export function didUnmount() {
  // 清理键盘事件
  if (this._keyHandler) {
    document.removeEventListener('keydown', this._keyHandler);
  }
}

// ============================================================
// 幻灯片数据
// ============================================================

const SLIDES = [
  {
    type: 'cover',
    eyebrow: '2026 AI Agent 实战分享',
    title: '以"竹"为名"连接"一切',
    subtitle: '悟空 AI-Native Work Platform',
    meta: '杭远 · 钉钉华中区域解决方案总经理 · 2026.03'
  },
  {
    type: 'toc',
    title: '今日分享',
    items: [
      { num: '01', title: '什么是 AI Agent', desc: '从概念到实践，理解 Agent 的本质' },
      { num: '02', title: 'OpenClaw 龙虾', desc: '开源 Agent 框架，三周超越 Linux 三十年' },
      { num: '03', title: '安全与企业级', desc: '机遇与风险并存，国家怎么看龙虾' },
      { num: '04', title: '悟空', desc: '阿里企业 AI 原生工作平台，重新定义人机协作' }
    ]
  },
  {
    type: 'keypoints',
    chapter: '演讲者介绍',
    title: '杭远',
    subtitle: '钉钉华中区域解决方案总经理',
    points: [
      { icon: '🏢', label: '钉钉华中区域解决方案总经理', desc: '负责钉钉在华中区域的企业数字化解决方案，推动 AI 与企业管理深度融合' },
      { icon: '🤖', label: '企业 AI 实践者', desc: '深度参与企业智能场景落地，探索 AI Agent 在企业服务中的创新应用' },
      { icon: '🦞', label: 'OpenYida + 宜搭 CLI 推动者', desc: '让 AI 驱动低代码，让每个企业都能快速构建智能化应用' }
    ]
  },
  {
    type: 'imagetext',
    chapter: '开发方式',
    title: '这个 PPT，是在悟空上做的',
    subtitle: 'Vibe Coding：用 AI 对话驱动开发，随时随地',
    body: '通过悟空 + OpenYida 技能，对话式完成了整套演讲 PPT 的开发和发布。\n\n这就是 AI Agent 的力量——不是未来，是现在。',
    imageUrl: 'https://img.alicdn.com/imgextra/i1/O1CN01KCDUMi26YkXRBM1Aj_!!6000000007674-0-tps-2074-1716.jpg'
  },
  {
    type: 'chapter',
    partNum: 'PART 01',
    title: '什么是 AI Agent？',
    subtitle: '从"问答机器"到"自主执行者"的进化'
  },
  {
    type: 'keypoints',
    chapter: 'PART 01 · 什么是 AI Agent',
    title: 'Agent = 感知 + 规划 + 执行',
    subtitle: '不只是聊天，而是真正帮你把事情做完',
    points: [
      { icon: '👁️', label: '感知 Perceive', desc: '理解你的意图、读取上下文、分析当前状态' },
      { icon: '🧠', label: '规划 Plan', desc: '拆解任务、制定步骤、选择合适的工具' },
      { icon: '⚡', label: '执行 Act', desc: '调用 API、操作系统、生成内容、完成交付' },
      { icon: '🔄', label: '反思 Reflect', desc: '检查结果、发现错误、自动修正重试' }
    ]
  },
  {
    type: 'chapter',
    partNum: 'PART 02',
    title: 'OpenClaw 龙虾',
    subtitle: '开放的 AI Agent，让每个人都能用上超级助手',
    desc: '从个人效率到团队协作，龙虾正在改变工作方式'
  },
  {
    type: 'keypoints',
    chapter: 'PART 02 · OpenClaw 龙虾',
    title: 'OpenClaw 是怎么火起来的？',
    subtitle: '从一个开源项目，到改变世界的软件——只用了三周',
    points: [
      { icon: '🛠️', label: '2025 年 11 月 · 诞生', desc: '一位独立开发者发布 OpenClaw，一个让 AI 真正操控电脑的开源 Agent 框架。Logo 是只龙虾，中文圈戏称"养龙虾"' },
      { icon: '🚀', label: '2026 年 3 月 6 日 · 引爆', desc: '腾讯云在深圳腾讯大厦门前广场组织现场排队安装活动，"养龙虾"话题席卷全网，全民跟风入局' },
      { icon: '📈', label: '3 周内 · 超越 Linux', desc: 'GitHub Stars 60 天斩获 28 万，下载量在三周内超越 Linux 三十年的积累——史上增长最快的开源项目' },
      { icon: '🏆', label: '黄仁勋 GTC 大会 · 封神', desc: '英伟达 CEO 黄仁勋在 GTC 大会上高度评价："这是我们这个时代最重要的软件发布，每家公司都需要制定龙虾战略"' }
    ]
  },
  {
    type: 'scene',
    chapter: 'PART 02 · OpenClaw 龙虾',
    sceneNum: 'SCENE 01',
    title: 'Mac Mini M4：最佳本地 AI 实验平台',
    subtitle: '低成本、低功耗、高性能，7×24 小时在线',
    body: '在部署龙虾的过程中，我尝试了云服务器、Windows PC、Linux 主机，最终发现 Mac Mini M4 是最优解：\n\n• 38 TOPS ANE 算力 → 7B-13B 模型推理 19-20 tokens/s\n• 待机仅 3-6W，年电费不足 50 元，静音被动散热\n• 16GB 统一内存，实际可用性接近传统 PC 的 32GB\n\nMac Mini M4 + 龙虾 = 完美的本地 AI 实验平台。',
    imageUrl: 'https://img.alicdn.com/imgextra/i3/O1CN014yYsDR1jS7dzzVtin_!!6000000004546-0-tps-1320-2231.jpg',
    tag: '🖥️ 本地部署'
  },
  {
    type: 'scene',
    chapter: 'PART 02 · OpenClaw 龙虾',
    sceneNum: 'SCENE 02',
    title: '用 OpenYida 复刻 SAP 系统',
    subtitle: 'AI 自动学习 SAP 架构，宜搭快速复刻 + 数据迁移',
    body: '企业用了十几年的 SAP，想换但迁移成本太高？\n\nOpenYida 自动分析 SAP 系统架构和业务逻辑 → 在宜搭上快速复刻对应的表单、流程和权限体系 → 历史数据一键迁移 → 通过 HTTP 连接器与 SAP 保持实时数据连接\n\n不是推倒重来，而是平滑过渡——新系统上线，旧系统数据不丢失。',
    imageUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01fs5WhH1m1VTW9ZMhK_!!6000000004894-0-tps-1320-2051.jpg',
    tag: '🏗️ 系统迁移'
  },
  {
    type: 'scene',
    chapter: 'PART 02 · OpenClaw 龙虾',
    sceneNum: 'SCENE 03',
    title: 'Agent 自动提需求',
    subtitle: '从"用户反馈"到"需求工单"全自动',
    body: 'Agent 持续监控用户反馈渠道：\n\n聚类相似问题 → 分析优先级 → 生成标准需求文档 → 自动创建工单\n\n产品经理从"整理反馈"中解放出来。',
    imageUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01YgmZx126P8DjenDGD_!!6000000007653-0-tps-1320-1160.jpg',
    tag: '📋 流程自动化'
  },
  {
    type: 'scene',
    chapter: 'PART 02 · OpenClaw 龙虾',
    sceneNum: 'SCENE 04',
    title: '一键生成小红书笔记',
    subtitle: '输入主题，输出爆款格式内容',
    body: '告诉 Agent 你想分享什么，它自动：\n\n分析爆款结构 → 生成标题 + 正文 + 标签 → 配图建议 → 发布时间推荐\n\n内容创作效率提升 10 倍。',
    imageUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01BS7oDq1haFRJB7PoG_!!6000000004293-0-tps-1076-2103.jpg',
    tag: '✍️ 内容创作'
  },
  {
    type: 'scene',
    chapter: 'PART 02 · OpenClaw 龙虾',
    sceneNum: 'SCENE 05',
    title: '把公众号当 NotebookLM 用',
    subtitle: '让 OpenClaw 帮你消化所有订阅内容',
    body: '关注了几百个公众号，但根本看不完？\n\nOpenClaw 自动抓取订阅公众号的最新文章 → 提炼核心观点 → 建立个人知识库 → 随时问随时答\n\n就像 NotebookLM，但内容来源是你精心挑选的公众号。\n\n"帮我总结今天 AI 领域的公众号更新" → 一句话搞定。',
    imageUrl: 'https://img.alicdn.com/imgextra/i1/O1CN01Rie0TX1Q22O4coira_!!6000000001917-0-tps-1320-2168.jpg',
    tag: '📚 知识管理'
  },
  {
    type: 'chapter',
    partNum: 'PART 03',
    title: '但是……安全呢？',
    subtitle: '开放的 Agent 能力越强，企业级顾虑越多',
    desc: '数据安全、权限管控、合规审计——这些是企业无法绕过的门槛'
  },
  {
    type: 'keypoints',
    chapter: 'PART 03 · 安全与企业级',
    title: '企业级 Agent 的"不可能三角"',
    subtitle: '"权限管不住、操作查不到、成本算不清" — 无招',
    points: [
      { icon: '🔓', label: '权限失控', desc: '龙虾为了完成任务，可能顺着内网爬取 CFO 电脑里的核心财务报表，机密数据发给未知第三方模型' },
      { icon: '🕳️', label: '黑盒不可审计', desc: 'Meta 安全总监亲测：安装龙虾后，200 多封重要邮件瞬间被删得干干净净，找都找不回来' },
      { icon: '💸', label: '成本算不清', desc: 'Agent 陷入死循环，不断发起万次无效 API 请求，月底云计算账单老板根本搞不清钱花在哪' },
      { icon: '⚠️', label: '企业的结论', desc: '大厂 IT 部门和合规团队正在下达死命令：严禁任何员工在真实业务系统中接入龙虾' }
    ]
  },
  {
    type: 'keypoints',
    chapter: 'PART 03 · 安全与企业级',
    title: 'AI 安全：不可忽视的红线',
    subtitle: '自主执行能力越强，风险管控越重要',
    points: [
      { icon: '🔑', label: '权限最小化原则', desc: 'Agent 只能访问完成任务所必需的最小权限范围，员工看不了的数据，他的 Agent 也绝对碰不到' },
      { icon: '📋', label: '操作全链路可审计', desc: '每一步操作都有完整日志记录，出了问题可以精确溯源，不再是黑盒' },
      { icon: '🛑', label: '关键步骤人工确认', desc: '涉及删除、转账、外发等高风险操作，必须人工二次确认，不允许 Agent 自主执行' },
      { icon: '⚡', label: '异常自动熔断', desc: '检测到死循环、异常调用频率或可疑行为时，立即中断 Agent 执行，保护系统安全' }
    ]
  },
  {
    type: 'keypoints',
    chapter: 'PART 03 · 安全与企业级',
    title: '国家怎么看"龙虾"？',
    subtitle: '鼓励与警惕并行，监管正在跟上',
    points: [
      { icon: '🏛️', label: '深圳龙岗"龙虾十条"', desc: '鼓励推出"龙虾服务区"，免费提供 OpenClaw 部署服务，最高补贴 500 万元——地方政府率先入场' },
      { icon: '⚠️', label: '工信部发出安全警示', desc: '工信部网络安全平台监测发现：OpenClaw 部分实例在默认或不当配置下存在严重安全风险，提醒警惕' },
      { icon: '🔒', label: 'CNNVD：82 个漏洞，12 个超危', desc: '国家信息安全漏洞库统计，2026 年 1-3 月 OpenClaw 已发现漏洞 82 个，其中超危 12 个、高危 21 个' },
      { icon: '🚫', label: '国企和政府机关：非必要不部署', desc: '多家央企、国企 IT 部门下达禁令，严禁员工在真实业务系统中接入龙虾，合规压力倒逼企业级方案' }
    ]
  },
  {
    type: 'chapter',
    partNum: 'PART 04',
    title: '悟空：企业级 AI Agent',
    subtitle: '龙虾是"野生 Agent"，悟空是"正规军"',
    desc: '阿里巴巴出品，专为企业场景设计——安全、可控、算得清账'
  },
  {
    type: 'keypoints',
    chapter: 'PART 04 · 悟空',
    title: '阿里无招说',
    subtitle: '悟空发布会现场金句',
    points: [
      { icon: '💥', label: '"今天，我们把钉钉打碎，用 AI 重建，炼出悟空。"', desc: '2026.03.17 悟空发布会开场' },
      { icon: '🔮', label: '"过去是人用钉钉来工作，未来是 AI 用钉钉来工作。"', desc: '重新定义人机协作的底层逻辑' },
      { icon: '🦞', label: '"龙虾关在主机里，是因为我们还没准备好放生它。"', desc: '解释为何悟空晚于龙虾发布' },
      { icon: '🛡️', label: '"宁愿晚生，也要把安全做到极致。"', desc: '悟空安全设计理念' }
    ]
  },
  {
    type: 'keypoints',
    chapter: 'PART 04 · 悟空',
    title: 'ATH 事业群：阿里 AI 战略全面升级',
    subtitle: '2026 年 3 月 16 日，吴泳铭直接挂帅，Token 成为新型"水电煤"',
    points: [
      { icon: '🧬', label: '通义实验室', desc: '创造领先的多模态模型，追求基础模型能力上限' },
      { icon: '☁️', label: 'MaaS 业务线', desc: '构建高效开放的模型服务平台，支撑全行业 AI 生态' },
      { icon: '👤', label: '千问事业部', desc: '打造最好的个人 AI 助手（To C），面向亿级用户' },
      { icon: '🏢', label: '悟空事业部', desc: '打造 B 端 AI 原生工作平台（To B），覆盖 2000 万企业' }
    ]
  },
  {
    type: 'keypoints',
    chapter: 'PART 04 · 悟空',
    title: '悟空的三重安全防线',
    subtitle: '企业级 Agent 的安全基石',
    points: [
      { icon: '🔐', label: '原生权限继承', desc: 'Agent 自动继承员工在钉钉/宜搭中的现有权限，员工看不了的数据，Agent 也绝对碰不到' },
      { icon: '📜', label: '全链路审计', desc: '每一步操作都有完整日志记录，支持精确溯源和责任认定' },
      { icon: '⚙️', label: 'CLI 化底层重构', desc: '通过命令行接口实现细粒度权限控制，确保企业数据绝对可控' }
    ]
  },
  {
    type: 'timeline',
    chapter: 'PART 04 · 悟空',
    title: '人机协作的范式跃迁',
    items: [
      { 
        era: 'DOS时代', 
        time: '1981-1995', 
        desc: '人使用机器语言与机器交互，需记忆指令格式。',
        img: 'https://img.alicdn.com/imgextra/i2/O1CN01A4XRVN1SyK1PbpVSn_!!6000000002315-2-tps-730-466.png' 
      },
      { 
        era: 'GUI时代', 
        time: '1995-2023', 
        desc: '机器以人类可理解的视觉方式呈现，实现“机器用人的语言”进行交互。',
        img: 'https://img.alicdn.com/imgextra/i1/O1CN011fEysu1TncNgelMws_!!6000000002427-2-tps-730-460.png' 
      },
      { 
        era: 'LUI时代', 
        time: '2023-2026', 
        desc: '人发出指令，AI 依据外挂人类工具执行。因缺乏原生理解，任务完成率受限。',
        img: 'https://img.alicdn.com/imgextra/i1/O1CN01tPNsAt1t4tibHGQnD_!!6000000005849-2-tps-730-460.png' 
      },
      { 
        era: 'CLI时代', 
        time: '现在', 
        desc: 'AI 成为生产主体，依托原生工具与模型进化，实现复杂任务的自主交付。',
        img: 'https://img.alicdn.com/imgextra/i1/O1CN0101olaY24f2kXs6074_!!6000000007417-2-tps-1691-1077.png' 
      }
    ]
  },
  {
    type: 'programmable',
    chapter: 'PART 04 · 悟空',
    title: 'Programmable Enterprise',
    subtitle: '企业中有大量可被编程的流程',
    leftTitle: '业务流程 | HR 月度考勤巡检流程',
    rightTitle: '程序逻辑 | Python',
    steps: [
      { id: 1, text: '拉部门花名册', sub: '获取“产品部”全部成员列表', icon: 'https://img.alicdn.com/imgextra/i4/O1CN01vAtZ6G1MBZpYvQYDP_!!6000000001394-2-tps-1320-880.png' },
      { id: 2, text: '批量查排班', sub: '查本月每个人的排班和打卡时间', icon: 'https://img.alicdn.com/imgextra/i3/O1CN01XclvVr1X9YXVZXVZ6_!!6000000002884-2-tps-1320-880.png' },
      { id: 3, text: '逐个查考勤记录', sub: '对每一位员工，查看当天打卡情况', icon: 'https://img.alicdn.com/imgextra/i4/O1CN01ZclvVr1X9YXVZXVZ6_!!6000000002884-2-tps-1320-880.png' },
      { id: 4, text: '如果有异常处理', sub: '查审批系统：是否已提交补卡？', icon: 'https://img.alicdn.com/imgextra/i1/O1CN01ZclvVr1X9YXVZXVZ6_!!6000000002884-2-tps-1320-880.png' },
      { id: 5, text: '登记到“考勤异常台账”', sub: '写入 AI 表格，月底汇总用', icon: 'https://img.alicdn.com/imgextra/i1/O1CN01ZclvVr1X9YXVZXVZ6_!!6000000002884-2-tps-1320-880.png' },
      { id: 6, text: '在部门群通报考勤情况', sub: '信息记录', icon: 'https://img.alicdn.com/imgextra/i1/O1CN01ZclvVr1X9YXVZXVZ6_!!6000000002884-2-tps-1320-880.png' }
    ],
    code: `# ① 顺序执行
members = get_dept_members("产品部")

# ② 顺序执行
shifts = get_shifts(members, "02-01", "02-28")

# ③ 循环
for user in members:
    record = get_attendance(user, "02-28")
    
    # ④ 条件判断
    if record.status == "异常":
        check_approval(user)
        
    # ⑤ 数据写入
    log_exception(user, "02-28", "未打卡")
    
# ⑥ 消息通知
notify_group("产品部群", "2月考勤巡检完毕")`
  },
  {
    type: 'cover',
    eyebrow: '谢谢观看',
    title: 'Q&A',
    subtitle: '让我们一起迎接 AI Agent 时代',
    meta: '杭远 · 钉钉华中区域解决方案总经理'
  }
];

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  const { timestamp } = this.state;
  const currentSlide = _customState.currentSlide;
  const slide = SLIDES[currentSlide];
  const self = this;

  const goToSlide = function(index) {
    if (index >= 0 && index < SLIDES.length) {
      self.setCustomState({ currentSlide: index });
    }
  };

  const nextSlide = function() {
    goToSlide(currentSlide + 1);
  };

  const prevSlide = function() {
    goToSlide(currentSlide - 1);
  };

  // 样式定义
  const styles = {
    container: {
      fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, sans-serif',
      minHeight: '100vh',
      background: slide.type === 'toc' || (slide.type === 'chapter' && slide.partNum === 'PART 03') || slide.type === 'timeline' ? '#0a0a0a' : '#ffffff',
      color: slide.type === 'toc' || (slide.type === 'chapter' && slide.partNum === 'PART 03') || slide.type === 'timeline' ? '#ffffff' : '#0a0a0a',
      padding: '0',
      position: 'relative'
    },
    slide: {
      minHeight: 'calc(100vh - 60px)',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    },
    nav: {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      height: '60px',
      background: 'rgba(255,255,255,0.95)',
      borderTop: '1px solid #eee',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      zIndex: 1000
    },
    navButton: {
      padding: '8px 20px',
      background: '#00c9a7',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600'
    },
    navButtonDisabled: {
      background: '#ccc',
      cursor: 'not-allowed'
    },
    progress: {
      position: 'fixed',
      top: '0',
      left: '0',
      height: '3px',
      background: '#00c9a7',
      width: ((currentSlide + 1) / SLIDES.length * 100) + '%',
      transition: 'width 0.3s ease',
      zIndex: 1001
    },
    themeToggle: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '10px 20px',
      borderRadius: '24px',
      background: 'rgba(0,0,0,0.6)',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      zIndex: 1002,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)'
    },
    // Cover styles
    coverTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '12px',
      color: '#999',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      marginBottom: '40px'
    },
    coverTitle: {
      fontSize: 'clamp(32px, 6vw, 64px)',
      fontWeight: '800',
      lineHeight: '1.1',
      marginBottom: '20px'
    },
    coverSubtitle: {
      fontSize: 'clamp(16px, 2.5vw, 24px)',
      color: '#666',
      fontWeight: '500'
    },
    coverMeta: {
      marginTop: '60px',
      paddingTop: '30px',
      borderTop: '2px solid #00c9a7',
      fontSize: '14px',
      color: '#999'
    },
    // TOC styles
    tocHeader: {
      fontSize: '12px',
      color: '#00c9a7',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      marginBottom: '20px'
    },
    tocTitle: {
      fontSize: 'clamp(28px, 5vw, 48px)',
      fontWeight: '800',
      marginBottom: '40px'
    },
    tocGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '24px'
    },
    tocItem: {
      borderLeft: '2px solid rgba(255,255,255,0.2)',
      paddingLeft: '20px'
    },
    tocNum: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#00c9a7',
      display: 'block',
      marginBottom: '8px'
    },
    tocItemTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '4px'
    },
    tocDesc: {
      fontSize: '14px',
      color: 'rgba(255,255,255,0.6)'
    },
    // Chapter styles
    chapterTag: {
      fontSize: '14px',
      color: '#00c9a7',
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
      marginBottom: '20px',
      textAlign: 'center'
    },
    chapterTitle: {
      fontSize: 'clamp(36px, 7vw, 72px)',
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: '40px'
    },
    chapterSubtitle: {
      fontSize: 'clamp(16px, 2.5vw, 24px)',
      color: '#666',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto'
    },
    // KeyPoints styles
    kpHeader: {
      fontSize: '12px',
      color: '#00c9a7',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      marginBottom: '16px'
    },
    kpTitle: {
      fontSize: 'clamp(24px, 4vw, 40px)',
      fontWeight: '700',
      marginBottom: '8px'
    },
    kpSubtitle: {
      fontSize: '16px',
      color: '#666',
      marginBottom: '32px'
    },
    pointsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '20px'
    },
    pointCard: {
      background: '#faf9f7',
      padding: '24px',
      borderRadius: '8px'
    },
    pointIcon: {
      fontSize: '32px',
      marginBottom: '12px'
    },
    pointLabel: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '8px'
    },
    pointDesc: {
      fontSize: '14px',
      color: '#666',
      lineHeight: '1.5'
    },
    // Scene styles
    sceneHeader: {
      display: 'flex',
      gap: '12px',
      marginBottom: '16px',
      alignItems: 'center'
    },
    sceneChapter: {
      fontSize: '12px',
      color: '#4361ee'
    },
    sceneBadge: {
      fontSize: '12px',
      padding: '4px 12px',
      background: 'rgba(0,0,0,0.05)',
      borderRadius: '4px',
      color: '#666'
    },
    sceneTag: {
      fontSize: '12px',
      padding: '4px 12px',
      background: '#4361ee',
      color: 'white',
      borderRadius: '4px'
    },
    sceneLayout: {
      display: 'grid',
      gridTemplateColumns: '1.2fr 0.8fr',
      gap: '40px',
      alignItems: 'start'
    },
    sceneBody: {
      fontSize: '22px',
      lineHeight: '1.8',
      whiteSpace: 'pre-line'
    },
    sceneImage: {
      width: '100%',
      maxHeight: '400px',
      objectFit: 'contain',
      borderRadius: '8px'
    },
    // Timeline styles
    timelineGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '20px',
      marginTop: '40px',
      position: 'relative'
    },
    timelineLine: {
      position: 'absolute',
      top: '66px',
      left: '0',
      right: '0',
      height: '2px',
      background: 'rgba(67, 97, 238, 0.3)',
      zIndex: 0
    },
    timelineItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      zIndex: 1
    },
    timelineEra: {
      fontSize: '24px',
      fontWeight: '800',
      marginBottom: '4px'
    },
    timelineTime: {
      fontSize: '12px',
      color: '#999',
      marginBottom: '20px'
    },
    timelineDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      background: '#4361ee',
      marginBottom: '20px',
      border: '4px solid #0a0a0a'
    },
    timelineDesc: {
      fontSize: '13px',
      lineHeight: '1.6',
      color: '#ccc',
      marginBottom: '20px',
      minHeight: '60px'
    },
    timelineImg: {
      width: '100%',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.1)'
    },
    // Programmable styles
    programmableLayout: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '40px',
      marginTop: '30px'
    },
    programmablePanel: {
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.1)'
    },
    programmablePanelTitle: {
      fontSize: '14px',
      color: '#00c9a7',
      marginBottom: '20px',
      fontWeight: '600'
    },
    programmableStep: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '16px',
      padding: '12px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '8px'
    },
    programmableStepNum: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      background: '#4361ee',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '700',
      flexShrink: 0
    },
    programmableStepContent: {
      flex: 1
    },
    programmableStepText: {
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '4px'
    },
    programmableStepSub: {
      fontSize: '12px',
      color: '#999'
    },
    programmableArrow: {
      color: '#4361ee',
      fontSize: '20px',
      marginLeft: '12px'
    },
    programmableCode: {
      background: '#1a1a2e',
      borderRadius: '8px',
      padding: '20px',
      fontFamily: 'Monaco, Consolas, monospace',
      fontSize: '13px',
      lineHeight: '1.8',
      color: '#a6accd',
      overflow: 'auto',
      whiteSpace: 'pre-wrap'
    },
    programmableCodeComment: {
      color: '#676e95'
    },
    programmableCodeKeyword: {
      color: '#c792ea'
    },
    programmableCodeString: {
      color: '#c3e88d'
    },
    programmableCodeFunc: {
      color: '#82aaff'
    }
  };

  // 渲染不同 slide 类型
  const renderContent = function() {
    switch(slide.type) {
      case 'cover':
        return (
          <div style={styles.slide}>
            <div style={styles.coverTop}>
              <span>{slide.eyebrow}</span>
              <span>悟空 AI-Native</span>
            </div>
            <h1 style={styles.coverTitle}>{slide.title}</h1>
            <p style={styles.coverSubtitle}>{slide.subtitle}</p>
            <div style={styles.coverMeta}>{slide.meta}</div>
          </div>
        );
      
      case 'toc':
        return (
          <div style={styles.slide}>
            <span style={styles.tocHeader}>Contents</span>
            <h2 style={styles.tocTitle}>{slide.title}</h2>
            <div style={styles.tocGrid}>
              {slide.items.map(function(item, idx) {
                return (
                  <div key={idx} style={styles.tocItem}>
                    <span style={styles.tocNum}>{item.num}</span>
                    <div style={styles.tocItemTitle}>{item.title}</div>
                    <div style={styles.tocDesc}>{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case 'chapter':
        return (
          <div style={{...styles.slide, alignItems: 'center', textAlign: 'center'}}>
            <span style={styles.chapterTag}>{slide.partNum}</span>
            <h1 style={styles.chapterTitle}>{slide.title}</h1>
            <p style={styles.chapterSubtitle}>{slide.subtitle}</p>
            {slide.desc && <p style={{...styles.chapterSubtitle, fontSize: '14px', marginTop: '20px'}}>{slide.desc}</p>}
          </div>
        );
      
      case 'keypoints':
        return (
          <div style={styles.slide}>
            <span style={styles.kpHeader}>{slide.chapter}</span>
            <h2 style={styles.kpTitle}>{slide.title}</h2>
            <p style={styles.kpSubtitle}>{slide.subtitle}</p>
            <div style={styles.pointsGrid}>
              {slide.points.map(function(point, idx) {
                return (
                  <div key={idx} style={styles.pointCard}>
                    <div style={styles.pointIcon}>{point.icon}</div>
                    <div style={styles.pointLabel}>{point.label}</div>
                    <div style={styles.pointDesc}>{point.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case 'scene':
        return (
          <div style={styles.slide}>
            <div style={styles.sceneHeader}>
              <span style={styles.sceneChapter}>{slide.chapter}</span>
              <span style={styles.sceneBadge}>{slide.sceneNum}</span>
              <span style={styles.sceneTag}>{slide.tag}</span>
            </div>
            <h2 style={styles.kpTitle}>{slide.title}</h2>
            <p style={styles.kpSubtitle}>{slide.subtitle}</p>
            <div style={styles.sceneLayout}>
              <p style={styles.sceneBody}>{slide.body}</p>
              <img src={slide.imageUrl} alt={slide.title} style={styles.sceneImage} referrerPolicy="no-referrer" />
            </div>
          </div>
        );
      
      case 'imagetext':
        return (
          <div style={styles.slide}>
            <span style={styles.kpHeader}>{slide.chapter}</span>
            <h2 style={styles.kpTitle}>{slide.title}</h2>
            <p style={styles.kpSubtitle}>{slide.subtitle}</p>
            <div style={styles.sceneLayout}>
              <p style={styles.sceneBody}>{slide.body}</p>
              <img src={slide.imageUrl} alt={slide.title} style={styles.sceneImage} referrerPolicy="no-referrer" />
            </div>
          </div>
        );
      
      case 'timeline':
        return (
          <div style={styles.slide}>
            <span style={styles.kpHeader}>{slide.chapter}</span>
            <h2 style={{...styles.kpTitle, textAlign: 'center', marginBottom: '60px'}}>{slide.title}</h2>
            <div style={styles.timelineGrid}>
              <div style={styles.timelineLine}></div>
              {slide.items.map(function(item, idx) {
                return (
                  <div key={idx} style={styles.timelineItem}>
                    <div style={styles.timelineEra}>{item.era}</div>
                    <div style={styles.timelineTime}>{item.time}</div>
                    <div style={styles.timelineDot}></div>
                    <div style={styles.timelineDesc}>{item.desc}</div>
                    <img src={item.img} style={styles.timelineImg} referrerPolicy="no-referrer" />
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case 'programmable':
        return (
          <div style={styles.slide}>
            <span style={styles.kpHeader}>{slide.chapter}</span>
            <h2 style={{...styles.kpTitle, textAlign: 'center'}}>{slide.title}</h2>
            <p style={{...styles.kpSubtitle, textAlign: 'center'}}>{slide.subtitle}</p>
            <div style={styles.programmableLayout}>
              <div style={styles.programmablePanel}>
                <div style={styles.programmablePanelTitle}>{slide.leftTitle}</div>
                {slide.steps.map(function(step, idx) {
                  return (
                    <div key={idx} style={styles.programmableStep}>
                      <div style={styles.programmableStepNum}>{step.id}</div>
                      <div style={styles.programmableStepContent}>
                        <div style={styles.programmableStepText}>{step.text}</div>
                        <div style={styles.programmableStepSub}>{step.sub}</div>
                      </div>
                      <span style={styles.programmableArrow}>→</span>
                    </div>
                  );
                })}
              </div>
              <div style={styles.programmablePanel}>
                <div style={styles.programmablePanelTitle}>{slide.rightTitle}</div>
                <pre style={styles.programmableCode}>{slide.code}</pre>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div style={styles.slide}>Unknown slide type</div>;
    }
  };

  // 主题切换
  const toggleTheme = function() {
    const lightFormUuid = 'FORM-92A5B6E162E74BADBFB1330230E671BBFOYM';
    const darkFormUuid = 'FORM-37F657D589514A18B78AB044D42CD476SFFB';
    const currentFormUuid = 'FORM-92A5B6E162E74BADBFB1330230E671BBFOYM';
    const targetFormUuid = currentFormUuid === lightFormUuid ? darkFormUuid : lightFormUuid;
    
    // 使用宜搭 history push 切换页面
    if (window.history && window.history.push) {
      window.history.push('/' + targetFormUuid + '?isRenderNav=false');
    } else {
      window.location.href = '/APP_HN6AD1O7YJCTNY0LXWF7/workbench/' + targetFormUuid + '?isRenderNav=false';
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'none' }}>{timestamp}</div>
      <div style={styles.progress}></div>
      
      {/* 主题切换按钮 */}
      <button 
        style={styles.themeToggle}
        onClick={toggleTheme}
        title="切换深色模式"
      >
        <span>🌙</span>
        <span>深色模式</span>
      </button>
      
      {renderContent()}
      
      <div style={styles.nav}>
        <button 
          style={{...styles.navButton, ...(currentSlide === 0 ? styles.navButtonDisabled : {})}}
          onClick={prevSlide}
          disabled={currentSlide === 0}
        >
          ← 上一页
        </button>
        <span>{currentSlide + 1} / {SLIDES.length}</span>
        <button 
          style={{...styles.navButton, ...(currentSlide === SLIDES.length - 1 ? styles.navButtonDisabled : {})}}
          onClick={nextSlide}
          disabled={currentSlide === SLIDES.length - 1}
        >
          下一页 →
        </button>
      </div>
    </div>
  );
}
