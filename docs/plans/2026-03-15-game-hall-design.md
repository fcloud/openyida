# 游戏大厅应用设计文档

## 概述

基于宜搭低代码平台，使用 React 16 JSX 自定义页面实现一个类边锋游戏大厅应用。包含斗地主、德州扑克、中国象棋、五子棋四款单机 AI 对战游戏，以及基于宜搭表单的全局排行榜系统。

---

## 架构设计

### 整体结构

单文件 React 16 SPA，存放于 `pages/src/game-hall.js`，通过 `currentGame` 状态控制大厅/游戏页切换。

```
GameHall（根组件）
├── state: currentGame = null | 'landlord' | 'texas' | 'chess' | 'gobang'
├── LobbyPage（大厅页，currentGame === null）
│   ├── ParticleBackground（Canvas 粒子星空）
│   ├── HeroHeader（标题 + 霓虹动效）
│   ├── GameCardGrid（4 张游戏卡片，2×2 网格）
│   └── LeaderboardPanel（排行榜面板，Tab 切换 4 个游戏）
└── GamePage（游戏页，currentGame !== null）
    ├── GameNavBar（返回大厅 + 游戏名 + 当前得分）
    ├── LandlordGame（斗地主）
    ├── TexasGame（德州扑克）
    ├── ChessGame（中国象棋）
    ├── GobangGame（五子棋）
    └── GameOverModal（游戏结束弹窗 + 提交排行榜）
```

### 数据流

- 游戏内状态：各游戏组件内部 `useState` / `useReducer` 管理
- 排行榜读取：页面加载时调用宜搭 `window.g_app._store.getState()` 获取 `corpId`，通过宜搭 JS API 查询表单数据
- 排行榜写入：游戏结束后用户填写昵称，调用宜搭表单提交 API 写入成绩

---

## 视觉设计

### 配色系统

| 用途 | 颜色值 |
|------|--------|
| 页面背景 | `#0a0a1a` |
| 卡片背景 | `rgba(255,255,255,0.05)` |
| 卡片边框 | `rgba(255,215,0,0.3)` |
| 主色金黄 | `#ffd700` |
| 强调青蓝 | `#00d4ff` |
| 强调紫红 | `#ff6b9d` |
| 文字主色 | `#ffffff` |
| 文字次色 | `rgba(255,255,255,0.6)` |

### 动画清单

| 位置 | 动画效果 | 实现方式 |
|------|---------|---------|
| 大厅背景 | 浮动粒子星空（60fps） | Canvas requestAnimationFrame |
| 游戏卡片进入 | 交错淡入（每张延迟 150ms） | CSS keyframes + animation-delay |
| 游戏卡片 hover | 3D 倾斜 + 发光边框 + 上浮 | CSS transform + box-shadow transition |
| 游戏切换 | 页面滑入/滑出 | CSS translateX + opacity transition |
| 五子棋落子 | 波纹扩散 | CSS keyframes scale + opacity |
| 象棋棋子移动 | 滑动轨迹 | CSS transition transform |
| 斗地主出牌 | 牌飞出（translateY + rotate） | CSS keyframes |
| 德州下注 | 筹码滑入 | CSS keyframes translateX |
| 胜利 | 粒子爆炸/烟花 | Canvas 粒子系统 |
| AI 思考 | 顶部进度条 loading | CSS keyframes width |
| 排行榜条目 | 滚动进入 | CSS keyframes translateX + opacity |

---

## 游戏设计

### 五子棋

- **棋盘**：15×15，Canvas 绘制木纹背景 + 网格线
- **AI 策略**：Minimax + Alpha-Beta 剪枝，深度 3 层
- **评分函数**：连子数（5连=胜/4连活=高分/3连活=中分）+ 位置权重
- **得分规则**：胜利 +100，每步用时越短加分越多

### 中国象棋

- **棋盘**：9×10，Canvas 绘制传统楚河汉界
- **规则引擎**：完整合法走法生成（将/士/象/马/车/炮/兵各自规则）
- **AI 策略**：Minimax 深度 2 层 + 子力价值评估（车=9/马炮=5/士象=2/兵=1）
- **得分规则**：胜利 +150，吃子得分

### 斗地主

- **牌型**：标准 54 张（含大小王），3 人局（玩家 + 2 个 AI）
- **规则**：单张/对子/三带/顺子/飞机/炸弹/火箭完整支持
- **AI 策略**：规则型，优先出最小合法牌，保留炸弹，地主优先压制
- **得分规则**：胜利 +100，炸弹加倍

### 德州扑克

- **模式**：No-Limit Texas Hold'em，玩家 vs 2 个 AI
- **流程**：发牌 → 翻牌前 → 翻牌 → 转牌 → 河牌 → 摊牌
- **AI 策略**：基于手牌强度（10 级评估）的概率决策，会 fold/call/raise
- **得分规则**：赢得筹码数作为得分

---

## 排行榜设计

### 宜搭表单字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| 玩家昵称 | `TextField` | 用户自填 |
| 游戏类型 | `SelectField` | 斗地主/德州扑克/中国象棋/五子棋 |
| 得分 | `NumberField` | 本局得分 |
| 胜负 | `RadioField` | 胜/负 |
| 对局时长 | `NumberField` | 秒数 |

### 排行榜 UI

- 位置：大厅页右侧面板
- Tab 切换：4 个游戏独立排行
- 展示：Top 10，金/银/铜牌图标标注前三
- 刷新：进入大厅时自动加载，支持手动刷新
- 提交：游戏结束弹窗中填写昵称后提交

---

## 技术约束

- **运行环境**：宜搭自定义页面，React 16
- **无外部依赖**：所有逻辑用原生 JS + React 实现，不引入第三方库
- **CSS 方案**：全部 inline style + `<style>` 标签注入 keyframes
- **Canvas**：用于棋盘绘制和粒子效果
- **API**：通过宜搭 `window.g_app` 获取用户信息和 corpId，通过宜搭 JS API 读写表单
