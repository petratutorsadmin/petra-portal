// src/utils/srep.ts
// SuperMemo 2 (SM-2) Spaced Repetition Engine
// Integrated into Petra Portal Learning Engine

export type CardGrade = 0 | 1 | 2 | 3 | 4 | 5
// 0 = complete blackout, 1 = incorrect / hard, 2 = incorrect but obvious, 
// 3 = correct with serious difficulty, 4 = correct after hesitation, 5 = perfect

export interface CardState {
    easiness_factor: number     // EF: 1.3 - 2.7 (default 2.5)
    interval_days: number       // Days until next review
    repetitions: number         // Streak of correct answers
    next_review_date: string    // ISO string
}

/**
 * Calculates the new SREP state after a card is graded.
 * Implements the SuperMemo-2 algorithm exactly.
 */
export function calculateNextReview(state: CardState, grade: CardGrade): CardState {
    let { easiness_factor, interval_days, repetitions } = state

    if (grade >= 3) {
        // Correct response
        if (repetitions === 0) {
            interval_days = 1
        } else if (repetitions === 1) {
            interval_days = 6
        } else {
            interval_days = Math.round(interval_days * easiness_factor)
        }
        repetitions += 1
    } else {
        // Incorrect — reset streak, review again soon
        repetitions = 0
        interval_days = 1
    }

    // Update Easiness Factor: EF' = EF + (0.1 - (5-q)(0.08 + (5-q)*0.02))
    easiness_factor = easiness_factor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
    
    // Clamp EF between 1.3 and 2.7
    easiness_factor = Math.max(1.3, Math.min(2.7, Number(easiness_factor.toFixed(2))))

    // Next review date
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + interval_days)

    return {
        easiness_factor,
        interval_days,
        repetitions,
        next_review_date: nextDate.toISOString()
    }
}

/**
 * Converts a raw grade label from the UI into the 0-5 SM-2 grade.
 */
export function labelToGrade(label: 'again' | 'hard' | 'good' | 'easy'): CardGrade {
    const map: Record<string, CardGrade> = {
        again: 1,
        hard: 2,
        good: 4,
        easy: 5,
    }
    return map[label] ?? 3
}

/**
 * Returns the XP earned for a study session.
 * Base 50 XP + 2 XP per card reviewed.
 */
export function calculateSessionXP(cardsReviewed: number): number {
    return 50 + cardsReviewed * 2
}
