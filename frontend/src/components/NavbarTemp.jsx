import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Film, Plus, BarChart3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const { pathname } = useLocation()
    
    const navItems = [
        { to: '/', label: 'My List', icon: Film },
        { to: '/add', label: 'Add', icon: Plus },
        { to: '/stats', label: 'Stats', icon: BarChart3 }
    ]

    const link = (to, label, Icon) => (
        <Link 
            to={to} 
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                pathname === to 
                    ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
        >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
        </Link>
    )

    return (
        <nav className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-black/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link 
                        to="/" 
                        className="flex items-center gap-2 text-2xl font-bold text-amber-400 hover:text-amber-300 transition-colors"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                        <Film className="w-6 h-6" />
                        MovieMate
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        {navItems.map(({ to, label, icon: Icon }) => link(to, label, Icon))}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden border-t border-white/5 mt-4 pt-4"
                        >
                            <div className="flex flex-col gap-2 pb-4">
                                {navItems.map(({ to, label, icon: Icon }) => link(to, label, Icon))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    )
}
