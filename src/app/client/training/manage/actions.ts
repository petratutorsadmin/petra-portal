'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPersonalLibrary(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const title = formData.get('title') as string
    const subject = formData.get('subject') as string

    const { error } = await supabase
        .from('card_libraries')
        .insert({
            title,
            subject,
            created_by: user.id
        })

    if (error) {
        console.error('Error creating library:', error)
        return
    }

    revalidatePath('/client/training/manage')
}

export async function addPersonalCard(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const libraryId = formData.get('library_id') as string
    const front = formData.get('front_content') as string
    const back = formData.get('back_content') as string
    const hint = formData.get('hint') as string

    // 1. Insert the card
    const { data: card, error: cardError } = await supabase
        .from('cards')
        .insert({
            library_id: libraryId,
            front_content: front,
            back_content: back,
            hint: hint || null
        })
        .select()
        .single()

    if (cardError) {
        console.error('Error adding card:', cardError)
        return
    }

    // 2. Initialize SREP performance entry for the user
    if (card) {
        await supabase
            .from('student_card_performance')
            .insert({
                student_id: user.id,
                card_id: card.id
            })
    }

    revalidatePath('/client/training/manage')
    revalidatePath(`/client/training/manage/${libraryId}`)
}

export async function deletePersonalLibrary(libraryId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
        .from('card_libraries')
        .delete()
        .eq('id', libraryId)
        .eq('created_by', user.id)

    if (error) {
        console.error('Error deleting library:', error)
        return
    }

    revalidatePath('/client/training/manage')
}
