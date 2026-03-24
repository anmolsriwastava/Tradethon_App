export default function OrderBook({ book }) {
  if (!book) return null

  return (
    <div style={{
      background: '#111',
      border: '1px solid #222',
      borderRadius: 8,
      padding: 16,
      fontFamily: 'monospace'
    }}>
      <p style={{ color: '#888', fontSize: 11, marginBottom: 12 }}>ORDER BOOK</p>

      {/* Asks - reversed so highest is on top */}
      {[...book.asks].reverse().map((ask, i) => (
        <div key={i} style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '4px 8px',
          marginBottom: 2,
          background: 'rgba(255,68,68,0.1)',
          borderLeft: '3px solid #ff4444',
          borderRadius: 3
        }}>
          <span style={{ color: '#ff4444' }}>{ask.price.toFixed(1)}</span>
          <span style={{ color: '#888' }}>{ask.qty}</span>
          <span style={{ color: '#555', fontSize: 10 }}>{ask.is_bot ? 'BOT' : 'YOU'}</span>
        </div>
      ))}

      {/* Spread indicator */}
      {book.bids.length > 0 && book.asks.length > 0 && (
        <div style={{
          textAlign: 'center',
          color: '#555',
          fontSize: 11,
          padding: '6px 0'
        }}>
          spread: {(book.asks[0].price - book.bids[0].price).toFixed(1)}
        </div>
      )}

      {/* Bids */}
      {book.bids.map((bid, i) => (
        <div key={i} style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '4px 8px',
          marginBottom: 2,
          background: 'rgba(0,255,136,0.1)',
          borderLeft: '3px solid #00ff88',
          borderRadius: 3
        }}>
          <span style={{ color: '#00ff88' }}>{bid.price.toFixed(1)}</span>
          <span style={{ color: '#888' }}>{bid.qty}</span>
          <span style={{ color: '#555', fontSize: 10 }}>{bid.is_bot ? 'BOT' : 'YOU'}</span>
        </div>
      ))}
    </div>
  )
}