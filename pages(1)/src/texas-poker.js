// ============================================================
// 状态管理
// ============================================================

// 牌面值和花色定义
var SUITS = ['♠', '♥', '♦', '♣'];
var RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
var RANK_VALUES = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };

// 游戏阶段
var PHASE_IDLE = 'idle';
var PHASE_PREFLOP = 'preflop';
var PHASE_FLOP = 'flop';
var PHASE_TURN = 'turn';
var PHASE_RIVER = 'river';
var PHASE_SHOWDOWN = 'showdown';

var _customState = {
  phase: PHASE_IDLE,
  deck: [],
  playerHand: [],
  aiHand: [],
  communityCards: [],
  pot: 0,
  playerChips: 1000,
  aiChips: 1000,
  currentBet: 0,
  playerBet: 0,
  aiBet: 0,
  raiseAmount: 50,
  message: '欢迎来到德州扑克！点击「开始游戏」开始一局。',
  winner: null,
  playerFolded: false,
  aiFolded: false,
  showAiCards: false,
  gameLog: [],
  playerHandName: '',
  aiHandName: '',
  isPlayerTurn: true,
  smallBlind: 10,
  bigBlind: 20,
  dealerIsPlayer: true,
};

export function getCustomState(key) {
  if (key) {
    return _customState[key];
  }
  return Object.assign({}, _customState);
}

export function setCustomState(newState) {
  Object.keys(newState).forEach(function(key) {
    _customState[key] = newState[key];
  });
  this.forceUpdate();
}

export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

// ============================================================
// 游戏核心逻辑（纯函数，不依赖 this）
// ============================================================

function buildDeck() {
  var deck = [];
  SUITS.forEach(function(suit) {
    RANKS.forEach(function(rank) {
      deck.push({ suit: suit, rank: rank, value: RANK_VALUES[rank] });
    });
  });
  return deck;
}

function shuffleDeck(deck) {
  var shuffled = deck.slice();
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}

// 判断是否同花
function isFlush(cards) {
  var suit = cards[0].suit;
  return cards.every(function(card) { return card.suit === suit; });
}

// 判断是否顺子
function isStraight(sortedValues) {
  // 处理 A-2-3-4-5 的低顺
  if (sortedValues[4] === 14 && sortedValues[0] === 2 && sortedValues[1] === 3 && sortedValues[2] === 4 && sortedValues[3] === 5) {
    return true;
  }
  for (var i = 1; i < sortedValues.length; i++) {
    if (sortedValues[i] - sortedValues[i - 1] !== 1) return false;
  }
  return true;
}

// 获取最佳5张牌的牌型（从7张中选最优5张）
function evaluateBestHand(sevenCards) {
  var bestRank = -1;
  var bestHandName = '';
  var combinations = getCombinations(sevenCards, 5);
  combinations.forEach(function(fiveCards) {
    var result = evaluateFiveCards(fiveCards);
    if (result.rank > bestRank) {
      bestRank = result.rank;
      bestHandName = result.name;
    }
  });
  return { rank: bestRank, name: bestHandName };
}

function getCombinations(arr, size) {
  var result = [];
  function combine(start, current) {
    if (current.length === size) {
      result.push(current.slice());
      return;
    }
    for (var i = start; i <= arr.length - (size - current.length); i++) {
      current.push(arr[i]);
      combine(i + 1, current);
      current.pop();
    }
  }
  combine(0, []);
  return result;
}

