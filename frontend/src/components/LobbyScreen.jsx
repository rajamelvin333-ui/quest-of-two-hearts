import { useState } from 'react';

export default function LobbyScreen({ roomId, role, onCreateRoom, onJoinRoom }) {
  const [screen, setScreen] = useState('menu'); // menu, create, join
  const [playerName, setPlayerName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [selectedRole, setSelectedRole] = useState('warrior');

  const handleCreate = () => {
    onCreateRoom();
    setScreen('waiting');
  };

  const handleJoin = () => {
    if (!joinRoomId || !playerName) {
      alert('Enter room ID and your name');
      return;
    }
    onJoinRoom(joinRoomId, playerName, selectedRole);
    setScreen('waiting');
  };

  return (
    <div className="lobby-screen">
      <div className="lobby-container">
        <h1>⚔️ Quest of Two Hearts</h1>

        {screen === 'menu' && (
          <div className="menu">
            <p className="subtitle">A co-op adventure for 2 players</p>
            <button className="btn btn-large" onClick={() => setScreen('create')}>
              Create Game
            </button>
            <button className="btn btn-large" onClick={() => setScreen('join')}>
              Join Game
            </button>
          </div>
        )}

        {screen === 'create' && (
          <div className="form">
            <h2>Create Game</h2>
            <div>
              <label>Your name:</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label>Select role:</label>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="warrior">⚔️ Warrior (Tank)</option>
                <option value="mage">🔮 Mage (Healer)</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleCreate}>
              Create
            </button>
            <button className="btn btn-secondary" onClick={() => setScreen('menu')}>
              Back
            </button>
          </div>
        )}

        {screen === 'join' && (
          <div className="form">
            <h2>Join Game</h2>
            <div>
              <label>Room ID:</label>
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                placeholder="e.g., AB12CD"
              />
            </div>
            <div>
              <label>Your name:</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label>Select role:</label>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="warrior">⚔️ Warrior (Tank)</option>
                <option value="mage">🔮 Mage (Healer)</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleJoin}>
              Join
            </button>
            <button className="btn btn-secondary" onClick={() => setScreen('menu')}>
              Back
            </button>
          </div>
        )}

        {screen === 'waiting' && (
          <div className="waiting">
            <h2>Waiting for second player...</h2>
            {roomId && (
              <div className="room-info">
                <p>Room ID:</p>
                <div className="room-id">{roomId}</div>
                <p className="small">Share this code with your friend</p>
              </div>
            )}
            <div className="spinner"></div>
            <p>Your role: {selectedRole === 'warrior' ? '⚔️ Warrior' : '🔮 Mage'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
