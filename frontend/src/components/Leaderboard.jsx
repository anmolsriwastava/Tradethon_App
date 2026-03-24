export default function Leaderboard({ leaderboard }) {
  if (!leaderboard || leaderboard.length === 0) return null

  return (
    <div style={{
      background: '#111',
      border: '1px solid #222',
      borderRadius: 8,
      padding: 16,
      fontFamily: 'monospace'
    }}>
      <p style={{ color: '#888', fontSize: 11, marginBottom: 12 }}>LEADERBOARD</p>

      {leaderboard.map((player, i) => (
        <div key={i} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 10px',
          marginBottom: 6,
          background: i === 0 ? 'rgba(0,255,136,0.08)' : '#0d0d1a',
          borderRadius: 6,
          border: i === 0 ? '1px solid rgba(0,255,136,0.2)' : '1px solid #1a1a2e'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              color: i === 0 ? '#ffd700' : i === 1 ? '#aaa' : i === 2 ? '#cd7f32' : '#555',
              fontSize: 14,
              width: 20
            }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
            </span>
            <span style={{ color: '#e0e0e0', fontSize: 13 }}>{player.name}</span>
          </div>
          <span style={{
            color: player.total_pnl >= 0 ? '#00ff88' : '#ff4444',
            fontSize: 13,
            fontWeight: 'bold'
          }}>
            {player.total_pnl >= 0 ? '+' : ''}{player.total_pnl.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  )
}