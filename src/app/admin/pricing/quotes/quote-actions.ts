'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
    calculateAdminPricing,
    PROGRAM_BASE_PRICES,
    type AdminPricingInputs,
} from '@/utils/pricing-engine'

export async function saveQuote(formData: FormData) {
    const supabase = await createClient()

    const programId = formData.get('program_id') as string
    const studentId = formData.get('student_id') as string
    const tutorId = formData.get('tutor_id') as string || null
    const lessonMinutes = parseInt(formData.get('lesson_length_minutes') as string)
    const lessonsPerWeek = parseInt(formData.get('lessons_per_week') as string)
    const planCode = formData.get('plan_code') as string
    const deliveryCode = formData.get('delivery_code') as string
    const studentTypeCode = formData.get('student_type_code') as string
    const marketRegion = formData.get('market_region') as string
    const currencyCode = formData.get('currency_code') as string
    const groupSize = parseInt(formData.get('group_size') as string)
    const tutorLevel = parseInt(formData.get('tutor_level') as string)
    const tutorPayMode = formData.get('tutor_pay_mode') as 'min' | 'standard' | 'max'

    // Fetch the program's base price
    const { data: program } = await supabase
        .from('program_categories')
        .select('code, base_price_jpy')
        .eq('id', programId)
        .single()

    if (!program) redirect('/admin/pricing/quotes?error=Program+not+found')

    // Get exchange rate for the chosen currency
    const { data: currency } = await supabase
        .from('currencies')
        .select('exchange_rate')
        .eq('code', currencyCode)
        .single()

    // Override the in-memory map's base price with the one from DB
    const tempPrograms = { ...PROGRAM_BASE_PRICES }
    tempPrograms[program.code] = { ...tempPrograms[program.code], basePrice: Number(program.base_price_jpy) }

    const inputs: AdminPricingInputs = {
        programCode: program.code,
        lessonMinutes,
        lessonsPerWeek,
        planCode,
        deliveryCode,
        studentTypeCode,
        marketRegion,
        groupSize,
        currencyCode,
        exchangeRate: currency?.exchange_rate ? Number(currency.exchange_rate) : 1.0,
        tutorLevel,
        tutorPayMode,
    }

    const result = calculateAdminPricing(inputs)

    const { error } = await supabase.from('pricing_quotes').insert({
        student_id: studentId,
        tutor_id: tutorId,
        program_id: programId,
        lesson_length_minutes: lessonMinutes,
        lessons_per_week: lessonsPerWeek,
        plan_code: planCode,
        delivery_code: deliveryCode,
        student_type_code: studentTypeCode,
        market_region: marketRegion,
        currency_code: currencyCode,
        group_size: groupSize,
        client_price_per_lesson: result.clientPricePerLessonJpy,
        tutor_pay_per_lesson: result.tutorPayPerLessonJpy,
        petra_margin_per_lesson: result.petraMarginPerLessonJpy,
        // Legacy columns
        student_price: result.clientPricePerLessonJpy,
        tutor_pay: result.tutorPayPerLessonJpy,
        petra_margin: result.petraMarginPerLessonJpy,
        status: 'draft',
    })

    if (error) redirect(`/admin/pricing/quotes?error=${encodeURIComponent('Failed: ' + error.message)}`)

    revalidatePath('/admin/pricing/quotes')
    redirect('/admin/pricing/quotes?success=Quote+saved+successfully')
}

export async function approveQuoteAndCreateInvoice(formData: FormData) {
    const supabase = await createClient()
    const quoteId = formData.get('quote_id') as string

    // Fetch the quote
    const { data: quote } = await supabase
        .from('pricing_quotes')
        .select('*')
        .eq('id', quoteId)
        .single()

    if (!quote) redirect('/admin/pricing/quotes?error=Quote+not+found')

    // Approve the quote
    await supabase.from('pricing_quotes')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', quoteId)

    // Auto-create an invoice for one month
    const monthlyAmount = (quote.client_price_per_lesson ?? 0) * (quote.lessons_per_week ?? 1) * 4
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14) // Due in 2 weeks

    await supabase.from('invoices').insert({
        student_id: quote.student_id,
        pricing_quote_id: quoteId,
        amount: monthlyAmount,
        status: 'unpaid',
        due_date: dueDate.toISOString().split('T')[0],
        notes: `Auto-generated from approved quote — ${quote.plan_code} plan`,
    })

    revalidatePath('/admin/pricing/quotes')
    revalidatePath('/admin/invoices')
    redirect('/admin/pricing/quotes?success=Quote+approved+and+invoice+created')
}