// 评估5张牌的牌型，返回 { rank, name }
// rank 越高越好：皇家同花顺=9, 同花顺=8, 四条=7, 葫芦=6, 同花=5, 顺子=4, 三条=3, 两对=2, 一对=1, 高牌=0
function evaluateFiveCards(cards) {
  var values = cards.map(function(c) { return c.value; }).sort(function(a, b) { return a - b; });
  var flush = isFlush(cards);
  var straight = isStraight(values);
  var valueCounts = {};
  values.forEach(function(v) { valueCounts[v] = (valueCounts[v] || 0) + 1; });
  var counts = Object.values(valueCounts).sort(function(a, b) { return b - a; });

  // 皇家同花顺：同花 + 顺子 + 最高牌是 A + 次高牌是 K（排除低顺 A-2-3-4-5）
  var isRoyalFlush = flush && straight && values[4] === 14 && values[3] === 13 && values[0] === 10;
  if (isRoyalFlush) {
    return { rank: 9, name: '皇家同花顺' };
  }
  // 同花顺：同花 + 顺子（含低顺 A-2-3-4-5 同花）
  if (flush && straight) {
    return { rank: 8, name: '同花顺' };
  }
  if (counts[0] === 4) {
    return { rank: 7, name: '四条' };
  }
  if (counts[0] === 3 && counts[1] === 2) {
    return { rank: 6, name: '葫芦' };
  }
  if (flush) {
    return { rank: 5, name: '同花' };
  }
  if (straight) {
    return { rank: 4, name: '顺子' };
  }
  if (counts[0] === 3) {
    return { rank: 3, name: '三条' };
  }
  if (counts[0] === 2 && counts[1] === 2) {
    return { rank: 2, name: '两对' };
  }
  if (counts[0] === 2) {
    return { rank: 1, name: '一对' };
  }
  return { rank: 0, name: '高牌' };
}

// 简单 AI 决策：根据手牌强度决定行动
function aiDecide(aiHand, communityCards, currentBet, aiBet, aiChips) {
  var allCards = aiHand.concat(communityCards);
  var handResult = allCards.length >= 5 ? evaluateBestHand(allCards) : { rank: -1 };
  var handStrength = handResult.rank;

  // 翻牌前：根据手牌高低决策
  if (communityCards.length === 0) {
    var maxValue = Math.max(aiHand[0].value, aiHand[1].value);
    var isPair = aiHand[0].value === aiHand[1].value;
    if (isPair || maxValue >= 11) {
      return 'call';
    }
    if (maxValue >= 8) {
      return Math.random() > 0.4 ? 'call' : 'fold';
    }
    return Math.random() > 0.6 ? 'call' : 'fold';
  }

  // 翻牌后：根据牌型强度决策
  if (handStrength >= 6) return 'raise';
  if (handStrength >= 3) return 'call';
  if (handStrength >= 1) return Math.random() > 0.5 ? 'call' : 'check';
  return Math.random() > 0.7 ? 'call' : 'fold';
}

function addLog(logs, message) {
  var newLogs = logs.slice();
  newLogs.unshift(message);
  if (newLogs.length > 8) newLogs = newLogs.slice(0, 8);
  return newLogs;
}

// ============================================================
// 生命周期
// ============================================================

export function didMount() {
  // 页面加载完成，无需初始化
}

export function didUnmount() {
  // 无需清理
}

// ============================================================
// 游戏操作函数（绑定 this）
// ============================================================

export function startGame() {
  var state = this.getCustomState();
  var playerChips = state.playerChips;
  var aiChips = state.aiChips;

  if (playerChips <= 0) {
    this.setCustomState({ message: '你的筹码已用完！游戏结束。' });
    return;
  }
  if (aiChips <= 0) {
    this.setCustomState({ message: 'AI 筹码已用完！你赢了整局游戏！' });
    return;
  }

  var deck = shuffleDeck(buildDeck());
  var playerHand = [deck.pop(), deck.pop()];
  var aiHand = [deck.pop(), deck.pop()];
  var smallBlind = state.smallBlind;
  var bigBlind = state.bigBlind;

  // 玩家为庄家时，AI 先下小盲，玩家下大盲（简化：玩家下小盲，AI 下大盲）
  var playerBlind = Math.min(smallBlind, playerChips);
  var aiBlind = Math.min(bigBlind, aiChips);
  var pot = playerBlind + aiBlind;

  var logs = addLog([], '新一局开始！小盲 ' + smallBlind + '，大盲 ' + bigBlind);
  logs = addLog(logs, '玩家下小盲 ' + playerBlind + '，AI 下大盲 ' + aiBlind);

  this.setCustomState({
    phase: PHASE_PREFLOP,
    deck: deck,
    playerHand: playerHand,
    aiHand: aiHand,
    communityCards: [],
    pot: pot,
    playerChips: playerChips - playerBlind,
    aiChips: aiChips - aiBlind,
    currentBet: bigBlind,
    playerBet: playerBlind,
    aiBet: aiBlind,
    raiseAmount: bigBlind,
    message: '翻牌前：你的行动（需要补齐大盲 ' + (bigBlind - playerBlind) + '）',
    winner: null,
    playerFolded: false,
    aiFolded: false,
    showAiCards: false,
    gameLog: logs,
    playerHandName: '',
    aiHandName: '',
    isPlayerTurn: true,
  });
}

