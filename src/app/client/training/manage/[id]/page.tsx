import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import CardEditorClient from './CardEditorClient'

// Note: In Next.js app router, server actions can be imported into client components.
// We proxy the add logic here.
import { addPersonalCard as serverAddCard } from '../actions'

export default async function CardDesignerPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id: libraryId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: library, error: libError } = await supabase
        .from('card_libraries')
        .select('*')
        .eq('id', libraryId)
        .eq('created_by', user?.id)
        .single()

    if (libError || !library) {
        redirect('/client/training/manage')
    }

    const { data: cards } = await supabase
        .from('cards')
        .select('*')
        .eq('library_id', libraryId)
        .order('created_at', { ascending: false })

    async function handleAddCard(formData: FormData) {
        'use server'
        await serverAddCard(formData)
        revalidatePath(`/client/training/manage/${libraryId}`)
    }

    return (
        <CardEditorClient 
            libraryTitle={library.title} 
            libraryId={libraryId} 
            cards={cards || []} 
            onAddCard={handleAddCard}
        />
    )
}
