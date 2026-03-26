import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import Results from './pages/Results'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game/:roomId/:playerId" element={<Game />} />
        <Route path="/results/:roomId" element={<Results />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App