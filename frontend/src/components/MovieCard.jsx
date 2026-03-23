import api from '../api/axios'
import { motion } from 'framer-motion'
import { Edit, Trash2, Play, Star, Clock, Film } from 'lucide-react'
import { useState } from 'react'

const STATUS = {
    watching: { label: 'Watching', color: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
    completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400 border border-green-500/30' },
    wishlist: { label: 'Wishlist', color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
}

export default function MovieCard({ movie, onDelete, onEdit, onOpenModal, onDeleteConfirm }) {
    const [isHovered, setIsHovered] = useState(false)
    const progress = movie.total_episodes > 0
        ? Math.round((movie.episodes_watched / movie.total_episodes) * 100) : null
    const s = STATUS[movie.status] || STATUS.wishlist

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative bg-[#0e1623] rounded-xl overflow-hidden border border-white/5 hover:border-amber-400/20"
        >
            {/* Poster Section */}
            <div className="relative aspect-[2/3] overflow-hidden cursor-pointer" onClick={() => onOpenModal(movie)}>
                {movie.poster_url ? (
                    <img 
                        src={movie.poster_url} 
                        alt={movie.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1a1f2e] to-[#0d1117] flex items-center justify-center">
                        <Film className="w-12 h-12 text-zinc-600" />
                    </div>
                )}
                
                {/* Hover Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center p-4"
                >
                    <div className="flex items-center gap-2 text-white">
                        <Play className="w-4 h-4" />
                        <span className="text-sm font-medium">View Details</span>
                    </div>
                </motion.div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.color}`}>
                        {s.label}
                    </span>
                </div>

                {/* Rating Badge */}
                {movie.rating > 0 && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-white font-medium">{movie.rating}</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col gap-3">
                {/* Title */}
                <h3 
                    className="text-white font-bold leading-tight cursor-pointer hover:text-amber-400 transition-colors line-clamp-2"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    onClick={() => onOpenModal(movie)}
                >
                    {movie.title}
                </h3>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    {movie.genre && (
                        <span className="px-2 py-0.5 bg-white/5 rounded-md">
                            {movie.genre.split(',')[0]}
                        </span>
                    )}
                    {movie.platform && (
                        <span className="px-2 py-0.5 bg-white/5 rounded-md">
                            {movie.platform}
                        </span>
                    )}
                </div>

                {/* Progress Bar for TV Shows */}
                {progress !== null && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-zinc-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Progress
                            </span>
                            <span className="text-amber-400 font-medium">
                                {movie.episodes_watched}/{movie.total_episodes}
                            </span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            />
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                    <button 
                        onClick={() => onEdit(movie)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium hover:text-white"
                    >
                        <Edit className="w-3 h-3" />
                        Edit
                    </button>
                    <button 
                        onClick={() => onDeleteConfirm(movie)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium hover:text-red-300"
                    >
                        <Trash2 className="w-3 h-3" />
                        Remove
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
