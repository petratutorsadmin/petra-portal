// ContextPanel — Server Component
// Renders the persistent right-side panel in the OS layout (desktop/iPad landscape only)
// Shown via CSS — hidden below 1024px with media query in client.css
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
        { data: recentTask },
    ] = await Promise.all([
        // Next upcoming lesson
        supabase.from('lessons')
            .select('date_time, subject_program, profiles!lessons_tutor_id_fkey(first_name)')
            .eq('student_id', userId)
            .eq('status', 'scheduled')
            .gte('date_time', now)
            .order('date_time', { ascending: true })
            .limit(1)
            .maybeSingle(),

        // Count of due flashcards
        supabase.from('student_card_performance')
            .select('id', { count: 'exact', head: true })
            .eq('student_id', userId)
            .lte('next_review_date', now),

        // Today's XP from study sessions
        supabase.from('study_sessions')
            .select('xp_earned, cards_reviewed')
            .eq('student_id', userId)
            .gte('completed_at', todayStart.toISOString()),

        // Most recently completed task
        supabase.from('student_tasks')
            .select('title, completed_at')
            .eq('student_id', userId)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
    ])

    const tutor = nextLesson?.profiles as any
    const todayXp = (todaySessions ?? []).reduce((sum, s) => sum + (s.xp_earned ?? 0), 0)
    const todayCards = (todaySessions ?? []).reduce((sum, s) => sum + (s.cards_reviewed ?? 0), 0)
    const dueCardCount = dueCardCountResponse ?? 0

    const formatLessonDate = (dt: string) => {
        const d = new Date(dt)
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)

        const isToday = d.toDateString() === today.toDateString()
        const isTomorrow = d.toDateString() === tomorrow.toDateString()
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        if (isToday) return `Today · ${timeStr}`
        if (isTomorrow) return `Tomorrow · ${timeStr}`
        return `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${timeStr}`
    }

    return (
        <aside className="context-panel">
            <p className="context-panel-header">SYSTEM STATUS</p>

            {/* Next Lesson */}
            <div className="context-card">
                <p className="context-label">NEXT LESSON</p>
                {nextLesson ? (
                    <>
                        <p className="context-value">{formatLessonDate(nextLesson.date_time)}</p>
                        <p className="context-sub">{nextLesson.subject_program}{tutor?.first_name ? ` · ${tutor.first_name}` : ''}</p>
                    </>
                ) : (
                    <p className="context-sub" style={{ color: '#94a3b8' }}>No upcoming lessons</p>
                )}
            </div>

            {/* Today's Activity */}
            <div className="context-card">
                <p className="context-label">TODAY</p>
                {todayXp > 0 ? (
                    <>
                        <p className="context-value" style={{ color: '#8b5cf6' }}>+{todayXp} XP</p>
                        <p className="context-sub">{todayCards} cards reviewed</p>
                    </>
                ) : (
                    <p className="context-sub" style={{ color: '#94a3b8' }}>No activity yet</p>
                )}
            </div>

            {/* Due Cards */}
            <div className="context-card">
                <p className="context-label">TRAINING</p>
                {dueCardCount > 0 ? (
                    <>
                        <p className="context-value">{dueCardCount} card{dueCardCount !== 1 ? 's' : ''} due</p>
                        <Link href="/client/training" className="context-action">Start Review →</Link>
                    </>
                ) : (
                    <p className="context-sub" style={{ color: '#10b981' }}>All caught up ✓</p>
                )}
            </div>

            {/* Recent Completion */}
            {recentTask && (
                <div className="context-card">
                    <p className="context-label">LAST COMPLETED</p>
                    <p className="context-sub" style={{ color: '#0f172a', fontWeight: 600 }}>{recentTask.title}</p>
                    {recentTask.completed_at && (
                        <p className="context-sub" style={{ fontSize: '0.75rem' }}>
                            {new Date(recentTask.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                    )}
                </div>
            )}
        </aside>
    )
}
