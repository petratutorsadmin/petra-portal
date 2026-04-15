import React from 'react'

interface BriefingHeaderProps {
    firstName: string
    streak: number
    currentXp: number
    currentLevel: number
}

function calculateLevelProgress(xp: number, level: number) {
    const baseRequirement = level * 100
    const progress = Math.min(100, Math.floor((xp / baseRequirement) * 100))
    return { progress, max: baseRequirement }
}

export default function BriefingHeader({ firstName, streak, currentXp, currentLevel }: BriefingHeaderProps) {
    const { progress, max } = calculateLevelProgress(currentXp, currentLevel)

    return (
        <header className="client-header">
            <h1>Briefing</h1>
            
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginTop: '16px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, maxWidth: '240px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <span>Level {currentLevel}</span>
                        <span>{currentXp} / {max} XP</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'var(--border-main)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--text-primary)' }} />
                    </div>
                </div>

                {streak > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid var(--border-main)', paddingLeft: '16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-orange)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {streak} Day Streak
                        </span>
                    </div>
                )}
            </div>
        </header>
    )
}
