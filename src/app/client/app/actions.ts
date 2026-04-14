'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeTask(taskId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Verify task belongs to user and is pending
    const { data: task } = await supabase.from('student_tasks')
        .select('xp_reward')
        .eq('id', taskId)
        .eq('student_id', user.id)
        .eq('status', 'pending')
        .single()

    if (!task) return

    // 1. Mark complete
    await supabase.from('student_tasks')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', taskId)

    // 2. Add XP and handle Level ups
    const { data: profile } = await supabase.from('student_profiles')
        .select('current_xp, current_level')
        .eq('id', user.id)
        .single()

    if (profile) {
        let newXp = (profile.current_xp || 0) + task.xp_reward
        let newLevel = profile.current_level || 1

        // Next level formula: level * 500
        while (newXp >= newLevel * 500) {
            newLevel += 1
        }

        await supabase.from('student_profiles')
            .update({ current_xp: newXp, current_level: newLevel })
            .eq('id', user.id)
    }

    revalidatePath('/client/app')
}
