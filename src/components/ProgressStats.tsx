import React from 'react'

interface ProgressStatsProps {
    stats: {
        label: string
        value: number
    }[]
}

export default function ProgressStats({ stats }: ProgressStatsProps) {
    return (
        <div className="stats-row" style={{ marginBottom: '1.5rem' }}>
            {stats.map((s) => (
                <div key={s.label} className="progress-card" style={{ textAlign: 'center', padding: '1rem' }}>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>{s.value}</p>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', margin: 0, textTransform: 'uppercase' }}>{s.label}</p>
                </div>
            ))}
        </div>
    )
}
