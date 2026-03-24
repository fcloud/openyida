// ============================================================
// 悟空幻灯片 - 2026 AI Agent 实战分享
// 宜搭自定义页面版本
// ============================================================

// ============================================================
// 状态管理
// ============================================================

const _customState = {
  currentSlide: 0,
  totalSlides: 25,
};

/**
 * 获取状态
 * @param {string} [key] - 传入 key 返回单个值，不传返回全部状态的浅拷贝
 */
export function getCustomState(key) {
  if (key) {
    return _customState[key];
  }
  return { ..._customState };
}

/**
 * 设置状态（合并更新，自动触发重新渲染）
 * @param {Object} newState - 需要更新的状态键值对
 */
export function setCustomState(newState) {
  Object.keys(newState).forEach(function(key) {
    _customState[key] = newState[key];
  });
  this.forceUpdate();
}

/**
 * 强制重新渲染（通过更新 timestamp 触发 React 重渲染）
 */
export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

// ============================================================
// 生命周期
// ============================================================

/**
 * 页面加载完成时调用
 */
export function didMount() {
  console.log('悟空幻灯片已加载，当前幻灯片:', _customState.currentSlide);
  
  // 添加键盘事件监听
  var self = this;
  this._keyHandler = function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      nextSlide.call(self);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide.call(self);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSlide.call(self, 0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSlide.call(self, _customState.totalSlides - 1);
    }
  };
  document.addEventListener('keydown', this._keyHandler);
}

/**
 * 页面卸载时调用
 */
export function didUnmount() {
  // 清理键盘事件监听
  if (this._keyHandler) {
    document.removeEventListener('keydown', this._keyHandler);
  }
}

// ============================================================
// 导航方法
// ============================================================

export function goToSlide(index) {
  if (index < 0) index = 0;
  if (index >= _customState.totalSlides) index = _customState.totalSlides - 1;
  _customState.currentSlide = index;
  this.forceUpdate();
}

export function nextSlide() {
  goToSlide.call(this, _customState.currentSlide + 1);
}

export function prevSlide() {
  goToSlide.call(this, _customState.currentSlide - 1);
}

// ============================================================
// 渲染
// ============================================================

/**
 * 页面渲染函数
 */
