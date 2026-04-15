import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LevelProgressBar from '@/components/LevelProgressBar'
import CheckableTaskCard from '@/components/CheckableTaskCard'
import { completeTask } from './actions'
import './student-app.css'

export default async function StudentCompanionHub() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) redirect('/login')

    const now = new Date().toISOString()

    // Run all queries in PARALLEL — was sequential (3x slower)
    const [
        { data: profile },
        { data: tasks },
        { data: nextLesson },
        { data: lastReport },
    ] = await Promise.all([
        supabase.from('student_profiles')
            .select('current_xp, current_level, profiles!inner(first_name)')
            .eq('id', user.id)
            .single(),

        supabase.from('student_tasks')
            .select('id, title, status, xp_reward, task_type, linked_library_id')
            .eq('student_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5),

        supabase.from('lessons')
            .select('id, date_time, subject_program, profiles!lessons_tutor_id_fkey(first_name)')
            .eq('student_id', user.id)
            .gte('date_time', now)
            .order('date_time', { ascending: true })
            .limit(1)
            .maybeSingle(),

        supabase.from('lesson_reports')
            .select('student_visible_comments, skill_increments')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
    ])

    const firstName = (profile as any)?.profiles?.first_name || 'Student'
    const streak = (profile as any)?.current_streak || 0

    return (
        <div className="student-dashboard">
            <header className="dashboard-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p className="greeting-label">Good morning, {firstName}.</p>
                    {streak > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(249, 115, 22, 0.08)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                            <span style={{ fontSize: '1.2rem' }}>🔥</span>
                            <span style={{ fontWeight: 800, color: '#f97316', fontSize: '0.9rem' }}>{streak} DAY STREAK</span>
                        </div>
                    )}
                </div>
                <h1>The Briefing</h1>
                <LevelProgressBar 
                    currentXp={profile?.current_xp || 0} 
                    currentLevel={profile?.current_level || 1} 
                />
            </header>

            {nextLesson && (
                <section className="lesson-anchor">
                    <p className="section-label">NEXT SESSION</p>
                    <p className="lesson-title">
                        {new Date(nextLesson.date_time).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {new Date(nextLesson.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="lesson-meta">
                        {nextLesson.subject_program} with {(nextLesson.profiles as any)?.first_name}
                    </p>
                </section>
            )}

            <section style={{ marginBottom: '3rem' }}>
                <h2 className="section-title">Current Objectives</h2>
                {tasks && tasks.length > 0 ? (
                    <div className="task-list">
                        {tasks.map((task: any) => (
                            <CheckableTaskCard key={task.id} task={task} onComplete={completeTask} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No pending objectives. You&apos;re all caught up!</p>
                    </div>
                )}
            </section>

            {lastReport && (
                <section>
                    <h2 className="section-title">Last Debrief</h2>
                    <div className="debrief-card">
                        <p className="debrief-quote">“{lastReport.student_visible_comments}”</p>
                        
                        {lastReport.skill_increments && Object.keys(lastReport.skill_increments).length > 0 && (
                            <div className="skill-tags">
                                {Object.entries(lastReport.skill_increments).map(([skill, val]) => {
                                    const value = val as number
                                    if (value === 0) return null
                                    return (
                                        <span key={skill} className={`skill-tag ${value > 0 ? 'positive' : 'negative'}`}>
                                            {skill} {value > 0 ? '+' : ''}{value}
                                        </span>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    )
}

