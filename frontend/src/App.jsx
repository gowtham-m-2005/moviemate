import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import AddMovie from './pages/AddMovie'
import Stats from './pages/Stats'

export default function App() {
  return (
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br overflow-hidden from-[#080c14] via-[#0a1118] to-[#0d1117]">
          <Navbar />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/add" element={<AddMovie />} />
              <Route path="/stats" element={<Stats />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
  )
}