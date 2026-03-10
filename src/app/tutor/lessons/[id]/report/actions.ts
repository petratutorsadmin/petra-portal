'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitReport(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const lesson_id = formData.get('lesson_id') as string
    const student_id = formData.get('student_id') as string
    const topics_covered = formData.get('topics_covered') as string
    const student_visible_comments = formData.get('student_visible_comments') as string
    const admin_only_notes = formData.get('admin_only_notes') as string
    const student_engagement_rating = parseInt(formData.get('student_engagement_rating') as string) || 3
    const task_description = formData.get('task_description') as string

    // 1. Insert Lesson Report
    const { error: reportError } = await supabase
        .from('lesson_reports')
        .insert({
            lesson_id,
            tutor_id: user.id,
            topics_covered,
            student_visible_comments,
            admin_only_notes,
            student_engagement_rating
        })

    if (reportError) {
        console.error('Error submitting report:', reportError)
        // Normally handle error state, for scaffolding just redirect
        redirect(`/tutor/lessons/${lesson_id}/report?error=submission_failed`)
    }

    // 2. Assign Homework if provided
    if (task_description && task_description.trim() !== '') {
        await supabase.from('homework_items').insert({
            lesson_id,
            student_id,
            task_description,
            status: 'assigned'
        })
    }

    // 3. Update Lesson Status to 'completed'
    await supabase.from('lessons')
        .update({ status: 'completed' })
        .eq('id', lesson_id)

    revalidatePath('/tutor/lessons')
    revalidatePath('/tutor')
    redirect('/tutor/lessons')
}