export function playerCall() {
  var state = this.getCustomState();
  if (!state.isPlayerTurn || state.phase === PHASE_IDLE || state.phase === PHASE_SHOWDOWN) return;

  var callAmount = Math.min(state.currentBet - state.playerBet, state.playerChips);
  var newPlayerChips = state.playerChips - callAmount;
  var newPot = state.pot + callAmount;
  var newPlayerBet = state.playerBet + callAmount;
  var logs = addLog(state.gameLog, '玩家跟注 ' + callAmount);

  this.setCustomState({
    playerChips: newPlayerChips,
    pot: newPot,
    playerBet: newPlayerBet,
    gameLog: logs,
    isPlayerTurn: false,
    message: 'AI 思考中...',
  });

  var self = this;
  setTimeout(function() {
    self.aiAction.call(self);
  }, 800);
}

export function playerRaise() {
  var state = this.getCustomState();
  if (!state.isPlayerTurn || state.phase === PHASE_IDLE || state.phase === PHASE_SHOWDOWN) return;

  var raiseTotal = state.currentBet + state.raiseAmount;
  var callAmount = Math.min(raiseTotal - state.playerBet, state.playerChips);
  if (callAmount <= 0) return;

  var newPlayerChips = state.playerChips - callAmount;
  var newPot = state.pot + callAmount;
  var newPlayerBet = state.playerBet + callAmount;
  var logs = addLog(state.gameLog, '玩家加注至 ' + raiseTotal);

  this.setCustomState({
    playerChips: newPlayerChips,
    pot: newPot,
    playerBet: newPlayerBet,
    currentBet: raiseTotal,
    gameLog: logs,
    isPlayerTurn: false,
    message: 'AI 思考中...',
  });

  var self = this;
  setTimeout(function() {
    self.aiAction.call(self);
  }, 800);
}

export function playerCheck() {
  var state = this.getCustomState();
  if (!state.isPlayerTurn || state.phase === PHASE_IDLE || state.phase === PHASE_SHOWDOWN) return;
  if (state.currentBet > state.playerBet) return;

  var logs = addLog(state.gameLog, '玩家过牌');
  this.setCustomState({
    gameLog: logs,
    isPlayerTurn: false,
    message: 'AI 思考中...',
  });

  var self = this;
  setTimeout(function() {
    self.aiAction.call(self);
  }, 800);
}

export function playerFold() {
  var state = this.getCustomState();
  if (!state.isPlayerTurn || state.phase === PHASE_IDLE || state.phase === PHASE_SHOWDOWN) return;

  var logs = addLog(state.gameLog, '玩家弃牌，AI 赢得底池 ' + state.pot);
  this.setCustomState({
    playerFolded: true,
    aiChips: state.aiChips + state.pot,
    phase: PHASE_SHOWDOWN,
    winner: 'ai',
    showAiCards: true,
    message: '你弃牌了，AI 赢得本局！底池：' + state.pot,
    gameLog: logs,
    isPlayerTurn: false,
  });
}

