// ============================================================
// 状态管理
// ============================================================

const IMG = 'https://raw.githubusercontent.com/GeeeekExplorer/PVZ/master/images/';

// 植物配置
const PLANT_CONFIGS = {
  SunFlower:  { name: '向日葵',   cost: 50,  cooldown: 7500,  hp: 300,  atk: 0,   gif: IMG + 'SunFlower.gif',  png: IMG + 'SunFlower.png',  type: 'sun' },
  Peashooter: { name: '豌豆射手', cost: 100, cooldown: 7500,  hp: 300,  atk: 20,  gif: IMG + 'Peashooter.gif', png: IMG + 'Peashooter.png', type: 'shooter' },
  SnowPea:    { name: '寒冰射手', cost: 175, cooldown: 7500,  hp: 300,  atk: 20,  gif: IMG + 'SnowPea.gif',    png: IMG + 'SnowPea.png',    type: 'snow' },
  WallNut:    { name: '坚果墙',   cost: 50,  cooldown: 30000, hp: 4000, atk: 0,   gif: IMG + 'WallNut.gif',    png: IMG + 'WallNut.png',    type: 'wall' },
  CherryBomb: { name: '樱桃炸弹', cost: 150, cooldown: 50000, hp: 300,  atk: 1800,gif: IMG + 'CherryBomb.gif', png: IMG + 'CherryBomb.png', type: 'bomb' },
};

const PLANT_ORDER = ['SunFlower', 'Peashooter', 'SnowPea', 'WallNut', 'CherryBomb'];

// 僵尸配置
const ZOMBIE_CONFIGS = {
  Basic:  { name: '普通僵尸', hp: 200,  atk: 1, speed: 0.4, walkGif: IMG + 'ZombieWalk1.gif',      attackGif: IMG + 'ZombieAttack.gif',      dieGif: IMG + 'ZombieDie.gif' },
  Cone:   { name: '路障僵尸', hp: 560,  atk: 1, speed: 0.4, walkGif: IMG + 'ConeZombieWalk.gif',   attackGif: IMG + 'ConeZombieAttack.gif',   dieGif: IMG + 'ZombieDie.gif' },
  Bucket: { name: '铁桶僵尸', hp: 1100, atk: 2, speed: 0.5, walkGif: IMG + 'BucketZombieWalk.gif', attackGif: IMG + 'BucketZombieAttack.gif', dieGif: IMG + 'ZombieDie.gif' },
};

// 游戏地图：5行 x 9列
const ROWS = 5;
const COLS = 9;
const CELL_W = 82;
const CELL_H = 98;
const MAP_LEFT = 249;
const MAP_TOP = 81;

const _customState = {
  gameState: 'menu', // 'menu' | 'playing' | 'paused' | 'win' | 'lose'
  sun: 200,
  score: 0,
  wave: 1,
  grid: [],
  zombies: [],
  bullets: [],
  suns: [],
  explosions: [],      // 爆炸特效列表
  floatingTexts: [],   // 浮动文字（+25☀ 等）
  cardCooldowns: {},
  selectedCard: null,
  hoverCell: null,     // 鼠标悬停的格子 {r, c}
  gameLoopId: null,
  sunTimerId: null,
  tick: 0,
  zombieQueue: [],
  zombiesKilled: 0,
  waveStartTime: 0,
  waveNotice: null,    // 波次提示 { text, born }
};

