# 游戏大厅应用实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在宜搭平台上构建一个包含斗地主、德州扑克、中国象棋、五子棋四款单机 AI 对战游戏的游戏大厅应用，含排行榜功能。

**Architecture:** 单文件 React 16 JSX 自定义页面（`pages/src/game-hall.js`），通过 `currentGame` 状态控制大厅/游戏页切换。排行榜数据存储在宜搭表单中，通过宜搭 JS API 读写。所有动画使用 CSS keyframes + inline style 实现，棋盘使用 Canvas 绘制。

**Tech Stack:** React 16, 纯 JS, CSS keyframes, Canvas API, 宜搭 yida-create-app/yida-create-page/yida-create-form-page/yida-publish-page skills

---

## 前置说明：宜搭开发规范

### 文件结构
- 源码：`pages/src/game-hall.js`（React 16 JSX，使用 `React.useState`、`React.useEffect` 等）
- 编译产物：`pages/dist/game-hall.js`（由 `yida-publish-page` 自动生成）
- 缓存：`.cache/game-hall-schema.json`（存储 appType、formUuid、fieldId）

### 关键约束
- **React 16**：使用 `React.useState`、`React.useEffect`、`React.useRef`、`React.useCallback`，不使用 hooks 简写
- **无外部依赖**：所有逻辑纯 JS 实现，不 import 第三方库
- **CSS**：全部 inline style，keyframes 通过 `<style>` 标签注入
- **宜搭 API**：通过 `window.g_app._store.getState()` 获取 corpId/userId，通过宜搭内置 API 读写表单

### 宜搭命令
```bash
# 创建应用
node .claude/skills/skills/yida-create-app/scripts/create-app.js "游戏大厅"

# 创建自定义页面
node .claude/skills/skills/yida-create-page/scripts/create-page.js <appType> "游戏大厅"

# 创建表单页面
node .claude/skills/skills/yida-create-form-page/scripts/create-form-page.js create <appType> "游戏成绩" '<字段JSON>'

# 发布页面
node .claude/skills/skills/yida-publish-page/scripts/publish.js <appType> <pageId> pages/src/game-hall.js
```

---

## Task 1: 创建宜搭应用和表单

**Files:**
- Create: `.cache/game-hall-schema.json`

**Step 1: 检查 corpId 一致性**

读取 `.cache/cookies.json`，确认其中的 `corpId` 与 `prd/game-hall.md` 中一致（如有记录）。如不一致，询问用户。

**Step 2: 创建宜搭应用**

```bash
node .claude/skills/skills/yida-create-app/scripts/create-app.js "游戏大厅"
```

记录返回的 `appType`。

**Step 3: 创建自定义页面**

```bash
node .claude/skills/skills/yida-create-page/scripts/create-page.js <appType> "游戏大厅"
```

记录返回的 `pageId`（自定义页面的 formUuid）。

**Step 4: 创建游戏成绩表单**

```bash
node .claude/skills/skills/yida-create-form-page/scripts/create-form-page.js create <appType> "游戏成绩" '[
  {"type":"TextField","label":"玩家昵称","required":true},
  {"type":"SelectField","label":"游戏类型","required":true,"options":[{"label":"斗地主","value":"landlord"},{"label":"德州扑克","value":"texas"},{"label":"中国象棋","value":"chess"},{"label":"五子棋","value":"gobang"}]},
  {"type":"NumberField","label":"得分","required":true},
  {"type":"RadioField","label":"胜负","required":true,"options":[{"label":"胜","value":"win"},{"label":"负","value":"lose"}]},
  {"type":"NumberField","label":"对局时长","required":true}
]'
```

记录返回的 `formUuid`。

**Step 5: 获取表单 Schema，记录字段 ID**

```bash
node .claude/skills/skills/yida-get-schema/scripts/get-schema.js <appType> <formUuid>
```

**Step 6: 写入缓存文件**

将以下内容写入 `.cache/game-hall-schema.json`：
```json
{
  "appType": "<appType>",
  "customPageId": "<pageId>",
  "scoreFormUuid": "<formUuid>",
  "fields": {
    "nickname": "<fieldId_玩家昵称>",
    "gameType": "<fieldId_游戏类型>",
    "score": "<fieldId_得分>",
    "result": "<fieldId_胜负>",
    "duration": "<fieldId_对局时长>"
  }
}
```