export function aiAction() {
  var state = this.getCustomState();
  var decision = aiDecide(state.aiHand, state.communityCards, state.currentBet, state.aiBet, state.aiChips);
  var logs = state.gameLog;
  var newAiChips = state.aiChips;
  var newPot = state.pot;
  var newAiBet = state.aiBet;
  var newCurrentBet = state.currentBet;

  if (decision === 'fold') {
    logs = addLog(logs, 'AI 弃牌，玩家赢得底池 ' + state.pot);
    this.setCustomState({
      aiFolded: true,
      playerChips: state.playerChips + state.pot,
      phase: PHASE_SHOWDOWN,
      winner: 'player',
      showAiCards: true,
      message: 'AI 弃牌！你赢得本局！底池：' + state.pot,
      gameLog: logs,
      isPlayerTurn: false,
    });
    return;
  }

  if (decision === 'raise') {
    var raiseTotal = state.currentBet + state.raiseAmount;
    var aiCallAmount = Math.min(raiseTotal - state.aiBet, state.aiChips);
    newAiChips = state.aiChips - aiCallAmount;
    newPot = state.pot + aiCallAmount;
    newAiBet = state.aiBet + aiCallAmount;
    newCurrentBet = raiseTotal;
    logs = addLog(logs, 'AI 加注至 ' + raiseTotal);

    // AI 加注后，把行动权还给玩家（玩家需要决定跟注/再加注/弃牌）
    this.setCustomState({
      aiChips: newAiChips,
      pot: newPot,
      aiBet: newAiBet,
      currentBet: newCurrentBet,
      gameLog: logs,
      isPlayerTurn: true,
      message: 'AI 加注至 ' + raiseTotal + '，轮到你行动',
    });
    return;
  }

  if (decision === 'call') {
    var callAmount = Math.min(state.currentBet - state.aiBet, state.aiChips);
    newAiChips = state.aiChips - callAmount;
    newPot = state.pot + callAmount;
    newAiBet = state.aiBet + callAmount;
    logs = addLog(logs, 'AI 跟注 ' + callAmount);
  } else {
    // check
    logs = addLog(logs, 'AI 过牌');
  }

  // AI 跟注或过牌后，进入下一阶段
  var self = this;
  this.setCustomState({
    aiChips: newAiChips,
    pot: newPot,
    aiBet: newAiBet,
    currentBet: newCurrentBet,
    gameLog: logs,
  });

  setTimeout(function() {
    self.advancePhase.call(self);
  }, 400);
}

export function advancePhase() {
  var state = this.getCustomState();
  var deck = state.deck.slice();
  var communityCards = state.communityCards.slice();
  var logs = state.gameLog;
  var nextPhase;

  if (state.phase === PHASE_PREFLOP) {
    communityCards.push(deck.pop(), deck.pop(), deck.pop());
    nextPhase = PHASE_FLOP;
    logs = addLog(logs, '翻牌：发出3张公共牌');
  } else if (state.phase === PHASE_FLOP) {
    communityCards.push(deck.pop());
    nextPhase = PHASE_TURN;
    logs = addLog(logs, '转牌：发出第4张公共牌');
  } else if (state.phase === PHASE_TURN) {
    communityCards.push(deck.pop());
    nextPhase = PHASE_RIVER;
    logs = addLog(logs, '河牌：发出第5张公共牌');
  } else if (state.phase === PHASE_RIVER) {
    this.showdown.call(this);
    return;
  } else {
    return;
  }

  var phaseNames = { flop: '翻牌', turn: '转牌', river: '河牌' };

  this.setCustomState({
    phase: nextPhase,
    deck: deck,
    communityCards: communityCards,
    currentBet: 0,
    playerBet: 0,
    aiBet: 0,
    isPlayerTurn: true,
    gameLog: logs,
    message: phaseNames[nextPhase] + '阶段：轮到你行动',
  });
}

