'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function calculateAndLogPayout(formData: FormData) {
    const supabase = await createClient()

    const tutorId = formData.get('tutor_id') as string
    const startDate = formData.get('start_date') as string
    const endDate = formData.get('end_date') as string
    const notes = formData.get('notes') as string

    // 1. Fetch all completed lessons for this tutor in the range
    const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('tutor_pay_per_lesson')
        .eq('tutor_id', tutorId)
        .eq('status', 'completed')
        .gte('date_time', `${startDate}T00:00:00Z`)
        .lte('date_time', `${endDate}T23:59:59Z`)

    if (lessonsError) {
        redirect(`/admin/invoices/payouts?error=${encodeURIComponent(lessonsError.message)}`)
    }

    if (!lessons || lessons.length === 0) {
        redirect(`/admin/invoices/payouts?error=No+completed+lessons+found+for+this+tutor+in+this+period`)
    }

    // 2. Sum up the pay
    const totalAmount = lessons.reduce((sum, lesson) => sum + (Number(lesson.tutor_pay_per_lesson) || 0), 0)

    if (totalAmount <= 0) {
        redirect(`/admin/invoices/payouts?error=Calculated+amount+is+zero`)
    }

    // 3. Create payout record
    const { error: payoutError } = await supabase.from('payouts').insert({
        tutor_id: tutorId,
        amount: totalAmount,
        currency_code: 'JPY',
        status: 'pending',
        period_start: startDate,
        period_end: endDate,
        notes: notes || null,
    })

    if (payoutError) {
        redirect(`/admin/invoices/payouts?error=${encodeURIComponent(payoutError.message)}`)
    }

    revalidatePath('/admin/invoices/payouts')
    redirect(`/admin/invoices/payouts?success=Payout+of+¥${totalAmount.toLocaleString()}+logged+successfully`)
}
