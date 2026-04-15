import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CheckableTaskCard from '@/components/CheckableTaskCard'
import BriefingHeader from '@/components/BriefingHeader'
import { completeTask } from './actions'
import './student-app.css'

export default async function StudentCompanionHub() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) redirect('/login')

    const now = new Date().toISOString()

    const [
        { data: profile },
        { data: tasks },
        { data: nextLesson },
    ] = await Promise.all([
        supabase.from('student_profiles')
            .select('current_xp, current_level, current_streak, profiles!inner(first_name)')
            .eq('id', user.id)
            .single(),

        supabase.from('student_tasks')
            .select('id, title, status, xp_reward, task_type, linked_library_id')
            .eq('student_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(10), // Show up to 10 for density

        supabase.from('lessons')
            .select('id, date_time, subject_program, profiles!lessons_tutor_id_fkey(first_name)')
            .eq('student_id', user.id)
            .gte('date_time', now)
            .order('date_time', { ascending: true })
            .limit(1)
            .maybeSingle(),
    ])

    const firstName = (profile as any)?.profiles?.first_name || 'Student'
    const streak = (profile as any)?.current_streak || 0

    return (
        <div className="client-main-view">
            <BriefingHeader 
                firstName={firstName}
                streak={streak}
                currentXp={profile?.current_xp || 0}
                currentLevel={profile?.current_level || 1}
            />

            <section className="dashboard-section" style={{ marginTop: '32px' }}>
                <h2 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid var(--border-main)', paddingBottom: '8px' }}>
                    Action Queue
                </h2>
                
                {tasks && tasks.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {tasks.map((task: any) => (
                            <CheckableTaskCard key={task.id} task={task} onComplete={completeTask} />
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '24px 0', borderBottom: '1px solid var(--border-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Queue is empty. You're all caught up.</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No actions pending</span>
                    </div>
                )}
            </section>

            {nextLesson && (
                <section className="dashboard-section">
                    <h2 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid var(--border-main)', paddingBottom: '8px' }}>
                        Upcoming Session
                    </h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-main)' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                                {nextLesson.subject_program}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                with {(nextLesson.profiles as any)?.first_name}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                                {new Date(nextLesson.date_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {new Date(nextLesson.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
