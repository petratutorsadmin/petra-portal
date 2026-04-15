import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function ContextPanel({ userId }: { userId: string }) {
    const supabase = await createClient()
    const now = new Date().toISOString()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [
        { data: nextLesson },
        { count: dueCardCountResponse },
        { data: todaySessions },
    ] = await Promise.all([
        supabase.from('lessons')
            .select('date_time, subject_program, profiles!lessons_tutor_id_fkey(first_name)')
            .eq('student_id', userId)
            .eq('status', 'scheduled')
            .gte('date_time', now)
            .order('date_time', { ascending: true })
            .limit(1)
            .maybeSingle(),

        supabase.from('student_card_performance')
            .select('id', { count: 'exact', head: true })
            .eq('student_id', userId)
            .lte('next_review_date', now),

        supabase.from('study_sessions')
            .select('xp_earned, cards_reviewed')
            .eq('student_id', userId)
            .gte('completed_at', todayStart.toISOString()),
    ])

    const tutor = nextLesson?.profiles as any
    const todayXp = (todaySessions ?? []).reduce((sum, s) => sum + (s.xp_earned ?? 0), 0)
    const todayCards = (todaySessions ?? []).reduce((sum, s) => sum + (s.cards_reviewed ?? 0), 0)
    const dueCardCount = dueCardCountResponse ?? 0

    const formatLessonDate = (dt: string) => {
        const d = new Date(dt)
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        return `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${timeStr}`
    }

    return (
        <aside className="context-panel">
            <p className="context-panel-header">Context</p>

            <div className="context-card">
                <p className="context-label">Status</p>
                {todayXp > 0 ? (
                    <>
                        <p className="context-value">+{todayXp} XP</p>
                        <p className="context-sub">{todayCards} cards reviewed today</p>
                    </>
                ) : (
                    <p className="context-sub">No activity today</p>
                )}
            </div>

            <div className="context-card">
                <p className="context-label">Training Queue</p>
                {dueCardCount > 0 ? (
                    <>
                        <p className="context-value">{dueCardCount} cards</p>
                        <p className="context-sub">Ready for review</p>
                        <Link href="/client/training" className="context-action">Start Session</Link>
                    </>
                ) : (
                    <p className="context-sub" style={{ color: 'var(--text-primary)' }}>Queue empty</p>
                )}
            </div>

            <div className="context-card" style={{ borderBottom: 'none' }}>
                <p className="context-label">Next Lesson</p>
                {nextLesson ? (
                    <>
                        <p className="context-value">{formatLessonDate(nextLesson.date_time)}</p>
                        <p className="context-sub">{nextLesson.subject_program}{tutor?.first_name ? ` · ${tutor.first_name}` : ''}</p>
                    </>
                ) : (
                    <p className="context-sub">No scheduled lessons</p>
                )}
            </div>
        </aside>
    )
}
