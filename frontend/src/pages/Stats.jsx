import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api/axios'
import MovieModal from '../components/MovieModal'
import Toast from '../components/Toast'

const COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4']

export default function Stats() {
    const [stats, setStats] = useState({ by_genre: {}, by_platform: {} })
    const [recommendations, setRecommendations] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetched, setFetched] = useState(false)
    const [selectedRec, setSelectedRec] = useState(null)
    const [toast, setToast] = useState('')

    useEffect(() => { api.get('/movies/stats/watch-time').then(r => setStats(r.data)) }, [])

    const fetchRecommendations = async () => {
        setLoading(true)
        try {
            const res = await api.get('/movies/ai/recommendations')
            setRecommendations(res.data.recommendations)
            setFetched(true)
        } catch { }
        setLoading(false)
    }

    const addToWatching = async (rec) => {
        try {
            // fetch full details from TMDB first
            const type = rec.type === 'tv' ? 'tv' : 'movie'
            let detail = {}
            if (rec.tmdb_id) {
                const res = await api.get(`/tmdb/detail?tmdb_id=${rec.tmdb_id}&type=${type}`)
                detail = res.data
            }
            await api.post('/movies/', {
                title: rec.title,
                genre: rec.genre || detail.genre || '',
                director: detail.director || '',
                poster_url: rec.poster_url || detail.poster_url || '',
                tmdb_id: rec.tmdb_id || '',
                content_type: type,
                status: 'watching',
                platform: '',
                rating: 0,
                review: '',
                episodes_watched: 0,
                total_episodes: detail.total_episodes || 0,
                watch_minutes: detail.runtime || 0,
                seasons_data: '{}'
            })
            setToast(`"${rec.title}" added to your watching list!`)
        } catch (e) {
            if (e.response?.status === 409) setToast(`"${rec.title}" is already in your collection!`)
            else setToast('Something went wrong. Try again.')
        }
    }

    const toChart = obj => Object.entries(obj).filter(([k]) => k).map(([name, mins]) => ({ name, hours: +(mins / 60).toFixed(1) }))

    const Chart = ({ data, title }) => (
        <div className="bg-[#0e1623] rounded-xl border border-white/5 p-6 mb-6">
            <h3 className="text-xl text-white mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{title}</h3>
            {data.length === 0
                ? <p className="text-zinc-600 text-sm">No data yet — add watch time when logging titles.</p>
                : <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                        <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} unit="h" />
                        <Tooltip
                            formatter={v => [`${v}h`, 'Watch Time']}
                            contentStyle={{ background: '#080c14', border: '1px solid #1e293b', borderRadius: '8px', color: '#f0ead6' }}
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        />
                        <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            }
        </div>
    )

    return (
        <div className="min-h-screen bg-[#080c14] px-8 py-8">
            <h2 className="text-3xl text-white mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Stats & Insights</h2>

            <div className="max-w-3xl">
                <Chart data={toChart(stats.by_genre)} title="By Genre" />
                <Chart data={toChart(stats.by_platform)} title="By Platform" />

                <div className="bg-[#0e1623] rounded-xl border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>AI Recommendations</h3>
                            <p className="text-zinc-500 text-xs mt-1">Based on your watch history and ratings</p>
                        </div>
                        <button onClick={fetchRecommendations} disabled={loading}
                                className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer">
                            {loading ? 'Thinking...' : fetched ? 'Refresh' : '✨ Get Recommendations'}
                        </button>
                    </div>

                    {!fetched && !loading && (
                        <p className="text-zinc-600 text-sm text-center py-8">
                            Click the button to get personalized recommendations based on what you've watched
                        </p>
                    )}

                    {loading && (
                        <div className="flex items-center justify-center py-12 gap-3">
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    )}

                    {Array.isArray(recommendations) && recommendations.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {recommendations.map((r, i) => (
                                <div key={i} onClick={() => setSelectedRec(r)}
                                     className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-amber-400/30 transition-all cursor-pointer hover:-translate-y-0.5">
                                    {r.poster_url
                                        ? <img src={r.poster_url} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" alt="" />
                                        : <div className="w-12 h-16 bg-zinc-800 rounded-lg flex-shrink-0 flex items-center justify-center text-zinc-600">🎬</div>
                                    }
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-white text-sm font-medium truncate">{r.title}</p>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300 flex-shrink-0">{r.type}</span>
                                        </div>
                                        <p className="text-xs text-zinc-500">{r.genre}</p>
                                        <p className="text-xs text-zinc-400 line-clamp-2">{r.reason}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedRec && (
                <MovieModal
                    movie={selectedRec}
                    onClose={() => setSelectedRec(null)}
                    isRecommendation={true}
                    onAddToWatching={addToWatching}
                />
            )}

            {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </div>
    )
}