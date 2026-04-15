import React from 'react'

interface SkillMasteryProps {
    sortedSkills: [string, number][]
    maxSkillVal: number
}

export default function SkillMastery({ sortedSkills, maxSkillVal }: SkillMasteryProps) {
    if (sortedSkills.length === 0) return null

    return (
        <section className="progress-card" style={{ marginBottom: '1.5rem' }}>
            <h2 className="progress-section-title">Skill Development</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {sortedSkills.map(([skill, val]) => (
                    <div key={skill}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{skill}</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: val > 0 ? '#10b981' : '#ef4444' }}>
                                {val > 0 ? '+' : ''}{val}
                            </span>
                        </div>
                        <div style={{ background: '#f1f5f9', borderRadius: '9999px', height: '6px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${Math.max(5, (Math.abs(val) / maxSkillVal * 100))}%`,
                                height: '100%',
                                background: val > 0 ? '#10b981' : '#ef4444',
                                borderRadius: '9999px',
                                transition: 'width 0.6s ease'
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
