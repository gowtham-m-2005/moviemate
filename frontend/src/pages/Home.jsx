import { useEffect, useState } from 'react'
import api from '../api/axios'
import MovieCard from '../components/MovieCard'
import { useNavigate } from 'react-router-dom'

export default function Home() {
    const [movies, setMovies] = useState([])
    const [allMovies, setAllMovies] = useState([]) // unfiltered, for genre list
    const [filters, setFilters] = useState({ genre: '', platform: '', status: '' })
    const navigate = useNavigate()

    // fetch all movies once for genre extraction
    useEffect(() => {
        api.get('/movies/').then(r => setAllMovies(r.data))
    }, [])

    // fetch filtered movies
    const fetchMovies = async () => {
        const params = {}
        if (filters.genre) params.genre = filters.genre
        if (filters.platform) params.platform = filters.platform
        if (filters.status) params.status = filters.status
        const res = await api.get('/movies/', { params })
        setMovies(res.data)
    }

    useEffect(() => { fetchMovies() }, [filters])

    // extract unique genres from all movies
    const genres = [...new Set(
        allMovies.flatMap(m => m.genre ? m.genre.split(',').map(g => g.trim()) : [])
    )].filter(Boolean).sort()

    const inputCls = "bg-[#0e1623] border border-white/10 text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-600"

    return (
        <div className="min-h-screen bg-[#080c14] px-8 py-8">
            <div className="flex flex-wrap items-center gap-3 mb-8">
                <h2 className="text-3xl text-white mr-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>My Collection</h2>

                {/* Dynamic genre dropdown */}
                <select className={inputCls} value={filters.genre} onChange={e => setFilters(f => ({ ...f, genre: e.target.value }))}>
                    <option value="">All Genres</option>
                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>

                {/* Platform dropdown */}
                <select className={inputCls} value={filters.platform} onChange={e => setFilters(f => ({ ...f, platform: e.target.value }))}>
                    <option value="">All Platforms</option>
                    <option value="Netflix">Netflix</option>
                    <option value="Prime Video">Prime Video</option>
                    <option value="Disney+">Disney+</option>
                    <option value="Hotstar">Hotstar</option>
                    <option value="Apple TV+">Apple TV+</option>
                    <option value="HBO Max">HBO Max</option>
                    <option value="Hulu">Hulu</option>
                    <option value="Peacock">Peacock</option>
                    <option value="Paramount+">Paramount+</option>
                    <option value="Zee5">Zee5</option>
                    <option value="SonyLIV">SonyLIV</option>
                    <option value="JioCinema">JioCinema</option>
                    <option value="MX Player">MX Player</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Mubi">Mubi</option>
                    <option value="Theatre">Theatre</option>
                    <option value="Other">Other</option>
                </select>

                {/* Status dropdown */}
                <select className={inputCls} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                    <option value="">All Status</option>
                    <option value="wishlist">Wishlist</option>
                    <option value="watching">Watching</option>
                    <option value="completed">Completed</option>
                </select>

                <span className="ml-auto text-zinc-500 text-sm">{movies.length} titles</span>
            </div>

            {movies.length === 0
                ? <div className="flex flex-col items-center justify-center mt-32 gap-4 text-zinc-600">
                    <span className="text-6xl">🎬</span>
                    <p className="text-lg">Nothing here yet.</p>
                    <button onClick={() => navigate('/add')} className="text-amber-400 hover:text-amber-300 text-sm underline underline-offset-4 cursor-pointer">
                        Add your first title
                    </button>
                </div>
                : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {movies.map(m => (
                        <MovieCard key={m.id} movie={m}
                                   onDelete={id => setMovies(ms => ms.filter(m => m.id !== id))}
                                   onEdit={m => navigate('/add', { state: { movie: m } })}
                        />
                    ))}
                </div>
            }
        </div>
    )
}