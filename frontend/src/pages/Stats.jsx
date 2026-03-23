import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import api from '../api/axios'
import MovieModal from '../components/MovieModal'
import Toast from '../components/Toast'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Clock, TrendingUp, Users, Star, Play, Sparkles, RefreshCw } from 'lucide-react'

const COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16']

export default function Stats() {
    const [stats, setStats] = useState({ by_genre: {}, by_platform: {} })
    const [recommendations, setRecommendations] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetched, setFetched] = useState(false)
    const [selectedRec, setSelectedRec] = useState(null)
    const [toast, setToast] = useState('')

    useEffect(() => { 
        api.get('/movies/stats/watch-time').then(r => setStats(r.data)) 
    }, [])

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

    const toChart = obj => Object.entries(obj).filter(([k]) => k).map(([name, mins]) => ({ 
        name: name.length > 15 ? name.substring(0, 12) + '...' : name, 
        fullName: name,
        hours: +(mins / 60).toFixed(1) 
    }))

    const totalHours = Object.values(stats.by_genre).reduce((a, b) => a + b, 0) / 60

    const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0e1623] rounded-xl border border-white/5 p-6"
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="text-zinc-400 text-sm">{title}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
                </div>
            </div>
        </motion.div>
    )

    const Chart = ({ data, title, icon: Icon }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0e1623] rounded-xl border border-white/5 p-6"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-400/10 rounded-lg">
                    <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-xl text-white font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    {title}
                </h3>
            </div>
            {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-3 bg-zinc-800 rounded-full mb-4">
                        <Icon className="w-6 h-6 text-zinc-600" />
                    </div>
                    <p className="text-zinc-600 text-sm">No data yet — add watch time when logging titles.</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis 
                            dataKey="name" 
                            stroke="#52525b" 
                            tick={{ fill: '#a1a1aa', fontSize: 11 }} 
                        />
                        <YAxis 
                            stroke="#52525b" 
                            tick={{ fill: '#a1a1aa', fontSize: 11 }} 
                            unit="h" 
                        />
                        <Tooltip
                            formatter={(v, name) => [`${v}h`, 'Watch Time']}
                            labelFormatter={(label) => data.find(d => d.name === label)?.fullName || label}
                            contentStyle={{ 
                                background: '#0e1623', 
                                border: '1px solid #1e293b', 
                                borderRadius: '8px', 
                                color: '#f0ead6' 
                            }}
                            cursor={{ fill: 'rgba(251, 191, 36, 0.05)' }}
                        />
                        <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </motion.div>
    )

    return (
        <div className="min-h-screen">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-400/10 rounded-xl">
                        <BarChart3 className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl text-white font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                            Stats & Insights
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1">Track your viewing habits and discover new content</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
                <StatCard
                    icon={Clock}
                    title="Total Watch Time"
                    value={`${totalHours.toFixed(1)}h`}
                    subtitle="Across all titles"
                    color="bg-amber-500/20"
                />
                <StatCard
                    icon={TrendingUp}
                    title="Top Genre"
                    value={Object.entries(stats.by_genre).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                    subtitle="Most watched category"
                    color="bg-blue-500/20"
                />
                <StatCard
                    icon={Users}
                    title="Platforms"
                    value={Object.keys(stats.by_platform).length}
                    subtitle="Streaming services"
                    color="bg-green-500/20"
                />
            </motion.div>

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Chart data={toChart(stats.by_genre)} title="By Genre" icon={Play} />
                    <Chart data={toChart(stats.by_platform)} title="By Platform" icon={Star} />
                </div>

                {/* AI Recommendations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#0e1623] rounded-xl border border-white/5 p-6"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-xl text-white font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                    AI Recommendations
                                </h3>
                                <p className="text-zinc-500 text-xs mt-1">Based on your watch history and ratings</p>
                            </div>
                        </div>
                        <button 
                            onClick={fetchRecommendations} 
                            disabled={loading}
                            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-medium rounded-lg flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Thinking...
                                </>
                            ) : fetched ? (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    Refresh
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Get Recommendations
                                </>
                            )}
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {!fetched && !loading && (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-12"
                            >
                                <div className="p-4 bg-purple-500/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-purple-400" />
                                </div>
                                <p className="text-zinc-400 text-sm">
                                    Click the button to get personalized recommendations based on what you've watched
                                </p>
                            </motion.div>
                        )}

                        {loading && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center py-12 gap-3"
                            >
                                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </motion.div>
                        )}

                        {Array.isArray(recommendations) && recommendations.length > 0 && (
                            <motion.div
                                key="recommendations"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                {recommendations.map((r, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        onClick={() => setSelectedRec(r)}
                                        className="group cursor-pointer"
                                    >
                                        <div className="flex gap-3 p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 hover:border-purple-400/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                            {r.poster_url ? (
                                                <img src={r.poster_url} className="w-14 h-20 object-cover rounded-lg flex-shrink-0" alt="" />
                                            ) : (
                                                <div className="w-14 h-20 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                    <Play className="w-6 h-6 text-zinc-600" />
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-2 min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-white text-sm font-medium truncate group-hover:text-purple-400 transition-colors">
                                                        {r.title}
                                                    </p>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 flex-shrink-0">
                                                        {r.type}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-400">{r.genre}</p>
                                                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                                                    {r.reason}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Modals */}
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
