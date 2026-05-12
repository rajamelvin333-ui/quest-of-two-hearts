const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Game constants
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 600;
const TICK_RATE = 20; // 50ms per tick
const WARRIOR_SPEED = 5;
const MAGE_SPEED = 7;
const WARRIOR_DAMAGE = 20;
const MAGE_DAMAGE = 15;
const WARRIOR_HP = 200;
const MAGE_HP = 150;

// Active game rooms
const GAME_ROOMS = new Map();

class GameRoom {
  constructor(roomId) {
    this.roomId = roomId;
    this.status = 'waiting'; // waiting, playing, ended
    this.players = new Map();
    this.enemies = [];
    this.tick = 0;
    this.startTime = null;
    this.wave = 0;
  }

  addPlayer(playerId, socketId, role) {
    if (this.players.size >= 2) return false;
    this.players.set(playerId, {
      playerId,
      socketId,
      role,
      x: role === 'warrior' ? 200 : 800,
      y: GAME_HEIGHT / 2,
      vx: 0,
      vy: 0,
      health: role === 'warrior' ? WARRIOR_HP : MAGE_HP,
      maxHealth: role === 'warrior' ? WARRIOR_HP : MAGE_HP,
      mana: role === 'warrior' ? 0 : 100,
      maxMana: 100,
      attacking: false,
      attackCooldown: 0,
      lastAttackTime: 0
    });
    return true;
  }

  spawnEnemies() {
    if (this.enemies.length === 0) {
      const enemyCount = Math.min(2 + this.wave, 4);
      for (let i = 0; i < enemyCount; i++) {
        this.enemies.push({
          id: `enemy-${Date.now()}-${i}`,
          x: Math.random() * (GAME_WIDTH - 100) + 50,
          y: Math.random() * (GAME_HEIGHT - 100) + 50,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          health: 50,
          maxHealth: 50,
          attackCooldown: 0
        });
      }
      this.wave++;
    }
  }

  update(deltaTime) {
    if (this.status !== 'playing') return;

    this.tick++;

    // Update player positions
    this.players.forEach(player => {
      const speed = player.role === 'warrior' ? WARRIOR_SPEED : MAGE_SPEED;
      player.x += player.vx * speed;
      player.y += player.vy * speed;

      // Boundary check
      player.x = Math.max(20, Math.min(GAME_WIDTH - 20, player.x));
      player.y = Math.max(20, Math.min(GAME_HEIGHT - 20, player.y));

      // Update cooldowns
      if (player.attackCooldown > 0) player.attackCooldown -= deltaTime;
      if (player.role === 'mage' && player.mana < player.maxMana) {
        player.mana += 0.5; // mana regen
      }
    });

    // Update enemies
    this.enemies = this.enemies.filter(enemy => enemy.health > 0);

    this.enemies.forEach(enemy => {
      // Chase nearest player
      let nearest = null;
      let minDist = Infinity;
      this.players.forEach(player => {
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist < minDist) {
          minDist = dist;
          nearest = player;
        }
      });

      if (nearest) {
        const dx = nearest.x - enemy.x;
        const dy = nearest.y - enemy.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 50) {
          enemy.x += (dx / dist) * 2;
          enemy.y += (dy / dist) * 2;
        }

        // Simple attack
        if (dist < 50 && Math.random() < 0.01) {
          nearest.health -= 10;
        }
      }

      // Boundary check
      enemy.x = Math.max(20, Math.min(GAME_WIDTH - 20, enemy.x));
      enemy.y = Math.max(20, Math.min(GAME_HEIGHT - 20, enemy.y));
    });

    // Check victory
    if (this.enemies.length === 0 && this.wave >= 3) {
      this.status = 'ended';
      this.result = 'victory';
    }

    // Check defeat
    let allDead = true;
    this.players.forEach(p => {
      if (p.health > 0) allDead = false;
    });
    if (allDead) {
      this.status = 'ended';
      this.result = 'defeat';
    }
  }

  getState() {
    return {
      tick: this.tick,
      status: this.status,
      players: Array.from(this.players.values()),
      enemies: this.enemies,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      wave: this.wave
    };
  }
}

// HTTP endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('game:createRoom', (callback) => {
    const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    const room = new GameRoom(roomId);
    GAME_ROOMS.set(roomId, room);
    callback({ roomId });
  });

  socket.on('game:joinRoom', (data, callback) => {
    const { roomId, playerName, role } = data;
    const room = GAME_ROOMS.get(roomId);

    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }

    const playerId = `${playerName}-${socket.id}`;
    const success = room.addPlayer(playerId, socket.id, role);

    if (success) {
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.playerId = playerId;

      // Notify other player
      socket.to(roomId).emit('game:playerJoined', {
        playerId,
        playerName,
        role
      });

      // Start game if 2 players
      if (room.players.size === 2) {
        room.status = 'playing';
        room.startTime = Date.now();
        room.spawnEnemies();
        io.to(roomId).emit('game:started', room.getState());
      }

      callback({ success: true, roomId, playerId });
    } else {
      callback({ success: false, error: 'Room full' });
    }
  });

  socket.on('player:move', (data) => {
    const { roomId, playerId, direction } = data;
    const room = GAME_ROOMS.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    // Set velocity based on direction
    const dirs = {
      up: { vx: 0, vy: -1 },
      down: { vx: 0, vy: 1 },
      left: { vx: -1, vy: 0 },
      right: { vx: 1, vy: 0 },
      stop: { vx: 0, vy: 0 }
    };

    const dir = dirs[direction] || dirs.stop;
    player.vx = dir.vx;
    player.vy = dir.vy;
  });

  socket.on('player:attack', (data) => {
    const { roomId, playerId, targetId } = data;
    const room = GAME_ROOMS.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    const target = room.enemies.find(e => e.id === targetId);

    if (!player || !target) return;

    if (player.attackCooldown > 0) return;

    const damage = player.role === 'warrior' ? WARRIOR_DAMAGE : MAGE_DAMAGE;
    target.health -= damage;
    player.attackCooldown = 1000; // 1 second cooldown

    io.to(roomId).emit('game:stateUpdate', room.getState());
  });

  socket.on('player:ability', (data) => {
    const { roomId, playerId, abilityName } = data;
    const room = GAME_ROOMS.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    if (abilityName === 'heal' && player.role === 'mage') {
      if (player.mana >= 50) {
        // Heal all players
        room.players.forEach(p => {
          p.health = Math.min(p.maxHealth, p.health + 50);
        });
        player.mana -= 50;
        io.to(roomId).emit('game:stateUpdate', room.getState());
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    const roomId = socket.data.roomId;
    if (roomId) {
      const room = GAME_ROOMS.get(roomId);
      if (room) {
        room.status = 'ended';
        room.result = 'disconnect';
      }
    }
  });
});

// Game tick loop
setInterval(() => {
  GAME_ROOMS.forEach((room, roomId) => {
    if (room.status === 'playing') {
      room.update(1000 / TICK_RATE);
      room.spawnEnemies();

      io.to(roomId).emit('game:stateUpdate', room.getState());

      if (room.status === 'ended') {
        io.to(roomId).emit('game:ended', {
          result: room.result,
          stats: room.getState()
        });
      }
    }
  });
}, 1000 / TICK_RATE);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎮 Game server running on port ${PORT}`);
});
