'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateTutorProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string
    const bio = formData.get('bio') as string
    const teachingStyle = formData.get('teaching_style') as string
    const university = formData.get('university') as string
    const availabilitySummary = formData.get('general_availability_summary') as string

    // Update profiles table
    await supabase
        .from('profiles')
        .update({ first_name: firstName, last_name: lastName })
        .eq('id', user!.id)

    // Upsert tutor_profiles table
    await supabase
        .from('tutor_profiles')
        .upsert({
            id: user!.id,
            bio,
            teaching_style: teachingStyle,
            university,
            general_availability_summary: availabilitySummary,
        }, { onConflict: 'id' })

    revalidatePath('/tutor/profile')
    redirect('/tutor/profile?success=1')
}

export async function addAvailabilityRule(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const dayOfWeek = parseInt(formData.get('day_of_week') as string)
    const startTime = formData.get('start_time') as string
    const endTime = formData.get('end_time') as string

    await supabase
        .from('tutor_availability_rules')
        .insert({
            tutor_id: user!.id,
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
        })

    revalidatePath('/tutor/availability')
}

export async function removeAvailabilityRule(formData: FormData) {
    const supabase = await createClient()
    const ruleId = formData.get('rule_id') as string

    await supabase
        .from('tutor_availability_rules')
        .delete()
        .eq('id', ruleId)

    revalidatePath('/tutor/availability')
}
