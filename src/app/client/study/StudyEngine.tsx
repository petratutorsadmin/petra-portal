'use client'

import { useState, useEffect, useRef } from 'react'
import { completeStudySession, GradedCard } from './actions'

interface Card {
    id: string
    front_content: string
    back_content: string
    hint: string | null
    student_card_performance: {
        easiness_factor: number
        interval_days: number
        repetitions: number
        next_review_date: string
    } | null
}

interface StudyEngineProps {
    deck: Card[]
    libraryTitle: string
    libraryId: string | null
    taskId: string | null
}

type SessionState = 'active' | 'debrief'

export default function StudyEngine({ deck, libraryTitle, libraryId, taskId }: StudyEngineProps) {
    const [cards] = useState<Card[]>(deck)
    const [index, setIndex] = useState(0)
    const [isRevealed, setIsRevealed] = useState(false)
    const [gradedCards, setGradedCards] = useState<GradedCard[]>([])
    const [sessionState, setSessionState] = useState<SessionState>('active')
    const [result, setResult] = useState<{ xpEarned: number; cardsReviewed: number; cardsMastered: number } | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const startTimeRef = useRef(Date.now())

    const currentCard = cards[index]
    const progress = Math.round((index / cards.length) * 100)

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (sessionState !== 'active' || isSubmitting) return

            if (e.code === 'Space') {
                e.preventDefault()
                if (!isRevealed) setIsRevealed(true)
            }

            if (isRevealed) {
                if (e.key === '1') grade('again')
                if (e.key === '2') grade('hard')
                if (e.key === '3') grade('good')
                if (e.key === '4') grade('easy')
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isRevealed, sessionState, isSubmitting])

    const grade = async (label: 'again' | 'hard' | 'good' | 'easy') => {
        const graded: GradedCard = {
            card_id: currentCard.id,
            grade: label,
            existing_state: currentCard.student_card_performance ?? null,
        }
        const updatedGraded = [...gradedCards, graded]
        setGradedCards(updatedGraded)
        setIsRevealed(false)

        if (index + 1 >= cards.length) {
            setIsSubmitting(true)
            const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000)
            const res = await completeStudySession({
                gradedCards: updatedGraded,
                libraryId,
                taskId,
                durationSeconds,
            })
            if (res.success) {
                setResult({ xpEarned: res.xpEarned!, cardsReviewed: res.cardsReviewed!, cardsMastered: res.cardsMastered! })
            }
            setIsSubmitting(false)
            setSessionState('debrief')
        } else {
            setIndex(i => i + 1)
        }
    }

    if (cards.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '24px', background: 'var(--bg-workspace)' }}>
                <div style={{ padding: '24px', border: '1px solid var(--border-main)', borderRadius: '4px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>No cards available.</p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Library is empty or cards are hidden.</p>
                </div>
            </div>
        )
    }

    if (sessionState === 'debrief' && result) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-workspace)', padding: '24px' }}>
                <div style={{ width: '400px', border: '1px solid var(--border-main)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border-main)', background: 'var(--bg-sidebar)' }}>
                        <h2 style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Session Results</h2>
                    </div>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-main)' }}>
                        <div style={{ flex: 1, padding: '16px', borderRight: '1px solid var(--border-main)' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Reviewed</p>
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>{result.cardsReviewed}</p>
                        </div>
                        <div style={{ flex: 1, padding: '16px', borderRight: '1px solid var(--border-main)' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Mastered</p>
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>{result.cardsMastered}</p>
                        </div>
                        <div style={{ flex: 1, padding: '16px' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>XP</p>
                            <p className="pulse-xp" style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>+{result.xpEarned}</p>
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: '24px' }}>
                    <a href="/client/app" style={{ display: 'inline-block', padding: '8px 16px', border: '1px solid var(--border-main)', background: 'var(--bg-workspace)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '12px', fontWeight: 500, borderRadius: '4px' }}>
                        Return to Briefing
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-workspace)' }}>
            {/* Progress Bar Top Edge */}
            <div style={{ height: '4px', background: 'var(--border-main)', width: '100%' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--text-primary)', transition: 'width 0.3s' }} />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{libraryTitle}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{index + 1} / {cards.length}</span>
                    </div>

                    {/* Card Body */}
                    <div 
                        onClick={() => !isRevealed && setIsRevealed(true)}
                        style={{
                            border: '1px solid var(--border-main)',
                            borderRadius: '4px',
                            background: 'var(--bg-workspace)',
                            minHeight: '300px',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: isRevealed ? 'default' : 'pointer'
                        }}
                    >
                        <div style={{ flex: 1, padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 500, color: 'var(--text-primary)', textAlign: 'center' }}>
                            {currentCard.front_content}
                        </div>

                        {isRevealed && (
                            <>
                                <div style={{ height: '1px', background: 'var(--border-main)', margin: '0 24px' }} />
                                <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                    {currentCard.back_content}
                                    {currentCard.hint && (
                                        <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                            💡 {currentCard.hint}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        
                        {!isRevealed && (
                            <div style={{ padding: '16px', textAlign: 'center', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                &lt;Space&gt; to Reveal
                            </div>
                        )}
                    </div>

                    {/* Grade Actions */}
                    <div style={{ marginTop: '24px', height: '48px' }}>
                        {isRevealed && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => grade('again')} disabled={isSubmitting} style={btnStyle}>[1] Again</button>
                                <button onClick={() => grade('hard')} disabled={isSubmitting} style={btnStyle}>[2] Hard</button>
                                <button onClick={() => grade('good')} disabled={isSubmitting} style={btnStyle}>[3] Good</button>
                                <button onClick={() => grade('easy')} disabled={isSubmitting} style={btnStyle}>[4] Easy</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const btnStyle = {
    flex: 1,
    padding: '12px',
    background: 'transparent',
    border: '1px solid var(--border-main)',
    borderRadius: '4px',
    color: 'var(--text-primary)',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.1s'
}
