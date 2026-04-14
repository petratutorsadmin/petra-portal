'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculateNextReview, calculateSessionXP, labelToGrade } from '@/utils/srep'

export interface GradedCard {
    card_id: string
    grade: 'again' | 'hard' | 'good' | 'easy'
    existing_state?: {
        easiness_factor: number
        interval_days: number
        repetitions: number
    } | null
}

/**
 * Called when a study session completes.
 * Persists all graded card states, logs the session, and awards XP.
 */
export async function completeStudySession({
    gradedCards,
    libraryId,
    taskId,
    durationSeconds,
}: {
    gradedCards: GradedCard[]
    libraryId: string | null
    taskId: string | null
    durationSeconds: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const cardsReviewed = gradedCards.length
    const cardsMastered = gradedCards.filter(c => c.grade === 'good' || c.grade === 'easy').length
    const xpEarned = calculateSessionXP(cardsReviewed)
    const now = new Date().toISOString()

    // 1. Upsert card performance states (SM-2 logic)
    const upserts = gradedCards.map(({ card_id, grade, existing_state }) => {
        const currentState = {
            easiness_factor: existing_state?.easiness_factor ?? 2.5,
            interval_days: existing_state?.interval_days ?? 0,
            repetitions: existing_state?.repetitions ?? 0,
            next_review_date: now,
        }
        const newState = calculateNextReview(currentState, labelToGrade(grade))
        return {
            student_id: user.id,
            card_id,
            easiness_factor: newState.easiness_factor,
            interval_days: newState.interval_days,
            repetitions: newState.repetitions,
            next_review_date: newState.next_review_date,
            last_reviewed_at: now,
        }
    })

    const { error: upsertError } = await supabase
        .from('student_card_performance')
        .upsert(upserts, { onConflict: 'student_id,card_id' })

    if (upsertError) {
        console.error('SREP upsert error:', upsertError)
        return { success: false, error: upsertError.message }
    }

    // 2. Log the study session
    await supabase.from('study_sessions').insert({
        student_id: user.id,
        library_id: libraryId,
        task_id: taskId,
        cards_reviewed: cardsReviewed,
        cards_mastered: cardsMastered,
        duration_seconds: durationSeconds,
        xp_earned: xpEarned,
    })

    // 3. Award XP + handle level-up
    const { data: profile } = await supabase
        .from('student_profiles')
        .select('current_xp, current_level')
        .eq('id', user.id)
        .single()

    if (profile) {
        let newXp = (profile.current_xp || 0) + xpEarned
        let newLevel = profile.current_level || 1
        while (newXp >= newLevel * 500) {
            newLevel += 1
        }
        await supabase.from('student_profiles')
            .update({ current_xp: newXp, current_level: newLevel })
            .eq('id', user.id)
    }

    // 4. Auto-complete the linked task if one exists
    if (taskId) {
        await supabase.from('student_tasks')
            .update({ status: 'completed', completed_at: now })
            .eq('id', taskId)
            .eq('student_id', user.id)
    }

    revalidatePath('/client/app')
    revalidatePath('/client/study')

    return { success: true, xpEarned, cardsReviewed, cardsMastered }
}

/**
 * Fetches all cards for a library, joining the student's existing performance state.
 */
export async function fetchStudyDeck(libraryId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: cards } = await supabase
        .from('cards')
        .select(`
            id, front_content, back_content, hint,
            student_card_performance!left (
                easiness_factor, interval_days, repetitions, next_review_date
            )
        `)
        .eq('library_id', libraryId)
        .eq('student_card_performance.student_id', user.id)

    return cards ?? []
}
