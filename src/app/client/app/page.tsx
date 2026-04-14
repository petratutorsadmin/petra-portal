import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LevelProgressBar from '@/components/LevelProgressBar'
import CheckableTaskCard from '@/components/CheckableTaskCard'
import { completeTask } from './actions'

export default async function StudentCompanionHub() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) redirect('/login')

    // Fetch Profile XP
    const { data: profile } = await supabase.from('student_profiles')
        .select('current_xp, current_level')
        .eq('id', user.id)
        .single()

    // Fetch Pending Tasks (Top 3)
    const { data: tasks } = await supabase.from('student_tasks')
        .select('*')
        .eq('student_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(3)

    // Fetch Next Lesson
    const now = new Date().toISOString()
    const { data: nextLesson } = await supabase.from('lessons')
        .select('*, profiles!lessons_tutor_id_fkey(first_name, last_name)')
        .eq('student_id', user.id)
        .gte('date_time', now)
        .order('date_time', { ascending: true })
        .limit(1)
        .single()

    // Fetch Last Debrief
    const { data: lastReport } = await supabase.from('lesson_reports')
        .select('*, lessons(date_time, subject_program)')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    return (
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 1rem 0' }}>The Briefing</h1>
                <LevelProgressBar 
                    currentXp={profile?.current_xp || 0} 
                    currentLevel={profile?.current_level || 1} 
                />
            </header>

            {nextLesson && (
                <section style={{ marginBottom: '2rem' }}>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #8b5cf6' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>NEXT SESSION</p>
                        <p style={{ margin: '0.5rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>
                            {new Date(nextLesson.date_time).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {new Date(nextLesson.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#475569' }}>
                            {nextLesson.subject_program} with {(nextLesson.profiles as any)?.first_name}
                        </p>
                    </div>
                </section>
            )}

            <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1rem' }}>Current Objectives</h2>
                {tasks && tasks.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {tasks.map((task: any) => (
                            <CheckableTaskCard key={task.id} task={task} onComplete={completeTask} />
                        ))}
                    </div>
                ) : (
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                        <p style={{ margin: 0, color: '#64748b' }}>No pending objectives. You're all caught up!</p>
                    </div>
                )}
            </section>

            {lastReport && (
                <section>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1rem' }}>Last Debrief</h2>
                    <div style={{ background: '#1e293b', color: 'white', padding: '1.5rem', borderRadius: '12px' }}>
                        <p style={{ margin: '0 0 1rem 0', fontStyle: 'italic', color: '#cbd5e1' }}>"{lastReport.student_visible_comments}"</p>
                        
                        {lastReport.skill_increments && Object.keys(lastReport.skill_increments).length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {Object.entries(lastReport.skill_increments).map(([skill, val]) => {
                                    const value = val as number
                                    if (value === 0) return null
                                    return (
                                        <span key={skill} style={{ 
                                            background: value > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                                            color: value > 0 ? '#34d399' : '#f87171',
                                            padding: '0.25rem 0.5rem', 
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>
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
