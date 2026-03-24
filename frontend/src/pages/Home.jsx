import { useEffect, useState } from 'react'
import api from '../api/axios'
import MovieCard from '../components/MovieCard.jsx'
import MovieModal from '../components/MovieModal.jsx'
import Toast from '../components/Toast.jsx'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, Film, Search } from 'lucide-react'

export default function Home() {
    const [movies, setMovies] = useState([])
    const [allMovies, setAllMovies] = useState([])
    const [filters, setFilters] = useState({ genre: '', platform: '', status: '' })
    const [selectedMovie, setSelectedMovie] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [toast, setToast] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        api.get('/movies/').then(r => setAllMovies(r.data))
    }, [])

    const fetchMovies = async () => {
        const params = {}
        if (filters.genre) params.genre = filters.genre
        if (filters.platform) params.platform = filters.platform
        if (filters.status) params.status = filters.status
        const res = await api.get('/movies/', { params })
        setMovies(res.data)
    }

    const handleDelete = async () => {
        await api.delete(`/movies/${confirmDelete.id}`)
        setMovies(ms => ms.filter(m => m.id !== confirmDelete.id))
        setToast(`"${confirmDelete.title}" removed from collection`)
        setConfirmDelete(null)
    }

    useEffect(() => { fetchMovies() }, [filters])

    const genres = [...new Set(
        allMovies.flatMap(m => m.genre ? m.genre.split(',').map(g => g.trim()) : [])
    )].filter(Boolean).sort()

    const filteredMovies = movies.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const inputCls = "bg-[#0e1623] border border-white/10 text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-amber-400 transition-colors"

    return (
        <div className="min-h-screen">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-400/10 rounded-xl">
                            <Film className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl text-white font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                My Collection
                            </h1>
                            <p className="text-zinc-400 text-sm mt-1">
                                {filteredMovies.length} titles in your library
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/add')}
                        className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-medium rounded-lg flex items-center gap-2"
                    >
                        <Film className="w-4 h-4" />
                        Add Title
                    </button>
                </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <div className="bg-[#0e1623] rounded-xl border border-white/5 p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input 
                                    type="text"
                                    placeholder="Search titles..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#0a1020] border border-white/10 text-zinc-200 text-sm rounded-lg pl-10 pr-3 py-2.5 outline-none focus:border-amber-400 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-3">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <select className={`${inputCls} pl-10 appearance-none bg-[#0a1020]`} value={filters.genre} onChange={e => setFilters(f => ({ ...f, genre: e.target.value }))}>
                                    <option value="">All Genres</option>
                                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            
                            <select className={`${inputCls} bg-[#0a1020]`} value={filters.platform} onChange={e => setFilters(f => ({ ...f, platform: e.target.value }))}>
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
                            
                            <select className={`${inputCls} bg-[#0a1020]`} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                                <option value="">All Status</option>
                                <option value="wishlist">Wishlist</option>
                                <option value="watching">Watching</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Movie Grid */}
            <AnimatePresence mode="wait">
                {filteredMovies.length === 0 ? (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center justify-center py-32 gap-6 text-zinc-600"
                    >
                        <div className="p-6 bg-[#0e1623] rounded-full border border-white/5">
                            <Film className="w-12 h-12" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-medium text-white mb-2">Nothing here yet</h3>
                            <p className="text-zinc-400 mb-4">Start building your movie collection</p>
                            <button 
                                onClick={() => navigate('/add')} 
                                className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 transition-colors"
                            >
                                Add your first title
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                    >
                        {filteredMovies.map((m, index) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <MovieCard 
                                    movie={m}
                                    onDelete={id => setMovies(ms => ms.filter(m => m.id !== id))}
                                    onEdit={m => navigate('/add', { state: { movie: m } })}
                                    onOpenModal={m => setSelectedMovie(m)}
                                    onDeleteConfirm={m => setConfirmDelete(m)}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            {selectedMovie && (
                <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
            )}

            <AnimatePresence>
                {confirmDelete && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="relative z-10 bg-[#0e1623] rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                    <Film className="w-5 h-5 text-red-400" />
                                </div>
                                <h3 className="text-xl text-white font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                    Remove Title?
                                </h3>
                            </div>
                            <p className="text-zinc-400 text-sm mb-6">
                                Are you sure you want to remove <span className="text-white font-medium">"{confirmDelete.title}"</span> from your collection?
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors"
                                >
                                    Yes, Remove
                                </button>
                            </div>
                        </motion.div>
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
                    </motion.div>
                )}
            </AnimatePresence>

            {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </div>
    )
}
