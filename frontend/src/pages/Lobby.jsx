import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { supabase } from '../lib/supabase'

const API = 'https://tradethon-backend.onrender.com'

export default function Lobby() {
  const navigate = useNavigate()
  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [numBots, setNumBots] = useState(10)
  const [duration, setDuration] = useState(120)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // CHECK IF USER IS LOGGED IN
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/')
      } else {
        // Auto-fill name from email
        setPlayerName(user.email.split('@')[0])
      }
    }
    checkUser()
  }, [navigate])

  async function createAndJoin() {
    if (!playerName.trim()) return setError('Enter your name')
    setLoading(true)
    setError('')
    try {
      const room = await axios.post(`${API}/room/create`, {
        num_bots: numBots,
        round_duration: duration
      })
      const newRoomId = room.data.room_id
      
      const player = await axios.post(`${API}/room/${newRoomId}/join`, {
        player_name: playerName
      })
      navigate(`/game/${newRoomId}/${player.data.player_id}`)
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
      background: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: '#1e293b',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          color: '#3b82f6',
          marginBottom: '8px'
        }}>
          Tradethon
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '14px' }}>
          Quantitative Trading Simulation
        </p>

        {/* Name display (read-only, from login) */}
        <div style={{
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: '#f1f5f9',
          fontSize: '14px'
        }}>
          Playing as: <strong>{playerName || 'Loading...'}</strong>
        </div>

        {/* Create Room Section */}
        <div style={{
          background: '#0f172a',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#3b82f6', fontWeight: '600', fontSize: '13px', marginBottom: '16px' }}>
            CREATE NEW ROOM
          </p>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>BOTS</label>
              <input
                type="number"
                value={numBots}
                onChange={e => setNumBots(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '10px',
                  color: '#f1f5f9'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>SECONDS / ROUND</label>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '10px',
                  color: '#f1f5f9'
                }}
              />
            </div>
          </div>
          <button
            onClick={createAndJoin}
            disabled={loading}
            style={{
              width: '100%',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {loading ? 'CREATING...' : 'CREATE & JOIN'}
          </button>
        </div>

        {/* Join Room Section */}
        <div style={{
          background: '#0f172a',
          borderRadius: '16px',
          padding: '20px'
        }}>
          <p style={{ color: '#60a5fa', fontWeight: '600', fontSize: '13px', marginBottom: '16px' }}>
            JOIN EXISTING ROOM
          </p>
          <input
            placeholder="Room ID (e.g. 5C8D184D)"
            value={roomId}
            onChange={e => setRoomId(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '12px',
              color: '#f1f5f9',
              marginBottom: '16px',
              outline: 'none'
            }}
          />
          <button
            onClick={joinRoom}
            disabled={loading}
            style={{
              width: '100%',
              background: '#334155',
              color: '#e2e8f0',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {loading ? 'JOINING...' : 'JOIN ROOM'}
          </button>
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', marginTop: '16px' }}>{error}</p>
        )}
      </div>
    </div>
  )
}