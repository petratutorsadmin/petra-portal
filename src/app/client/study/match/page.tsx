import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import MatchEngine from './MatchEngine'
import { fetchStudyDeck } from '../actions'

export default async function MatchPage({
    searchParams,
}: {
    searchParams: Promise<{ library_id?: string }>
}) {
    const { library_id } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    if (!library_id) {
        // Find default personal vault "Quick Captures" as fallback
        const { data: defaultLib } = await supabase
            .from('card_libraries')
            .select('id')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
        
        if (!defaultLib) notFound()
        redirect(`/client/study/match?library_id=${defaultLib.id}`)
    }

    const { data: lib } = await supabase
        .from('card_libraries')
        .select('title')
        .eq('id', library_id)
        .single()
    
    if (!lib) notFound()

    const deck = await fetchStudyDeck(library_id)

    return (
        <MatchEngine
            deck={deck as any}
            libraryTitle={lib.title}
            libraryId={library_id}
        />
    )
}
