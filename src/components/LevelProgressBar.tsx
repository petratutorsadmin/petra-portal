'use client'

export default function LevelProgressBar({ currentXp, currentLevel }: { currentXp: number, currentLevel: number }) {
    const xpForNextLevel = currentLevel * 500
    const progressPercent = Math.min(100, Math.max(0, (currentXp / xpForNextLevel) * 100))

    return (
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto' }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle 
                        cx="60" cy="60" r="54" 
                        fill="none" 
                        stroke="#8b5cf6" 
                        strokeWidth="8" 
                        strokeDasharray="339.29" 
                        strokeDashoffset={339.29 - (progressPercent / 100) * 339.29} 
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>LEVEL</span>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{currentLevel}</span>
                </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{currentXp} / {xpForNextLevel} XP</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>Keep your rhythm.</p>
            </div>
        </div>
    )
}
