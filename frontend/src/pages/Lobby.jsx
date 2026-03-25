import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function Lobby() {
  const navigate = useNavigate()
  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [numBots, setNumBots] = useState(10)
  const [duration, setDuration] = useState(120)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function createAndJoin() {
    if (!playerName.trim()) return setError('Enter your name')
    setLoading(true)
    setError('')
    try {
      const room = await axios.post(`${API}/room/create`, {
        num_bots: numBots,
        round_duration: duration
      })
      const roomId = room.data.room_id
      const player = await axios.post(`${API}/room/${roomId}/join`, {
        player_name: playerName
      })
      navigate(`/game/${roomId}/${player.data.player_id}`)
    } catch (e) {
      setError('Failed to create room')
    }
    setLoading(false)
  }

  async function joinRoom() {
    if (!playerName.trim()) return setError('Enter your name')
    if (!roomId.trim()) return setError('Enter room ID')
    setLoading(true)
    setError('')
    try {
      const player = await axios.post(`${API}/room/${roomId}/join`, {
        player_name: playerName
      })
      navigate(`/game/${roomId}/${player.data.player_id}`)
    } catch (e) {
      setError('Failed to join room')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e0e0e0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace'
    }}>
      <div style={{ width: 420, padding: 40 }}>

        <h1 style={{ color: '#00ff88', fontSize: 32, marginBottom: 4 }}>
          TRADETHON
        </h1>
        <p style={{ color: '#888', marginBottom: 40 }}>
          Quantitative Trading Simulation
        </p>

        <input
          placeholder="Your Name"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          style={inputStyle}
        />

        <div style={{
          background: '#111',
          border: '1px solid #222',
          borderRadius: 8,
          padding: 20,
          marginBottom: 16
        }}>
          <p style={{ color: '#00ff88', marginBottom: 12, fontSize: 13 }}>
            CREATE NEW ROOM
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: '#888' }}>BOTS</label>
              <input
                type="number"
                value={numBots}
                onChange={e => setNumBots(Number(e.target.value))}
                style={{ ...inputStyle, marginBottom: 0 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: '#888' }}>SECONDS/ROUND</label>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                style={{ ...inputStyle, marginBottom: 0 }}
              />
            </div>
          </div>
          <button
            onClick={createAndJoin}
            disabled={loading}
            style={btnStyle('#00ff88', '#0a0a0f')}
          >
            {loading ? 'CREATING...' : 'CREATE & JOIN'}
          </button>
        </div>

        <div style={{
          background: '#111',
          border: '1px solid #222',
          borderRadius: 8,
          padding: 20,
          marginBottom: 16
        }}>
          <p style={{ color: '#4488ff', marginBottom: 12, fontSize: 13 }}>
            JOIN EXISTING ROOM
          </p>
          <input
            placeholder="Room ID (e.g. 5C8D184D)"
            value={roomId}
            onChange={e => setRoomId(e.target.value.toUpperCase())}
            style={inputStyle}
          />
          <button
            onClick={joinRoom}
            disabled={loading}
            style={btnStyle('#4488ff', '#0a0a0f')}
          >
            {loading ? 'JOINING...' : 'JOIN ROOM'}
          </button>
        </div>

        {error && (
          <p style={{ color: '#ff4444', fontSize: 13 }}>{error}</p>
        )}

      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  background: '#1a1a2e',
  border: '1px solid #333',
  borderRadius: 6,
  padding: '10px 12px',
  color: '#e0e0e0',
  fontSize: 14,
  marginBottom: 12,
  boxSizing: 'border-box',
  fontFamily: 'monospace'
}

const btnStyle = (bg, color) => ({
  width: '100%',
  background: bg,
  color: color,
  border: 'none',
  borderRadius: 6,
  padding: '12px',
  fontSize: 14,
  fontWeight: 'bold',
  cursor: 'pointer',
  fontFamily: 'monospace'
})