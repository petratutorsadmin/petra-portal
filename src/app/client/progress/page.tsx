import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import WordGraphWrapper from '@/components/WordGraphWrapper'
import ProgressStats from '@/components/ProgressStats'
import SkillMastery from '@/components/SkillMastery'

export default async function ProgressPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [
        { data: profile },
        { data: reports },
        { data: sessions },
        { data: xpHistory },
        { data: cardData },
    ] = await Promise.all([
        supabase.from('student_profiles')
            .select('current_xp, current_level')
            .eq('id', user.id)
            .single(),

        supabase.from('lesson_reports')
            .select('skill_increments, student_visible_comments, created_at, lessons(date_time, subject_program)')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20),

        supabase.from('study_sessions')
            .select('xp_earned, cards_reviewed, completed_at, card_libraries(title)')
            .eq('student_id', user.id)
            .order('completed_at', { ascending: false })
            .limit(10),

        supabase.from('student_tasks')
            .select('xp_reward, completed_at')
            .eq('student_id', user.id)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(30),

        supabase.from('student_card_performance')
            .select('card_id, cards(front_content, library_id), repetitions')
            .eq('student_id', user.id)
            .gt('repetitions', 0)
            .limit(40),
    ])

    const masteredCards = (cardData as any) ?? []
    const graphData = {
        nodes: masteredCards.map((c: any) => ({
            id: c.card_id,
            label: c.cards?.front_content || '?',
            val: c.repetitions
        })),
        links: [] as any[]
    }
    // Simple links: cards in same library
    for (let i = 0; i < masteredCards.length; i++) {
        for (let j = i + 1; j < masteredCards.length; j++) {
            if (masteredCards[i].cards?.library_id === masteredCards[j].cards?.library_id) {
                graphData.links.push({ source: masteredCards[i].card_id, target: masteredCards[j].card_id })
            }
        }
    }

    const level = profile?.current_level ?? 1
    const xp = profile?.current_xp ?? 0
    const xpPerLevel = 500
    const xpIntoLevel = xp % xpPerLevel
    const xpProgress = Math.round((xpIntoLevel / xpPerLevel) * 100)

    // Aggregate all skill increments across reports
    const skillTotals: Record<string, number> = {}
    for (const r of reports ?? []) {
        if (r.skill_increments && typeof r.skill_increments === 'object') {
            for (const [skill, val] of Object.entries(r.skill_increments)) {
                skillTotals[skill] = (skillTotals[skill] ?? 0) + Number(val)
            }
        }
    }
    const sortedSkills = Object.entries(skillTotals)
        .filter(([_, v]) => v !== 0)
        .sort((a, b) => b[1] - a[1])

    const maxSkillVal = Math.max(...sortedSkills.map(([_, v]) => v), 1)

    const totalStudySessions = (sessions ?? []).length
    const totalCardsReviewed = (sessions ?? []).reduce((s: number, r: any) => s + (r.cards_reviewed ?? 0), 0)
    const totalTasksCompleted = (xpHistory ?? []).length
    const totalXpFromTasks = (xpHistory ?? []).reduce((s: number, r: any) => s + (r.xp_reward ?? 0), 0)

    return (
        <div className="progress-page">
            <header className="progress-header">
                <h1>Progress</h1>
                <p>Your mastery arc — skills, XP, and study history.</p>
            </header>

            {/* Level & XP */}
            <section className="progress-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.25rem' }}>LEVEL</p>
                        <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1 }}>{level}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.25rem' }}>TOTAL XP</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8b5cf6', margin: 0 }}>{xp.toLocaleString()}</p>
                    </div>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${xpProgress}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)', borderRadius: '9999px', transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{xpIntoLevel} XP</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{xpPerLevel} XP to Level {level + 1}</span>
                </div>
            </section>

            {/* Stats Row */}
            <ProgressStats stats={[
                { label: 'Lessons', value: reports?.length ?? 0 },
                { label: 'Study Sessions', value: totalStudySessions },
                { label: 'Cards Reviewed', value: totalCardsReviewed },
                { label: 'Tasks Done', value: totalTasksCompleted },
            ]} />

            {/* Knowledge Graph - Desktop Only */}
            <section className="desktop-only" style={{ marginBottom: '1.5rem' }}>
                <WordGraphWrapper data={graphData} />
            </section>

            {/* Skill Mastery */}
            <SkillMastery sortedSkills={sortedSkills} maxSkillVal={maxSkillVal} />

            {/* Recent Study Sessions */}
            {(sessions ?? []).length > 0 && (
                <section className="progress-card" style={{ marginBottom: '1.5rem' }}>
                    <h2 className="progress-section-title">Study Sessions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {sessions!.map((s: any, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                                        {s.card_libraries?.title ?? 'Session'}
                                    </p>
                                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                                        {new Date(s.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {s.cards_reviewed} cards
                                    </p>
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#8b5cf6' }}>+{s.xp_earned} XP</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Lesson Debriefs */}
            {(reports ?? []).length > 0 && (
                <section className="progress-card">
                    <h2 className="progress-section-title">Lesson History</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {reports!.map((r: any, i) => {
                            const lesson = r.lessons as any
                            return (
                                <div key={i} style={{ borderLeft: '3px solid #e2e8f0', paddingLeft: '1rem' }}>
                                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                                        {lesson?.subject_program ?? '—'} · {lesson?.date_time ? new Date(lesson.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                                    </p>
                                    {r.student_visible_comments && (
                                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#0f172a', lineHeight: 1.5, fontStyle: 'italic' }}>
                                            "{r.student_visible_comments}"
                                        </p>
                                    )}
                                    {r.skill_increments && Object.entries(r.skill_increments).filter(([_, v]) => Number(v) !== 0).length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                            {Object.entries(r.skill_increments).filter(([_, v]) => Number(v) !== 0).map(([skill, val]) => (
                                                <span key={skill} style={{
                                                    padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                                                    background: Number(val) > 0 ? '#d1fae5' : '#fee2e2',
                                                    color: Number(val) > 0 ? '#065f46' : '#991b1b'
                                                }}>
                                                    {skill} {Number(val) > 0 ? '+' : ''}{Number(val)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {(reports ?? []).length === 0 && (sessions ?? []).length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
                    <p style={{ fontWeight: 600, margin: '0 0 0.5rem' }}>No progress data yet.</p>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>Complete lessons and study sessions to see your mastery arc here.</p>
                    <Link href="/client/training" style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: '#0f172a', color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                        Start Training →
                    </Link>
                </div>
            )}
        </div>
    )
}
