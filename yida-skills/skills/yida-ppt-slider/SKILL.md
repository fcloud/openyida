---
name: yida-ppt-slider
description: "宜搭自定义页面 PPT 幻灯片开发指南。用于在宜搭平台上创建全屏演示文稿式的幻灯片页面，支持键盘翻页、移动端适配、演讲笔控制等功能。适用于技术分享、产品路演、培训课件等场景。不适用于：创建普通数据展示页面（应使用 yida-custom-page），或创建数据报表（应使用 yida-report 或 yida-chart）。"
---

# yida-ppt-slider — 宜搭 PPT 幻灯片开发技能

本技能用于在宜搭平台上开发全屏演示文稿式的幻灯片页面，支持键盘翻页、数字键快速跳页、导航栏自动显隐、全屏按钮、中英文切换、深色/浅色模式、URL hash 定位、移动端竖屏适配、演讲笔控制、ECharts 动态图表等功能。

## 核心规则

### FATAL（致命）

1. **禁止 React Hooks**：不要使用 `useState`/`useEffect`，必须使用类组件模式
2. **禁止内联事件处理**：不要在 `renderJsx` 内部创建内联函数，必须在顶部定义后引用
3. **禁止 import/require**：不要引入第三方库，必须通过 CDN 或内联代码
4. **禁止遗漏清理**：`componentWillUnmount` 中必须清理所有键盘/触摸/鼠标/全屏/hash 事件监听
5. **禁止 objectFit: cover**：图片必须用 `contain` 确保完整显示
6. **禁止硬编码幻灯片数据**：必须定义为顶层 `SLIDES` 数组

### IMPORTANT（重要）

1. **发布前必须确认**：向用户展示幻灯片配置摘要（页数、标题列表），获得明确同意后再发布
2. **必须注册键盘事件**：在 `componentDidMount` 中注册，含 `PageDown`/`PageUp` 演讲笔支持
3. **必须适配移动端**：使用 `this.utils.isMobile()` 判断设备类型并适配样式
4. **必须覆盖默认样式**：用 `position: fixed; top:0; left:0; right:0; bottom:0` 覆盖宜搭容器
5. **状态变更规范**：通过 `_customState.xxx = value; this.forceUpdate()` 触发重渲染
6. **发布后隐藏导航**：执行 `openyida update-form-config <appType> <formUuid> false "<标题>"` 隐藏宜搭顶部导航
7. **本技能不读写 memory**，所有状态仅在当前页面会话内有效

## 适用场景 / 触发条件

| 用户意图 | 触发关键词 |
|---------|---------|
| 在宜搭内创建演示文稿 | "PPT"、"幻灯片"、"演示页面"、"产品路演" |
| 需要读取宜搭数据的演示 | 集成宜搭表单数据的展示页 |
| 技术分享 / 培训课件 | "技术分享"、"培训课件"、"全屏演示" |
| 纯演讲稿（无宜搭依赖） | → 改用 `report-slides` 技能（独立 HTML） |
| 普通数据展示页 | → 改用 `yida-custom-page` |
| 数据报表 | → 改用 `yida-report` 或 `yida-chart` |

## 幻灯片类型

| 类型 | 用途 | 关键字段 |
|------|------|---------|
| `cover` | 封面页 | `eyebrow`, `title`, `subtitle`, `meta`, `tags` |
| `toc` | 目录页 | `title`, `items` |
| `chapter` | 章节过渡页 | `partNum`, `title`, `subtitle`, `desc` |
| `key-points` | 要点列表页 | `chapter`, `title`, `subtitle`, `points` |
| `image-text` | 图文混排页 | `chapter`, `title`, `subtitle`, `body`, `imageUrl` |
| `scene-image` | 场景展示页 | `chapter`, `sceneNum`, `title`, `subtitle`, `body`, `imageUrl`, `tag` |
| `scene-image-top` | 顶部大图场景页 | 同 `scene-image` |
| `two-images` | 双图对比页 | `chapter`, `title`, `subtitle`, `leftImage`, `rightImage` |
| `ending` | 结束页 | `title`, `subtitle`, `quote`, `cta`, `tags`, `contacts` |
| `echarts-race` | ECharts 动态柱状图 | `title`, `subtitle` |

## 开发流程

```
[1] openyida env               → 环境检测
[2] openyida create-app         → 获得 appType
[3] openyida create-page        → 获得 formUuid
[4] 编写幻灯片代码               → pages/src/<文件名>.js
[5] openyida publish <file> <appType> <formUuid>  → 发布
[6] openyida update-form-config <appType> <formUuid> false "<标题>"  → 隐藏导航
[7] openyida save-share-config  → 配置公开访问（可选）
```

> 每个步骤的详细参数格式，请先阅读对应技能的 SKILL.md（如 `yida-create-app`、`yida-publish-page` 等）。

## 核心代码结构（概览）

```javascript
var _customState = {
  currentIndex: 0, total: 0, navVisible: false, isFullscreen: false,
  lang: 'zh', themeMode: 'light', numBuffer: '', numTimer: null,
};

var SLIDES = [
  { type: 'cover', bg: '#ffffff', accent: '#d97706', title: '...', subtitle: '...' },
  // ... 更多幻灯片
];

export function renderSlideContent(slide, accent, isMobile) { /* 根据 type 渲染 */ }

export function renderJsx() {
  var state = _customState;
  var slide = SLIDES[state.currentIndex];
  var isMobile = this.utils.isMobile();
  // 顶部定义事件处理函数 → 渲染 UI
}
```

