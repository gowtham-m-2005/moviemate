import api from '../api/axios'

const STATUS = {
    watching: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    completed: 'bg-green-500/20 text-green-400 border border-green-500/30',
    wishlist: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
}

export default function MovieCard({ movie, onDelete, onEdit }) {
    const progress = movie.total_episodes > 0
        ? Math.round((movie.episodes_watched / movie.total_episodes) * 100) : null

    return (
        <div className="bg-[#0e1623] rounded-xl overflow-hidden flex flex-col border border-white/5 hover:-translate-y-1 hover:shadow-2xl transition-all duration-200">
            <div className="relative">
                {movie.poster_url
                    ? <img src={movie.poster_url} alt={movie.title} className="w-full h-64 object-cover" />
                    : <div className="h-64 bg-[#111827] flex items-center justify-center text-5xl text-zinc-700">🎬</div>
                }
                <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full ${STATUS[movie.status] || STATUS.wishlist}`}>
          {movie.status}
        </span>
            </div>

            <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="text-xl text-white leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{movie.title}</h3>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">{[movie.genre, movie.platform].filter(Boolean).join(' · ')}</p>

                {movie.rating > 0 && (
                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                        {'★'.repeat(Math.round(movie.rating / 2))}{'☆'.repeat(5 - Math.round(movie.rating / 2))}
                        <span className="text-zinc-500 ml-1">{movie.rating}/10</span>
                    </div>
                )}

                {progress !== null && (
                    <div className="mt-1">
                        <div className="flex justify-between text-xs text-zinc-500 mb-1">
                            <span>Progress</span>
                            <span>{movie.episodes_watched}/{movie.total_episodes} eps</span>
                        </div>
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                {movie.review && <p className="text-xs text-zinc-400 italic line-clamp-2 mt-1">"{movie.review}"</p>}

                <div className="flex gap-2 mt-auto pt-3">
                    <button onClick={() => onEdit(movie)}
                            className="flex-1 text-xs py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer">
                        Edit
                    </button>
                    <button onClick={() => { api.delete(`/movies/${movie.id}`); onDelete(movie.id) }}
                            className="flex-1 text-xs py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer">
                        Remove
                    </button>
                </div>
            </div>
        </div>
    )
}