**Step 7: Commit**

```bash
git add .cache/game-hall-schema.json prd/game-hall.md
git commit -m "feat: 创建游戏大厅宜搭应用和表单"
```

---

## Task 2: 搭建页面骨架和全局样式系统

**Files:**
- Create: `pages/src/game-hall.js`

**Step 1: 创建文件骨架**

创建 `pages/src/game-hall.js`，包含：
- CSS keyframes 注入（`<style>` 标签）
- 全局颜色/样式常量
- `GameHall` 根组件（含 `currentGame` 状态）
- `LobbyPage` 和 `GamePage` 占位组件
- `export default GameHall`

骨架代码结构：

```jsx
// 注入全局 CSS keyframes
const injectGlobalStyles = () => {
  if (document.getElementById('game-hall-styles')) return;
  const style = document.createElement('style');
  style.id = 'game-hall-styles';
  style.textContent = `
    @keyframes fadeInUp { ... }
    @keyframes cardGlow { ... }
    @keyframes particleDrift { ... }
    @keyframes slideInRight { ... }
    @keyframes ripple { ... }
    @keyframes pieceMove { ... }
    @keyframes cardFly { ... }
    @keyframes chipSlide { ... }
    @keyframes victoryBurst { ... }
    @keyframes loadingBar { ... }
    @keyframes leaderboardEntry { ... }
    @keyframes neonPulse { ... }
    @keyframes spin { ... }
  `;
  document.head.appendChild(style);
};

// 颜色常量
const COLORS = {
  bgDeep: '#0a0a1a',
  bgCard: 'rgba(255,255,255,0.05)',
  borderGold: 'rgba(255,215,0,0.3)',
  gold: '#ffd700',
  cyan: '#00d4ff',
  pink: '#ff6b9d',
  purple: '#8b5cf6',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.6)',
};

function GameHall() {
  const [currentGame, setCurrentGame] = React.useState(null);
  React.useEffect(() => { injectGlobalStyles(); }, []);
  if (currentGame) {
    return <GamePage game={currentGame} onBack={() => setCurrentGame(null)} />;
  }
  return <LobbyPage onSelectGame={setCurrentGame} />;
}

export default GameHall;
```

**Step 2: Commit**

```bash
git add pages/src/game-hall.js
git commit -m "feat: 游戏大厅页面骨架和全局样式系统"
```

---

## Task 3: 实现大厅页（粒子背景 + 游戏卡片 + 排行榜）

**Files:**
- Modify: `pages/src/game-hall.js`

### 3.1 Canvas 粒子背景组件 `ParticleBackground`

使用 `React.useRef` + `React.useEffect` 创建 Canvas，`requestAnimationFrame` 驱动 60fps 粒子动画。

粒子属性：随机位置、速度、大小（1-3px）、透明度（0.3-1）、颜色（金黄/青蓝/白）。每帧更新位置，超出边界重置。

```jsx
function ParticleBackground() {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      color: ['#ffd700', '#00d4ff', '#ffffff', '#8b5cf6'][Math.floor(Math.random() * 4)],
    }));
    
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }} />;
}
```

### 3.2 游戏卡片组件 `GameCard`

支持 hover 3D 倾斜（`perspective` + `rotateX/Y`）、发光边框、向上浮起。交错淡入动画（`animation-delay: index * 150ms`）。

```jsx
const GAME_CONFIG = [
  { id: 'landlord', name: '斗地主', icon: '🃏', desc: '经典三人斗地主，人机对战', color: '#ff6b9d', players: '1v2 AI' },
  { id: 'texas', name: '德州扑克', icon: '♠️', desc: 'No-Limit Texas Hold\'em', color: '#ffd700', players: '1v2 AI' },
  { id: 'chess', name: '中国象棋', icon: '♟️', desc: '传统象棋，完整规则引擎', color: '#00d4ff', players: '1v1 AI' },
  { id: 'gobang', name: '五子棋', icon: '⚫', desc: '15×15 棋盘，AI 智能对弈', color: '#8b5cf6', players: '1v1 AI' },
];

function GameCard({ config, index, onSelect }) {
  const [hovered, setHovered] = React.useState(false);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setTilt({
      x: (e.clientY - centerY) / rect.height * 15,
      y: -(e.clientX - centerX) / rect.width * 15,
    });
  };
  
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
      onClick={() => onSelect(config.id)}
      style={{
        background: COLORS.bgCard,
        border: `1px solid ${hovered ? config.color : COLORS.borderGold}`,
        borderRadius: 16,
        padding: '32px 24px',
        cursor: 'pointer',
        transform: hovered
          ? `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-8px)`
          : 'perspective(600px) rotateX(0) rotateY(0) translateY(0)',
        transition: 'transform 0.15s ease, border-color 0.3s, box-shadow 0.3s',
        boxShadow: hovered ? `0 20px 60px ${config.color}40, 0 0 30px ${config.color}20` : '0 4px 20px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
        animation: `fadeInUp 0.6s ease ${index * 0.15}s both`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 卡片内容：icon、名称、描述、玩家数 */}
    </div>
  );
}
```

