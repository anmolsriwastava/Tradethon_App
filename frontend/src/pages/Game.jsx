import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import OrderBook from '../components/OrderBook'
import TradePanel from '../components/TradePanel'
import Leaderboard from '../components/Leaderboard'
import PuzzleDisplay from '../components/PuzzleDisplay'

const API = 'http://127.0.0.1:8000'

export default function Game() {
  const { roomId, playerId } = useParams()
  const navigate = useNavigate()
  const wsRef = useRef(null)

  const [gameState, setGameState] = useState('waiting')
  const [puzzle, setPuzzle] = useState(null)
  const [book, setBook] = useState({ bids: [], asks: [] })
  const [leaderboard, setLeaderboard] = useState([])
  const [round, setRound] = useState(0)
  const [totalRounds, setTotalRounds] = useState(5)
  const [timeLeft, setTimeLeft] = useState(0)
  const [roundResult, setRoundResult] = useState(null)
  const [messages, setMessages] = useState([])
  const [gameStarted, setGameStarted] = useState(false)
  const [myPnl, setMyPnl] = useState(0)
  const [myTrades, setMyTrades] = useState(0)

  useEffect(() => {

    const wsUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace('https://', 'wss://').replace('http://', 'ws://')
        : 'ws://127.0.0.1:8000'
    const ws = new WebSocket(`${wsUrl}/ws/${roomId}/${playerId}`)
                   
    wsRef.current = ws
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      handleEvent(data)
    }
    const pollInterval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/room/${roomId}/book`)
        setBook(res.data)
      } catch (e) {}
    }, 3000)
    return () => {
      ws.close()
      clearInterval(pollInterval)
    }
  }, [roomId, playerId])

  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft])

  function handleEvent(data) {
    addMessage(data.event)
    if (data.event === 'game_started') {
      setGameState('active')
      setTotalRounds(data.total_rounds)
    }
    if (data.event === 'round_start') {
      setRound(data.round)
      setPuzzle(data.puzzle)
      setTimeLeft(data.duration)
      setRoundResult(null)
      setBook({ bids: [], asks: [] })
    }
    if (data.event === 'order_book_update') {
      setBook(data.book)
      if (data.time_left !== undefined) setTimeLeft(data.time_left)
    }
    if (data.event === 'round_end') {
      setRoundResult(data)
      setLeaderboard(data.leaderboard)
      setTimeLeft(0)
      const myRoundPnl = data.round_pnl[playerId] || 0
      setMyPnl(prev => prev + myRoundPnl)
    }
    if (data.event === 'game_over') {
      setLeaderboard(data.final_leaderboard)
      setGameState('finished')
      setTimeout(() => navigate(`/results/${roomId}`), 3000)
    }
  }

  function addMessage(msg) {
    setMessages(prev => [...prev.slice(-4), msg])
  }

  async function startGame() {
    try {
      await axios.post(`${API}/room/${roomId}/start`)
      setGameStarted(true)
    } catch (e) {}
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e0e0e0',
      fontFamily: 'monospace',
      padding: 20
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottom: '1px solid #222',
        paddingBottom: 12
      }}>
        <h2 style={{ color: '#00ff88', margin: 0 }}>TRADETHON</h2>
        <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#888' }}>
          <span>ROOM: <span style={{ color: '#fff' }}>{roomId}</span></span>
          <span>ID: <span style={{ color: '#fff' }}>{playerId}</span></span>
          <span>PnL: <span style={{ color: myPnl >= 0 ? '#00ff88' : '#ff4444', fontWeight: 'bold' }}>{myPnl >= 0 ? '+' : ''}{myPnl.toFixed(2)}</span></span>
          <span>TRADES: <span style={{ color: '#fff' }}>{myTrades}</span></span>
          <span style={{ color: gameState === 'active' ? '#00ff88' : '#ffaa00' }}>
            ● {gameState.toUpperCase()}
          </span>
        </div>
      </div>

      {gameState === 'waiting' && (
        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <p style={{ color: '#888', marginBottom: 24 }}>
            Share room code <span style={{ color: '#00ff88' }}>{roomId}</span> with friends
          </p>
          {!gameStarted && (
            <button
              onClick={startGame}
              style={{
                background: '#00ff88',
                color: '#0a0a0f',
                border: 'none',
                borderRadius: 8,
                padding: '14px 40px',
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}
            >
              START GAME
            </button>
          )}
          {gameStarted && (
            <p style={{ color: '#ffaa00' }}>Starting...</p>
          )}
        </div>
      )}

      {gameState === 'active' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 16
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PuzzleDisplay
              puzzle={puzzle}
              timeLeft={timeLeft}
              round={round}
              totalRounds={totalRounds}
            />
            {roundResult && (
              <div style={{
                background: '#111',
                border: '1px solid #333',
                borderRadius: 8,
                padding: 16
              }}>
                <p style={{ color: '#ffaa00', marginBottom: 8 }}>ROUND RESULT</p>
                <p style={{ color: '#fff', fontSize: 18 }}>
                  True Value: <span style={{ color: '#00ff88' }}>{roundResult.true_value}</span>
                </p>
                <p style={{ color: '#888', fontSize: 12, marginTop: 8 }}>
                  {roundResult.hint_2}
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <OrderBook book={book} />
            <div style={{
              background: '#111',
              border: '1px solid #222',
              borderRadius: 8,
              padding: 12
            }}>
              <p style={{ color: '#888', fontSize: 11, marginBottom: 8 }}>EVENTS</p>
              {messages.map((m, i) => (
                <p key={i} style={{ color: '#555', fontSize: 11, margin: '2px 0' }}>
                  › {m}
                </p>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TradePanel
              roomId={roomId}
              playerId={playerId}
              onTrade={(book, traded) => {
                setBook(book)
                if (traded) setMyTrades(prev => prev + 1)
              }}
            />
            <Leaderboard leaderboard={leaderboard} />
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <h2 style={{ color: '#00ff88' }}>GAME OVER</h2>
          <p style={{ color: '#888' }}>Redirecting to results...</p>
          <Leaderboard leaderboard={leaderboard} />
        </div>
      )}
    </div>
  )
}