export function showdown() {
  var state = this.getCustomState();
  var allPlayerCards = state.playerHand.concat(state.communityCards);
  var allAiCards = state.aiHand.concat(state.communityCards);

  var playerResult = evaluateBestHand(allPlayerCards);
  var aiResult = evaluateBestHand(allAiCards);

  var winner;
  var message;
  var logs = state.gameLog;

  logs = addLog(logs, '摊牌！玩家：' + playerResult.name + '，AI：' + aiResult.name);

  if (playerResult.rank > aiResult.rank) {
    winner = 'player';
    message = '🎉 你赢了！你的牌型：' + playerResult.name + '，AI 牌型：' + aiResult.name + '。赢得底池：' + state.pot;
    logs = addLog(logs, '玩家赢得底池 ' + state.pot);
  } else if (aiResult.rank > playerResult.rank) {
    winner = 'ai';
    message = '😢 AI 赢了！AI 牌型：' + aiResult.name + '，你的牌型：' + playerResult.name + '。AI 赢得底池：' + state.pot;
    logs = addLog(logs, 'AI 赢得底池 ' + state.pot);
  } else {
    winner = 'tie';
    message = '🤝 平局！双方牌型相同：' + playerResult.name + '。平分底池。';
    logs = addLog(logs, '平局，平分底池');
  }

  var newPlayerChips = state.playerChips;
  var newAiChips = state.aiChips;
  if (winner === 'player') {
    newPlayerChips += state.pot;
  } else if (winner === 'ai') {
    newAiChips += state.pot;
  } else {
    var half = Math.floor(state.pot / 2);
    newPlayerChips += half;
    newAiChips += state.pot - half;
  }

  this.setCustomState({
    phase: PHASE_SHOWDOWN,
    winner: winner,
    showAiCards: true,
    playerChips: newPlayerChips,
    aiChips: newAiChips,
    message: message,
    gameLog: logs,
    playerHandName: playerResult.name,
    aiHandName: aiResult.name,
    isPlayerTurn: false,
  });
}

export function changeRaiseAmount(delta) {
  var state = this.getCustomState();
  var newAmount = Math.max(state.bigBlind, state.raiseAmount + delta);
  newAmount = Math.min(newAmount, state.playerChips);
  this.setCustomState({ raiseAmount: newAmount });
}

// ============================================================
// 渲染辅助函数（普通内部函数，不 export，在 renderJsx 内直接调用）
// ============================================================

