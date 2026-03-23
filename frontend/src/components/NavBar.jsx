import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
    const { pathname } = useLocation()
    const link = (to, label) => (
        <Link to={to} className={`text-sm tracking-widest uppercase transition-colors ${pathname === to ? 'text-amber-400' : 'text-zinc-400 hover:text-white'}`}>
            {label}
        </Link>
    )
    return (
        <nav className="border-b border-white/5 px-8 py-4 flex items-center gap-10 sticky top-0 z-50 backdrop-blur-md bg-black/60">
            <span className="text-2xl text-amber-400 tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>🎬 MovieMate</span>
            <div className="flex gap-8">
                {link('/', 'My List')}
                {link('/add', '+ Add')}
                {link('/stats', 'Stats')}
            </div>
        </nav>
    )
}