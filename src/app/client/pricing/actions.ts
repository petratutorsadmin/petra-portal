'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { calculateClientPrice } from '@/utils/pricing-engine'

export type RequestType =
    | 'format_change'
    | 'frequency_change'
    | 'lesson_length_change'
    | 'tutor_change'
    | 'add_subject'
    | 'pause'
    | 'resume'
    | 'add_sibling'
    | 'other'

// Simple requests where we can auto-calculate the new price
const SIMPLE_CHANGE_TYPES: RequestType[] = [
    'format_change',
    'frequency_change',
    'lesson_length_change',
]

export async function submitPlanChangeRequest(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const requestType = formData.get('request_type') as RequestType
    const currentValue = formData.get('current_value') as string
    const requestedValue = formData.get('requested_value') as string
    const notes = formData.get('notes') as string

    // Attempt to calculate a price delta for simple changes
    let currentMonthlyJpy: number | null = null
    let projectedMonthlyJpy: number | null = null

    // Fetch the student's current plan data for price preview
    const { data: match } = await supabase
        .from('matches')
        .select(`
            id,
            student_profiles!matches_student_id_fkey(assigned_plan),
            lessons(duration_minutes, delivery_type)
        `)
        .eq('student_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()

    if (match && SIMPLE_CHANGE_TYPES.includes(requestType)) {
        // Attempt to build a price preview using the pricing engine
        try {
            const recentLesson = (match.lessons as any[])?.[0]
            const currentMinutes = recentLesson?.duration_minutes ?? 60
            const currentDelivery = recentLesson?.delivery_type ?? 'online'
            const assignedPlan = (match.student_profiles as any)?.assigned_plan ?? 'M1'

            // Current price
            const currentCalc = calculateClientPrice({
                programCode: 'P2', // Use a sensible default
                lessonMinutes: currentMinutes,
                lessonsPerWeek: 1,
                planCode: assignedPlan,
                deliveryCode: currentDelivery,
                studentTypeCode: 'junior_high',
                marketRegion: 'Japan Baseline',
                groupSize: 1,
            })
            currentMonthlyJpy = currentCalc.clientMonthlyJpy

            // Project the changed price
            let newMinutes = currentMinutes
            let newDelivery = currentDelivery
            let newFrequency = 1

            if (requestType === 'lesson_length_change') newMinutes = parseInt(requestedValue) || currentMinutes
            if (requestType === 'format_change') newDelivery = requestedValue
            if (requestType === 'frequency_change') newFrequency = parseInt(requestedValue) || 1

            const projectedCalc = calculateClientPrice({
                programCode: 'P2',
                lessonMinutes: newMinutes,
                lessonsPerWeek: newFrequency,
                planCode: assignedPlan,
                deliveryCode: newDelivery,
                studentTypeCode: 'junior_high',
                marketRegion: 'Japan Baseline',
                groupSize: 1,
            })
            projectedMonthlyJpy = projectedCalc.clientMonthlyJpy
        } catch {
            // Non-critical — price preview unavailable
        }
    }

    const { error } = await supabase.from('plan_change_requests').insert({
        student_id: user.id,
        request_type: requestType,
        current_value: currentValue || null,
        requested_value: requestedValue || null,
        notes: notes || null,
        current_monthly_jpy: currentMonthlyJpy,
        projected_monthly_jpy: projectedMonthlyJpy,
        status: 'pending',
    })

    if (error) {
        console.error('Plan change request error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/client/pricing')
    return { success: true }
}

export async function cancelPlanChangeRequest(requestId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false }

    await supabase.from('plan_change_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .eq('student_id', user.id)
        .eq('status', 'pending')

    revalidatePath('/client/pricing')
    return { success: true }
}

// Admin action: approve or decline a request
export async function reviewPlanChangeRequest(
    requestId: string,
    decision: 'approved' | 'declined',
    adminNotes: string,
    effectiveDate?: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false }

    await supabase.from('plan_change_requests')
        .update({
            status: decision,
            reviewed_by: user.id,
            admin_notes: adminNotes || null,
            effective_date: effectiveDate || null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)

    revalidatePath('/client/pricing')
    revalidatePath('/admin/plan-requests')
    return { success: true }
}