function renderCard(card, faceDown, index) {
  var isRed = card.suit === '♥' || card.suit === '♦';
  var cardStyle = {
    display: 'inline-flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '52px',
    height: '76px',
    background: faceDown ? 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #1a237e 100%)' : '#fff',
    border: '2px solid ' + (faceDown ? '#3949ab' : '#ddd'),
    borderRadius: '8px',
    margin: '0 4px',
    padding: '4px 6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    cursor: 'default',
    position: 'relative',
    flexShrink: 0,
  };

  if (faceDown) {
    return (
      <div key={index} style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '20px' }}>🂠</div>
      </div>
    );
  }

  var rankStyle = { color: isRed ? '#e53935' : '#212121', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 };
  var rankStyleBottom = { color: isRed ? '#e53935' : '#212121', fontSize: '16px', fontWeight: 'bold', lineHeight: 1, alignSelf: 'flex-end', transform: 'rotate(180deg)' };

  return (
    <div key={index} style={cardStyle}>
      <div style={rankStyle}>{card.rank}</div>
      <div style={{ textAlign: 'center', fontSize: '20px', color: isRed ? '#e53935' : '#212121' }}>{card.suit}</div>
      <div style={rankStyleBottom}>{card.rank}</div>
    </div>
  );
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var timestamp = this.state.timestamp;
  var gameState = this.getCustomState();

  var currentPhase = gameState.phase;
  var playerHand = gameState.playerHand;
  var aiHand = gameState.aiHand;
  var communityCards = gameState.communityCards;
  var potAmount = gameState.pot;
  var playerChips = gameState.playerChips;
  var aiChips = gameState.aiChips;
  var currentBet = gameState.currentBet;
  var playerBet = gameState.playerBet;
  var aiBet = gameState.aiBet;
  var gameMessage = gameState.message;
  var winnerResult = gameState.winner;
  var showAiCards = gameState.showAiCards;
  var gameLog = gameState.gameLog;
  var raiseAmount = gameState.raiseAmount;
  var isPlayerTurn = gameState.isPlayerTurn;
  var playerHandName = gameState.playerHandName;
  var aiHandName = gameState.aiHandName;
  var bigBlind = gameState.bigBlind;

  var isIdle = currentPhase === PHASE_IDLE;
  var isShowdown = currentPhase === PHASE_SHOWDOWN;
  var canCheck = isPlayerTurn && currentBet <= playerBet && !isIdle && !isShowdown;
  var canCall = isPlayerTurn && currentBet > playerBet && !isIdle && !isShowdown;
  var canRaise = isPlayerTurn && playerChips > 0 && !isIdle && !isShowdown;
  var canFold = isPlayerTurn && !isIdle && !isShowdown;

  // 颜色主题
  var tableGreen = '#1b5e20';
  var feltGreen = '#2e7d32';
  var goldColor = '#ffd700';
  var chipRed = '#c62828';

  var containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0d1b0d 0%, #1a2e1a 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
    color: '#fff',
  };

  var tableStyle = {
    width: '100%',
    maxWidth: '700px',
    background: 'radial-gradient(' + feltGreen + ' 60%, ' + tableGreen + ' 100%)',
    borderRadius: '120px',
    border: '12px solid #4e342e',
    boxShadow: '0 0 40px rgba(0,0,0,0.8), inset 0 0 60px rgba(0,0,0,0.3)',
    padding: '24px 32px',
    margin: '12px 0',
    position: 'relative',
  };

  var sectionLabelStyle = {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '6px',
    textAlign: 'center',
  };

  var chipBadgeStyle = {
    display: 'inline-block',
    background: chipRed,
    color: '#fff',
    borderRadius: '20px',
    padding: '3px 12px',
    fontSize: '13px',
    fontWeight: 'bold',
    margin: '0 4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
  };

  var potStyle = {
    textAlign: 'center',
    margin: '12px 0',
  };

  var btnBase = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    margin: '4px',
    transition: 'all 0.2s',
    boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
  };

  var btnGreen = Object.assign({}, btnBase, { background: 'linear-gradient(135deg, #43a047, #2e7d32)', color: '#fff' });
  var btnBlue = Object.assign({}, btnBase, { background: 'linear-gradient(135deg, #1e88e5, #1565c0)', color: '#fff' });
  var btnOrange = Object.assign({}, btnBase, { background: 'linear-gradient(135deg, #fb8c00, #e65100)', color: '#fff' });
  var btnRed = Object.assign({}, btnBase, { background: 'linear-gradient(135deg, #e53935, #b71c1c)', color: '#fff' });
  var btnGray = Object.assign({}, btnBase, { background: '#555', color: '#aaa', cursor: 'not-allowed' });
  var btnGold = Object.assign({}, btnBase, { background: 'linear-gradient(135deg, #ffd700, #ff8f00)', color: '#212121', fontSize: '16px', padding: '12px 32px' });

  var messageStyle = {
    background: 'rgba(0,0,0,0.5)',
    borderRadius: '8px',
    padding: '10px 16px',
    margin: '8px 0',
    fontSize: '14px',
    textAlign: 'center',
    maxWidth: '700px',
    width: '100%',
    color: winnerResult === 'player' ? goldColor : winnerResult === 'ai' ? '#ef9a9a' : '#fff',
    fontWeight: winnerResult ? 'bold' : 'normal',
    border: winnerResult === 'player' ? '1px solid ' + goldColor : winnerResult === 'ai' ? '1px solid #ef9a9a' : '1px solid transparent',
  };

  var logStyle = {
    background: 'rgba(0,0,0,0.4)',
    borderRadius: '8px',
    padding: '10px 14px',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '120px',
    overflowY: 'auto',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
    margin: '8px 0',
  };

  var phaseLabels = {
    idle: '等待开始',
    preflop: '翻牌前',
    flop: '翻牌',
    turn: '转牌',
    river: '河牌',
    showdown: '摊牌',
  };

  var self = this;

  return (
    <div style={containerStyle}>
      <div style={{ display: 'none' }}>{timestamp}</div>

      {/* 标题 */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: goldColor, textShadow: '0 0 20px rgba(255,215,0,0.5)', letterSpacing: '2px' }}>
          ♠ 德州扑克 ♠
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
          阶段：{phaseLabels[currentPhase] || currentPhase}
        </div>
      </div>

      {/* 牌桌 */}
      <div style={tableStyle}>

        {/* AI 区域 */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={sectionLabelStyle}>AI 对手</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>筹码：</span>
            <span style={chipBadgeStyle}>{aiChips}</span>
            {aiBet > 0 && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>已下注：{aiBet}</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {aiHand.length > 0
              ? aiHand.map(function(card, i) { return renderCard(card, !showAiCards, i); })
              : <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>等待发牌...</div>
            }
          </div>
          {aiHandName ? <div style={{ fontSize: '12px', color: goldColor, marginTop: '4px' }}>牌型：{aiHandName}</div> : null}
        </div>

        {/* 公共牌 & 底池 */}
        <div style={potStyle}>
          <div style={sectionLabelStyle}>公共牌</div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', minHeight: '80px', alignItems: 'center' }}>
            {communityCards.length > 0
              ? communityCards.map(function(card, i) { return renderCard(card, false, i); })
              : <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>等待发牌...</div>
            }
          </div>
          <div style={{ marginTop: '10px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>底池：</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: goldColor, textShadow: '0 0 10px rgba(255,215,0,0.4)' }}>{potAmount}</span>
          </div>
        </div>

        {/* 玩家区域 */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
            {playerHand.length > 0
              ? playerHand.map(function(card, i) { return renderCard(card, false, i); })
              : <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>等待发牌...</div>
            }
          </div>
          {playerHandName ? <div style={{ fontSize: '12px', color: goldColor, marginBottom: '4px' }}>牌型：{playerHandName}</div> : null}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>你的筹码：</span>
            <span style={chipBadgeStyle}>{playerChips}</span>
            {playerBet > 0 && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>已下注：{playerBet}</span>}
          </div>
          <div style={sectionLabelStyle}>你的手牌</div>
        </div>

      </div>

      {/* 消息提示 */}
      <div style={messageStyle}>{gameMessage}</div>

      {/* 操作区 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', maxWidth: '700px', width: '100%' }}>

        {isIdle || isShowdown ? (
          <button style={btnGold} onClick={function() { self.startGame.call(self); }}>
            {isIdle ? '🃏 开始游戏' : '🔄 下一局'}
          </button>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {canCheck && (
              <button style={btnBlue} onClick={function() { self.playerCheck.call(self); }}>过牌</button>
            )}
            {canCall && (
              <button style={btnGreen} onClick={function() { self.playerCall.call(self); }}>
                跟注 ({Math.min(currentBet - playerBet, playerChips)})
              </button>
            )}
            {canRaise && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button style={Object.assign({}, btnBase, { background: '#555', color: '#fff', padding: '10px 14px' })}
                  onClick={function() { self.changeRaiseAmount.call(self, -bigBlind); }}>−</button>
                <button style={btnOrange} onClick={function() { self.playerRaise.call(self); }}>
                  加注 ({raiseAmount})
                </button>
                <button style={Object.assign({}, btnBase, { background: '#555', color: '#fff', padding: '10px 14px' })}
                  onClick={function() { self.changeRaiseAmount.call(self, bigBlind); }}>+</button>
              </div>
            )}
            {canFold && (
              <button style={btnRed} onClick={function() { self.playerFold.call(self); }}>弃牌</button>
            )}
            {!isPlayerTurn && (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', padding: '12px' }}>等待 AI 行动...</div>
            )}
          </div>
        )}
      </div>

      {/* 游戏日志 */}
      {gameLog.length > 0 && (
        <div style={logStyle}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>游戏记录</div>
          {gameLog.map(function(log, i) {
            return <div key={i} style={{ padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{log}</div>;
          })}
        </div>
      )}

      {/* 筹码统计 */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
        <span>玩家总筹码：{playerChips + (currentPhase !== PHASE_IDLE && currentPhase !== PHASE_SHOWDOWN ? playerBet : 0)}</span>
        <span>AI 总筹码：{aiChips + (currentPhase !== PHASE_IDLE && currentPhase !== PHASE_SHOWDOWN ? aiBet : 0)}</span>
      </div>

    </div>
  );
}
