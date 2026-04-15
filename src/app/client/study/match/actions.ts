'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitMatchScore({
    libraryId,
    timeSeconds,
    pairsMatched
}: {
    libraryId: string
    timeSeconds: number
    pairsMatched: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    // Every matched pair grants 3 XP for speed, plus a flat 5 XP completion bonus
    const xpYield = Math.min((pairsMatched * 3) + 5, 25)

    // Call stored procedure to safely increment XP
    const { error: rpcError } = await supabase.rpc('increment_student_xp', {
        student_uid: user.id,
        xp_amount: xpYield
    })

    if (rpcError) {
        console.error('Failed to update Match Mode XP:', rpcError)
        return { success: false, error: rpcError.message }
    }

    revalidatePath('/client/app')
    revalidatePath('/client/progress')

    return {
        success: true,
        xpEarned: xpYield
    }
}
