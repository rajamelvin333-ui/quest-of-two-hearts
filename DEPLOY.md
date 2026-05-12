# 🚀 Deployment Guide - Production Ready

## Pre-Deployment Checklist

- [x] Game is playable locally
- [x] Server and client sync
- [x] Both roles functional
- [x] Canvas rendering working
- [x] Controls responsive

## Deploy Frontend (Vercel)

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login to Vercel (if not already)
vercel login

# Deploy
vercel deploy --prod
```

**Result**: Game will be live at https://[your-vercel-project].vercel.app

## Deploy Backend (Railway)

### Option 1: Using Railway CLI
```bash
cd backend

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Option 2: GitHub + Railway Web
1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit: Quest of Two Hearts"
   git push origin main
   ```

2. Go to railway.app
3. Create new project → GitHub repo
4. Connect your repo
5. Railway auto-deploys on push

**Result**: Backend URL will be something like https://quest-server-prod.railway.app

## Update Frontend .env

After deployment, update frontend to use production backend:

**frontend/.env.production.local**
```
VITE_SOCKET_URL=https://[your-railway-backend].railway.app
```

Then redeploy frontend:
```bash
cd frontend
vercel deploy --prod
```

## Test Production

1. Open https://[your-vercel-project].vercel.app in browser
2. Click "Create Game"
3. Open in another browser/device
4. Join with room code
5. Play together!

## Share with Aliya

Send her the URL:
```
https://[your-vercel-project].vercel.app
```

She can open it, join your room, and play from Jakarta while you're in Aceh.

## Troubleshooting

### "Cannot connect to server"
- Check backend is running on Railway
- Verify VITE_SOCKET_URL is correct
- Check CORS is enabled on backend

### "Room not found"
- Make sure both players are on same deployment (prod vs local)
- Room codes are 6-character alphanumeric

### "Lag/Desync"
- Normal up to 300ms latency
- Check internet connection quality
- Server compensates for lag

## Cost

**Free tier coverage**:
- Vercel: 100GB bandwidth/month FREE
- Railway: $5/month free credit

Should be completely free for a small co-op game.

## Post-Launch Updates

```bash
# Make changes to code
# Commit
git add .
git commit -m "Fix: [description]"
git push origin main

# Auto-deploys to both Vercel and Railway
```

---

**Once deployed, you're live! Share the URL and play tomorrow.** 🎮
