'use client'

import { useState, useEffect, useRef } from 'react'
import { completeStudySession, GradedCard } from './actions'
import './study.css'

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
            // Session complete — submit
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
            <div className="study-empty">
                <p>No cards in this deck yet.</p>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Ask your tutor to add content to this library.</p>
            </div>
        )
    }

    if (sessionState === 'debrief' && result) {
        return (
            <div className="study-debrief">
                <div className="debrief-matrix">
                    <div className="matrix-row">
                        <span className="matrix-label">CARDS PROCESSED</span>
                        <span className="matrix-value">{result.cardsReviewed}</span>
                    </div>
                    <div className="matrix-row">
                        <span className="matrix-label">CARDS MASTERED</span>
                        <span className="matrix-value green">{result.cardsMastered}</span>
                    </div>
                    <div className="matrix-row">
                        <span className="matrix-label">XP YIELD</span>
                        <span className="matrix-value purple">+{result.xpEarned}</span>
                    </div>
                </div>
                <a href="/client/app" className="debrief-cta">← Return to Briefing</a>
            </div>
        )
    }

    return (
        <div className="study-engine">
            {/* Progress bar (Fixed to top edge via CSS) */}
            <div className="study-progress-track">
                <div className="study-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="study-content-wrapper">
                {/* Counter */}
                <div className="study-counter">
                    {index + 1} / {cards.length}
                </div>

                {/* Card */}
                <div className="study-card" onClick={() => !isRevealed && setIsRevealed(true)}>
                    <div className="card-face front">{currentCard.front_content}</div>

                    {isRevealed && (
                        <>
                            <div className="card-divider" />
                            <div className="card-face back">{currentCard.back_content}</div>
                            {currentCard.hint && (
                                <div className="card-hint">💡 {currentCard.hint}</div>
                            )}
                        </>
                    )}

                    {!isRevealed && (
                        <div className="card-tap-prompt">Tap to reveal</div>
                    )}
                </div>

                {/* Grade buttons — only visible after reveal */}
                {isRevealed && (
                    <div className="grade-buttons">
                        <button className="grade-btn again" onClick={() => grade('again')} disabled={isSubmitting}>Again</button>
                        <button className="grade-btn hard" onClick={() => grade('hard')} disabled={isSubmitting}>Hard</button>
                        <button className="grade-btn good" onClick={() => grade('good')} disabled={isSubmitting}>Good</button>
                        <button className="grade-btn easy" onClick={() => grade('easy')} disabled={isSubmitting}>Easy</button>
                    </div>
                )}

                {isSubmitting && <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '1rem' }}>Saving results...</p>}
            </div>
        </div>
    )
}
