import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import SpellerEngine from './SpellerEngine'
import { fetchStudyDeck } from '../actions'

export default async function SpellerPage({
    searchParams,
}: {
    searchParams: Promise<{ library_id?: string }>
}) {
    const { library_id } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    if (!library_id) {
        notFound()
    }

    const { data: lib } = await supabase
        .from('card_libraries')
        .select('title')
        .eq('id', library_id)
        .single()
    
    if (!lib) notFound()

    const deck = await fetchStudyDeck(library_id)

    return (
        <SpellerEngine
            deck={deck as any}
            libraryTitle={lib.title}
            libraryId={library_id}
        />
    )
}
