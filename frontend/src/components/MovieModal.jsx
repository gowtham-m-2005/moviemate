import { useEffect } from 'react'

const STATUS = {
    watching: { label: 'Watching', color: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
    completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400 border border-green-500/30' },
    wishlist: { label: 'Wishlist', color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
}

export default function MovieModal({ movie, onClose, isRecommendation = false, onAddToWatching }) {
    useEffect(() => {
        const handler = e => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [])

    if (!movie) return null
    const s = STATUS[movie.status] || STATUS.wishlist
    const progress = movie.total_episodes > 0
        ? Math.round((movie.episodes_watched / movie.total_episodes) * 100) : null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-2xl bg-[#0e1623] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                {/* Banner */}
                <div className="relative h-48 overflow-hidden">
                    {movie.poster_url
                        ? <>
                            <img src={movie.poster_url} className="absolute inset-0 w-full h-full object-cover scale-110 blur-md opacity-40" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0e1623]" />
                        </>
                        : <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-[#0e1623]" />
                    }
                    <button onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer transition-colors text-lg">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex gap-6 px-6 pb-4 -mt-16 relative">
                    {movie.poster_url
                        ? <img src={movie.poster_url} className="w-28 rounded-xl border-2 border-white/10 flex-shrink-0 shadow-xl object-cover" style={{ height: '168px' }} alt={movie.title} />
                        : <div className="w-28 rounded-xl border-2 border-white/10 flex-shrink-0 bg-zinc-800 flex items-center justify-center text-4xl" style={{ height: '168px' }}>🎬</div>
                    }
                    <div className="flex flex-col gap-2 pt-16 flex-1 min-w-0">
                        <h2 className="text-2xl text-white leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                            {movie.title}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {!isRecommendation && (
                                <span className={`text-xs px-2 py-1 rounded-full ${s.color}`}>{s.label}</span>
                            )}
                            {movie.genre && movie.genre.split(',').map(g => (
                                <span key={g} className="text-xs px-2 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/10">{g.trim()}</span>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mt-1">
                            {movie.director && <span>🎬 {movie.director}</span>}
                            {movie.platform && <span>📺 {movie.platform}</span>}
                            {movie.watch_minutes > 0 && <span>⏱ {movie.watch_minutes} min</span>}
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6 flex flex-col gap-4">
                    {!isRecommendation && movie.rating > 0 && (
                        <div className="flex items-center gap-3">
                            <div className="flex text-amber-400">
                                {'★'.repeat(Math.round(movie.rating / 2))}{'☆'.repeat(5 - Math.round(movie.rating / 2))}
                            </div>
                            <span className="text-zinc-400 text-sm">{movie.rating}/10</span>
                        </div>
                    )}

                    {!isRecommendation && progress !== null && (
                        <div>
                            <div className="flex justify-between text-xs text-zinc-500 mb-2">
                                <span>Episode Progress</span>
                                <span className="text-amber-400">{movie.episodes_watched}/{movie.total_episodes} eps ({progress}%)</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full transition-all"
                                     style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}

                    {(movie.review || movie.overview) && (
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                                {isRecommendation ? 'Overview' : 'Review'}
                            </p>
                            <p className="text-zinc-300 text-sm leading-relaxed">
                                {isRecommendation ? movie.overview : movie.review}
                            </p>
                        </div>
                    )}

                    {isRecommendation && (
                        <div className="flex flex-col gap-2">
                            {movie.reason && (
                                <div className="bg-amber-400/5 rounded-xl p-4 border border-amber-400/20">
                                    <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">Why you'd like it</p>
                                    <p className="text-zinc-300 text-sm">{movie.reason}</p>
                                </div>
                            )}
                            {movie.similarity && (
                                <p className="text-xs text-zinc-600 italic px-1">{movie.similarity}</p>
                            )}
                        </div>
                    )}

                    {/* Add to Watching button — only for recommendations */}
                    {isRecommendation && (
                        <button
                            onClick={() => { onAddToWatching(movie); onClose() }}
                            className="w-full bg-amber-400 hover:bg-amber-300 text-black font-medium py-3 rounded-xl transition-colors cursor-pointer text-sm tracking-wide flex items-center justify-center gap-2">
                            ➕ Add to Watching List
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}