> 完整代码详见 [coding-guide.md](references/coding-guide.md)，包含生命周期、状态管理、分页导航、多端适配等 14 个模块的完整实现。

## 功能清单与代码引用

| 功能 | 说明 | 代码位置 |
|------|------|---------|
| 生命周期 | didMount 注册事件，didUnmount 清理 | [coding-guide.md#1](references/coding-guide.md) |
| 状态管理 | `_customState` + `forceUpdate()` | [coding-guide.md#2](references/coding-guide.md) |
| 分页导航 | 精简分页点（最多5个），动态计算 | [coding-guide.md#3](references/coding-guide.md) |
| 多端适配 | `this.utils.isMobile()` 条件样式 | [coding-guide.md#4](references/coding-guide.md) |
| 清除默认样式 | `position: fixed` 覆盖宜搭容器 | [coding-guide.md#5](references/coding-guide.md) |
| 数字键跳页 | 300ms 延迟缓冲，支持双位数 | [coding-guide.md#6](references/coding-guide.md) |
| 隐藏平台导航 | `update-form-config` + 内部导航自动显隐 | [coding-guide.md#7](references/coding-guide.md) |
| 全屏按钮 | Fullscreen API，需用户手势触发 | [coding-guide.md#8](references/coding-guide.md) |
| 中英文切换 | `I18N[state.lang]` 动态读取 | [coding-guide.md#9](references/coding-guide.md) |
| 深色/浅色模式 | `THEME_CONFIG` 配色方案 | [coding-guide.md#10](references/coding-guide.md) |
| URL hash 定位 | `#页码` 格式，支持浏览器前进后退 | [coding-guide.md#11](references/coding-guide.md) |
| ECharts 动态图 | Bar Chart Race，逐帧插值动画 | [coding-guide.md#12](references/coding-guide.md) |
| 隐藏调试工具 | 隐藏 `__lowcode_devtool_switch__` | [coding-guide.md#13](references/coding-guide.md) |
| 样式规范 | 白色主题配色 + 图片展示 | [coding-guide.md#14](references/coding-guide.md) |

## 最佳实践

- 每页一个主题，保持内容简洁，避免文字过多
- 图片使用 CDN（宜搭自定义页面不支持本地图片），`objectFit: 'contain'`
- 在真机上测试竖屏显示效果
- 确保 `PageDown`/`PageUp` 演讲笔翻页正常工作
- 每次修改后及时发布，记录版本号
- 右上角工具栏从左到右：主题切换 → 语言切换 → 全屏按钮
- 幻灯片内容需中英文时，在 `SLIDES` 中提供 `title_en`、`subtitle_en` 等字段

## 异常处理

| 异常场景 | 处理方式 |
|---------|----------|
| 键盘翻页无响应 | 确认 `componentDidMount` 中注册了键盘事件，检查 `PageDown`/`PageUp` 支持 |
| 内存泄漏 | 在 `componentWillUnmount` 中清理所有事件监听（键盘/触摸/鼠标/全屏/hash/定时器） |
| 图片显示不完整 | 使用 `objectFit: 'contain'`，不要用 `cover` |
| 移动端布局异常 | 使用 `this.utils.isMobile()` 适配样式 |
| 数字键跳到错误页 | 检查 300ms 延迟缓冲逻辑，确保 `numBuffer` 跳转后清空 |
| 导航栏不显示 | 默认隐藏，鼠标移到底部 80px 区域才显示；移动端通过触摸底部触发 |
| 全屏按钮无效 | 部分浏览器限制 Fullscreen API 必须由用户手势触发 |
| 中英文切换后内容未更新 | 确保 `forceUpdate()` 被调用，UI 文案从 `I18N[state.lang]` 动态读取 |
| 幻灯片数据难以维护 | 定义为顶层 `SLIDES` 数组，不要硬编码在 `renderJsx` 中 |

## Agent 错误处理策略

| 错误类型 | 默认处理策略 |
|---------|-------------|
| 命令执行失败 | 停止执行，展示完整错误信息，询问是否重试 |
| 参数格式错误 | 停止执行，提示正确格式，引导修正 |
| 登录态失效 | 提示执行 `openyida login` 重新登录 |
| formUuid / appType 缺失 | 不得编造，提示先执行对应创建命令 |
| 发布失败 | 展示错误信息，建议在宜搭后台手动发布或检查权限 |
| 用户拒绝确认 | 停止执行，询问是否调整配置 |

## 参考文档

| 文档 | 内容 | 阅读时机 |
|------|------|---------|
| [coding-guide.md](references/coding-guide.md) | 14 个功能模块的完整代码实现 | 编写幻灯片代码时必读 |
| [examples.md](references/examples.md) | 完整端到端示例（创建→发布）+ 渲染函数 | 首次使用参考 |
| [宜搭 API](../../references/yida-api.md) | 表单/页面 API 完整参数 | 需要查询数据时 |
