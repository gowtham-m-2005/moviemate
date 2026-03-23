import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertCircle, Info } from 'lucide-react'

export default function Toast({ message, onClose, type = 'success' }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000)
        return () => clearTimeout(t)
    }, [])

    const icons = {
        success: <Check className="w-5 h-5" />,
        error: <X className="w-5 h-5" />,
        warning: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    }

    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-amber-500 text-white',
        info: 'bg-blue-500 text-white'
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.8 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.4 }}
                className="fixed bottom-6 right-6 z-[100] flex items-center gap-3"
            >
                <div className={`${colors[type]} px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-sm border border-white/20`}>
                    <div className="flex-shrink-0">
                        {icons[type]}
                    </div>
                    <span className="font-medium text-sm max-w-xs">{message}</span>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