### 3.3 排行榜面板 `LeaderboardPanel`

Tab 切换 4 个游戏，从宜搭表单查询 Top 10 数据，金/银/铜牌图标标注前三。

```jsx
function LeaderboardPanel({ appType, formUuid, fieldIds }) {
  const [activeTab, setActiveTab] = React.useState('landlord');
  const [rankings, setRankings] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  
  const loadRankings = React.useCallback((gameType) => {
    setLoading(true);
    // 调用宜搭 searchFormDatas API 查询表单数据
    window.g_app._store.getState(); // 获取 corpId
    // 通过宜搭 JS API 查询，按得分降序，取 Top 10
    // 筛选条件：游戏类型 = gameType
    setLoading(false);
  }, [formUuid, fieldIds]);
  
  React.useEffect(() => { loadRankings(activeTab); }, [activeTab]);
  
  const medalIcons = ['🥇', '🥈', '🥉'];
  
  return (
    <div style={{ /* 排行榜面板样式 */ }}>
      {/* Tab 切换 */}
      {/* 排行榜列表，条目带 leaderboardEntry 动画 */}
    </div>
  );
}
```

### 3.4 组装 `LobbyPage`

```jsx
function LobbyPage({ onSelectGame, appType, scoreFormUuid, fieldIds }) {
  return (
    <div style={{ minHeight: '100vh', background: COLORS.bgDeep, position: 'relative' }}>
      <ParticleBackground />
      <div style={{ position: 'relative', zIndex: 1, padding: '40px 60px' }}>
        {/* HeroHeader：标题 + 霓虹动效 */}
        <div style={{ display: 'flex', gap: 40 }}>
          {/* 左：游戏卡片 2×2 网格 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flex: 1 }}>
            {GAME_CONFIG.map((config, index) => (
              <GameCard key={config.id} config={config} index={index} onSelect={onSelectGame} />
            ))}
          </div>
          {/* 右：排行榜面板 */}
          <LeaderboardPanel appType={appType} formUuid={scoreFormUuid} fieldIds={fieldIds} />
        </div>
      </div>
    </div>
  );
}
```

**Step: Commit**

```bash
git add pages/src/game-hall.js
git commit -m "feat: 大厅页 - 粒子背景、游戏卡片、排行榜面板"
```

---

## Task 4: 实现五子棋游戏

**Files:**
- Modify: `pages/src/game-hall.js`

### 4.1 棋盘 Canvas 组件

15×15 棋盘，Canvas 绘制木纹渐变背景 + 网格线 + 星位点。

```jsx
function GobangBoard({ board, lastMove, onCellClick, disabled }) {
  const canvasRef = React.useRef(null);
  const CELL_SIZE = 36;
  const PADDING = 30;
  const BOARD_SIZE = 14 * CELL_SIZE + PADDING * 2;
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // 绘制木纹背景
    const gradient = ctx.createLinearGradient(0, 0, BOARD_SIZE, BOARD_SIZE);
    gradient.addColorStop(0, '#c8a96e');
    gradient.addColorStop(1, '#a0784a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);
    // 绘制网格线
    // 绘制星位点（天元 + 8 个星位）
    // 绘制棋子（黑子渐变/白子渐变）
    // 标记最后落子位置（红色小圆点）
  }, [board, lastMove]);
  
  const handleClick = (e) => {
    if (disabled) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const col = Math.round((e.clientX - rect.left - PADDING) / CELL_SIZE);
    const row = Math.round((e.clientY - rect.top - PADDING) / CELL_SIZE);
    if (col >= 0 && col < 15 && row >= 0 && row < 15) onCellClick(row, col);
  };
  
  return <canvas ref={canvasRef} width={BOARD_SIZE} height={BOARD_SIZE} onClick={handleClick} style={{ cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: 8 }} />;
}
```

