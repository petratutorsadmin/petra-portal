'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
    calculateAdminPricing,
    PROGRAM_BASE_PRICES,
    getCategoryFromTopics,
    type AdminPricingInputs,
} from '@/utils/pricing-engine'

export async function saveQuote(formData: FormData) {
    const supabase = await createClient()

    const programId = formData.get('program_id') as string
    const studentId = formData.get('student_id') as string
    const tutorId = formData.get('tutor_id') as string || null
    const topicIds = formData.getAll('topics') as string[] // Added this line
    const lessonMinutes = parseInt(formData.get('lesson_length_minutes') as string)
    const lessonsPerWeek = parseInt(formData.get('lessons_per_week') as string)
    const planCode = formData.get('plan_code') as string
    const deliveryCode = formData.get('delivery_code') as string
    const studentTypeCode = formData.get('student_type_code') as string
    const marketRegion = formData.get('market_region') as string
    const currencyCode = formData.get('currency_code') as string
    const groupSize = parseInt(formData.get('group_size') as string)
    const tutorLevel = parseInt(formData.get('tutor_level') as string)
    const tutorPayMode = formData.get('tutor_pay_mode') as string // Changed type assertion

    // 1. Resolve final Program Category if topics are used
    let finalProgramId = programId
    let finalProgramCode = ''

    if (topicIds.length > 0) {
        // Fetch topic names to use the engine's mapping
        const { data: topicData } = await supabase
            .from('topics')
            .select('name')
            .in('id', topicIds)
        
        const topicNames = topicData?.map(t => t.name) || []
        const derivedCode = getCategoryFromTopics(topicNames)
        
        // Find the program_id for this code
        const { data: programData } = await supabase
            .from('program_categories')
            .select('id, code')
            .eq('code', derivedCode)
            .single()
        
        if (programData) {
            finalProgramId = programData.id
            finalProgramCode = programData.code
        } else {
            // Fallback if derived program code not found, use original programId's code
            const { data: originalProgramData } = await supabase
                .from('program_categories')
                .select('code')
                .eq('id', programId)
                .single()
            finalProgramCode = originalProgramData?.code || 'P1' // Default to P1 if nothing found
        }
    } else {
        const { data: programData } = await supabase
            .from('program_categories')
            .select('code')
            .eq('id', programId)
            .single()
        finalProgramCode = programData?.code || 'P1' // Default to P1 if nothing found
    }

    // 2. Fetch market multiplier and currency rate (currency rate is not used in calculateAdminPricing directly, but might be needed for display later)
    // The original code fetched currency, but the new calculateAdminPricing doesn't use it directly.
    // Keeping the market multiplier fetch as it's a common dependency for pricing.
    const { data: market } = await supabase.from('market_multipliers').select('multiplier').eq('region_name', marketRegion).single()
    // const { data: currency } = await supabase.from('currencies').select('exchange_rate').eq('code', currencyCode).single() // Removed as per new pricing engine inputs

    // 3. Run the pricing engine
    const pricing = calculateAdminPricing({
        programCode: finalProgramCode,
        lessonMinutes,
        lessonsPerWeek,
        planCode,
        deliveryCode,
        studentTypeCode,
        marketRegion,
        groupSize,
        currencyCode, // Added back for completeness, though engine might not use it directly
        exchangeRate: 1.0, // Placeholder, as engine might not use it directly or it's handled internally
        tutorLevel,
        tutorPayMode: tutorPayMode as 'min' | 'standard' | 'max', // Re-assert type for engine
    })

    // 4. Save the Quote
    const { data: quote, error: quoteError } = await supabase.from('pricing_quotes').insert({
        student_id: studentId,
        tutor_id: tutorId,
        program_id: finalProgramId,
        lesson_length_minutes: lessonMinutes,
        lessons_per_week: lessonsPerWeek,
        plan_code: planCode,
        delivery_code: deliveryCode,
        student_type_code: studentTypeCode,
        market_region: marketRegion,
        currency_code: currencyCode,
        group_size: groupSize,
        client_price_per_lesson: pricing.clientPricePerLessonJpy,
        tutor_pay_per_lesson: pricing.tutorPayPerLessonJpy,
        petra_margin_per_lesson: pricing.petraMarginPerLessonJpy, // Corrected column name
        // Legacy columns (kept for backward compatibility if needed, but new code uses _per_lesson)
        student_price: pricing.clientPricePerLessonJpy,
        tutor_pay: pricing.tutorPayPerLessonJpy,
        petra_margin: pricing.petraMarginPerLessonJpy,
        status: 'draft',
    }).select().single()

    if (quoteError) {
        redirect(`/admin/pricing/quotes?error=${encodeURIComponent('Failed: ' + quoteError.message)}`)
    }

    // 5. Save quote topics if any
    if (topicIds.length > 0 && quote) {
        const topicInserts = topicIds.map(tid => ({
            quote_id: quote.id,
            topic_id: tid
        }))
        const { error: topicError } = await supabase.from('pricing_quote_topics').insert(topicInserts)
        if (topicError) {
            console.error("Failed to insert quote topics:", topicError.message)
            // Optionally redirect with an error or log it
        }
    }

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
