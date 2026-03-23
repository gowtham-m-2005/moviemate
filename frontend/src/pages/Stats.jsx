import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api/axios'

const COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4']

export default function Stats() {
    const [stats, setStats] = useState({ by_genre: {}, by_platform: {} })

    useEffect(() => { api.get('/movies/stats/watch-time').then(r => setStats(r.data)) }, [])

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
            <h2 className="text-3xl text-white mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Watch Stats</h2>
            <div className="max-w-3xl">
                <Chart data={toChart(stats.by_genre)} title="By Genre" />
                <Chart data={toChart(stats.by_platform)} title="By Platform" />
            </div>
        </div>
    )
}