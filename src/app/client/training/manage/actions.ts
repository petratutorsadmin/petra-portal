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

export async function quickAddCard({ front, back, hint }: { front: string, back: string, hint?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    // Find or create 'Quick Captures' library
    let { data: library } = await supabase
        .from('card_libraries')
        .select('id')
        .eq('created_by', user.id)
        .eq('title', 'Quick Captures')
        .single()

    if (!library) {
        const { data: newLib, error: createErr } = await supabase
            .from('card_libraries')
            .insert({
                title: 'Quick Captures',
                subject: 'Uncategorized',
                created_by: user.id
            })
            .select('id')
            .single()
            
        if (createErr) return { success: false, error: 'Failed to create system library' }
        library = newLib
    }

    if (!library) return { success: false, error: 'Failed to find library' }

    // Insert card
    const { data: card, error: cardError } = await supabase
        .from('cards')
        .insert({
            library_id: library.id,
            front_content: front,
            back_content: back,
            hint: hint || null
        })
        .select('id')
        .single()

    if (cardError) return { success: false, error: 'Failed to insert card' }

    // Initialize SREP
    if (card) {
        await supabase
            .from('student_card_performance')
            .insert({
                student_id: user.id,
                card_id: card.id
            })
    }

    revalidatePath('/client')
    return { success: true }
}
