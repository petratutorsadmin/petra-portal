import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TrainingLibrariesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch all available card libraries
    const { data: libraries } = await supabase
        .from('card_libraries')
        .select('id, title, subject')
        .order('subject', { ascending: true })

    // Fetch student's recent study sessions
    const { data: recentSessions } = await supabase
        .from('study_sessions')
        .select('id, cards_reviewed, xp_earned, completed_at, card_libraries(title)')
        .eq('student_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5)

    // Group libraries by subject
    const grouped = (libraries ?? []).reduce((acc: Record<string, typeof libraries>, lib) => {
        const subject = lib!.subject ?? 'General'
        if (!acc[subject]) acc[subject] = []
        acc[subject]!.push(lib)
        return acc
    }, {})

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1.5rem 1rem 5rem 1rem' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                    Training
                </h1>
                <p style={{ color: '#64748b', margin: 0 }}>
                    Spaced repetition study sessions. Select a library to begin.
                </p>
            </header>

            {/* Recent Sessions */}
            {recentSessions && recentSessions.length > 0 && (
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                        Recent Sessions
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {recentSessions.map((s: any) => (
                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.9rem' }}>
                                    {s.card_libraries?.title ?? 'Session'}
                                </span>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.cards_reviewed} cards</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6' }}>+{s.xp_earned} XP</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        {new Date(s.completed_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Library Browser */}
            {Object.keys(grouped).length === 0 ? (
                <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', margin: 0 }}>No card libraries available yet.</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
                        Ask your tutor to assign a study session, or contact Petra Admin.
                    </p>
                </div>
            ) : (
                Object.entries(grouped).map(([subject, libs]) => (
                    <section key={subject} style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                            {subject}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {(libs ?? []).map((lib: any) => (
                                <Link
                                    key={lib.id}
                                    href={`/client/study?library_id=${lib.id}`}
                                    style={{
                                        display: 'block',
                                        padding: '1.25rem',
                                        background: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        textDecoration: 'none',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                        transition: 'box-shadow 0.2s, border-color 0.2s',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '1rem', lineHeight: 1.3 }}>
                                            {lib.title}
                                        </h3>
                                        <span style={{ fontSize: '1.25rem', marginLeft: '0.5rem' }}>▶</span>
                                    </div>
                                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', fontWeight: 600, color: '#8b5cf6' }}>
                                        Start Session
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))
            )}
        </div>
    )
}
