import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  
      
      localStorage.setItem('playerName', email.split('@')[0])
      navigate('/lobby')
      
    async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isSignUp) {
      // Sign Up (With email confirmation off, this automatically logs them in!)
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { name: email.split('@')[0] }
        }
      })
      
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }
      
      localStorage.setItem('playerName', email.split('@')[0])
      navigate('/lobby')
      
    } else {
      // Sign In
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      
      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }
      
      localStorage.setItem('playerName', data.user.email.split('@')[0])
      navigate('/lobby')
    }
    
    setLoading(false)
  }

  async function handleGoogleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: 'https://quantdrill.onrender.com/lobby'
      }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  function handleGuestMode() {
    const guestName = `Guest_${Math.floor(Math.random() * 10000)}`
    localStorage.setItem('playerName', guestName)
    navigate('/lobby')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0c15',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: '#111827',
        borderRadius: '24px',
        padding: '40px',
        border: '1px solid #1f2937'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#3b82f6',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          Tradethon
        </h1>
        <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '32px' }}>
          {isSignUp ? 'Create an account' : 'Sign in to save your progress'}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              background: '#0f172a',
              border: '1px solid #1f2937',
              borderRadius: '10px',
              padding: '12px',
              color: '#f1f5f9',
              marginBottom: '16px',
              outline: 'none'
            }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%',
              background: '#0f172a',
              border: '1px solid #1f2937',
              borderRadius: '10px',
              padding: '12px',
              color: '#f1f5f9',
              marginBottom: '24px',
              outline: 'none'
            }}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            background: '#1f2937',
            color: '#e2e8f0',
            border: '1px solid #334155',
            borderRadius: '10px',
            padding: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          🚀 Sign in with Google
        </button>

        <button
          onClick={handleGuestMode}
          disabled={loading}
          style={{
            width: '100%',
            background: '#334155',
            color: '#e2e8f0',
            border: '1px solid #475569',
            borderRadius: '10px',
            padding: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          🎮 Continue as Guest
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              marginLeft: '6px',
              fontSize: '13px'
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}