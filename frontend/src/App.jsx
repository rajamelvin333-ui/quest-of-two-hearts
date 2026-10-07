import { useState, useRef, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import GameScreen from './components/GameScreen';
import LobbyScreen from './components/LobbyScreen';
import './App.css';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

function App() {
  const [gameState, setGameState] = useState('lobby');
  const [roomId, setRoomId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [role, setRole] = useState(null);
  const socketRef = useRef(null);
  const [gameData, setGameData] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('game:playerJoined', (data) => {
      console.log('Player joined:', data);
    });

    socketRef.current.on('game:started', (state) => {
      console.log('Game started');
      setGameState('game');
      setGameData(state);
    });

    socketRef.current.on('game:stateUpdate', (state) => {
      setGameData(state);
    });

    socketRef.current.on('game:ended', (data) => {
      console.log('Game ended:', data.result);
      setResult(data.result);
      setGameState('ended');
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const handleJoined = (response, onFail) => {
    if (response.success) {
      setRoomId(response.roomId);
      setPlayerId(response.playerId);
      setRole(response.role);
      console.log('Joined room:', response.roomId);
    } else {
      alert(response.error);
      onFail?.();
    }
  };

  const createRoom = (playerName, selectedRole, onFail) => {
    socketRef.current.emit('game:createRoom', {
      playerName,
      role: selectedRole
    }, (response) => handleJoined(response, onFail));
  };

  const joinRoom = (roomId, playerName, selectedRole, onFail) => {
    socketRef.current.emit('game:joinRoom', {
      roomId,
      playerName,
      role: selectedRole
    }, (response) => handleJoined(response, onFail));
  };

  const handleGameAction = useCallback((action) => {
    if (!roomId || !playerId) return;
    const eventName = `player:${action.type}`;
    socketRef.current.emit(eventName, {
      roomId,
      playerId,
      ...action
    });
  }, [roomId, playerId]);

  const resetGame = () => {
    setGameState('lobby');
    setRoomId(null);
    setPlayerId(null);
    setRole(null);
    setGameData(null);
    setResult(null);
  };

  return (
    <div className="app">
      {gameState === 'lobby' && (
        <LobbyScreen
          roomId={roomId}
          role={role}
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
        />
      )}
      {gameState === 'game' && gameData && (
        <GameScreen
          gameData={gameData}
          playerId={playerId}
          role={role}
          onAction={handleGameAction}
        />
      )}
      {gameState === 'ended' && (
        <div className="end-screen">
          <h1>
            {result === 'victory' ? '🎉 VICTORY!'
              : result === 'disconnect' ? '💔 Partner disconnected'
              : '💀 DEFEAT'}
          </h1>
          <button className="btn btn-primary btn-large" onClick={resetGame}>Play Again</button>
        </div>
      )}
    </div>
  );
}

export default App;
