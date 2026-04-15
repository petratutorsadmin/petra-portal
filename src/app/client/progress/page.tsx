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
    
    for (let i = 0; i < masteredCards.length; i++) {
        for (let j = i + 1; j < masteredCards.length; j++) {
            if (masteredCards[i].cards?.library_id === masteredCards[j].cards?.library_id) {
                graphData.links.push({ source: masteredCards[i].card_id, target: masteredCards[j].card_id })
            }
        }
    }

    const level = profile?.current_level ?? 1
    const xp = profile?.current_xp ?? 0
    
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

    return (
        <div className="client-main-view">
            <header className="client-header flex-between" style={{ alignItems: 'flex-end', paddingBottom: '16px', borderBottom: '1px solid var(--border-main)' }}>
                <div>
                    <h1>Progress</h1>
                    <p>KPI analysis and mastery arc tracking.</p>
                </div>
            </header>

            {/* KPI Row - High Density Linear Style */}
            <div className="responsive-grid-4" style={{ borderBottom: '1px solid var(--border-main)' }}>
                <div style={{ flex: 1, padding: '16px 0', borderRight: '1px solid var(--border-main)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Level</div>
                    <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{level}</div>
                </div>
                <div style={{ flex: 1, padding: '16px 16px', borderRight: '1px solid var(--border-main)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total XP</div>
                    <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{xp.toLocaleString()}</div>
                </div>
                <div style={{ flex: 1, padding: '16px 16px', borderRight: '1px solid var(--border-main)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cards Studied</div>
                    <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{totalCardsReviewed}</div>
                </div>
                <div style={{ flex: 1, padding: '16px 16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tasks Done</div>
                    <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{totalTasksCompleted}</div>
                </div>
            </div>

            {/* Remove big ProgressStats since we embedded them above */}

            <section className="dashboard-section desktop-only" style={{ marginTop: '48px' }}>
                <h2 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                    Knowledge Topology
                </h2>
                <div style={{ border: '1px solid var(--border-main)', background: 'var(--bg-workspace)', borderRadius: '4px', overflow: 'hidden' }}>
                    <WordGraphWrapper data={graphData} />
                </div>
            </section>

            <div className="responsive-split-2" style={{ marginTop: '48px' }}>
                {/* Left Column: Skill Mastery & Study Sessions */}
                <div style={{ flex: 1 }}>
                    <section className="dashboard-section" style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid var(--border-main)', paddingBottom: '8px' }}>
                            Skill Mastery Metrics
                        </h2>
                        <SkillMastery sortedSkills={sortedSkills} maxSkillVal={maxSkillVal} />
                    </section>

                    {(sessions ?? []).length > 0 && (
                        <section className="dashboard-section">
                            <h2 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid var(--border-main)', paddingBottom: '8px' }}>
                                Session Log
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {sessions!.map((s: any, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-main)' }}>
                                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                                            {s.card_libraries?.title ?? 'Session'}
                                        </span>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(s.completed_at).toLocaleDateString()}</span>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>+{s.xp_earned} XP</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Column: Lesson Debriefs */}
                <div style={{ flex: 1 }}>
                    {(reports ?? []).length > 0 && (
                        <section className="dashboard-section">
                            <h2 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid var(--border-main)', paddingBottom: '8px' }}>
                                Tutor Debriefs
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {reports!.map((r: any, i) => {
                                    const lesson = r.lessons as any
                                    return (
                                        <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid var(--border-main)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{lesson?.subject_program ?? '—'}</span>
                                                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                                    {lesson?.date_time ? new Date(lesson.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                                                </span>
                                            </div>
                                            {r.student_visible_comments && (
                                                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                                    "{r.student_visible_comments}"
                                                </p>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )}
                </div>
            </div>

        </div>
    )
}
