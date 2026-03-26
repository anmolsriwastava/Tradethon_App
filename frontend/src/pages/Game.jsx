import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import OrderBook from '../components/OrderBook'
import TradePanel from '../components/TradePanel'
import Leaderboard from '../components/Leaderboard'
import PuzzleDisplay from '../components/PuzzleDisplay'

const API = 'https://tradethon-backend.onrender.com'

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
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    const ws = new WebSocket(`wss://tradethon-backend.onrender.com/ws/${roomId}/${playerId}`)
    wsRef.current = ws
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      handleEvent(data)
    }
    ws.onerror = (e) => console.log('WebSocket error:', e)
    
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
    } catch (e) {
      console.log('Start error:', e)
    }
  }

  function copyRoomLink() {
    const link = `${window.location.origin}/game/${roomId}`
    navigator.clipboard.writeText(link)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0c15',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #1f2937'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0
        }}>
          TRADETHON
        </h1>
        <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#94a3b8' }}>
          <span>ROOM: <span style={{ color: '#f1f5f9', fontWeight: '500' }}>{roomId}</span></span>
          <span>ID: <span style={{ color: '#f1f5f9', fontWeight: '500' }}>{playerId}</span></span>
          <span>PnL: <span style={{ color: myPnl >= 0 ? '#10b981' : '#ef4444', fontWeight: '700' }}>
            {myPnl >= 0 ? '+' : ''}{myPnl.toFixed(2)}
          </span></span>
          <span>TRADES: <span style={{ color: '#f1f5f9', fontWeight: '500' }}>{myTrades}</span></span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: gameState === 'active' ? '#10b981' : '#f59e0b'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></span>
            {gameState.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Waiting Screen */}
      {gameState === 'waiting' && (
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <div style={{
            background: '#111827',
            borderRadius: '16px',
            border: '1px solid #1f2937',
            maxWidth: '500px',
            margin: '0 auto',
            padding: '40px'
          }}>
            <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
              Share this link with friends to join:
            </p>
            
            <div style={{
              background: '#0f172a',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '24px',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: '14px',
              color: '#3b82f6'
            }}>
              {`${window.location.origin}/game/${roomId}`}
            </div>
            
            <button
              onClick={copyRoomLink}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '24px'
              }}
            >
              📋 COPY LINK
            </button>
            
            {copySuccess && (
              <p style={{ color: '#10b981', fontSize: '13px', marginBottom: '24px' }}>
                ✓ Link copied to clipboard!
              </p>
            )}
            
            <div style={{
              borderTop: '1px solid #1f2937',
              paddingTop: '24px',
              marginTop: '8px'
            }}>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
                Room Code: <span style={{ color: '#f1f5f9', fontFamily: 'monospace' }}>{roomId}</span>
              </p>
              
              {!gameStarted && (
                <button
                  onClick={startGame}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 32px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  START GAME
                </button>
              )}
              {gameStarted && (
                <p style={{ color: '#f59e0b' }}>Starting game...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Game */}
      {gameState === 'active' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <PuzzleDisplay
              puzzle={puzzle}
              timeLeft={timeLeft}
              round={round}
              totalRounds={totalRounds}
            />
            {roundResult && (
              <div style={{
                background: '#111827',
                borderRadius: '16px',
                border: '1px solid #1f2937',
                padding: '20px'
              }}>
                <p style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '600', marginBottom: '12px' }}>
                  ROUND RESULT
                </p>
                <p style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                  True Value: <span style={{ color: '#10b981' }}>{roundResult.true_value}</span>
                </p>
                <p style={{ color: '#64748b', fontSize: '12px' }}>
                  {roundResult.hint_2}
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <OrderBook book={book} />
            <div style={{
              background: '#111827',
              borderRadius: '16px',
              border: '1px solid #1f2937',
              padding: '16px'
            }}>
              <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', marginBottom: '12px' }}>
                EVENTS
              </p>
              {messages.map((m, i) => (
                <p key={i} style={{ color: '#475569', fontSize: '11px', margin: '4px 0', fontFamily: 'monospace' }}>
                  › {m}
                </p>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

      {/* Game Finished */}
      {gameState === 'finished' && (
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <div style={{
            background: '#111827',
            borderRadius: '16px',
            border: '1px solid #1f2937',
            maxWidth: '400px',
            margin: '0 auto',
            padding: '40px'
          }}>
            <h2 style={{ color: '#10b981', marginBottom: '16px' }}>GAME OVER</h2>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Redirecting to results...</p>
            <Leaderboard leaderboard={leaderboard} />
          </div>
        </div>
      )}
    </div>
  )
}