import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ScatterEngine from './ScatterEngine'
import { fetchStudyDeck } from '../actions'

export default async function ScatterPage({
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
        <ScatterEngine
            deck={deck as any}
            libraryTitle={lib.title}
            libraryId={library_id}
        />
    )
}
