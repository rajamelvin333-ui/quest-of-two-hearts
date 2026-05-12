import { useRef, useEffect, useState } from 'react';

export default function GameScreen({ gameData, playerId, role, onAction }) {
  const canvasRef = useRef(null);
  const [keysPressed, setKeysPressed] = useState({});

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', ' ', 'e'].includes(key)) {
        setKeysPressed(prev => ({ ...prev, [key]: true }));
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', ' ', 'e'].includes(key)) {
        setKeysPressed(prev => ({ ...prev, [key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle movement
  useEffect(() => {
    let direction = 'stop';
    if (keysPressed['w']) direction = 'up';
    else if (keysPressed['s']) direction = 'down';
    else if (keysPressed['a']) direction = 'left';
    else if (keysPressed['d']) direction = 'right';

    if (direction !== 'stop') {
      onAction({ type: 'move', direction });
    }
  }, [keysPressed, onAction]);

  // Handle attack with space
  useEffect(() => {
    if (!keysPressed[' '] || !gameData) return;

    const currentPlayer = gameData.players.find(p => p.playerId === playerId);
    if (!currentPlayer || gameData.enemies.length === 0) return;

    // Find nearest enemy
    let nearest = gameData.enemies[0];
    let minDist = Infinity;
    gameData.enemies.forEach(enemy => {
      const dist = Math.hypot(currentPlayer.x - enemy.x, currentPlayer.y - enemy.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    });

    if (minDist < 150) {
      onAction({ type: 'attack', targetId: nearest.id });
    }
  }, [keysPressed[' '], gameData, playerId, onAction]);

  // Handle heal with E
  useEffect(() => {
    if (!keysPressed['e'] || role !== 'mage') return;
    onAction({ type: 'ability', abilityName: 'heal' });
  }, [keysPressed['e'], role, onAction]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameData) return;

    const ctx = canvas.getContext('2d');
    const { width, height, players, enemies, wave } = gameData;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#2a2a4e';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw enemies
    ctx.fillStyle = '#ff6b6b';
    enemies.forEach(enemy => {
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, 15, 0, Math.PI * 2);
      ctx.fill();
      // Health bar
      ctx.fillStyle = '#fff';
      ctx.fillRect(enemy.x - 20, enemy.y - 30, 40 * (enemy.health / enemy.maxHealth), 3);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(enemy.x - 20, enemy.y - 30, 40, 3);
      ctx.fillStyle = '#ff6b6b';
    });

    // Draw players
    players.forEach(player => {
      const isCurrentPlayer = player.playerId === playerId;
      ctx.fillStyle = player.role === 'warrior' ? '#4ecdc4' : '#ffe66d';
      ctx.beginPath();
      ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
      ctx.fill();

      // Player name
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(player.playerId.split('-')[0], player.x, player.y - 35);

      // Health bar
      const healthPercent = player.health / player.maxHealth;
      ctx.fillStyle = healthPercent > 0.5 ? '#51cf66' : '#ff6b6b';
      ctx.fillRect(player.x - 25, player.y - 30, 50 * healthPercent, 4);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(player.x - 25, player.y - 30, 50, 4);

      // Mana bar if mage
      if (player.role === 'mage') {
        const manaPercent = player.mana / player.maxMana;
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(player.x - 25, player.y - 24, 50 * manaPercent, 3);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(player.x - 25, player.y - 24, 50, 3);
      }
    });

    // HUD
    const currentPlayer = players.find(p => p.playerId === playerId);
    if (currentPlayer) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Wave: ${wave}`, 20, 30);
      ctx.fillText(`Health: ${currentPlayer.health}/${currentPlayer.maxHealth}`, 20, 55);
      if (currentPlayer.role === 'mage') {
        ctx.fillText(`Mana: ${Math.floor(currentPlayer.mana)}/${currentPlayer.maxMana}`, 20, 80);
      }
      ctx.fillText(`Enemies: ${enemies.length}`, 20, 105);

      // Controls
      ctx.font = '12px sans-serif';
      ctx.fillText('WASD: Move | Space: Attack | E: Ability', 20, height - 20);
    }
  }, [gameData, playerId]);

  return (
    <div className="game-screen">
      <canvas
        ref={canvasRef}
        width={gameData?.width || 1000}
        height={gameData?.height || 600}
        className="game-canvas"
      />
    </div>
  );
}