### 4.2 五子棋 AI（Minimax + Alpha-Beta，深度 3）

```jsx
// 评分函数：评估棋盘上某一方的得分
const evaluateGobangBoard = (board, player) => {
  // 遍历所有方向（横/竖/斜），统计连子数
  // 5连=100000，活4=10000，冲4=1000，活3=500，眠3=100，活2=50
};

const gobangMinimax = (board, depth, alpha, beta, isMaximizing, aiPlayer, humanPlayer) => {
  // 终止条件：depth=0 或有人获胜
  // 生成候选位置（只考虑已有棋子周围 2 格内的空位，减少搜索空间）
  // Alpha-Beta 剪枝
};

const getGobangAIMove = (board, aiPlayer, humanPlayer) => {
  // 调用 gobangMinimax，深度 3
  // 返回最优落子位置 {row, col}
};
```

### 4.3 `GobangGame` 组件

```jsx
function GobangGame({ onGameEnd }) {
  const [board, setBoard] = React.useState(Array(15).fill(null).map(() => Array(15).fill(null)));
  const [currentPlayer, setCurrentPlayer] = React.useState('black'); // 玩家执黑
  const [gameStatus, setGameStatus] = React.useState('playing'); // playing | won | lost
  const [lastMove, setLastMove] = React.useState(null);
  const [score, setScore] = React.useState(0);
  const [aiThinking, setAiThinking] = React.useState(false);
  const [rippleEffect, setRippleEffect] = React.useState(null);
  const startTime = React.useRef(Date.now());
  
  const checkWinner = (board, row, col, player) => {
    // 检查四个方向是否有 5 连
  };
  
  const handleCellClick = (row, col) => {
    if (board[row][col] || gameStatus !== 'playing' || currentPlayer !== 'black') return;
    // 落子 + 波纹动画
    // 检查胜负
    // AI 思考（setTimeout 模拟延迟）
  };
  
  // AI 落子逻辑（useEffect 监听 currentPlayer）
  React.useEffect(() => {
    if (currentPlayer === 'white' && gameStatus === 'playing') {
      setAiThinking(true);
      setTimeout(() => {
        const move = getGobangAIMove(board, 'white', 'black');
        // 落子、检查胜负、切换玩家
        setAiThinking(false);
      }, 500);
    }
  }, [currentPlayer, gameStatus]);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {aiThinking && <AIThinkingBar />}
      <GobangBoard board={board} lastMove={lastMove} onCellClick={handleCellClick} disabled={currentPlayer !== 'black' || gameStatus !== 'playing'} />
      {rippleEffect && <RippleEffect position={rippleEffect} />}
      <GameStatusBar status={gameStatus} score={score} currentPlayer={currentPlayer} />
    </div>
  );
}
```

**Step: Commit**

```bash
git add pages/src/game-hall.js
git commit -m "feat: 五子棋游戏 - Canvas棋盘 + Minimax AI + 落子动画"
```

---

## Task 5: 实现中国象棋游戏

**Files:**
- Modify: `pages/src/game-hall.js`

### 5.1 棋盘 Canvas 绘制

9×10 棋盘，绘制楚河汉界、九宫格斜线、炮位标记。棋子用圆形 + 文字绘制（红方/黑方颜色区分）。

### 5.2 完整走法规则引擎

```jsx
// 棋子类型：将/帅、士/仕、象/相、马、车、炮、兵/卒
const CHESS_PIECES = {
  // 红方
  R_KING: '帅', R_GUARD: '仕', R_BISHOP: '相', R_KNIGHT: '马',
  R_ROOK: '车', R_CANNON: '炮', R_PAWN: '兵',
  // 黑方
  B_KING: '将', B_GUARD: '士', B_BISHOP: '象', B_KNIGHT: '马',
  B_ROOK: '车', B_CANNON: '炮', B_PAWN: '卒',
};

// 生成合法走法
const getValidMoves = (board, row, col, piece, side) => {
  // 根据棋子类型生成所有候选走法
  // 过滤掉会导致己方将帅被将军的走法
};

// 各棋子走法规则（完整实现）：
// - 将/帅：九宫格内，一步，不能对面
// - 士/仕：九宫格内斜走一步
// - 象/相：田字斜走，不能过河，不能塞象眼
// - 马：日字走，不能蹩马腿
// - 车：直线任意格，不能穿越棋子
// - 炮：直线移动，吃子需隔一子（炮架）
// - 兵/卒：过河前只能前进，过河后可左右
```

