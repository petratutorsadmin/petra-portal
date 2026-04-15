import React from 'react'

interface DebriefCardProps {
    report: {
        student_visible_comments: string
        skill_increments: Record<string, number> | null
    }
}

export default function DebriefCard({ report }: DebriefCardProps) {
    if (!report) return null

    return (
        <section>
            <h2 className="section-title">Last Debrief</h2>
            <div className="debrief-card">
                <p className="debrief-quote">“{report.student_visible_comments}”</p>
                
                {report.skill_increments && Object.keys(report.skill_increments).length > 0 && (
                    <div className="skill-tags">
                        {Object.entries(report.skill_increments).map(([skill, val]) => {
                            const value = val as number
                            if (value === 0) return null
                            return (
                                <span key={skill} className={`skill-tag ${value > 0 ? 'positive' : 'negative'}`}>
                                    {skill} {value > 0 ? '+' : ''}{value}
                                </span>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}
