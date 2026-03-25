import { useState } from 'react'
import axios from 'axios'

const API = 'https://tradethon-backend.onrender.com'

export default function TradePanel({ roomId, playerId, onTrade }) {
  const [side, setSide] = useState('buy')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function placeOrder() {
    if (!price) return setMessage('Enter a price')
    setLoading(true)
    setMessage('')
    try {
      const res = await axios.post(`${API}/room/${roomId}/order`, {
        player_id: playerId,
        side,
        price: parseFloat(price),
        quantity: parseInt(quantity)
      })
      if (res.data.error) {
        setMessage(res.data.error)
      } else {
        const matched = res.data.trades > 0
        setMessage(matched
            ? `Matched ${res.datadone.trades} trade(s)!`
            : 'Order added to book')
if (onTrade) onTrade(res.data.book, matched)
      }
    } catch (e) {
      setMessage('Order failed')
    }
    setLoading(false)
  }

  return (
    <div style={{
      background: '#111',
      border: '1px solid #222',
      borderRadius: 8,
      padding: 16,
      fontFamily: 'monospace'
    }}>
      <p style={{ color: '#888', fontSize: 11, marginBottom: 12 }}>PLACE ORDER</p>

      {/* Buy/Sell toggle */}
      <div style={{ display: 'flex', marginBottom: 12, borderRadius: 6, overflow: 'hidden' }}>
        <button
          onClick={() => setSide('buy')}
          style={{
            flex: 1,
            padding: '10px',
            background: side === 'buy' ? '#00ff88' : '#1a1a2e',
            color: side === 'buy' ? '#0a0a0f' : '#888',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 13,
            fontFamily: 'monospace'
          }}
        >
          BUY
        </button>
        <button
          onClick={() => setSide('sell')}
          style={{
            flex: 1,
            padding: '10px',
            background: side === 'sell' ? '#ff4444' : '#1a1a2e',
            color: side === 'sell' ? '#fff' : '#888',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 13,
            fontFamily: 'monospace'
          }}
        >
          SELL
        </button>
      </div>

      <label style={{ fontSize: 11, color: '#888' }}>PRICE</label>
      <input
        type="number"
        placeholder="0.0"
        value={price}
        onChange={e => setPrice(e.target.value)}
        style={inputStyle}
      />

      <label style={{ fontSize: 11, color: '#888' }}>QUANTITY</label>
      <input
        type="number"
        value={quantity}
        min={1}
        onChange={e => setQuantity(e.target.value)}
        style={inputStyle}
      />

      <button
        onClick={placeOrder}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          background: side === 'buy' ? '#00ff88' : '#ff4444',
          color: side === 'buy' ? '#0a0a0f' : '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: 14,
          fontFamily: 'monospace'
        }}
      >
        {loading ? 'PLACING...' : `${side.toUpperCase()} @ ${price || '?'}`}
      </button>

      {message && (
        <p style={{
          marginTop: 10,
          fontSize: 12,
          color: message.includes('trade') ? '#00ff88' : '#ffaa00'
        }}>
          {message}
        </p>
      )}
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