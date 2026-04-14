'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface TaskPayload {
    title: string;
    type: 'standard' | 'study_session';
    libraryId?: string;
}

export interface StructuredReportPayload {
    lesson_id: string;
    student_id: string;
    core_feedback: string;
    skills: Record<string, number>;
    bonus_xp: number;
    tasks: TaskPayload[];
}

export async function submitStructuredReport(payload: StructuredReportPayload) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { lesson_id, student_id, core_feedback, skills, bonus_xp, tasks } = payload

    // 1. Insert Lesson Report
    const { error: reportError } = await supabase
        .from('lesson_reports')
        .insert({
            lesson_id,
            tutor_id: user.id,
            student_visible_comments: core_feedback,
            skill_increments: skills,
            xp_awarded: bonus_xp
        })

    if (reportError) {
        console.error('Error submitting report:', reportError)
        return { success: false, error: reportError.message }
    }

    // 2. Assign Tasks (standard checkboxes OR study session triggers)
    if (tasks && tasks.length > 0) {
        const taskInserts = tasks.map(t => ({
            lesson_id,
            student_id,
            tutor_id: user.id,
            title: t.title,
            task_type: t.type ?? 'standard',
            linked_library_id: t.libraryId ?? null,
            xp_reward: t.type === 'study_session' ? 100 : 50,
            status: 'pending'
        }))
        const { error: taskError } = await supabase.from('student_tasks').insert(taskInserts)
        if (taskError) console.error("Task insert error:", taskError)
    }

    // 3. Update Student XP
    // Note: direct "UPDATE + X" requires an RPC. As a stopgap, we fetch current, then update.
    const { data: profile } = await supabase.from('student_profiles').select('current_xp').eq('id', student_id).single()
    if (profile) {
        const newXp = (profile.current_xp || 0) + 100 + bonus_xp // Base 100 XP + Bonus
        await supabase.from('student_profiles').update({ current_xp: newXp }).eq('id', student_id)
    }

    // 4. Update Lesson Status
    await supabase.from('lessons')
        .update({ status: 'completed' })
        .eq('id', lesson_id)

    revalidatePath('/tutor/lessons')
    revalidatePath('/tutor')
    redirect('/tutor/lessons')
}