### 5.3 象棋 AI（Minimax 深度 2 + 子力评估）

```jsx
// 子力价值
const PIECE_VALUES = {
  KING: 10000, GUARD: 200, BISHOP: 200,
  KNIGHT: 500, ROOK: 900, CANNON: 500, PAWN: 100,
};

// 位置加成表（每种棋子在不同位置的额外价值）
const POSITION_BONUS = { /* ... */ };

const evaluateChessBoard = (board, side) => {
  // 遍历棋盘，计算己方 - 对方的子力价值 + 位置加成
};

const chessAIMinimax = (board, depth, alpha, beta, isMaximizing, aiSide) => {
  // 生成所有合法走法，递归评估
};
```

### 5.4 `ChessGame` 组件

```jsx
function ChessGame({ onGameEnd }) {
  const [board, setBoard] = React.useState(initChessBoard()); // 初始棋盘布局
  const [selectedPiece, setSelectedPiece] = React.useState(null);
  const [validMoves, setValidMoves] = React.useState([]);
  const [currentSide, setCurrentSide] = React.useState('red'); // 玩家执红
  const [gameStatus, setGameStatus] = React.useState('playing');
  const [movingPiece, setMovingPiece] = React.useState(null); // 棋子移动动画
  const [score, setScore] = React.useState(0);
  const [aiThinking, setAiThinking] = React.useState(false);
  
  // 点击棋盘：选中棋子 / 移动棋子
  const handleBoardClick = (row, col) => { /* ... */ };
  
  // AI 走棋
  React.useEffect(() => {
    if (currentSide === 'black' && gameStatus === 'playing') {
      setAiThinking(true);
      setTimeout(() => {
        const move = chessAIMinimax(board, 2, -Infinity, Infinity, true, 'black');
        // 执行走法，检查将军/将死
        setAiThinking(false);
      }, 800);
    }
  }, [currentSide, gameStatus]);
}
```

**Step: Commit**

```bash
git add pages/src/game-hall.js
git commit -m "feat: 中国象棋 - 完整规则引擎 + Minimax AI + 棋子移动动画"
```

---

## Task 6: 实现斗地主游戏

**Files:**
- Modify: `pages/src/game-hall.js`

### 6.1 牌型系统

```jsx
// 54 张牌
const createDeck = () => {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['3','4','5','6','7','8','9','10','J','Q','K','A','2'];
  const deck = [];
  suits.forEach(suit => values.forEach(value => deck.push({ suit, value, id: `${suit}${value}` })));
  deck.push({ suit: '🃏', value: 'small', id: 'small_joker' });
  deck.push({ suit: '🃏', value: 'big', id: 'big_joker' });
  return deck;
};

// 牌型识别（完整）
const identifyCardType = (cards) => {
  // 单张、对子、三张、三带一、三带二
  // 顺子（5张以上连续）、连对（3对以上）、飞机（2组以上三张连续）
  // 飞机带翅膀、四带二、炸弹、火箭
};

// 比较两手牌大小（同类型才能比较）
const compareCards = (cards1, cards2) => { /* ... */ };

// 判断是否能压过上家
const canBeat = (myCards, lastPlay) => { /* ... */ };
```

### 6.2 斗地主 AI

```jsx
// AI 出牌策略（规则型）
const landlordAIPlay = (hand, lastPlay, isLandlord) => {
  if (!lastPlay) {
    // 主动出牌：优先出最小的单张/对子，保留炸弹
    // 地主优先出大牌压制
  } else {
    // 被动出牌：找最小的能压过上家的牌型
    // 找不到则 pass
    // 有炸弹时根据局势决定是否出
  }
};
```

### 6.3 `LandlordGame` 组件

