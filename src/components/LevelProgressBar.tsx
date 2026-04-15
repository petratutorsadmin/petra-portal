'use client'

export default function LevelProgressBar({ currentXp, currentLevel }: { currentXp: number, currentLevel: number }) {
    const xpPerLevel = 500
    const xpIntoLevel = currentXp % xpPerLevel
    const progressPercent = Math.min(100, Math.max(0, (xpIntoLevel / xpPerLevel) * 100))

    return (
        <div style={{ width: '100%', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.625rem' }}>
                <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>LEVEL</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginLeft: '0.5rem' }}>{currentLevel}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-purple)' }}>{currentXp.toLocaleString()} XP</span>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>{xpPerLevel - xpIntoLevel} to Level {currentLevel + 1}</p>
                </div>
            </div>
            
            {/* The Bar */}
            <div style={{ height: '8px', background: 'var(--border-main)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                <div 
                    className="xp-bar-fill"
                    style={{ 
                        width: `${progressPercent}%`, 
                        height: '100%', 
                        borderRadius: '4px',
                        transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                    }} 
                />
            </div>
        </div>
    )
}
