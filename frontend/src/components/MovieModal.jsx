import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Clock, Film, Play, Plus, Calendar, User } from 'lucide-react'

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
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={e => e.target === e.currentTarget && onClose()}
            >
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                    className="relative z-10 w-full max-w-4xl bg-[#0e1623] rounded-2xl border border-white/10 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
                >
                    {/* Banner/Background */}
                    <div className="relative h-64 sm:h-80 overflow-hidden">
                        {movie.poster_url ? (
                            <>
                                <img 
                                    src={movie.poster_url} 
                                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-30" 
                                    alt="" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#0e1623]" />
                            </>
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-[#0e1623]" />
                        )}
                        
                        {/* Close Button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm border border-white/10"
                        >
                            <X className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {/* Content */}
                    <div className="relative px-6 pb-6">
                        {/* Main Content Layout */}
                        <div className="flex flex-col sm:flex-row gap-6 -mt-20 sm:-mt-16">
                            {/* Poster */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex-shrink-0"
                            >
                                {movie.poster_url ? (
                                    <img 
                                        src={movie.poster_url} 
                                        className="w-32 sm:w-40 rounded-xl border-2 border-white/20 shadow-2xl object-cover" 
                                        style={{ height: '192px' }}
                                        alt={movie.title} 
                                    />
                                ) : (
                                    <div className="w-32 sm:w-40 rounded-xl border-2 border-white/20 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center" style={{ height: '192px' }}>
                                        <Film className="w-12 h-12 text-zinc-600" />
                                    </div>
                                )}
                            </motion.div>

                            {/* Movie Info */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex-1 min-w-0 pt-16 sm:pt-0"
                            >
                                <h2 className="text-3xl sm:text-4xl text-white font-bold leading-tight mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                    {movie.title}
                                </h2>
                                
                                {/* Status and Tags */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {!isRecommendation && (
                                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${s.color}`}>
                                            {s.label}
                                        </span>
                                    )}
                                    {movie.genre && movie.genre.split(',').map(g => (
                                        <span key={g} className="text-sm px-3 py-1 rounded-full bg-white/5 text-zinc-300 border border-white/10">
                                            {g.trim()}
                                        </span>
                                    ))}
                                </div>

                                {/* Meta Information */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-400">
                                    {movie.director && (
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-zinc-500" />
                                            <span>{movie.director}</span>
                                        </div>
                                    )}
                                    {movie.platform && (
                                        <div className="flex items-center gap-2">
                                            <Play className="w-4 h-4 text-zinc-500" />
                                            <span>{movie.platform}</span>
                                        </div>
                                    )}
                                    {movie.watch_minutes > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-zinc-500" />
                                            <span>{movie.watch_minutes} minutes</span>
                                        </div>
                                    )}
                                    {movie.release_date && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-zinc-500" />
                                            <span>{new Date(movie.release_date).getFullYear()}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Details Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 space-y-6"
                        >
                            {/* Rating */}
                            {!isRecommendation && movie.rating > 0 && (
                                <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                        <span className="text-2xl font-bold text-white">{movie.rating}</span>
                                        <span className="text-zinc-400">/10</span>
                                    </div>
                                    <div className="flex text-amber-400">
                                        {'★'.repeat(Math.round(movie.rating / 2))}{'☆'.repeat(5 - Math.round(movie.rating / 2))}
                                    </div>
                                </div>
                            )}

                            {/* Progress */}
                            {!isRecommendation && progress !== null && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Episode Progress
                                        </span>
                                        <span className="text-amber-400 font-bold">
                                            {movie.episodes_watched}/{movie.total_episodes} ({progress}%)
                                        </span>
                                    </div>
                                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.8, delay: 0.5 }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Review/Overview */}
                            {(movie.review || movie.overview) && (
                                <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-6 border border-white/10">
                                    <h4 className="text-sm font-medium text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Film className="w-4 h-4" />
                                        {isRecommendation ? 'Overview' : 'Review'}
                                    </h4>
                                    <p className="text-zinc-300 leading-relaxed text-sm">
                                        {isRecommendation ? movie.overview : movie.review}
                                    </p>
                                </div>
                            )}

                            {/* Recommendation Reason */}
                            {isRecommendation && (
                                <div className="space-y-4">
                                    {movie.reason && (
                                        <div className="bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-xl p-6 border border-amber-400/20">
                                            <h4 className="text-sm font-medium text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <Star className="w-4 h-4" />
                                                Why you'd like it
                                            </h4>
                                            <p className="text-zinc-300 leading-relaxed">{movie.reason}</p>
                                        </div>
                                    )}
                                    {movie.similarity && (
                                        <p className="text-xs text-zinc-600 italic text-center px-4">
                                            {movie.similarity}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Action Button */}
                            {isRecommendation && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { onAddToWatching(movie); onClose() }}
                                    className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 text-lg"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add to Watching List
                                </motion.button>
                            )}
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
