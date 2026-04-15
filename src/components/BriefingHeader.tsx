import React from 'react'
import LevelProgressBar from './LevelProgressBar'

interface BriefingHeaderProps {
    firstName: string
    streak: number
    currentXp: number
    currentLevel: number
}

export default function BriefingHeader({ firstName, streak, currentXp, currentLevel }: BriefingHeaderProps) {
    return (
        <header className="dashboard-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="greeting-label">Good morning, {firstName}.</p>
                {streak > 0 && (
                    <div className="streak-badge">
                        <span style={{ fontSize: '1.2rem' }}>🔥</span>
                        <span style={{ fontWeight: 800, color: '#f97316', fontSize: '0.9rem' }}>{streak} DAY STREAK</span>
                    </div>
                )}
            </div>
            <h1>The Briefing</h1>
            <LevelProgressBar 
                currentXp={currentXp} 
                currentLevel={currentLevel} 
            />
        </header>
    )
}