```jsx
function LandlordGame({ onGameEnd }) {
  const [deck, setDeck] = React.useState([]);
  const [playerHand, setPlayerHand] = React.useState([]);
  const [ai1Hand, setAi1Hand] = React.useState([]);
  const [ai2Hand, setAi2Hand] = React.useState([]);
  const [bottomCards, setBottomCards] = React.useState([]); // 底牌
  const [landlord, setLandlord] = React.useState(null); // 0=玩家, 1=AI1, 2=AI2
  const [currentTurn, setCurrentTurn] = React.useState(0);
  const [lastPlay, setLastPlay] = React.useState(null);
  const [lastPlayer, setLastPlayer] = React.useState(null);
  const [selectedCards, setSelectedCards] = React.useState([]);
  const [gamePhase, setGamePhase] = React.useState('bidding'); // bidding | playing | ended
  const [flyingCards, setFlyingCards] = React.useState([]); // 出牌飞出动画
  const [score, setScore] = React.useState(0);
  
  // 发牌、叫地主、出牌、AI 出牌逻辑
  // 牌面 UI：扑克牌组件（花色颜色、数值、选中状态）
  // 出牌区：展示上一手牌
  // 操作按钮：出牌、不出（Pass）
}
```

### 6.4 扑克牌 UI 组件

```jsx
function PlayingCard({ card, selected, onClick, small }) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <div
      onClick={onClick}
      style={{
        width: small ? 40 : 60,
        height: small ? 60 : 90,
        background: 'white',
        borderRadius: 6,
        border: selected ? '2px solid #ffd700' : '1px solid #ccc',
        transform: selected ? 'translateY(-12px)' : 'translateY(0)',
        transition: 'transform 0.2s ease, border-color 0.2s',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '4px 6px',
        color: isRed ? '#e53e3e' : '#1a1a1a',
        boxShadow: selected ? '0 8px 20px rgba(255,215,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: small ? 10 : 14, fontWeight: 'bold' }}>{card.value}</span>
      <span style={{ fontSize: small ? 12 : 18, textAlign: 'center' }}>{card.suit}</span>
      <span style={{ fontSize: small ? 10 : 14, fontWeight: 'bold', transform: 'rotate(180deg)' }}>{card.value}</span>
    </div>
  );
}
```

**Step: Commit**

```bash
git add pages/src/game-hall.js
git commit -m "feat: 斗地主 - 完整牌型系统 + 规则型AI + 出牌飞出动画"
```

---

## Task 7: 实现德州扑克游戏

**Files:**
- Modify: `pages/src/game-hall.js`

### 7.1 手牌强度评估

```jsx
// 手牌强度（10 级）
const evaluatePokerHand = (holeCards, communityCards) => {
  const allCards = [...holeCards, ...communityCards];
  // 皇家同花顺(9) > 同花顺(8) > 四条(7) > 葫芦(6) > 同花(5)
  // > 顺子(4) > 三条(3) > 两对(2) > 一对(1) > 高牌(0)
  // 返回 { rank, name, score }
};

// 比较两手牌
const comparePokerHands = (hand1, hand2) => { /* ... */ };
```

### 7.2 德州扑克 AI（概率型决策）

```jsx
const texasAIDecide = (holeCards, communityCards, pot, callAmount, chips, phase) => {
  const handStrength = evaluatePokerHand(holeCards, communityCards).rank;
  const potOdds = callAmount / (pot + callAmount);
  
  // 基于手牌强度和底池赔率决策
  if (handStrength >= 6) return { action: 'raise', amount: Math.min(pot * 0.75, chips) };
  if (handStrength >= 3 && potOdds < 0.3) return { action: 'call' };
  if (handStrength >= 1 && potOdds < 0.15) return { action: 'call' };
  return { action: 'fold' };
};
```

### 7.3 `TexasGame` 组件

```jsx
function TexasGame({ onGameEnd }) {
  const [deck, setDeck] = React.useState([]);
  const [playerHole, setPlayerHole] = React.useState([]); // 玩家底牌
  const [ai1Hole, setAi1Hole] = React.useState([]);
  const [ai2Hole, setAi2Hole] = React.useState([]);
  const [communityCards, setCommunityCards] = React.useState([]); // 公共牌
  const [pot, setPot] = React.useState(0);
  const [playerChips, setPlayerChips] = React.useState(1000);
  const [ai1Chips, setAi1Chips] = React.useState(1000);
  const [ai2Chips, setAi2Chips] = React.useState(1000);
  const [phase, setPhase] = React.useState('preflop'); // preflop|flop|turn|river|showdown
  const [currentBet, setCurrentBet] = React.useState(0);
  const [raiseAmount, setRaiseAmount] = React.useState(50);
  const [gameStatus, setGameStatus] = React.useState('playing');
  const [chipAnimation, setChipAnimation] = React.useState(null); // 筹码滑入动画
  const [score, setScore] = React.useState(0);
  
  // 游戏流程：发底牌 → 翻牌前下注 → 翻牌(3张) → 转牌(1张) → 河牌(1张) → 摊牌
  // 操作按钮：Fold / Check / Call / Raise
  // AI 自动决策（setTimeout 模拟思考）
}
```

