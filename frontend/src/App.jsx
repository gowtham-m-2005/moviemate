import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import AddMovie from './pages/AddMovie'
import Stats from './pages/Stats'

export default function App() {
  return (
      <BrowserRouter>
        <Navbar />
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddMovie />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </div>
      </BrowserRouter>
  )
}