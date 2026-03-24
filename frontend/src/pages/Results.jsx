import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Leaderboard from '../components/Leaderboard'

const API = 'http://127.0.0.1:8000'

export default function Results() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await axios.get(`${API}/room/${roomId}/leaderboard`)
        setLeaderboard(res.data.leaderboard)
      } catch (e) {}
    }
    fetchLeaderboard()
  }, [roomId])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e0e0e0',
      fontFamily: 'monospace',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ width: 420 }}>
        <h1 style={{ color: '#00ff88', textAlign: 'center', marginBottom: 8 }}>
          FINAL RESULTS
        </h1>
        <p style={{ color: '#888', textAlign: 'center', marginBottom: 32 }}>
          ROOM: {roomId}
        </p>

        <Leaderboard leaderboard={leaderboard} />

        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%',
            marginTop: 24,
            background: '#00ff88',
            color: '#0a0a0f',
            border: 'none',
            borderRadius: 8,
            padding: '14px',
            fontSize: 14,
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'monospace'
          }}
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  )
}