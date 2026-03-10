'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createLesson(formData: FormData) {
    const supabase = await createClient()

    const matchId = formData.get('match_id') as string
    const programId = formData.get('program_id') as string
    const dateTime = formData.get('date_time') as string
    const durationMinutes = parseInt(formData.get('duration_minutes') as string)
    const deliveryType = formData.get('delivery_type') as string
    const notes = formData.get('notes') as string

    // 1. Fetch match details to get student and tutor IDs
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('student_id, tutor_id')
        .eq('id', matchId)
        .single()

    if (matchError || !match) {
        redirect('/admin/calendar/new?error=Match+not+found')
    }

    // 2. Check for locked enrollment (payment check)
    const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select('id, locked')
        .eq('student_id', match.student_id)
        .eq('status', 'active')
        .maybeSingle()

    if (!enrollment || !enrollment.locked) {
        redirect('/admin/calendar/new?error=Lessons+cannot+be+scheduled+until+payment+is received+and+plan+is+locked.')
    }

    // 3. Fetch the program to get the name/subject
    const { data: program } = await supabase
        .from('program_categories')
        .select('name, code')
        .eq('id', programId)
        .single()

    // 3. Fetch the active pricing quote for this student to get pay/price
    // We try to find an approved quote. If not found, we save with nulls (admin will need to wire later)
    const { data: quote } = await supabase
        .from('pricing_quotes')
        .select('id, client_price_per_lesson, tutor_pay_per_lesson')
        .eq('student_id', match.student_id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    // 4. Create the lesson
    const { error: lessonError } = await supabase.from('lessons').insert({
        student_id: match.student_id,
        tutor_id: match.tutor_id,
        date_time: new Date(dateTime).toISOString(),
        duration_minutes: durationMinutes,
        subject_program: program ? `${program.code} — ${program.name}` : 'Tutoring',
        delivery_type: deliveryType,
        status: 'scheduled',
        pricing_quote_id: quote?.id || null,
        notes: notes || null,
    })

    if (lessonError) {
        console.error('Error creating lesson:', lessonError)
        redirect(`/admin/calendar/new?error=${encodeURIComponent(lessonError.message)}`)
    }

    revalidatePath('/admin/calendar')
    redirect('/admin/calendar?success=Lesson+scheduled')
}
