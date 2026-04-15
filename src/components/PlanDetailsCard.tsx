import React from 'react'

interface PlanDetailsCardProps {
    tutorName: string
    programName: string
    deliveryType: string | null
    lessonsPerWeek: string | number
    lessonLength: number | null
    isMatched: boolean
}

export default function PlanDetailsCard({ 
    tutorName, 
    programName, 
    deliveryType, 
    lessonsPerWeek, 
    lessonLength,
    isMatched 
}: PlanDetailsCardProps) {
    return (
        <section className="plan-card">
            <h2 className="plan-card-title">Current Plan</h2>

            <div className="plan-rows">
                <div className="plan-row">
                    <span className="plan-row-label">Tutor</span>
                    <span className="plan-row-value">{isMatched ? tutorName : 'Not yet matched'}</span>
                </div>
                <div className="plan-row">
                    <span className="plan-row-label">Program</span>
                    <span className="plan-row-value">{programName}</span>
                </div>
                <div className="plan-row">
                    <span className="plan-row-label">Format</span>
                    <span className="plan-row-value" style={{ textTransform: 'capitalize' }}>
                        {deliveryType?.replace(/_/g, ' ') ?? '—'}
                    </span>
                </div>
                <div className="plan-row">
                    <span className="plan-row-label">Frequency</span>
                    <span className="plan-row-value">{lessonsPerWeek} lessons / week</span>
                </div>
                <div className="plan-row">
                    <span className="plan-row-label">Length</span>
                    <span className="plan-row-value">
                        {lessonLength ? `${lessonLength} min` : '—'}
                    </span>
                </div>
            </div>
        </section>
    )
}