**Step: Commit**

```bash
git add pages/src/game-hall.js
git commit -m "feat: 德州扑克 - 完整流程 + 手牌评估 + 概率型AI + 筹码动画"
```

---

## Task 8: 实现游戏通用组件（导航栏、结束弹窗、排行榜提交）

**Files:**
- Modify: `pages/src/game-hall.js`

### 8.1 游戏导航栏 `GameNavBar`

```jsx
function GameNavBar({ gameName, score, onBack, aiThinking }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 32px',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,215,0,0.2)',
      position: 'relative',
    }}>
      <button onClick={onBack} style={{ /* 返回按钮样式 */ }}>← 返回大厅</button>
      <span style={{ color: COLORS.gold, fontSize: 20, fontWeight: 'bold' }}>{gameName}</span>
      <span style={{ color: COLORS.cyan }}>得分：{score}</span>
      {aiThinking && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: 'rgba(255,255,255,0.1)',
        }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.cyan})`,
            animation: 'loadingBar 1.5s ease-in-out infinite',
          }} />
        </div>
      )}
    </div>
  );
}
```

### 8.2 游戏结束弹窗 `GameOverModal`

```jsx
function GameOverModal({ result, score, duration, gameType, onClose, onRestart, appType, formUuid, fieldIds }) {
  const [nickname, setNickname] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  
  const submitScore = async () => {
    if (!nickname.trim()) return;
    setSubmitting(true);
    try {
      // 调用宜搭表单提交 API
      await window.YZF && window.YZF.FormUtil.createFormInstance({
        formUuid,
        appType,
        formDataJson: JSON.stringify({
          [fieldIds.nickname]: nickname,
          [fieldIds.gameType]: gameType,
          [fieldIds.score]: score,
          [fieldIds.result]: result === 'win' ? 'win' : 'lose',
          [fieldIds.duration]: duration,
        }),
      });
      setSubmitted(true);
    } catch (e) {
      console.error('提交失败', e);
    }
    setSubmitting(false);
  };
  
  return (
    <div style={{ /* 全屏遮罩 + 弹窗 */ }}>
      {/* 胜利/失败标题 + 烟花/粒子效果 */}
      {/* 得分展示 */}
      {/* 昵称输入 + 提交按钮 */}
      {/* 再来一局 + 返回大厅 */}
    </div>
  );
}
```

### 8.3 胜利粒子效果 `VictoryEffect`

```jsx
function VictoryEffect() {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // 从屏幕底部发射彩色粒子，模拟烟花爆炸
    const particles = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height,
      vx: (Math.random() - 0.5) * 8,
      vy: -(Math.random() * 12 + 4),
      color: ['#ffd700', '#00d4ff', '#ff6b9d', '#8b5cf6', '#ffffff'][Math.floor(Math.random() * 5)],
      life: 1,
      decay: Math.random() * 0.02 + 0.01,
      size: Math.random() * 4 + 2,
    }));
    
    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.2; // 重力
        p.life -= p.decay;
        if (p.life <= 0) return;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (particles.some(p => p.life > 0)) animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);
  
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000, pointerEvents: 'none' }} />;
}
```

### 8.4 组装 `GamePage`

```jsx
function GamePage({ game, onBack, appType, scoreFormUuid, fieldIds }) {
  const [score, setScore] = React.useState(0);
  const [gameOver, setGameOver] = React.useState(null); // null | { result, score, duration }
  const startTime = React.useRef(Date.now());
  
  const handleGameEnd = (result, finalScore) => {
    const duration = Math.floor((Date.now() - startTime.current) / 1000);
    setGameOver({ result, score: finalScore, duration });
  };
  
  const gameComponents = {
    landlord: LandlordGame,
    texas: TexasGame,
    chess: ChessGame,
    gobang: GobangGame,
  };
  const GameComponent = gameComponents[game];
  const gameNames = { landlord: '斗地主', texas: '德州扑克', chess: '中国象棋', gobang: '五子棋' };
  
  return (
    <div style={{ minHeight: '100vh', background: COLORS.bgDeep }}>
      <GameNavBar gameName={gameNames[game]} score={score} onBack={onBack} />
      <div style={{ padding: '20px 40px' }}>
        <GameComponent onGameEnd={handleGameEnd} onScoreUpdate={setScore} />
      </div>
      {gameOver && (
        <GameOverModal
          result={gameOver.result}
          score={gameOver.score}
          duration={gameOver.duration}
          gameType={game}
          onClose={() => setGameOver(null)}
          onRestart={() => { setGameOver(null); startTime.current = Date.now(); }}
          appType={appType}
          formUuid={scoreFormUuid}
          fieldIds={fieldIds}
        />
      )}
      {gameOver?.result === 'win' && <VictoryEffect />}
    </div>
  );
}
```

**Step: Commit**

```bash
git add pages/src/game-hall.js
git commit -m "feat: 通用组件 - 导航栏、结束弹窗、排行榜提交、胜利粒子效果"
```

---

## Task 9: 组装根组件并读取宜搭配置

**Files:**
- Modify: `pages/src/game-hall.js`
- Read: `.cache/game-hall-schema.json`

**Step 1: 读取 Schema 缓存**

从 `.cache/game-hall-schema.json` 读取 `appType`、`scoreFormUuid`、`fieldIds`。

**Step 2: 更新根组件**

```jsx
// 从缓存文件读取的配置（硬编码到源码中）
const APP_CONFIG = {
  appType: '<从缓存读取>',
  scoreFormUuid: '<从缓存读取>',
  fieldIds: {
    nickname: '<从缓存读取>',
    gameType: '<从缓存读取>',
    score: '<从缓存读取>',
    result: '<从缓存读取>',
    duration: '<从缓存读取>',
  },
};

