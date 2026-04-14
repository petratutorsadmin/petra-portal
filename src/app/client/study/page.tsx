import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import StudyEngine from './StudyEngine'
import { fetchStudyDeck } from './actions'

export default async function StudyPage({
    searchParams,
}: {
    searchParams: Promise<{ task_id?: string; library_id?: string }>
}) {
    const { task_id, library_id } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    let resolvedLibraryId: string | null = library_id ?? null
    let libraryTitle = 'Training Session'
    let taskId: string | null = task_id ?? null

    // If a task_id is provided, resolve the linked library from it
    if (task_id && !library_id) {
        const { data: task } = await supabase
            .from('student_tasks')
            .select('linked_library_id, title')
            .eq('id', task_id)
            .eq('student_id', user.id)
            .single()

        if (!task) notFound()
        resolvedLibraryId = task.linked_library_id ?? null
        libraryTitle = task.title
    }

    // If a library_id is known, fetch its title
    if (resolvedLibraryId && !task_id) {
        const { data: lib } = await supabase
            .from('card_libraries')
            .select('title')
            .eq('id', resolvedLibraryId)
            .single()
        if (lib) libraryTitle = lib.title
    }

    if (!resolvedLibraryId) {
        notFound()
    }

    const deck = await fetchStudyDeck(resolvedLibraryId)

    return (
        <StudyEngine
            deck={deck as any}
            libraryTitle={libraryTitle}
            libraryId={resolvedLibraryId}
            taskId={taskId}
        />
    )
}
