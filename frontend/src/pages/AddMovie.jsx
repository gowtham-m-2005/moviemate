import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useNavigate, useLocation } from 'react-router-dom'

export default function AddMovie() {
    const navigate = useNavigate()
    const { state } = useLocation()
    const editing = state?.movie

    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [selectedSeason, setSelectedSeason] = useState(null)
    const [tmdbFilled, setTmdbFilled] = useState(false)
    const [seasons, setSeasons] = useState([])
    const [seasonProgress, setSeasonProgress] = useState({}) // { "1": { watched: 5, total: 10 } }
    const [error, setError] = useState('')
    const [generatingReview, setGeneratingReview] = useState(false)

    const [form, setForm] = useState({
        title: '', director: '', genre: '', platform: '',
        content_type: 'movie', status: 'wishlist',
        episodes_watched: 0, total_episodes: 0,
        seasons_data: '{}', rating: 0, review: '',
        poster_url: '', tmdb_id: '', watch_minutes: 0
    })

    useEffect(() => {
        if (editing) {
            setForm(editing)
            setTmdbFilled(true)
            setSelectedSeason(null)
            try {
                const parsed = JSON.parse(editing.seasons_data || '{}')
                setSeasonProgress(parsed)
            } catch { setSeasonProgress({}) }
            if (editing.content_type === 'tv' && editing.tmdb_id) {
                api.get(`/tmdb/detail?tmdb_id=${editing.tmdb_id}&type=tv`).then(r => {
                    const s = r.data.seasons || []
                    setSeasons(s)
                    if (s.length > 0) setSelectedSeason(s[0]) // ← auto-select Season 1
                })
            }
        }
    }, [])

    // keep episodes_watched + total_episodes + seasons_data in sync
    useEffect(() => {
        if (seasons.length === 0) return
        const totalWatched = Object.values(seasonProgress).reduce((a, s) => a + (s.watched || 0), 0)
        const totalEps = Object.values(seasonProgress).reduce((a, s) => a + (s.total || 0), 0)
        setForm(f => ({
            ...f,
            episodes_watched: totalWatched,
            total_episodes: totalEps || f.total_episodes,
            seasons_data: JSON.stringify(seasonProgress)
        }))
    }, [seasonProgress])

    const searchTMDB = async () => {
        if (!query.trim()) return
        const res = await api.get(`/tmdb/search?query=${query}&type=${form.content_type}`)
        setResults(res.data)
    }

    const fillFromTMDB = async (item) => {
        setForm(f => ({ ...f, title: item.title, poster_url: item.poster_url, tmdb_id: item.tmdb_id }))
        setTmdbFilled(true)
        setResults([])
        setQuery('')
        setSeasonProgress({})
        const res = await api.get(`/tmdb/detail?tmdb_id=${item.tmdb_id}&type=${form.content_type}`)
        const d = res.data
        setSeasons(d.seasons || [])
        setForm(f => ({
            ...f,
            poster_url: d.poster_url || f.poster_url,
            genre: d.genre,
            director: d.director,
            total_episodes: d.total_episodes || 0,
            watch_minutes: d.runtime || 0,
            episodes_watched: 0,
            seasons_data: '{}'
        }))
    }

    const updateSeasonProgress = (seasonNum, totalEps, watched) => {
        setSeasonProgress(prev => ({
            ...prev,
            [seasonNum]: { watched, total: totalEps }
        }))
    }

    const generateReview = async () => {
        if (!editing?.id) return
        setGeneratingReview(true)
        try {
            const res = await api.post(`/movies/ai/review/${editing.id}`, { review: form.review.trim() })
            setForm(f => ({ ...f, review: res.data.review }))
        } catch (e) {
            setError(e.response?.data?.detail || 'Add some notes first, then generate!')
        }
        setGeneratingReview(false)
    }

    const handleSubmit = async () => {
        setError('')
        if (!form.title) return setError('Please select a title from TMDB first')
        try {
            if (editing) await api.put(`/movies/${editing.id}`, form)
            else await api.post('/movies/', form)
            navigate('/')
        } catch (e) {
            if (e.response?.status === 409) setError('This title is already in your collection!')
            else setError('Something went wrong. Try again.')
        }
    }

    const inp = "w-full bg-[#0e1623] border border-white/10 text-zinc-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-600"
    const label = "text-xs text-zinc-500 uppercase tracking-wider mb-1 block"

    return (
        <div className="min-h-screen bg-[#080c14] px-8 py-8">
            <div className="max-w-xl mx-auto">
                <h2 className="text-3xl text-white mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    {editing ? 'Edit Title' : 'Add New Title'}
                </h2>

                {/* TMDB Search */}
                {!editing && (
                    <div className="mb-6 p-4 bg-[#0e1623] rounded-xl border border-white/5">
                        <p className={label}>Search TMDB to autofill</p>
                        <div className="flex gap-2">
                            <input className={inp} placeholder="Search movies or shows..."
                                   value={query} onChange={e => setQuery(e.target.value)}
                                   onKeyDown={e => e.key === 'Enter' && searchTMDB()} />
                            <select className={`${inp} w-28`} value={form.content_type}
                                    onChange={e => { setForm(f => ({ ...f, content_type: e.target.value })); setSeasons([]); setSeasonProgress({}) }}>
                                <option value="movie">Movie</option>
                                <option value="tv">TV</option>
                            </select>
                            <button onClick={searchTMDB}
                                    className="bg-amber-400 hover:bg-amber-300 text-black text-sm font-medium px-4 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                                Search
                            </button>
                        </div>
                        {results.length > 0 && (
                            <div className="mt-3 flex flex-col gap-1 max-h-64 overflow-y-auto">
                                {results.map(r => (
                                    <div key={r.tmdb_id} onClick={() => fillFromTMDB(r)}
                                         className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                                        {r.poster_url
                                            ? <img src={r.poster_url} className="w-8 h-12 object-cover rounded flex-shrink-0" alt="" />
                                            : <div className="w-8 h-12 bg-zinc-800 rounded flex-shrink-0" />
                                        }
                                        <div>
                                            <p className="text-sm text-zinc-200">{r.title}</p>
                                            <p className="text-xs text-zinc-500">{r.genre}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Autofilled preview */}
                {tmdbFilled && (
                    <div className="mb-6 flex gap-4 p-4 bg-[#0e1623] rounded-xl border border-amber-400/20">
                        {form.poster_url && <img src={form.poster_url} className="w-16 rounded-lg object-cover flex-shrink-0" alt="" />}
                        <div className="flex flex-col gap-1">
                            <p className="text-white font-medium">{form.title}</p>
                            {form.director && <p className="text-xs text-zinc-400">🎬 {form.director}</p>}
                            {form.genre && <p className="text-xs text-zinc-400">🎭 {form.genre}</p>}
                            {form.total_episodes > 0 && <p className="text-xs text-zinc-400">📺 {form.total_episodes} episodes total</p>}
                            {!editing && (
                                <button onClick={() => { setTmdbFilled(false); setSeasons([]); setSeasonProgress({}); setForm(f => ({ ...f, title: '', director: '', genre: '', poster_url: '', tmdb_id: '', total_episodes: 0 })) }}
                                        className="text-xs text-red-400 hover:text-red-300 text-left mt-1 cursor-pointer">
                                    ✕ Clear
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    {/* Status + Platform */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={label}>Status</label>
                            <select className={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                <option value="wishlist">Wishlist</option>
                                <option value="watching">Watching</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className={label}>Platform</label>
                            <select className={inp} value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                                <option value="">Select Platform</option>
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
                        </div>
                    </div>

                    {/* Rating */}
                    <div>
                        <label className={label}>Your Rating (0–10)</label>
                        <div className="flex items-center gap-3">
                            <input type="range" min="0" max="10" step="0.5" value={form.rating}
                                   onChange={e => setForm(f => ({ ...f, rating: +e.target.value }))}
                                   className="flex-1 accent-amber-400 cursor-pointer" />
                            <span className="text-amber-400 font-medium w-8 text-right">{form.rating}</span>
                        </div>
                    </div>

                    {/* Season progress — TV only */}
                    {form.content_type === 'tv' && seasons.length > 0 && (
                        <div>
                            <label className={label}>Season Progress</label>

                            {/* Season cards grid */}
                            {/* Season cards grid */}
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                                {seasons.map(s => {
                                    const sp = seasonProgress[s.season_number] || { watched: 0, total: s.episode_count }
                                    const pct = sp.total > 0 ? Math.round((sp.watched / sp.total) * 100) : 0
                                    return (
                                        <button key={s.season_number}
                                                onClick={() => {
                                                    setSelectedSeason(s)
                                                    if (!seasonProgress[s.season_number]) {
                                                        updateSeasonProgress(s.season_number, s.episode_count, 0)
                                                    }
                                                }}
                                                className={`text-xs py-2 px-3 rounded-lg border transition-all cursor-pointer text-left ${
                                                    selectedSeason?.season_number === s.season_number
                                                        ? 'bg-amber-400 text-black border-amber-400 font-medium'
                                                        : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                                                }`}>
                                            <div className="font-medium">{s.name}</div>
                                            <div className="opacity-60 mt-0.5">{s.episode_count} eps</div>
                                        </button>
                                    )
                                })}
                            </div>
                            {/* Slider — only for selected season */}
                            {selectedSeason && (() => {
                                const s = selectedSeason
                                const sp = seasonProgress[s.season_number] || { watched: 0, total: s.episode_count }
                                const pct = sp.total > 0 ? (sp.watched / sp.total) * 100 : 0
                                return (
                                    <div className="bg-[#0a1020] rounded-xl p-4 border border-amber-400/20">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm text-white font-medium">{s.name}</span>
                                            <span className="text-amber-400 text-sm font-medium">{sp.watched} / {s.episode_count} eps</span>
                                        </div>
                                        <input type="range" min="0" max={s.episode_count} step="1"
                                               value={sp.watched}
                                               onChange={e => updateSeasonProgress(s.season_number, s.episode_count, +e.target.value)}
                                               className="w-full accent-amber-400 cursor-pointer" />
                                        <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full transition-all duration-300"
                                                 style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <button onClick={() => updateSeasonProgress(s.season_number, s.episode_count, 0)}
                                                    className="text-xs px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 cursor-pointer transition-colors">
                                                None
                                            </button>
                                            <button onClick={() => updateSeasonProgress(s.season_number, s.episode_count, Math.floor(s.episode_count / 2))}
                                                    className="text-xs px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 cursor-pointer transition-colors">
                                                Halfway
                                            </button>
                                            <button onClick={() => updateSeasonProgress(s.season_number, s.episode_count, s.episode_count)}
                                                    className="text-xs px-3 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 cursor-pointer transition-colors">
                                                All watched ✓
                                            </button>
                                        </div>
                                    </div>
                                )
                            })()}

                            {/* Total summary */}
                            <div className="text-xs text-zinc-500 text-right mt-2">
                                Total: {Object.values(seasonProgress).reduce((a, s) => a + (s.watched || 0), 0)} / {seasons.reduce((a, s) => a + s.episode_count, 0)} episodes across all seasons
                            </div>
                        </div>
                    )}

                    {/* Review */}
                    {/* Review */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className={label}>Your Review / Notes</label>
                            {editing && (
                                <button onClick={generateReview} disabled={generatingReview}
                                        className="text-xs px-3 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 disabled:opacity-50 cursor-pointer transition-colors flex items-center gap-1">
                                    {generatingReview
                                        ? <><span className="animate-spin inline-block">⟳</span> Generating...</>
                                        : <>✨ AI Generate</>
                                    }
                                </button>
                            )}
                        </div>
                        <textarea className={`${inp} h-24 resize-none`}
                                  placeholder={editing ? "Write rough notes and hit AI Generate..." : "What did you think..."}
                                  value={form.review}
                                  onChange={e => setForm(f => ({ ...f, review: e.target.value }))} />
                        {editing && (
                            <p className="text-xs text-zinc-600 mt-1">Write rough notes → AI expands into a proper review</p>
                        )}
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button onClick={handleSubmit}
                            className="w-full bg-amber-400 hover:bg-amber-300 text-black font-medium py-3 rounded-lg transition-colors cursor-pointer text-sm tracking-wide">
                        {editing ? 'Save Changes' : 'Add to Collection'}
                    </button>
                </div>
            </div>
        </div>
    )
}