function GameHall() {
  const [currentGame, setCurrentGame] = React.useState(null);
  React.useEffect(() => { injectGlobalStyles(); }, []);
  
  if (currentGame) {
    return (
      <GamePage
        game={currentGame}
        onBack={() => setCurrentGame(null)}
        appType={APP_CONFIG.appType}
        scoreFormUuid={APP_CONFIG.scoreFormUuid}
        fieldIds={APP_CONFIG.fieldIds}
      />
    );
  }
  return (
    <LobbyPage
      onSelectGame={setCurrentGame}
      appType={APP_CONFIG.appType}
      scoreFormUuid={APP_CONFIG.scoreFormUuid}
      fieldIds={APP_CONFIG.fieldIds}
    />
  );
}
```

**Step 3: Commit**

```bash
git add pages/src/game-hall.js
git commit -m "feat: 组装根组件，接入宜搭配置"
```

---

## Task 10: 发布到宜搭平台

**Files:**
- Read: `.cache/game-hall-schema.json`

**Step 1: 发布页面**

```bash
node .claude/skills/skills/yida-publish-page/scripts/publish.js <appType> <customPageId> pages/src/game-hall.js
```

**Step 2: 验证**

发布成功后，脚本会输出访问链接，用系统浏览器打开验证：
- 大厅页粒子背景正常显示
- 4 张游戏卡片 hover 动效正常
- 排行榜面板正常加载（初始为空）
- 点击游戏卡片能进入对应游戏
- 各游戏 AI 能正常出牌/落子
- 游戏结束弹窗正常显示
- 提交成绩后排行榜更新

**Step 3: Final Commit**

```bash
git add pages/dist/game-hall.js
git commit -m "feat: 发布游戏大厅到宜搭平台"
```

---

## 执行顺序总结

| Task | 内容 | 预计时间 |
|------|------|---------|
| Task 1 | 创建宜搭应用和表单 | 5 min |
| Task 2 | 页面骨架和全局样式 | 10 min |
| Task 3 | 大厅页（粒子背景+卡片+排行榜） | 20 min |
| Task 4 | 五子棋游戏 | 25 min |
| Task 5 | 中国象棋游戏 | 30 min |
| Task 6 | 斗地主游戏 | 30 min |
| Task 7 | 德州扑克游戏 | 25 min |
| Task 8 | 通用组件（导航栏+弹窗+粒子） | 15 min |
| Task 9 | 组装根组件 | 5 min |
| Task 10 | 发布到宜搭 | 5 min |