export function renderJsx() {
  const { timestamp } = this.state;
  const self = this;
  
  // 使用 _customState 中的值
  const currentSlide = _customState.currentSlide;
  const totalSlides = _customState.totalSlides;

  // 样式定义
  var styles = {
    container: {
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      background: '#0a0a0f',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      position: 'relative',
      padding: '0 !important',
      margin: 0,
    },
    slide: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: 'clamp(40px, 8vw, 80px)',
    },
    slideBg: {
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      overflow: 'hidden',
      background: '#0a0a0f',
    },
    gridPattern: {
      backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
      backgroundSize: '60px 60px',
      opacity: 0.3,
      position: 'absolute',
      inset: 0,
    },
    gradientOrb: {
      position: 'absolute',
      width: '600px',
      height: '600px',
      background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
      borderRadius: '50%',
      filter: 'blur(60px)',
    },
    contentContainer: {
      position: 'relative',
      zIndex: 1,
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%',
    },
    eyebrow: {
      fontSize: 'clamp(14px, 2.2vw, 18px)',
      fontWeight: 600,
      color: '#6366f1',
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      marginBottom: 'clamp(16px, 3vw, 32px)',
      display: 'inline-block',
    },
    chapterLabel: {
      fontSize: 'clamp(11px, 1.8vw, 14px)',
      fontWeight: 500,
      color: '#6b6b7b',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      marginBottom: 'clamp(8px, 1.5vw, 12px)',
    },
    slideTitle: {
      fontSize: 'clamp(28px, 5vw, 48px)',
      fontWeight: 600,
      lineHeight: 1.2,
      marginBottom: 'clamp(8px, 2vw, 16px)',
      background: 'linear-gradient(135deg, #ffffff 0%, #a5a6f6 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    slideTitleWide: {
      fontSize: 'clamp(36px, 6vw, 72px)',
      fontWeight: 600,
      lineHeight: 1.2,
      marginBottom: 'clamp(16px, 3vw, 32px)',
      background: 'linear-gradient(135deg, #ffffff 0%, #a5a6f6 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      maxWidth: '100%',
      whiteSpace: 'nowrap',
    },
    slideSubtitle: {
      fontSize: 'clamp(14px, 2.5vw, 20px)',
      color: '#a0a0b0',
      lineHeight: 1.5,
      maxWidth: '900px',
      marginBottom: 'clamp(8px, 2vw, 16px)',
    },
    slideSubtitleCenter: {
      fontSize: 'clamp(16px, 3vw, 24px)',
      color: '#a0a0b0',
      lineHeight: 1.6,
      maxWidth: '900px',
      margin: '0 auto',
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 40vw, 400px), 1fr))',
      gap: 'clamp(16px, 3vw, 24px)',
      marginTop: 'clamp(24px, 4vw, 40px)',
    },
    featureCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: 'clamp(20px, 4vw, 32px)',
      backdropFilter: 'blur(10px)',
    },
    cardIcon: {
      fontSize: 'clamp(32px, 5vw, 48px)',
      marginBottom: 'clamp(12px, 2vw, 20px)',
    },
    cardLabel: {
      fontSize: 'clamp(16px, 2.8vw, 22px)',
      fontWeight: 600,
      color: '#ffffff',
      marginBottom: 'clamp(8px, 1.5vw, 12px)',
    },
    cardDesc: {
      fontSize: 'clamp(13px, 2.2vw, 16px)',
      color: '#a0a0b0',
      lineHeight: 1.6,
    },
    navDots: {
      position: 'fixed',
      right: 'clamp(20px, 4vw, 40px)',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 100,
    },
    navDot: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'none',
      cursor: 'pointer',
    },
    navDotActive: {
      background: '#6366f1',
      transform: 'scale(1.2)',
    },
    progressBar: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: '#12121a',
      zIndex: 100,
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      transition: 'width 0.3s ease',
    },
    slideCounter: {
      position: 'fixed',
      bottom: 'clamp(20px, 4vh, 40px)',
      left: 'clamp(20px, 4vw, 40px)',
      fontSize: 'clamp(12px, 2vw, 14px)',
      color: '#6b6b7b',
      zIndex: 100,
    },
    twoColumn: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'clamp(24px, 4vw, 48px)',
      alignItems: 'start',
      marginTop: 'clamp(16px, 3vw, 24px)',
      maxHeight: 'calc(100vh - 220px)',
      overflow: 'hidden',
    },
    imageContainer: {
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(255, 255, 255, 0.05)',
      maxHeight: 'calc(100vh - 280px)',
      display: 'flex',
      flexDirection: 'column',
    },
    image: {
      width: '100%',
      height: 'auto',
      maxHeight: 'calc(100vh - 440px)',
      maxWidth: '100%',
      objectFit: 'contain',
      display: 'block',
    },
    imageCaption: {
      padding: 'clamp(12px, 2vw, 20px)',
      fontSize: 'clamp(12px, 2vw, 14px)',
      color: '#6b6b7b',
      textAlign: 'center',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    },
    tagBadge: {
      display: 'inline-block',
      padding: '6px 14px',
      background: 'rgba(99, 102, 241, 0.1)',
      border: '1px solid #6366f1',
      borderRadius: '20px',
      fontSize: 'clamp(11px, 1.8vw, 13px)',
      color: '#818cf8',
      fontWeight: 500,
      marginRight: '8px',
      marginBottom: '8px',
    },
    partNumber: {
      fontSize: 'clamp(48px, 10vw, 120px)',
      fontWeight: 600,
      color: 'rgba(99, 102, 241, 0.2)',
      lineHeight: 1,
      marginBottom: 'clamp(-20px, -3vw, -40px)',
    },
    partTitle: {
      fontSize: 'clamp(36px, 7vw, 72px)',
      fontWeight: 600,
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: 1.2,
    },
    timeline: {
      position: 'relative',
      paddingLeft: 'clamp(30px, 5vw, 50px)',
      marginTop: 'clamp(24px, 4vw, 40px)',
    },
    timelineItem: {
      position: 'relative',
      paddingBottom: 'clamp(24px, 4vw, 40px)',
    },
    timelineMarker: {
      fontSize: 'clamp(12px, 2vw, 14px)',
      fontWeight: 600,
      color: '#6366f1',
      marginBottom: 'clamp(6px, 1vw, 10px)',
    },
    timelineTitle: {
      fontSize: 'clamp(18px, 3vw, 24px)',
      fontWeight: 600,
      color: '#ffffff',
      marginBottom: 'clamp(6px, 1vw, 10px)',
    },
    timelineDesc: {
      fontSize: 'clamp(13px, 2.2vw, 16px)',
      color: '#a0a0b0',
      lineHeight: 1.6,
    },
    quoteBlock: {
      marginBottom: '24px',
      padding: '20px',
      borderLeft: '3px solid #6366f1',
      background: 'rgba(99, 102, 241, 0.1)',
      borderRadius: '8px',
    },
    quoteText: {
      fontSize: 'clamp(16px, 2.5vw, 20px)',
      color: '#ffffff',
      fontStyle: 'italic',
      marginBottom: '8px',
    },
    quoteAuthor: {
      fontSize: 'clamp(12px, 2vw, 14px)',
      color: '#6b6b7b',
    },
    list: {
      color: '#a0a0b0',
      lineHeight: 2,
      paddingLeft: '20px',
    },
    accent: {
      color: '#6366f1',
    },
    warning: {
      color: '#f59e0b',
    },
    success: {
      color: '#10b981',
    },
    textCenter: {
      textAlign: 'center',
    },
    centerContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    },
    themeToggle: {
      position: 'fixed',
      top: 'clamp(16px, 3vh, 24px)',
      right: 'clamp(16px, 3vw, 24px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: 'clamp(12px, 1.8vw, 14px)',
      color: '#a0a0b0',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
    },
    themeToggleIcon: {
      fontSize: '16px',
    },
  };

  // 渲染幻灯片内容
  var slideContent;
  
  if (currentSlide === 0) {
    // Slide 1: 封面 - 修改标题和副标题
    slideContent = (
      <div style={styles.textCenter}>
        <div style={styles.eyebrow}>2026 AI Agent 实战分享</div>
        <h1 style={styles.slideTitleWide}>以"竹"名义，"连接"一切</h1>
        <p style={{ fontSize: 'clamp(16px, 3vw, 24px)', color: '#a0a0b0', lineHeight: 1.6, textAlign: 'center', margin: '20px auto 0' }}>悟空 - AI Agent 时代的人机协作新范式</p>
        <div style={{ marginTop: 'clamp(40px, 6vw, 80px)', paddingTop: 'clamp(30px, 5vw, 50px)', borderTop: '2px solid rgba(255, 255, 255, 0.1)' }}>
          <p style={{ color: '#6b6b7b', fontSize: 'clamp(14px, 2.2vw, 16px)' }}>杭远 · 钉钉华中区域解决方案总经理 · 2026.03</p>
        </div>
      </div>
    );
  } else if (currentSlide === 1) {
    // Slide 2: 关于我
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>演讲者介绍</div>
        <h2 style={styles.slideTitle}>杭远</h2>
        <p style={styles.slideSubtitle}>钉钉华中区域解决方案总经理</p>
        <div style={styles.cardGrid}>
          <div style={styles.featureCard}>
            <div style={styles.cardIcon}>🏢</div>
            <div style={styles.cardLabel}>区域解决方案负责人</div>
            <div style={styles.cardDesc}>负责钉钉在华中区域的企业数字化解决方案，推动 AI 与企业管理深度融合</div>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.cardIcon}>🤖</div>
            <div style={styles.cardLabel}>企业 AI 实践者</div>
            <div style={styles.cardDesc}>深度参与企业智能场景落地，探索 AI Agent 在企业服务中的创新应用</div>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.cardIcon}>🦞</div>
            <div style={styles.cardLabel}>OpenYida 推动者</div>
            <div style={styles.cardDesc}>让 AI 驱动低代码，让每个企业都能快速构建智能化应用</div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 2) {
    // Slide 3: Vibe Coding
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>开发方式</div>
        <h2 style={styles.slideTitle}>这个 PPT，是在悟空上做的</h2>
        <p style={styles.slideSubtitle}>Vibe Coding：用 AI 对话驱动开发</p>
        <div style={styles.twoColumn}>
          <div>
            <p style={{ color: '#a0a0b0', lineHeight: 1.8, marginBottom: '20px' }}>
              通过<strong style={styles.accent}>悟空平台 + OpenYida 技能</strong>，对话式完成了整套演讲 PPT 的开发和发布。
            </p>
            <p style={{ color: '#a0a0b0', lineHeight: 1.8 }}>这就是 AI Agent 的力量——不是未来，是现在。</p>
            <div style={{ marginTop: '24px' }}>
              <span style={styles.tagBadge}>🚀 悟空平台</span>
              <span style={styles.tagBadge}>⚡ OpenYida</span>
              <span style={styles.tagBadge}>💬 对话式开发</span>
            </div>
          </div>
          <div style={styles.imageContainer}>
            <img src="https://img.alicdn.com/imgextra/i1/O1CN01KCDUMi26YkXRBM1Aj_!!6000000007674-0-tps-2074-1716.jpg" alt="悟空 Vibe Coding" style={styles.image} />
            <div style={styles.imageCaption}>在悟空平台上通过对话完成 PPT 开发</div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 3) {
    // Slide 4: PART 01 - 修复容器高度和副标题居中
    slideContent = (
      <div style={styles.centerContainer}>
        <div style={styles.partNumber}>PART 01</div>
        <h1 style={styles.partTitle}>什么是 AI Agent？</h1>
        <p style={{ fontSize: 'clamp(16px, 3vw, 24px)', color: '#a0a0b0', lineHeight: 1.6, textAlign: 'center', marginTop: '20px' }}>从"问答机器"到"自主执行者"的进化</p>
      </div>
    );
  } else if (currentSlide === 4) {
    // Slide 5: Agent 定义
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>PART 01 · 什么是 AI Agent</div>
        <h2 style={styles.slideTitle}>Agent = 感知 + 规划 + 执行</h2>
        <p style={styles.slideSubtitle}>不只是聊天，而是真正帮你把事情做完</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div style={styles.featureCard}>
              <div style={styles.cardIcon}>👁️</div>
              <div style={styles.cardLabel}>感知 Perceive</div>
              <div style={styles.cardDesc}>理解你的意图、读取上下文、分析当前状态</div>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.cardIcon}>🧠</div>
              <div style={styles.cardLabel}>规划 Plan</div>
              <div style={styles.cardDesc}>拆解任务、制定步骤、选择合适的工具</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div style={styles.featureCard}>
              <div style={styles.cardIcon}>⚡</div>
              <div style={styles.cardLabel}>执行 Act</div>
              <div style={styles.cardDesc}>调用 API、操作系统、生成内容、完成交付</div>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.cardIcon}>🔄</div>
              <div style={styles.cardLabel}>反思 Reflect</div>
              <div style={styles.cardDesc}>检查结果、发现错误、自动修正重试</div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 5) {
    // Slide 6: PART 02 - 修复容器高度和副标题居中
    slideContent = (
      <div style={styles.centerContainer}>
        <div style={{ fontSize: 'clamp(48px, 10vw, 120px)', fontWeight: 600, color: 'rgba(0, 137, 255, 0.2)', lineHeight: 1, marginBottom: 'clamp(-20px, -3vw, -40px)' }}>PART 02</div>
        <h1 style={{ fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 600, background: 'linear-gradient(135deg, #0ea5e9 0%, #0089ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.2 }}>OpenClaw 龙虾</h1>
        <p style={{ fontSize: 'clamp(16px, 3vw, 24px)', color: '#a0a0b0', lineHeight: 1.6, textAlign: 'center', marginTop: '20px' }}>开源 Agent 框架，三周超越 Linux 三十年</p>
      </div>
    );
  } else if (currentSlide === 6) {
    // Slide 7: OpenClaw 时间线
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>PART 02 · OpenClaw 龙虾</div>
        <h2 style={styles.slideTitle}>OpenClaw 是怎么火起来的？</h2>
        <p style={styles.slideSubtitle}>从一个开源项目，到改变世界的软件——只用了三周</p>
        <div style={styles.timeline}>
          <div style={styles.timelineItem}>
            <div style={styles.timelineMarker}>🛠️ 2025 年 11 月 · 诞生</div>
            <div style={styles.timelineTitle}>独立开发者发布 OpenClaw</div>
            <div style={styles.timelineDesc}>一个让 AI 真正操控电脑的开源 Agent 框架。Logo 是只龙虾，中文圈戏称"养龙虾"</div>
          </div>
          <div style={styles.timelineItem}>
            <div style={styles.timelineMarker}>🚀 2026 年 3 月 6 日 · 引爆</div>
            <div style={styles.timelineTitle}>腾讯云组织现场排队安装</div>
            <div style={styles.timelineDesc}>在深圳腾讯大厦门前广场举办活动，"养龙虾"话题席卷全网，全民跟风入局</div>
          </div>
          <div style={styles.timelineItem}>
            <div style={styles.timelineMarker}>📈 3 周内 · 超越 Linux</div>
            <div style={styles.timelineTitle}>史上增长最快的开源项目</div>
            <div style={styles.timelineDesc}>GitHub Stars 60 天斩获 28 万，下载量在三周内超越 Linux 三十年的积累</div>
          </div>
          <div style={styles.timelineItem}>
            <div style={styles.timelineMarker}>🏆 GTC 大会 · 封神</div>
            <div style={styles.timelineTitle}>黄仁勋高度评价</div>
            <div style={styles.timelineDesc}>"这是我们这个时代最重要的软件发布，每家公司都需要制定龙虾战略"</div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 7) {
    // Slide 8: Mac Mini
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>PART 02 · OpenClaw 龙虾</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={styles.tagBadge}>🖥️ 本地部署</span>
        </div>
        <h2 style={styles.slideTitle}>Mac Mini M4：最佳本地 AI 实验平台</h2>
        <p style={styles.slideSubtitle}>低成本、低功耗、高性能，7×24 小时在线</p>
        <div style={styles.twoColumn}>
          <div>
            <p style={{ color: '#a0a0b0', lineHeight: 1.8, marginBottom: '20px' }}>
              在部署龙虾的过程中，我尝试了云服务器、Windows PC、Linux 主机，最终发现 Mac Mini M4 是最优解：
            </p>
            <ul style={styles.list}>
              <li><strong style={styles.accent}>38 TOPS ANE 算力</strong> → 7B-13B 模型推理 19-20 tokens/s</li>
              <li><strong style={styles.accent}>待机仅 3-6W</strong> → 年电费不足 50 元，静音被动散热</li>
              <li><strong style={styles.accent}>16GB 统一内存</strong> → 实际可用性接近传统 PC 的 32GB</li>
            </ul>
            <p style={{ color: '#a0a0b0', lineHeight: 1.8, marginTop: '20px' }}>
              <strong style={styles.accent}>Mac Mini M4 + 龙虾 = 完美的本地 AI 实验平台</strong>
            </p>
          </div>
          <div style={styles.imageContainer}>
            <img src="https://img.alicdn.com/imgextra/i3/O1CN014yYsDR1jS7dzzVtin_!!6000000004546-0-tps-1320-2231.jpg" alt="Mac Mini M4" style={styles.image} />
            <div style={styles.imageCaption}>Mac Mini M4 本地 AI 工作站</div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 8) {
    // Slide 9: SAP 迁移
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>PART 02 · OpenClaw 龙虾</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={styles.tagBadge}>🏗️ 系统迁移</span>
        </div>
        <h2 style={styles.slideTitle}>用 OpenYida 复刻 SAP 系统</h2>
        <p style={styles.slideSubtitle}>AI 自动学习 SAP 架构，宜搭快速复刻 + 数据迁移</p>
        <div style={styles.twoColumn}>
          <div>
            <p style={{ color: '#a0a0b0', lineHeight: 1.8, marginBottom: '20px' }}>
              企业用了十几年的 SAP，想换但迁移成本太高？
            </p>
            <ol style={styles.list}>
              <li>OpenYida 自动分析 SAP 系统架构和业务逻辑</li>
              <li>在宜搭上快速复刻对应的表单、流程和权限体系</li>
              <li>历史数据一键迁移</li>
              <li>通过 HTTP 连接器与 SAP 保持实时数据连接</li>
            </ol>
            <p style={{ color: '#a0a0b0', lineHeight: 1.8, marginTop: '20px' }}>
              <strong style={styles.accent}>不是推倒重来，而是平滑过渡</strong>
            </p>
          </div>
          <div style={styles.imageContainer}>
            <img src="https://img.alicdn.com/imgextra/i2/O1CN01fs5WhH1m1VTW9ZMhK_!!6000000004894-0-tps-1320-2051.jpg" alt="SAP 迁移" style={styles.image} />
            <div style={styles.imageCaption}>SAP → 宜搭系统迁移</div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 9) {
    // Slide 10: 自动提需求
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>PART 02 · OpenClaw 龙虾</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={styles.tagBadge}>📋 流程自动化</span>
        </div>
        <h2 style={styles.slideTitle}>Agent 自动提需求</h2>
        <p style={styles.slideSubtitle}>从"用户反馈"到"需求工单"全自动</p>
        <div style={styles.twoColumn}>
          <div>
            <p style={{ color: '#a0a0b0', lineHeight: 1.8, marginBottom: '20px' }}>
              Agent 持续监控用户反馈渠道：
            </p>
            <ul style={styles.list}>
              <li>聚类相似问题</li>
              <li>分析优先级</li>
              <li>生成标准需求文档</li>
              <li>自动创建工单</li>
            </ul>
            <p style={{ color: '#a0a0b0', lineHeight: 1.8, marginTop: '20px' }}>
              产品经理从"整理反馈"中解放出来。
            </p>
          </div>
          <div style={styles.imageContainer}>
            <img src="https://img.alicdn.com/imgextra/i4/O1CN01YgmZx126P8DjenDGD_!!6000000007653-0-tps-1320-1160.jpg" alt="自动提需求" style={styles.image} />
            <div style={styles.imageCaption}>Agent 自动提需求工单</div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 10) {
    // Slide 11: 小红书
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>PART 02 · OpenClaw 龙虾</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={styles.tagBadge}>✍️ 内容创作</span>
        </div>
        <h2 style={styles.slideTitle}>一键生成小红书笔记</h2>
        <p style={styles.slideSubtitle}>输入主题，输出爆款格式内容</p>
        <div style={styles.twoColumn}>
          <div>
            <p style={{ color: '#a0a0b0', lineHeight: 1.8, marginBottom: '20px' }}>
              告诉 Agent 你想分享什么，它自动：
            </p>
            <ul style={styles.list}>
              <li>分析爆款结构</li>
              <li>生成标题 + 正文 + 标签</li>
              <li>配图建议</li>
              <li>发布时间推荐</li>
            </ul>
            <p style={{ color: '#a0a0b0', lineHeight: 1.8, marginTop: '20px' }}>
              内容创作效率提升 10 倍。
            </p>
          </div>
          <div style={styles.imageContainer}>
            <img src="https://img.alicdn.com/imgextra/i2/O1CN01BS7oDq1haFRJB7PoG_!!6000000004293-0-tps-1076-2103.jpg" alt="小红书生成" style={styles.image} />
            <div style={styles.imageCaption}>小红书内容自动生成</div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 11) {
    // Slide 12: 公众号 NotebookLM
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>PART 02 · OpenClaw 龙虾</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={styles.tagBadge}>📚 知识管理</span>
        </div>
        <h2 style={styles.slideTitle}>把公众号当 NotebookLM 用</h2>
        <p style={styles.slideSubtitle}>让 OpenClaw 帮你消化所有订阅内容</p>
        <div style={styles.twoColumn}>
          <div>
            <p style={{ color: '#a0a0b0', lineHeight: 1.8, marginBottom: '20px' }}>
              关注了几百个公众号，但根本看不完？
            </p>
            <ul style={styles.list}>
              <li>OpenClaw 自动抓取订阅公众号的最新文章</li>
              <li>提炼核心观点</li>
              <li>建立个人知识库</li>
              <li>随时问随时答</li>
            </ul>
            <p style={{ color: '#a0a0b0', lineHeight: 1.8, marginTop: '20px' }}>
              就像 NotebookLM，但内容来源是你精心挑选的公众号。
            </p>
          </div>
          <div style={styles.imageContainer}>
            <img src="https://img.alicdn.com/imgextra/i1/O1CN01Rie0TX1Q22O4coira_!!6000000001917-0-tps-1320-2168.jpg" alt="公众号知识库" style={styles.image} />
            <div style={styles.imageCaption}>公众号内容知识库</div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 12) {
    // Slide 13: PART 03 - 修复容器高度和副标题居中
    slideContent = (
      <div style={styles.centerContainer}>
        <div style={{ fontSize: 'clamp(48px, 10vw, 120px)', fontWeight: 600, color: 'rgba(245, 158, 11, 0.2)', lineHeight: 1, marginBottom: 'clamp(-20px, -3vw, -40px)' }}>PART 03</div>
        <h1 style={{ fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 600, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.2 }}>安全与企业级挑战</h1>
        <p style={{ fontSize: 'clamp(16px, 3vw, 24px)', color: '#a0a0b0', lineHeight: 1.6, textAlign: 'center', marginTop: '20px' }}>权限管不住、操作查不到、成本算不清</p>
      </div>
    );
  } else if (currentSlide === 13) {
    // Slide 14: 不可能三角
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>PART 03 · 安全与企业级</div>
        <h2 style={styles.slideTitle}>企业级 Agent 的"不可能三角"</h2>
        <p style={styles.slideSubtitle}>"权限管不住、操作查不到、成本算不清" — 无招</p>
        <div style={styles.cardGrid}>
          <div style={Object.assign({}, styles.featureCard, { borderColor: 'rgba(245, 158, 11, 0.3)' })}>
            <div style={styles.cardIcon}>🔓</div>
            <div style={styles.cardLabel}>权限失控</div>
            <div style={styles.cardDesc}>龙虾为了完成任务，可能顺着内网爬取 CFO 电脑里的核心财务报表</div>
          </div>
          <div style={Object.assign({}, styles.featureCard, { borderColor: 'rgba(245, 158, 11, 0.3)' })}>
            <div style={styles.cardIcon}>🕳️</div>
            <div style={styles.cardLabel}>黑盒不可审计</div>
            <div style={styles.cardDesc}>Meta 安全总监亲测：安装龙虾后，200 多封重要邮件瞬间被删得干干净净</div>
          </div>
          <div style={Object.assign({}, styles.featureCard, { borderColor: 'rgba(245, 158, 11, 0.3)' })}>
            <div style={styles.cardIcon}>💸</div>
            <div style={styles.cardLabel}>成本算不清</div>
            <div style={styles.cardDesc}>Agent 陷入死循环，不断发起万次无效 API 请求，月底账单老板看不懂</div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 14) {
    // Slide 15: AI 安全红线
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>PART 03 · 安全与企业级</div>
        <h2 style={styles.slideTitle}>AI 安全：不可忽视的红线</h2>
        <p style={styles.slideSubtitle}>自主执行能力越强，风险管控越重要</p>
        <div style={styles.cardGrid}>
          <div style={styles.featureCard}>
            <div style={styles.cardIcon}>🔑</div>
            <div style={styles.cardLabel}>权限最小化</div>
            <div style={styles.cardDesc}>Agent 只能访问完成任务所必需的最小权限范围</div>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.cardIcon}>📋</div>
            <div style={styles.cardLabel}>全链路审计</div>
            <div style={styles.cardDesc}>每一步操作都有完整日志记录，出了问题可以精确溯源</div>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.cardIcon}>🛑</div>
            <div style={styles.cardLabel}>关键步骤人工确认</div>
            <div style={styles.cardDesc}>涉及删除、转账、外发等高风险操作，必须人工二次确认</div>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.cardIcon}>⚡</div>
            <div style={styles.cardLabel}>异常自动熔断</div>
            <div style={styles.cardDesc}>检测到死循环、异常调用时，立即中断 Agent 执行</div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 15) {
    // Slide 16: 国家政策
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>PART 03 · 安全与企业级</div>
        <h2 style={styles.slideTitle}>国家怎么看"龙虾"？</h2>
        <p style={styles.slideSubtitle}>鼓励与警惕并行，监管正在跟上</p>
        <div style={styles.timeline}>
          <div style={styles.timelineItem}>
            <div style={styles.timelineMarker}>🏛️ 深圳龙岗"龙虾十条"</div>
            <div style={styles.timelineTitle}>地方政府率先入场</div>
            <div style={styles.timelineDesc}>鼓励推出"龙虾服务区"，免费提供 OpenClaw 部署服务，最高补贴 500 万元</div>
          </div>
          <div style={styles.timelineItem}>
            <div style={styles.timelineMarker}>⚠️ 工信部安全警示</div>
            <div style={styles.timelineTitle}>官方发出风险提示</div>
            <div style={styles.timelineDesc}>OpenClaw 部分实例在默认或不当配置下存在严重安全风险</div>
          </div>
          <div style={styles.timelineItem}>
            <div style={styles.timelineMarker}>🔒 CNNVD 漏洞统计</div>
            <div style={styles.timelineTitle}>82 个漏洞，12 个超危</div>
            <div style={styles.timelineDesc}>2026 年 1-3 月已发现漏洞 82 个，其中超危 12 个、高危 21 个</div>
          </div>
          <div style={styles.timelineItem}>
            <div style={styles.timelineMarker}>🚫 国企和政府机关</div>
            <div style={styles.timelineTitle}>非必要不部署</div>
            <div style={styles.timelineDesc}>多家央企、国企 IT 部门下达禁令，严禁接入真实业务系统</div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 16) {
    // Slide 17: PART 04 - 修复容器高度和副标题居中
    slideContent = (
      <div style={styles.centerContainer}>
        <div style={{ fontSize: 'clamp(48px, 10vw, 120px)', fontWeight: 600, color: 'rgba(0, 201, 167, 0.2)', lineHeight: 1, marginBottom: 'clamp(-20px, -3vw, -40px)' }}>PART 04</div>
        <h1 style={{ fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 600, background: 'linear-gradient(135deg, #00c9a7 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.2 }}>悟空：企业级 AI Agent</h1>
        <p style={{ fontSize: 'clamp(16px, 3vw, 24px)', color: '#a0a0b0', lineHeight: 1.6, textAlign: 'center', marginTop: '20px' }}>龙虾是"野生 Agent"，悟空是"正规军"</p>
      </div>
    );
  } else if (currentSlide === 17) {
    // Slide 18: 无招金句
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>PART 04 · 悟空</div>
        <h2 style={styles.slideTitle}>阿里无招说</h2>
        <p style={styles.slideSubtitle}>悟空发布会现场金句</p>
        <div style={{ marginTop: '30px' }}>
          <div style={styles.quoteBlock}>
            <div style={styles.quoteText}>"今天，我们把钉钉打碎，用 AI 重建，炼出悟空。"</div>
            <div style={styles.quoteAuthor}>2026.03.17 悟空发布会开场</div>
          </div>
          <div style={styles.quoteBlock}>
            <div style={styles.quoteText}>"过去是人用钉钉来工作，未来是 AI 用钉钉来工作。"</div>
            <div style={styles.quoteAuthor}>重新定义人机协作的底层逻辑</div>
          </div>
          <div style={styles.quoteBlock}>
            <div style={styles.quoteText}>"龙虾关在主机里，是因为我们还没准备好放生它。"</div>
            <div style={styles.quoteAuthor}>解释为何悟空晚于龙虾发布</div>
          </div>
          <div style={styles.quoteBlock}>
            <div style={styles.quoteText}>"宁愿晚生，也要把安全做到极致。"</div>
            <div style={styles.quoteAuthor}>悟空安全设计理念</div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 18) {
    // Slide 19: 人机协作的范式跃迁（新增）
    slideContent = (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingTop: '20px', paddingBottom: '20px' }}>
        <div>
          <div style={styles.chapterLabel}>PART 04 · 悟空</div>
          <h2 style={Object.assign({}, styles.slideTitle, { textAlign: 'center', marginBottom: '40px' })}>人机协作的范式跃迁</h2>
        </div>
        
        {/* 时间轴线容器 */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          {/* 贯穿的横线 - 现在位于标题下方 */}
          <div style={{ position: 'absolute', top: '63px', left: '11.5%', right: '11.5%', height: '2px', background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)', zIndex: 1 }}></div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', width: '100%' }}>
            {/* DOS时代 */}
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
              {/* 标题和时间 - 在线上方 */}
              <div style={{ fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>DOS时代</div>
              <div style={{ fontSize: 'clamp(10px, 1.5vw, 12px)', color: '#6b6b7b', marginBottom: '16px' }}>1981-1985</div>
              {/* 节点圆点 */}
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#6366f1', margin: '0 auto 16px', border: '2px solid #0a0a0f' }}></div>
              <div style={{ fontSize: 'clamp(11px, 1.6vw, 13px)', color: '#a0a0b0', lineHeight: 1.5, marginBottom: '16px', minHeight: '60px', padding: '0 8px' }}>
                人使用机器语言与机器交互，需记忆指令格式。
              </div>
              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <img src="https://img.alicdn.com/imgextra/i2/O1CN01A4XRVN1SyK1PbpVSn_!!6000000002315-2-tps-730-466.png" alt="DOS时代" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            </div>
            {/* GUI时代 */}
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
              {/* 标题和时间 - 在线上方 */}
              <div style={{ fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>GUI时代</div>
              <div style={{ fontSize: 'clamp(10px, 1.5vw, 12px)', color: '#6b6b7b', marginBottom: '16px' }}>1985-2007</div>
              {/* 节点圆点 */}
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#6366f1', margin: '0 auto 16px', border: '2px solid #0a0a0f' }}></div>
              <div style={{ fontSize: 'clamp(11px, 1.6vw, 13px)', color: '#a0a0b0', lineHeight: 1.5, marginBottom: '16px', minHeight: '60px', padding: '0 8px' }}>
                机器以人类可理解的视觉方式呈现，实现"所见即所得"的交互。
              </div>
              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <img src="https://img.alicdn.com/imgextra/i1/O1CN011fEysu1TncNgelMws_!!6000000002427-2-tps-730-460.png" alt="GUI时代" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            </div>
            {/* LUI时代 */}
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
              {/* 标题和时间 - 在线上方 */}
              <div style={{ fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>LUI时代</div>
              <div style={{ fontSize: 'clamp(10px, 1.5vw, 12px)', color: '#6b6b7b', marginBottom: '16px' }}>2007-2025</div>
              {/* 节点圆点 */}
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#6366f1', margin: '0 auto 16px', border: '2px solid #0a0a0f' }}></div>
              <div style={{ fontSize: 'clamp(11px, 1.6vw, 13px)', color: '#a0a0b0', lineHeight: 1.5, marginBottom: '16px', minHeight: '60px', padding: '0 8px' }}>
                人发出指令，AI理解并找人或工具执行。因表达有理解，自然语言成重要载体。
              </div>
              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <img src="https://img.alicdn.com/imgextra/i1/O1CN01tPNsAt1t4tibHGQnD_!!6000000005849-2-tps-730-460.png" alt="LUI时代" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            </div>
            {/* CLI时代 */}
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
              {/* 标题和时间 - 在线上方 */}
              <div style={{ fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>CLI时代</div>
              <div style={{ fontSize: 'clamp(10px, 1.5vw, 12px)', color: '#6b6b7b', marginBottom: '16px' }}>2025-</div>
              {/* 节点圆点 */}
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#6366f1', margin: '0 auto 16px', border: '2px solid #0a0a0f' }}></div>
              <div style={{ fontSize: 'clamp(11px, 1.6vw, 13px)', color: '#a0a0b0', lineHeight: 1.5, marginBottom: '16px', minHeight: '60px', padding: '0 8px' }}>
                AI成为主导，可依据员工主观意图变化，实现复杂任务的自主交付。
              </div>
              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <img src="https://img.alicdn.com/imgextra/i1/O1CN0101olaY24f2kXs6074_!!6000000007417-2-tps-1691-1077.png" alt="CLI时代" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 20) {
    // Slide 21: DingTalk CLI
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>PART 04 · 悟空</div>
        <h2 style={Object.assign({}, styles.slideTitle, { textAlign: 'center', fontSize: 'clamp(32px, 6vw, 56px)' })}>DingTalk CLI</h2>
        <p style={{ fontSize: 'clamp(14px, 2.5vw, 20px)', color: '#a0a0b0', lineHeight: 1.5, textAlign: 'center', marginBottom: '40px' }}>万级原子化指令，全面打通人、AI 与业务系统</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div style={Object.assign({}, styles.imageContainer, { maxHeight: 'none' })}>
            <img src="https://img.alicdn.com/imgextra/i1/O1CN01qThBs11wQN8UxfKNg_!!6000000006302-2-tps-2768-2470.png" alt="Command Creation" style={Object.assign({}, styles.image, { maxHeight: 'none' })} />
          </div>
          <div style={Object.assign({}, styles.imageContainer, { maxHeight: 'none' })}>
            <img src="https://img.alicdn.com/imgextra/i2/O1CN01OdT4IE29Zc8K2YbO0_!!6000000008082-2-tps-2846-2516.png" alt="AI Ready Language" style={Object.assign({}, styles.image, { maxHeight: 'none' })} />
          </div>
          <div style={Object.assign({}, styles.imageContainer, { maxHeight: 'none' })}>
            <img src="https://img.alicdn.com/imgextra/i3/O1CN01VfVKFr1FHBiMpyoeW_!!6000000000461-2-tps-2768-2470.png" alt="Ultra-Lightweight" style={Object.assign({}, styles.image, { maxHeight: 'none' })} />
          </div>
        </div>
        <p style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', color: '#6b6b7b', lineHeight: 1.6, textAlign: 'center', marginTop: '32px' }}>50 年前 Unix 串起 0 和 1，如今 AI+CLI 再次串起生产力</p>
      </div>
    );
  } else if (currentSlide === 21) {
    // Slide 22: 悟空三大安全杀器
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>PART 04 · 悟空</div>
        <h2 style={styles.slideTitle}>悟空的三重安全防线</h2>
        <p style={styles.slideSubtitle}>企业级 Agent 的安全基石</p>
        <div style={styles.cardGrid}>
          <div style={Object.assign({}, styles.featureCard, { borderColor: '#10b981' })}>
            <div style={styles.cardIcon}>🔐</div>
            <div style={Object.assign({}, styles.cardLabel, { color: '#10b981' })}>原生权限继承</div>
            <div style={styles.cardDesc}>Agent 自动继承员工在钉钉/宜搭中的现有权限</div>
          </div>
          <div style={Object.assign({}, styles.featureCard, { borderColor: '#10b981' })}>
            <div style={styles.cardIcon}>📜</div>
            <div style={Object.assign({}, styles.cardLabel, { color: '#10b981' })}>全链路审计</div>
            <div style={styles.cardDesc}>每一步操作都有完整日志记录，支持精确溯源</div>
          </div>
          <div style={Object.assign({}, styles.featureCard, { borderColor: '#10b981' })}>
            <div style={styles.cardIcon}>⚙️</div>
            <div style={Object.assign({}, styles.cardLabel, { color: '#10b981' })}>CLI 化底层重构</div>
            <div style={styles.cardDesc}>通过命令行接口实现细粒度权限控制</div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 19) {
    // Slide 20: Programmable Enterprise
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>PART 04 · 悟空</div>
        <h2 style={Object.assign({}, styles.slideTitle, { textAlign: 'center', fontSize: 'clamp(24px, 4vw, 40px)' })}>Programmable Enterprise</h2>
        <p style={{ fontSize: 'clamp(14px, 2.5vw, 20px)', color: '#a0a0b0', lineHeight: 1.5, textAlign: 'center', marginBottom: '32px' }}>企业中有大量可被编程的流程</p>
        
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', alignItems: 'stretch' }}>
          {/* 左侧：业务流程 */}
          <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: 'clamp(12px, 1.8vw, 14px)', color: '#6b6b7b' }}>业务流程</span>
              <span style={{ fontSize: 'clamp(12px, 1.8vw, 14px)', color: '#6366f1' }}>HR | 月度考勤巡检流程</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 600 }}>1</div>
                <span style={{ fontSize: 'clamp(12px, 1.8vw, 14px)', color: '#ffffff' }}>拉部门花名册</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 600 }}>2</div>
                <span style={{ fontSize: 'clamp(12px, 1.8vw, 14px)', color: '#ffffff' }}>批量查排班</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 600 }}>3</div>
                <span style={{ fontSize: 'clamp(12px, 1.8vw, 14px)', color: '#ffffff' }}>逐个查考勤记录</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 600 }}>4</div>
                <span style={{ fontSize: 'clamp(12px, 1.8vw, 14px)', color: '#ffffff' }}>如果有异常处理</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 600 }}>5</div>
                <span style={{ fontSize: 'clamp(12px, 1.8vw, 14px)', color: '#ffffff' }}>登记到"考勤异常台账"</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 600 }}>6</div>
                <span style={{ fontSize: 'clamp(12px, 1.8vw, 14px)', color: '#ffffff' }}>向部门群通报考勤情况</span>
              </div>
            </div>
          </div>
          
          {/* 中间箭头 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ fontSize: '20px', color: '#6366f1' }}>→</div>
              <div style={{ fontSize: '20px', color: '#6366f1' }}>→</div>
              <div style={{ fontSize: '20px', color: '#6366f1' }}>→</div>
              <div style={{ fontSize: '20px', color: '#6366f1' }}>→</div>
              <div style={{ fontSize: '20px', color: '#6366f1' }}>→</div>
              <div style={{ fontSize: '20px', color: '#6366f1' }}>→</div>
            </div>
          </div>
          
          {/* 右侧：程序逻辑 */}
          <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: 'clamp(12px, 1.8vw, 14px)', color: '#6b6b7b' }}>程序逻辑</span>
              <span style={{ fontSize: 'clamp(12px, 1.8vw, 14px)', color: '#10b981' }}>Python</span>
            </div>
            
            <div style={{ fontFamily: 'monospace', fontSize: 'clamp(10px, 1.5vw, 12px)', color: '#a0a0b0', lineHeight: 1.8, background: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: '8px', overflow: 'auto' }}>
              <div><span style={{ color: '#6b6b7b' }}># 1. 获取部门成员</span></div>
              <div>members = get_dept_members("产品部")</div>
              <div style={{ marginTop: '8px' }}><span style={{ color: '#6b6b7b' }}># 2. 批量查排班</span></div>
              <div>shifts = get_shifts(members, "02-01", "02-28")</div>
              <div style={{ marginTop: '8px' }}><span style={{ color: '#6b6b7b' }}># 3. 逐个查考勤记录</span></div>
              <div>for user in members:</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;record = get_attendance(user, "02-28")</div>
              <div style={{ marginTop: '8px' }}><span style={{ color: '#6b6b7b' }}># 4. 如果有异常处理</span></div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;if record.status == "异常":</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;log_exception(user)</div>
              <div style={{ marginTop: '8px' }}><span style={{ color: '#6b6b7b' }}># 5. 登记到"考勤异常台账"</span></div>
              <div>log_exception(user, "02-28", "未打卡")</div>
              <div style={{ marginTop: '8px' }}><span style={{ color: '#6b6b7b' }}># 6. 向部门群通报</span></div>
              <div>notify_dept("产品部群", "2月考勤巡检完毕")</div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 22) {
    // Slide 23: ATH 事业群
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>PART 04 · 悟空</div>
        <h2 style={styles.slideTitle}>ATH 事业群：阿里 AI 战略全面升级</h2>
        <p style={styles.slideSubtitle}>2026 年 3 月 16 日，吴泳铭直接挂帅</p>
        <div style={styles.cardGrid}>
          <div style={styles.featureCard}>
            <div style={styles.cardIcon}>🧬</div>
            <div style={styles.cardLabel}>通义实验室</div>
            <div style={styles.cardDesc}>创造领先的多模态模型，追求基础模型能力上限</div>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.cardIcon}>☁️</div>
            <div style={styles.cardLabel}>MaaS 业务线</div>
            <div style={styles.cardDesc}>构建高效开放的模型服务平台，支撑全行业 AI 生态</div>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.cardIcon}>👤</div>
            <div style={styles.cardLabel}>千问事业部</div>
            <div style={styles.cardDesc}>打造最好的个人 AI 助手（To C），面向亿级用户</div>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.cardIcon}>🏢</div>
            <div style={styles.cardLabel}>悟空事业部</div>
            <div style={styles.cardDesc}>打造 B 端 AI 原生工作平台（To B），覆盖 2000 万企业</div>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 23) {
    // Slide 24: 对比总结
    slideContent = (
      <div>
        <div style={styles.chapterLabel}>总结对比</div>
        <h2 style={styles.slideTitle}>龙虾 vs 悟空：定位不同，各有所长</h2>
        <p style={styles.slideSubtitle}>选择适合你的 Agent 方案</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '30px' }}>
          <div style={Object.assign({}, styles.featureCard, { borderColor: 'rgba(0, 137, 255, 0.3)' })}>
            <h3 style={{ color: '#0ea5e9', marginBottom: '16px' }}>🦞 OpenClaw 龙虾</h3>
            <ul style={styles.list}>
              <li>开源免费，社区驱动</li>
              <li>本地部署，完全控制</li>
              <li>适合个人和极客</li>
              <li>灵活性强，可玩性高</li>
              <li><strong style={styles.warning}>企业使用需谨慎评估风险</strong></li>
            </ul>
          </div>
          <div style={Object.assign({}, styles.featureCard, { borderColor: 'rgba(0, 201, 167, 0.3)' })}>
            <h3 style={{ color: '#00c9a7', marginBottom: '16px' }}>🐵 悟空</h3>
            <ul style={styles.list}>
              <li>企业级产品，商业授权</li>
              <li>原生集成钉钉/宜搭</li>
              <li>适合企业和组织</li>
              <li>安全可控，合规审计</li>
              <li><strong style={styles.success}>为企业场景深度优化</strong></li>
            </ul>
          </div>
        </div>
      </div>
    );
  } else if (currentSlide === 24) {
    // Slide 25: 结束页
    slideContent = (
      <div style={styles.textCenter}>
        <div style={styles.eyebrow}>谢谢观看</div>
        <h1 style={styles.slideTitle}>Q&A</h1>
        <p style={{ fontSize: 'clamp(14px, 2.5vw, 20px)', color: '#a0a0b0', lineHeight: 1.5, textAlign: 'center', margin: '0 auto' }}>让我们一起迎接 AI Agent 时代</p>
        <div style={{ marginTop: 'clamp(40px, 6vw, 80px)' }}>
          <p style={{ color: '#6b6b7b', fontSize: 'clamp(14px, 2.2vw, 16px)' }}>杭远 · 钉钉华中区域解决方案总经理</p>
        </div>
      </div>
    );
  }

  // 渲染导航点
  var navDots = [];
  for (var i = 0; i < totalSlides; i++) {
    var isActive = i === currentSlide;
    navDots.push(
      <button
        key={i}
        style={Object.assign({}, styles.navDot, isActive ? styles.navDotActive : {})}
        onClick={function(idx) { return function() { goToSlide.call(self, idx); }; }(i)}
      />
    );
  }

  return (
    <div style={styles.container}>
      {/* 隐藏的 timestamp 用于触发重新渲染 */}
      <div style={{ display: "none" }}>{timestamp}</div>
      
      {/* 幻灯片内容 */}
      <div style={styles.slide}>
        <div style={styles.slideBg}>
          <div style={styles.gridPattern}></div>
          <div style={Object.assign({}, styles.gradientOrb, { top: '-200px', right: '-200px' })}></div>
          <div style={Object.assign({}, styles.gradientOrb, { bottom: '-200px', left: '-200px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)' })}></div>
        </div>
        
        <div style={styles.contentContainer}>
          {slideContent}
        </div>
      </div>
      
      {/* 导航点 */}
      <div style={styles.navDots}>
        {navDots}
      </div>
      
      {/* 进度条 */}
      <div style={styles.progressBar}>
        <div style={Object.assign({}, styles.progressFill, { width: ((currentSlide + 1) / totalSlides) * 100 + '%' })}></div>
      </div>
      
      {/* 幻灯片计数器 */}
      <div style={styles.slideCounter}>
        {(currentSlide + 1)} / {totalSlides}
      </div>
      
      {/* 主题切换按钮 */}
      <div
        style={styles.themeToggle}
        title="切换到浅色模式"
        onClick={function() {
          if (self.history && self.history.push) {
            self.history.push('/APP_HN6AD1O7YJCTNY0LXWF7/workbench/FORM-92A5B6E162E74BADBFB1330230E671BBFOYM?isRenderNav=false');
          } else {
            window.location.href = 'https://ding.aliwork.com/APP_HN6AD1O7YJCTNY0LXWF7/workbench/FORM-92A5B6E162E74BADBFB1330230E671BBFOYM?isRenderNav=false';
          }
        }}
      >
        <span style={styles.themeToggleIcon}>☀️</span>
        <span>浅色模式</span>
      </div>
      
      {/* 点击区域导航 */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '30%', height: '100%', zIndex: 50 }} onClick={function() { prevSlide.call(self); }}></div>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '30%', height: '100%', zIndex: 50 }} onClick={function() { nextSlide.call(self); }}></div>
    </div>
  );
}
