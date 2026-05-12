# ⚔️ Quest of Two Hearts

A real-time co-op game for 2 players built in 24 hours.

## 🎮 How to Play

1. **One player creates a game** → Share the room code
2. **Other player joins with room code** → Pick your role (Warrior or Mage)
3. **Game starts when both players join**
4. **Fight enemies together, win by defeating all waves**

### Controls
- **WASD**: Move around
- **Space**: Attack nearest enemy
- **E**: Use ability (Shield for Warrior, Heal for Mage)

### Roles

**Warrior (Melvin)**
- Health: 200 HP
- Damage: 20 per attack
- Ability: Shield (reduces damage)
- Playstyle: Tank, melee

**Mage (Aliya)**
- Health: 150 HP
- Mana: 100 (regenerates)
- Damage: 15 per attack
- Ability: Heal (restores 50 HP to both players)
- Playstyle: Ranged, support

## 🚀 Quick Start

### Local Development

```bash
# Terminal 1: Backend
cd quest-of-two-hearts/backend
npm install
npm run dev

# Terminal 2: Frontend
cd quest-of-two-hearts/frontend
npm install
npm run dev

# Open http://localhost:5173 in browser
```

### Deployment (Production)

#### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel deploy
```

#### Backend (Railway)
```bash
cd backend
# Push to GitHub, connect to Railway
# Railway auto-deploys on push
```

#### Production .env
```
# Frontend: .env.production
VITE_SOCKET_URL=https://api.quest-of-two-hearts.railway.app

# Backend: .env
PORT=3001
NODE_ENV=production
```

## 📁 Project Structure

```
quest-of-two-hearts/
├── backend/
│   ├── server.js          # Game server (Express + Socket.io)
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── App.css        # Styling
│   │   └── components/
│   │       ├── GameScreen.jsx   # Game canvas + controls
│   │       └── LobbyScreen.jsx  # Room creation/joining
│   ├── package.json
│   └── .env.local
└── README.md
```

## 🔧 Technology Stack

- **Frontend**: React 18 + Socket.io + Canvas
- **Backend**: Node.js + Express + Socket.io
- **Deployment**: Vercel (frontend) + Railway (backend)

## 🎯 Game Mechanics

### Core Loop
1. Players move with WASD
2. Attack enemies with Space
3. Use abilities with E
4. Enemies attack in return
5. Win when all waves defeated
6. Lose if both players die

### Server-Authoritative
- All game state lives on server
- Server calculates all damage
- Client cannot cheat positions/health
- Real-time sync every 50ms

## 🌐 Online Multiplayer

Works anywhere with internet:
- Player 1 (Aceh) creates game
- Player 2 (Jakarta) joins with room code
- WebSocket keeps both in sync

## 📈 Next Steps (Post-Launch)

- [ ] Stage 3: Sky Fortress + Darkness Lord boss
- [ ] Cosmetics/skins
- [ ] Challenge modes
- [ ] Leaderboards
- [ ] Sound effects
- [ ] Animations

## 💕 Made for Melvin & Aliya

A hand-crafted co-op experience built with love.

---

**Status**: 🟢 Ready to Play  
**Version**: 1.0 MVP  
**Built**: 24-hour sprint
