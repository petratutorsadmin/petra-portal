'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function approveMatch(formData: FormData) {
    const supabase = await createClient()
    const matchId = formData.get('match_id') as string

    await supabase
        .from('matches')
        .update({ status: 'active' })
        .eq('id', matchId)

    revalidatePath('/admin')
    revalidatePath('/admin/users')
}

export async function rejectMatch(formData: FormData) {
    const supabase = await createClient()
    const matchId = formData.get('match_id') as string

    await supabase
        .from('matches')
        .update({ status: 'rejected' })
        .eq('id', matchId)

    revalidatePath('/admin')
    revalidatePath('/admin/users')
}

export async function createInvoice(formData: FormData) {
    const supabase = await createClient()

    const studentId = formData.get('student_id') as string
    const amount = parseFloat(formData.get('amount') as string)
    const dueDate = formData.get('due_date') as string
    const notes = formData.get('notes') as string

    const { error } = await supabase
        .from('invoices')
        .insert({
            student_id: studentId,
            amount,
            due_date: dueDate || null,
            notes: notes || null,
            status: 'unpaid',
        })

    if (error) {
        console.error('Error creating invoice:', error)
        redirect('/admin/invoices?error=Failed+to+create+invoice')
    }

    revalidatePath('/admin/invoices')
    redirect('/admin/invoices?success=Invoice+created')
}

export async function logPayment(formData: FormData) {
    const supabase = await createClient()
    const invoiceId = formData.get('invoice_id') as string

    await supabase
        .from('invoices')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', invoiceId)

    revalidatePath('/admin/invoices')
}

export async function updateUser(userId: string, formData: FormData) {
    const supabase = await createClient()

    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string
    const role = formData.get('role') as string
    const timezone = formData.get('timezone') as string
    const status = formData.get('status') as string

    // Update profiles
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            first_name: firstName,
            last_name: lastName,
            role: role as any,
            timezone,
            status: status as any
        })
        .eq('id', userId)

    if (profileError) throw profileError

    // Role-specific updates
    if (role === 'tutor') {
        const tutorLevel = parseInt(formData.get('tutor_level') as string)
        const tutorPayMode = formData.get('tutor_pay_mode') as string
        const university = formData.get('university') as string
        const bio = formData.get('bio') as string

        const { error: tutorError } = await supabase
            .from('tutor_profiles')
            .upsert({
                id: userId,
                tutor_level: tutorLevel,
                tutor_pay_mode: tutorPayMode,
                university,
                bio
            })

        if (tutorError) throw tutorError
    }

    revalidatePath('/admin/users')
    revalidatePath(`/admin/users/${userId}`)
    redirect('/admin/users?success=User+updated')
}
