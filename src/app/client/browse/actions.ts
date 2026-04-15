'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createCalendarEvent } from '@/utils/google-calendar'

export async function requestMatch(tutorId: string, tutorName: string, subjectProgram: string, formData?: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    // Ensure student_profile exists to satisfy foreign key constraint before match request
    await supabase.from('student_profiles').upsert({ id: user.id }, { onConflict: 'id' })

    // 1. Create a Match Request
    const { error: matchError } = await supabase
        .from('match_requests')
        .insert({
            student_id: user.id,
            preferred_tutor_id: tutorId,
            request_text: `Interested in ${subjectProgram}`,
            status: 'pending' // Admin needs to approve
        })

    if (matchError) {
        console.error('Failed to request match:', matchError)
        throw new Error(matchError.message)
    }

    // 2. Fetch User Profile to get their name for the calendar placeholder
    const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single()

    let studentName = 'Student'
    if (profile) studentName = `${profile.first_name} ${profile.last_name}`

    // 3. (Optional) Create a "Placeholder" Trial event on Google Calendar 
    // Normally this happens ONLY when Admin approves, but we can do it here to test the sync!
    // We'll set it 7 days from now as a hypothetical trial.
    const trialDate = new Date()
    trialDate.setDate(trialDate.getDate() + 7)

    let calendarLink = null
    try {
        const calendarRes = await createCalendarEvent({
            title: `Trial Lesson: ${subjectProgram}`,
            description: `Automated Request from Petra Portal. Match is pending Admin Approval.`,
            startTime: trialDate.toISOString(),
            durationMinutes: 60,
            tutorName: tutorName,
            studentName: studentName,
            userId: user.id
        })
        
        if (calendarRes.success) {
            calendarLink = calendarRes.link
        } else {
            console.error('Calendar Sync Error:', calendarRes.error)
        }
    } catch (err) {
        console.error('Ignoring Calendar Sync error on Request Match:', err)
    }

    revalidatePath('/client/browse')
    revalidatePath('/client')

    return { 
        success: true, 
        message: calendarLink 
            ? `Match requested and synced to calendar! Check your Google Calendar.` 
            : `Match requested! (Admin will review. Note: Google Calendar sync skipped due to missing credentials)`
    }
}
