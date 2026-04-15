import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TrainingLibrariesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: libraries } = await supabase
        .from('card_libraries')
        .select('id, title, subject')
        .order('subject', { ascending: true })

    const { data: recentSessions } = await supabase
        .from('study_sessions')
        .select('id, cards_reviewed, xp_earned, completed_at, card_libraries(title)')
        .eq('student_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5)

    const grouped = (libraries ?? []).reduce((acc: Record<string, typeof libraries>, lib) => {
        const subject = lib!.subject ?? 'General'
        if (!acc[subject]) acc[subject] = []
        acc[subject]!.push(lib)
        return acc
    }, {})

    return (
        <div className="client-main-view">
            <header className="client-header">
                <h1>Training</h1>
                <p>Spaced repetition study sessions.</p>
            </header>

            {/* Recent Sessions */}
            {recentSessions && recentSessions.length > 0 && (
                <section className="dashboard-section" style={{ marginTop: '32px' }}>
                    <h2 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid var(--border-main)', paddingBottom: '8px' }}>
                        Recent Sessions
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {recentSessions.map((s: any) => (
                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-main)' }}>
                                <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '13px' }}>
                                    {s.card_libraries?.title ?? 'Session'}
                                </span>
                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.cards_reviewed} cards</span>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>+{s.xp_earned} XP</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', width: '80px', textAlign: 'right' }}>
                                        {new Date(s.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Library Table View */}
            <section className="dashboard-section" style={{ marginTop: '48px' }}>
                <h2 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid var(--border-main)', paddingBottom: '8px' }}>
                    Active Libraries
                </h2>

                {Object.keys(grouped).length === 0 ? (
                    <div style={{ padding: '24px 0', borderBottom: '1px solid var(--border-main)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No libraries available.</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Empty</span>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {Object.entries(grouped).map(([subject, libs]) => (
                            <div key={subject} style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', padding: '8px 0', borderBottom: '1px solid var(--border-main)' }}>
                                    {subject}
                                </div>
                                {(libs ?? []).map((lib: any) => (
                                    <div key={lib.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-main)' }}>
                                        <h3 style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)', fontSize: '13px' }}>
                                            {lib.title}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <Link href={`/client/study?library_id=${lib.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'underline', textDecorationColor: 'var(--border-main)', textUnderlineOffset: '2px', fontWeight: 500, fontSize: '12px' }}>Flashcards</Link>
                                            <Link href={`/client/study/match?library_id=${lib.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'underline', textDecorationColor: 'var(--border-main)', textUnderlineOffset: '2px', fontWeight: 500, fontSize: '12px' }}>Match</Link>
                                            <Link href={`/client/study/speller?library_id=${lib.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'underline', textDecorationColor: 'var(--border-main)', textUnderlineOffset: '2px', fontWeight: 500, fontSize: '12px' }}>Speller</Link>
                                            <Link href={`/client/study/scatter?library_id=${lib.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'underline', textDecorationColor: 'var(--border-main)', textUnderlineOffset: '2px', fontWeight: 500, fontSize: '12px' }}>Scatter</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
