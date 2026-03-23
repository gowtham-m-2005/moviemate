import { useEffect } from 'react'

export default function Toast({ message, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000)
        return () => clearTimeout(t)
    }, [])

    return (
        <div className="fixed bottom-6 right-6 z-[100] bg-amber-400 text-black px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce-in">
            <span className="text-lg">✅</span>
            <span className="font-medium text-sm">{message}</span>
        </div>
    )
}