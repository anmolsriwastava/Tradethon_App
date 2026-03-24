import { useState } from 'react'

export default function PuzzleDisplay({ puzzle, timeLeft, round, totalRounds }) {
  const [showHint1, setShowHint1] = useState(false)
  const [showHint2, setShowHint2] = useState(false)

  if (!puzzle) return null

  const timeColor = timeLeft < 20 ? '#ff4444' : timeLeft < 60 ? '#ffaa00' : '#00ff88'

  return (
    <div style={{
      background: '#111',
      border: '1px solid #222',
      borderRadius: 8,
      padding: 20,
      fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ color: '#888', fontSize: 11 }}>
          ROUND {round} / {totalRounds}
        </span>
        <span style={{ color: timeColor, fontSize: 18, fontWeight: 'bold' }}>
          {timeLeft}s
        </span>
      </div>

      <h3 style={{ color: '#00ff88', marginBottom: 8 }}>{puzzle.title}</h3>
      <p style={{ color: '#ccc', lineHeight: 1.6, marginBottom: 16 }}>
        {puzzle.description}
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setShowHint1(!showHint1)}
          style={{
            background: 'transparent',
            border: '1px solid #333',
            color: '#888',
            padding: '6px 12px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'monospace'
          }}
        >
          {showHint1 ? 'HIDE HINT 1' : 'HINT 1'}
        </button>
        <button
          onClick={() => setShowHint2(!showHint2)}
          style={{
            background: 'transparent',
            border: '1px solid #333',
            color: '#888',
            padding: '6px 12px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'monospace'
          }}
        >
          {showHint2 ? 'HIDE HINT 2' : 'HINT 2'}
        </button>
      </div>

      {showHint1 && (
        <p style={{
          color: '#ffaa00',
          fontSize: 13,
          marginTop: 10,
          padding: '8px 12px',
          background: 'rgba(255,170,0,0.05)',
          borderRadius: 4,
          border: '1px solid rgba(255,170,0,0.2)'
        }}>
          💡 {puzzle.hint_1}
        </p>
      )}

      {showHint2 && (
        <p style={{
          color: '#4488ff',
          fontSize: 13,
          marginTop: 8,
          padding: '8px 12px',
          background: 'rgba(68,136,255,0.05)',
          borderRadius: 4,
          border: '1px solid rgba(68,136,255,0.2)'
        }}>
          🧮 {puzzle.hint_2}
        </p>
      )}
    </div>
  )
}