export function getCustomState(key) {
  if (key) return _customState[key];
  return { ..._customState };
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
// 游戏逻辑
// ============================================================

function initGrid() {
  var grid = [];
  for (var r = 0; r < ROWS; r++) {
    grid.push([]);
    for (var c = 0; c < COLS; c++) {
      grid[r].push(null);
    }
  }
  return grid;
}

function generateWaveZombies(wave) {
  var queue = [];
  var types = ['Basic'];
  if (wave >= 2) types = ['Basic', 'Basic', 'Cone', 'Cone'];
  if (wave >= 3) types = ['Basic', 'Cone', 'Cone', 'Bucket', 'Bucket'];
  var count = 6 + wave * 3;
  for (var i = 0; i < count; i++) {
    var typeIndex = Math.floor(Math.random() * types.length);
    var row = Math.floor(Math.random() * ROWS);
    queue.push({
      type: types[typeIndex],
      row: row,
      delay: i * 2500 + Math.random() * 1500,
    });
  }
  return queue;
}

function spawnZombie(type, row) {
  var cfg = ZOMBIE_CONFIGS[type];
  return {
    id: Date.now() + Math.random(),
    type: type,
    row: row,
    x: MAP_LEFT + COLS * CELL_W + 80,
    hp: cfg.hp,
    maxHp: cfg.hp,
    atk: cfg.atk,
    speed: cfg.speed,
    state: 'walk',
    frozen: 0,
    attackTimer: 0,
    dieTimer: 0,
  };
}

function spawnSun(x, y, fromFlower) {
  var targetY = fromFlower
    ? (y !== undefined ? y + 60 : 100)
    : MAP_TOP + 30 + Math.random() * (ROWS * CELL_H - 60);
  return {
    id: Date.now() + Math.random(),
    x: x !== undefined ? x : MAP_LEFT + 40 + Math.random() * (COLS * CELL_W - 80),
    y: y !== undefined ? y : -40,
    targetY: targetY,
    value: 25,
    lifetime: 9000,
    born: Date.now(),
    fromFlower: !!fromFlower,
    collected: false,
  };
}

function addFloatingText(x, y, text, color) {
  _customState.floatingTexts.push({
    id: Date.now() + Math.random(),
    x: x, y: y,
    text: text,
    color: color || '#FFD700',
    born: Date.now(),
    lifetime: 1200,
  });
}

// ============================================================
// 生命周期
// ============================================================

export function didMount() {}

export function didUnmount() {
  stopGame.call(this);
}

function startGame() {
  var self = this;
  _customState.gameState = 'playing';
  _customState.sun = 200;
  _customState.score = 0;
  _customState.wave = 1;
  _customState.grid = initGrid();
  _customState.zombies = [];
  _customState.bullets = [];
  _customState.suns = [];
  _customState.explosions = [];
  _customState.floatingTexts = [];
  _customState.cardCooldowns = {};
  _customState.selectedCard = null;
  _customState.hoverCell = null;
  _customState.tick = 0;
  _customState.zombiesKilled = 0;
  _customState.waveStartTime = Date.now();
  _customState.waveNotice = { text: '第 1 波！', born: Date.now() };

  var waveQueue = generateWaveZombies(1);
  _customState.zombieQueue = waveQueue;

  if (_customState.gameLoopId) clearInterval(_customState.gameLoopId);
  _customState.gameLoopId = setInterval(function() {
    if (_customState.gameState === 'playing') {
      gameLoop.call(self);
    }
  }, 1000 / 30);

  if (_customState.sunTimerId) clearInterval(_customState.sunTimerId);
  _customState.sunTimerId = setInterval(function() {
    if (_customState.gameState === 'playing') {
      _customState.suns.push(spawnSun());
    }
  }, 7000);

  // 初始给2个阳光
  setTimeout(function() { _customState.suns.push(spawnSun()); }, 1000);
  setTimeout(function() { _customState.suns.push(spawnSun()); }, 3500);

  self.forceUpdate();
}

function stopGame() {
  if (_customState.gameLoopId) { clearInterval(_customState.gameLoopId); _customState.gameLoopId = null; }
  if (_customState.sunTimerId) { clearInterval(_customState.sunTimerId); _customState.sunTimerId = null; }
}

function gameLoop() {
  var self = this;
  _customState.tick++;
  var now = Date.now();

  // 1. 生成波次僵尸
  var waveStart = _customState.waveStartTime;
  _customState.zombieQueue = _customState.zombieQueue.filter(function(zq) {
    if (now - waveStart >= zq.delay) {
      _customState.zombies.push(spawnZombie(zq.type, zq.row));
      return false;
    }
    return true;
  });

  // 2. 向日葵产阳光（约15秒一次）
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      var plant = _customState.grid[r][c];
      if (!plant) continue;
      if (plant.type === 'SunFlower') {
        plant.sunTimer = (plant.sunTimer || 0) + 1;
        if (plant.sunTimer >= 30 * 15) {
          plant.sunTimer = 0;
          var px = MAP_LEFT + c * CELL_W + CELL_W / 2;
          var py = MAP_TOP + r * CELL_H + CELL_H / 2;
          _customState.suns.push(spawnSun(px, py - 10, true));
        }
      }
      // 樱桃炸弹：种下后2秒爆炸
      if (plant.type === 'CherryBomb') {
        plant.fuseTimer = (plant.fuseTimer || 0) + 1;
        if (plant.fuseTimer === 60) {
          // 爆炸！范围3x3格
          _customState.explosions.push({ id: now + Math.random(), x: MAP_LEFT + c * CELL_W + CELL_W / 2, y: MAP_TOP + r * CELL_H + CELL_H / 2, born: now, lifetime: 800 });
          for (var zi = 0; zi < _customState.zombies.length; zi++) {
            var zb = _customState.zombies[zi];
            if (zb.state === 'die') continue;
            var zbCol = Math.floor((zb.x - MAP_LEFT) / CELL_W);
            if (Math.abs(zbCol - c) <= 1 && Math.abs(zb.row - r) <= 1) {
              zb.hp -= PLANT_CONFIGS.CherryBomb.atk;
              if (zb.hp <= 0) {
                zb.state = 'die';
                _customState.score += 10;
                _customState.zombiesKilled++;
              }
            }
          }
          _customState.grid[r][c] = null;
        }
      }
    }
  }

  // 3. 豌豆射手/寒冰射手发射子弹（约1.5秒一次）
  for (var r2 = 0; r2 < ROWS; r2++) {
    var hasZombieInRow = _customState.zombies.some(function(z) { return z.row === r2 && z.state !== 'die'; });
    if (!hasZombieInRow) continue;
    for (var c2 = 0; c2 < COLS; c2++) {
      var plant2 = _customState.grid[r2][c2];
      if (!plant2) continue;
      if (plant2.type !== 'Peashooter' && plant2.type !== 'SnowPea') continue;
      plant2.shootTimer = (plant2.shootTimer || 0) + 1;
      if (plant2.shootTimer >= 45) {
        plant2.shootTimer = 0;
        _customState.bullets.push({
          id: Date.now() + Math.random(),
          row: r2,
          x: MAP_LEFT + c2 * CELL_W + CELL_W,
          y: MAP_TOP + r2 * CELL_H + CELL_H / 2,
          atk: PLANT_CONFIGS[plant2.type].atk,
          speed: 7,
          frozen: plant2.type === 'SnowPea',
        });
      }
    }
  }

  // 4. 移动子弹 & 碰撞检测
  _customState.bullets = _customState.bullets.filter(function(bullet) {
    bullet.x += bullet.speed;
    if (bullet.x > MAP_LEFT + COLS * CELL_W + 100) return false;
    for (var zi = 0; zi < _customState.zombies.length; zi++) {
      var zombie = _customState.zombies[zi];
      if (zombie.state === 'die') continue;
      if (zombie.row !== bullet.row) continue;
      if (Math.abs(zombie.x - bullet.x) < 28) {
        zombie.hp -= bullet.atk;
        if (bullet.frozen) zombie.frozen = 90;
        if (zombie.hp <= 0) {
          zombie.state = 'die';
          _customState.score += 10;
          _customState.zombiesKilled++;
        }
        return false;
      }
    }
    return true;
  });

  // 5. 移动僵尸 & 攻击植物
  _customState.zombies.forEach(function(zombie) {
    if (zombie.state === 'die') {
      zombie.dieTimer++;
      return;
    }
    var speed = zombie.frozen > 0 ? zombie.speed * 0.4 : zombie.speed;
    if (zombie.frozen > 0) zombie.frozen--;

    // 检查前方植物
    var col = Math.floor((zombie.x - MAP_LEFT) / CELL_W);
    var attackingPlant = null;
    for (var checkC = Math.max(0, col - 1); checkC <= Math.min(COLS - 1, col); checkC++) {
      var p = _customState.grid[zombie.row] && _customState.grid[zombie.row][checkC];
      if (p) {
        var plantRightEdge = MAP_LEFT + checkC * CELL_W + CELL_W;
        if (zombie.x < plantRightEdge + 10) {
          attackingPlant = { r: zombie.row, c: checkC, plant: p };
          break;
        }
      }
    }

    if (attackingPlant) {
      zombie.state = 'attack';
      zombie.attackTimer++;
      if (zombie.attackTimer >= 30) {
        zombie.attackTimer = 0;
        attackingPlant.plant.hp -= zombie.atk * 30;
        if (attackingPlant.plant.hp <= 0) {
          _customState.grid[attackingPlant.r][attackingPlant.c] = null;
        }
      }
    } else {
      zombie.state = 'walk';
      zombie.x -= speed;
    }

    if (zombie.x < MAP_LEFT - 40) {
      _customState.gameState = 'lose';
      stopGame.call(self);
    }
  });

  // 6. 清理死亡僵尸（死亡动画播放完）
  _customState.zombies = _customState.zombies.filter(function(z) {
    return !(z.state === 'die' && z.dieTimer > 50);
  });

  // 7. 清理过期阳光
  _customState.suns = _customState.suns.filter(function(sun) {
    return now - sun.born < sun.lifetime;
  });

  // 8. 清理过期特效
  _customState.explosions = _customState.explosions.filter(function(ex) {
    return now - ex.born < ex.lifetime;
  });
  _customState.floatingTexts = _customState.floatingTexts.filter(function(ft) {
    return now - ft.born < ft.lifetime;
  });

  // 9. 检查胜利/下一波
  if (_customState.zombieQueue.length === 0 && _customState.zombies.length === 0 && _customState.gameState === 'playing') {
    if (_customState.wave < 3) {
      _customState.wave++;
      var nextQueue = generateWaveZombies(_customState.wave);
      _customState.zombieQueue = nextQueue;
      _customState.waveStartTime = Date.now() + 4000; // 4秒缓冲
      _customState.waveNotice = { text: '第 ' + _customState.wave + ' 波！', born: Date.now() };
    } else {
      _customState.gameState = 'win';
      stopGame.call(self);
    }
  }

  self.forceUpdate();
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var self = this;
  var { timestamp } = this.state;
  var state = _customState;
  var now = Date.now();

  var isMobile = this.utils.isMobile();
  // 根据屏幕宽度自动计算缩放比
  var screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  var naturalW = MAP_LEFT + COLS * CELL_W + 120;
  var naturalH = MAP_TOP + ROWS * CELL_H + 40;
  var scale = isMobile ? Math.min(0.6, (screenW - 16) / naturalW) : Math.min(1, (screenW - 40) / naturalW);
  var gameW = naturalW * scale;
  var gameH = naturalH * scale;

  var styles = {
    page: {
      background: 'linear-gradient(180deg, #0a1628 0%, #0d2010 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
      userSelect: 'none',
      padding: isMobile ? '8px 0' : '16px 0',
      boxSizing: 'border-box',
    },
    gameContainer: {
      position: 'relative',
      width: gameW + 'px',
      height: gameH + 'px',
      overflow: 'hidden',
      borderRadius: '10px',
      boxShadow: '0 0 0 3px #2a6a3a, 0 0 40px rgba(0,180,80,0.35), 0 8px 32px rgba(0,0,0,0.6)',
      cursor: state.selectedCard ? 'crosshair' : 'default',
      flexShrink: 0,
      userSelect: 'none',
      WebkitUserSelect: 'none',
    },
    bg: {
      position: 'absolute',
      top: 0, left: 0,
      width: naturalW + 'px',
      height: naturalH + 'px',
      objectFit: 'cover',
      transformOrigin: 'top left',
      transform: 'scale(' + scale + ')',
    },
    // 顶部 HUD 覆盖在背景图上方
    hud: {
      position: 'absolute',
      top: 0, left: 0,
      width: '100%',
      height: (MAP_TOP * scale) + 'px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 ' + (6 * scale) + 'px',
      boxSizing: 'border-box',
      zIndex: 20,
      gap: (4 * scale) + 'px',
    },
  };

  // ---- 菜单界面 ----
  if (state.gameState === 'menu') {
    return (
      <div style={styles.page}>
        <div style={{ display: 'none' }}>{timestamp}</div>
        <div style={{
          background: 'linear-gradient(160deg, #0f2a10 0%, #1a4020 50%, #0f2a10 100%)',
          border: '2px solid #3a8a4a',
          borderRadius: '20px',
          padding: isMobile ? '28px 24px' : '44px 64px',
          textAlign: 'center',
          boxShadow: '0 0 60px rgba(0,180,80,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
          maxWidth: '480px',
          width: '90%',
          marginTop: '20px',
        }}>
          {/* 标题区 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: isMobile ? '40px' : '56px', lineHeight: 1, marginBottom: '8px' }}>🌻🧟</div>
            <h1 style={{
              color: '#7fff00',
              fontSize: isMobile ? '24px' : '34px',
              margin: '0 0 6px',
              fontWeight: 'bold',
              textShadow: '0 0 20px rgba(100,255,0,0.5)',
              letterSpacing: '2px',
            }}>植物大战僵尸</h1>
            <div style={{ color: '#5a8a5a', fontSize: '12px' }}>宜搭版 · 素材来自 GeeeekExplorer/PVZ</div>
          </div>

          {/* 植物介绍卡片 */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '24px',
            textAlign: 'left',
          }}>
            <div style={{ color: '#7fff00', fontSize: '12px', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>植物图鉴</div>
            {PLANT_ORDER.map(function(pt) {
              var cfg = PLANT_CONFIGS[pt];
              return (
                <div key={pt} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                  <img src={cfg.png} style={{ width: '32px', height: '32px', objectFit: 'contain', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ color: '#ddd', fontSize: '13px', fontWeight: 'bold' }}>{cfg.name}</span>
                    <span style={{ color: '#FFD700', fontSize: '11px', marginLeft: '8px' }}>☀{cfg.cost}</span>
                  </div>
                  <div style={{ color: '#888', fontSize: '11px' }}>
                    {pt === 'SunFlower' && '定时产阳光'}
                    {pt === 'Peashooter' && '发射豌豆'}
                    {pt === 'SnowPea' && '冰冻减速'}
                    {pt === 'WallNut' && '超高血量'}
                    {pt === 'CherryBomb' && '范围爆炸'}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={function() { startGame.call(self); }}
            style={{
              background: 'linear-gradient(135deg, #2a7a2a, #1a5a1a)',
              color: '#7fff00',
              border: '2px solid #4aaa5a',
              borderRadius: '40px',
              padding: isMobile ? '12px 40px' : '16px 60px',
              fontSize: isMobile ? '18px' : '22px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 20px rgba(0,200,80,0.35)',
              letterSpacing: '2px',
            }}
          >
            开始游戏 🎮
          </button>
          <div style={{ color: '#3a6a3a', fontSize: '11px', marginTop: '14px' }}>
            点击卡牌选植物 → 点击地图种植 · 点击☀收集阳光
          </div>
        </div>
      </div>
    );
  }

  // ---- 胜利/失败界面 ----
  if (state.gameState === 'win' || state.gameState === 'lose') {
    var isWin = state.gameState === 'win';
    return (
      <div style={styles.page}>
        <div style={{ display: 'none' }}>{timestamp}</div>
        <div style={{
          background: isWin
            ? 'linear-gradient(160deg, #0f2a10, #1a4020, #0f2a10)'
            : 'linear-gradient(160deg, #2a0f0f, #401a1a, #2a0f0f)',
          border: '2px solid ' + (isWin ? '#3a8a4a' : '#8a3a3a'),
          borderRadius: '20px',
          padding: isMobile ? '32px 24px' : '50px 70px',
          textAlign: 'center',
          boxShadow: '0 0 60px ' + (isWin ? 'rgba(0,180,80,0.3)' : 'rgba(180,50,50,0.3)'),
          maxWidth: '420px',
          width: '90%',
          marginTop: '40px',
        }}>
          <div style={{ fontSize: isMobile ? '56px' : '72px', marginBottom: '16px' }}>{isWin ? '🏆' : '💀'}</div>
          <h1 style={{
            color: isWin ? '#7fff00' : '#ff5555',
            fontSize: isMobile ? '28px' : '40px',
            margin: '0 0 20px',
            textShadow: '0 0 20px ' + (isWin ? 'rgba(100,255,0,0.5)' : 'rgba(255,50,50,0.5)'),
          }}>
            {isWin ? '胜利！' : '僵尸获胜！'}
          </h1>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '28px',
          }}>
            <div style={{ color: '#FFD700', fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', marginBottom: '6px' }}>
              {state.score} 分
            </div>
            <div style={{ color: '#aaa', fontSize: '14px' }}>消灭僵尸 {state.zombiesKilled} 只 · 第 {state.wave} 波</div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={function() { startGame.call(self); }}
              style={{
                background: 'linear-gradient(135deg, #2a5a8a, #1a3a5a)',
                color: '#7ff',
                border: '2px solid #4a8aaf',
                borderRadius: '30px',
                padding: isMobile ? '10px 28px' : '14px 40px',
                fontSize: isMobile ? '15px' : '18px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              再来一局 🔄
            </button>
            <button
              onClick={function() { stopGame.call(self); _customState.gameState = 'menu'; self.forceUpdate(); }}
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#aaa',
                border: '1px solid #555',
                borderRadius: '30px',
                padding: isMobile ? '10px 20px' : '14px 30px',
                fontSize: isMobile ? '14px' : '16px',
                cursor: 'pointer',
              }}
            >
              返回菜单
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- 游戏主界面 ----

  // 右键取消选中
  var handleContextMenu = function(e) {
    e.preventDefault();
    if (_customState.selectedCard) {
      _customState.selectedCard = null;
      self.forceUpdate();
    }
  };

  // 鼠标悬停格子
  var handleMouseMove = function(e) {
    if (!state.selectedCard) { _customState.hoverCell = null; return; }
    var rect = e.currentTarget.getBoundingClientRect();
    var mx = (e.clientX - rect.left) / scale;
    var my = (e.clientY - rect.top) / scale;
    var col = Math.floor((mx - MAP_LEFT) / CELL_W);
    var row = Math.floor((my - MAP_TOP) / CELL_H);
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      _customState.hoverCell = { r: row, c: col };
    } else {
      _customState.hoverCell = null;
    }
  };

  var handleMouseLeave = function() {
    _customState.hoverCell = null;
  };

  // 点击地图种植（只响应直接点击地图背景区域，卡牌/按钮点击会自行 stopPropagation）
  var handleMapClick = function(e) {
    var currentSelected = _customState.selectedCard;
    if (!currentSelected) return;

    var rect = e.currentTarget.getBoundingClientRect();
    var clickX = (e.clientX - rect.left) / scale;
    var clickY = (e.clientY - rect.top) / scale;

    // 点击在顶部 HUD 区域（MAP_TOP 以上）时不种植
    if (clickY < MAP_TOP) return;

    var col = Math.floor((clickX - MAP_LEFT) / CELL_W);
    var row = Math.floor((clickY - MAP_TOP) / CELL_H);
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

    if (_customState.grid[row][col]) {
      self.utils.toast({ title: '该格已有植物！', type: 'warning', duration: 1500 });
      return;
    }
    var cfg = PLANT_CONFIGS[currentSelected];
    if (_customState.sun < cfg.cost) {
      self.utils.toast({ title: '阳光不足！需要 ' + cfg.cost + ' ☀', type: 'error', duration: 1500 });
      return;
    }
    var plantTime = Date.now();
    _customState.sun -= cfg.cost;
    _customState.cardCooldowns[currentSelected] = plantTime;
    _customState.grid[row][col] = {
      type: currentSelected,
      hp: cfg.hp,
      maxHp: cfg.hp,
      sunTimer: 0,
      shootTimer: 0,
      fuseTimer: 0,
      plantedAt: plantTime,
    };
    _customState.hoverCell = null;
    _customState.selectedCard = null;
    self.forceUpdate();
  };

  // 点击阳光收集
  var handleSunClick = function(e, sunId, sunX, sunY, sunValue) {
    // 阻止冒泡，防止收集阳光时误触发地图种植
    e.stopPropagation();
    _customState.suns = _customState.suns.filter(function(s) {
      if (s.id === sunId) {
        _customState.sun += s.value;
        addFloatingText(sunX, sunY, '+' + s.value + '☀', '#FFD700');
        return false;
      }
      return true;
    });
    self.forceUpdate();
  };

  // 渲染卡牌
  var renderCards = function() {
    var cardW = Math.floor(isMobile ? 42 * scale : 58);
    var cardH = Math.floor(isMobile ? 60 * scale : 80);
    return PLANT_ORDER.map(function(plantType) {
      var cfg = PLANT_CONFIGS[plantType];
      var lastUsed = _customState.cardCooldowns[plantType] || 0;
      var elapsed = now - lastUsed;
      var cooldownRatio = Math.min(1, elapsed / cfg.cooldown);
      var isReady = cooldownRatio >= 1;
      var isSelected = state.selectedCard === plantType;
      var canAfford = _customState.sun >= cfg.cost;
      var isActive = isReady && canAfford;

      return (
        <div
          key={plantType}
          onClick={function(e) {
            // 阻止冒泡，防止触发地图的 handleMapClick 误种植
            e.stopPropagation();
            if (!isActive) {
              if (!isReady) self.utils.toast({ title: cfg.name + ' 冷却中', type: 'warning', duration: 1000 });
              else self.utils.toast({ title: '阳光不足！需要 ' + cfg.cost + ' ☀', type: 'error', duration: 1000 });
              return;
            }
            _customState.selectedCard = isSelected ? null : plantType;
            self.forceUpdate();
          }}
          style={{
            position: 'relative',
            width: cardW + 'px',
            height: cardH + 'px',
            marginRight: '3px',
            cursor: isActive ? 'pointer' : 'not-allowed',
            border: isSelected ? '2px solid #FFD700' : (isActive ? '2px solid #5a9a6a' : '2px solid #3a4a3a'),
            borderRadius: '6px',
            overflow: 'hidden',
            background: isSelected ? '#2a3a0a' : '#0a1a0a',
            boxShadow: isSelected ? '0 0 12px #FFD700, 0 0 4px #FFD700' : (isActive ? '0 2px 6px rgba(0,0,0,0.4)' : 'none'),
            flexShrink: 0,
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
        >
          <img
            src={cfg.png}
            style={{
              width: '100%',
              height: (cardH - 18) + 'px',
              objectFit: 'cover',
              display: 'block',
              filter: isActive ? 'none' : 'grayscale(60%) brightness(0.7)',
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '18px',
            background: canAfford ? 'rgba(0,0,0,0.75)' : 'rgba(60,0,0,0.85)',
            color: canAfford ? '#FFD700' : '#aa5555',
            fontSize: '10px',
            textAlign: 'center',
            lineHeight: '18px',
            fontWeight: 'bold',
          }}>
            ☀{cfg.cost}
          </div>
          {/* 冷却遮罩：从上往下消退 */}
          {!isReady && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: ((1 - cooldownRatio) * (cardH - 18)) + 'px',
              background: 'rgba(0,0,0,0.7)',
              borderRadius: '4px 4px 0 0',
            }} />
          )}
          {/* 选中高亮角标 */}
          {isSelected && (
            <div style={{
              position: 'absolute',
              top: '2px', right: '2px',
              width: '8px', height: '8px',
              borderRadius: '50%',
              background: '#FFD700',
              boxShadow: '0 0 4px #FFD700',
            }} />
          )}
        </div>
      );
    });
  };

  // 渲染植物
  var renderPlants = function() {
    var elements = [];
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var plant = _customState.grid[r][c];
        if (!plant) continue;
        var cfg = PLANT_CONFIGS[plant.type];
        var px = (MAP_LEFT + c * CELL_W + CELL_W / 2 - 35) * scale;
        var py = (MAP_TOP + r * CELL_H + CELL_H / 2 - 38) * scale;
        var hpRatio = Math.max(0, plant.hp / plant.maxHp);
        var hpColor = hpRatio > 0.6 ? '#2ecc71' : hpRatio > 0.3 ? '#f39c12' : '#e74c3c';
        // 种下后短暂放大动画（通过 scale 模拟）
        var age = now - (plant.plantedAt || now);
        var plantScale = age < 300 ? (0.7 + 0.3 * age / 300) : 1;
        elements.push(
          <div key={r + '-' + c} style={{
            position: 'absolute',
            left: px + 'px',
            top: py + 'px',
            width: (70 * scale) + 'px',
            height: (76 * scale) + 'px',
            transform: 'scale(' + plantScale + ')',
            transformOrigin: 'bottom center',
          }}>
            <img src={cfg.gif} style={{ width: '100%', height: (70 * scale) + 'px', objectFit: 'contain', display: 'block' }} />
            {/* 血条 */}
            <div style={{
              position: 'absolute',
              bottom: '0px',
              left: '8%', right: '8%',
              height: '5px',
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: (hpRatio * 100) + '%',
                background: hpColor,
                borderRadius: '3px',
                boxShadow: '0 0 4px ' + hpColor,
              }} />
            </div>
          </div>
        );
      }
    }
    return elements;
  };

  // 渲染僵尸
  var renderZombies = function() {
    return _customState.zombies.map(function(zombie) {
      var cfg = ZOMBIE_CONFIGS[zombie.type];
      var gifSrc = zombie.state === 'attack' ? cfg.attackGif : zombie.state === 'die' ? cfg.dieGif : cfg.walkGif;
      var zx = zombie.x * scale - 38 * scale;
      var zy = (MAP_TOP + zombie.row * CELL_H + CELL_H / 2 - 45) * scale;
      var hpRatio = Math.max(0, zombie.hp / zombie.maxHp);
      var isFrozen = zombie.frozen > 0;
      var isDying = zombie.state === 'die';
      return (
        <div key={zombie.id} style={{
          position: 'absolute',
          left: zx + 'px',
          top: zy + 'px',
          width: (76 * scale) + 'px',
          height: (90 * scale) + 'px',
          opacity: isDying ? Math.max(0, 1 - zombie.dieTimer / 50) : 1,
          filter: isFrozen ? 'hue-rotate(160deg) brightness(1.4) saturate(1.5)' : 'none',
          zIndex: isDying ? 1 : 3,
        }}>
          <img src={gifSrc} style={{ width: '100%', height: (84 * scale) + 'px', objectFit: 'contain', display: 'block' }} />
          {/* 血条 */}
          {!isDying && (
            <div style={{
              position: 'absolute',
              bottom: '0px',
              left: '5%', right: '5%',
              height: '5px',
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: (hpRatio * 100) + '%',
                background: hpRatio > 0.5 ? '#e74c3c' : '#c0392b',
                borderRadius: '3px',
              }} />
            </div>
          )}
          {/* 冰冻标识 */}
          {isFrozen && (
            <div style={{
              position: 'absolute',
              top: '2px', right: '2px',
              fontSize: (10 * scale) + 'px',
            }}>❄️</div>
          )}
        </div>
      );
    });
  };

  // 渲染子弹（使用真实豌豆图片）
  var renderBullets = function() {
    return _customState.bullets.map(function(bullet) {
      var bx = bullet.x * scale;
      var by = bullet.y * scale;
      var bulletSize = 16 * scale;
      return (
        <div key={bullet.id} style={{
          position: 'absolute',
          left: (bx - bulletSize / 2) + 'px',
          top: (by - bulletSize / 2) + 'px',
          width: bulletSize + 'px',
          height: bulletSize + 'px',
          zIndex: 5,
        }}>
          <img
            src={bullet.frozen ? IMG + 'PeaSnow.png' : IMG + 'Pea.png'}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      );
    });
  };

  // 渲染阳光
  var renderSuns = function() {
    return _customState.suns.map(function(sun) {
      var age = now - sun.born;
      var sunY;
      if (sun.fromFlower) {
        var progress = Math.min(1, age / 800);
        sunY = sun.y + progress * (sun.targetY - sun.y);
      } else {
        var fallProgress = Math.min(1, age / 2000);
        sunY = sun.y + fallProgress * (sun.targetY - sun.y);
      }
      var opacity = age > sun.lifetime - 2500 ? (sun.lifetime - age) / 2500 : 1;
      var sunSize = 44 * scale;
      return (
        <div
          key={sun.id}
          onClick={function(e) { handleSunClick(e, sun.id, sun.x, sunY, sun.value); }}
          style={{
            position: 'absolute',
            left: (sun.x * scale - sunSize / 2) + 'px',
            top: (sunY * scale - sunSize / 2) + 'px',
            width: sunSize + 'px',
            height: sunSize + 'px',
            cursor: 'pointer',
            zIndex: 25,
            opacity: opacity,
            filter: 'drop-shadow(0 0 6px rgba(255,200,0,0.8))',
          }}
        >
          <img src={IMG + 'Sun.gif'} style={{ width: '100%', height: '100%' }} />
        </div>
      );
    });
  };

  // 渲染爆炸特效
  var renderExplosions = function() {
    return _customState.explosions.map(function(ex) {
      var age = now - ex.born;
      var progress = age / ex.lifetime;
      var exSize = (120 + progress * 80) * scale;
      var opacity = 1 - progress;
      return (
        <div key={ex.id} style={{
          position: 'absolute',
          left: (ex.x * scale - exSize / 2) + 'px',
          top: (ex.y * scale - exSize / 2) + 'px',
          width: exSize + 'px',
          height: exSize + 'px',
          zIndex: 30,
          opacity: opacity,
          pointerEvents: 'none',
        }}>
          <img src={IMG + 'Boom.gif'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      );
    });
  };

  // 渲染浮动文字
  var renderFloatingTexts = function() {
    return _customState.floatingTexts.map(function(ft) {
      var age = now - ft.born;
      var progress = age / ft.lifetime;
      var ftY = ft.y * scale - progress * 40 * scale;
      var opacity = 1 - progress;
      return (
        <div key={ft.id} style={{
          position: 'absolute',
          left: (ft.x * scale) + 'px',
          top: ftY + 'px',
          color: ft.color,
          fontSize: (14 * scale) + 'px',
          fontWeight: 'bold',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          opacity: opacity,
          pointerEvents: 'none',
          zIndex: 40,
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
        }}>
          {ft.text}
        </div>
      );
    });
  };

  // 渲染格子（含悬停高亮）
  var renderGrid = function() {
    var cells = [];
    var hover = _customState.hoverCell;
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var isHover = hover && hover.r === r && hover.c === c;
        var hasPlant = !!(_customState.grid[r][c]);
        var canPlace = isHover && state.selectedCard && !hasPlant;
        cells.push(
          <div key={r + '-' + c} style={{
            position: 'absolute',
            left: ((MAP_LEFT + c * CELL_W) * scale) + 'px',
            top: ((MAP_TOP + r * CELL_H) * scale) + 'px',
            width: (CELL_W * scale) + 'px',
            height: (CELL_H * scale) + 'px',
            border: isHover ? ('2px solid ' + (canPlace ? 'rgba(100,255,100,0.7)' : 'rgba(255,100,100,0.6)')) : '1px solid rgba(255,255,255,0.04)',
            boxSizing: 'border-box',
            background: canPlace ? 'rgba(100,255,100,0.12)' : (isHover && !canPlace ? 'rgba(255,100,100,0.08)' : 'transparent'),
            borderRadius: '2px',
            pointerEvents: 'none',
          }} />
        );
      }
    }
    return cells;
  };

  // 渲染割草机
  var renderMowers = function() {
    var mowers = [];
    for (var r = 0; r < ROWS; r++) {
      var my = (MAP_TOP + r * CELL_H + CELL_H / 2 - 20) * scale;
      var mx = (MAP_LEFT - 60) * scale;
      mowers.push(
        <div key={'mower-' + r} style={{
          position: 'absolute',
          left: mx + 'px',
          top: my + 'px',
          width: (50 * scale) + 'px',
          height: (40 * scale) + 'px',
          zIndex: 2,
        }}>
          <img src={IMG + 'LawnMower.png'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      );
    }
    return mowers;
  };

  // 波次提示
  var renderWaveNotice = function() {
    if (!state.waveNotice) return null;
    var age = now - state.waveNotice.born;
    if (age > 2500) return null;
    var progress = age / 2500;
    var opacity = progress < 0.2 ? progress / 0.2 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
    var translateY = (progress < 0.2 ? (1 - progress / 0.2) * 20 : 0);
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, calc(-50% + ' + translateY + 'px))',
        color: '#FFD700',
        fontSize: (isMobile ? 22 : 32) * scale + 'px',
        fontWeight: 'bold',
        textShadow: '0 0 20px rgba(255,200,0,0.8), 0 2px 8px rgba(0,0,0,0.9)',
        opacity: opacity,
        zIndex: 50,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        letterSpacing: '3px',
      }}>
        ⚠️ {state.waveNotice.text}
      </div>
    );
  };

  // 僵尸进度条（右侧）
  var totalSpawned = state.zombiesKilled + _customState.zombies.filter(function(z) { return z.state !== 'die'; }).length;
  var waveTotal = 6 + state.wave * 3;
  var zombieProgress = Math.min(1, totalSpawned / waveTotal);

  return (
    <div style={styles.page}>
      <div style={{ display: 'none' }}>{timestamp}</div>

      {/* 顶部信息栏（游戏容器外） */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '10px' : '20px',
        marginBottom: '6px',
        width: gameW + 'px',
        boxSizing: 'border-box',
        padding: '0 4px',
      }}>
        <div style={{ color: '#FFD700', fontWeight: 'bold', fontSize: isMobile ? '13px' : '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <img src={IMG + 'Sun.gif'} style={{ width: isMobile ? '16px' : '20px', height: isMobile ? '16px' : '20px' }} />
          {state.sun}
        </div>
        <div style={{ color: '#7fff00', fontSize: isMobile ? '12px' : '14px' }}>
          第 <strong>{state.wave}</strong>/3 波
        </div>
        <div style={{ color: '#f88', fontSize: isMobile ? '12px' : '14px' }}>
          消灭 <strong>{state.zombiesKilled}</strong> 只
        </div>
        <div style={{ color: '#FFD700', fontSize: isMobile ? '12px' : '14px', marginLeft: 'auto' }}>
          得分 <strong>{state.score}</strong>
        </div>
        <button
          onClick={function() {
            if (_customState.gameState === 'playing') _customState.gameState = 'paused';
            else if (_customState.gameState === 'paused') _customState.gameState = 'playing';
            self.forceUpdate();
          }}
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: '#ccc',
            border: '1px solid #444',
            borderRadius: '6px',
            padding: isMobile ? '3px 8px' : '4px 12px',
            cursor: 'pointer',
            fontSize: isMobile ? '11px' : '13px',
          }}
        >
          {state.gameState === 'paused' ? '▶ 继续' : '⏸ 暂停'}
        </button>
      </div>

      {/* 游戏主容器 */}
      <div
        style={styles.gameContainer}
        onClick={handleMapClick}
        onContextMenu={handleContextMenu}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onDragStart={function(e) { e.preventDefault(); }}
      >
        {/* 背景图 */}
        <img src={IMG + 'Background.jpg'} style={styles.bg} draggable="false" />

        {/* 格子高亮 */}
        {renderGrid()}

        {/* 割草机 */}
        {renderMowers()}

        {/* 植物 */}
        {renderPlants()}

        {/* 僵尸 */}
        {renderZombies()}

        {/* 子弹 */}
        {renderBullets()}

        {/* 阳光 */}
        {renderSuns()}

        {/* 爆炸特效 */}
        {renderExplosions()}

        {/* 浮动文字 */}
        {renderFloatingTexts()}

        {/* 波次提示 */}
        {renderWaveNotice()}

        {/* 顶部卡牌栏（覆盖在背景上） */}
        <div style={styles.hud}>
          {/* 阳光显示 */}
          <div style={{
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            color: '#FFD700',
            fontWeight: 'bold',
            fontSize: (isMobile ? 11 : 14) * scale + 'px',
            padding: (3 * scale) + 'px ' + (8 * scale) + 'px',
            borderRadius: (12 * scale) + 'px',
            display: 'flex',
            alignItems: 'center',
            gap: (3 * scale) + 'px',
            flexShrink: 0,
            border: '1px solid rgba(255,200,0,0.3)',
          }}>
            <img src={IMG + 'Sun.gif'} style={{ width: (18 * scale) + 'px', height: (18 * scale) + 'px' }} />
            {state.sun}
          </div>

          {/* 卡牌区 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', overflow: 'hidden' }}>
            {renderCards()}
          </div>

          {/* 右侧：选中提示 */}
          {state.selectedCard && (
            <div style={{
              marginLeft: 'auto',
              background: 'rgba(0,0,0,0.6)',
              color: '#FFD700',
              fontSize: (isMobile ? 9 : 11) * scale + 'px',
              padding: (2 * scale) + 'px ' + (8 * scale) + 'px',
              borderRadius: (10 * scale) + 'px',
              flexShrink: 0,
              border: '1px solid rgba(255,200,0,0.4)',
              whiteSpace: 'nowrap',
            }}>
              {PLANT_CONFIGS[state.selectedCard].name} · 右键取消
            </div>
          )}
        </div>

        {/* 暂停遮罩 */}
        {state.gameState === 'paused' && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            gap: '16px',
          }}>
            <div style={{ color: '#fff', fontSize: (isMobile ? 22 : 30) * scale + 'px', fontWeight: 'bold' }}>⏸ 游戏暂停</div>
            <button
              onClick={function() { _customState.gameState = 'playing'; self.forceUpdate(); }}
              style={{
                background: 'linear-gradient(135deg, #2a7a2a, #1a5a1a)',
                color: '#7fff00',
                border: '2px solid #4aaa5a',
                borderRadius: '30px',
                padding: (isMobile ? 8 : 12) * scale + 'px ' + (isMobile ? 24 : 36) * scale + 'px',
                fontSize: (isMobile ? 14 : 18) * scale + 'px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              ▶ 继续游戏
            </button>
          </div>
        )}
      </div>

      {/* 底部进度条 */}
      <div style={{
        width: gameW + 'px',
        marginTop: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{ color: '#666', fontSize: '11px', flexShrink: 0 }}>僵尸进度</div>
        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: (zombieProgress * 100) + '%',
            background: 'linear-gradient(90deg, #e74c3c, #c0392b)',
            borderRadius: '3px',
            transition: 'width 0.3s',
          }} />
        </div>
        <div style={{ color: '#888', fontSize: '11px', flexShrink: 0 }}>{state.zombiesKilled}/{waveTotal}</div>
      </div>
    </div>
  );
}
