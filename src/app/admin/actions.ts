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
