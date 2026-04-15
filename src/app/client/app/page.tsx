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

    // Parallel fetching for performance
    const [
        { data: profile },
        { data: tasks },
        { data: nextLesson },
        { data: lastReport },
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
            <BriefingHeader 
                firstName={firstName}
                streak={streak}
                currentXp={profile?.current_xp || 0}
                currentLevel={profile?.current_level || 1}
            />

            {/* TASKS GO FIRST AS THE CORE ENGINE */}
            <section style={{ marginBottom: '2rem' }}>
                <h2 className="section-title">Up Next</h2>
                {tasks && tasks.length > 0 ? (
                    <div className="task-list">
                        {tasks.map((task: any) => (
                            <CheckableTaskCard key={task.id} task={task} onComplete={completeTask} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', color: '#64748b', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: 0 }}>No pending tasks. You're all caught up!</p>
                    </div>
                )}
            </section>

            {/* NEXT SESSION MOVES DOWN (SECONDARY TO TASKS) */}
            {nextLesson && (
                <section className="lesson-anchor">
                    <p className="section-label">UPCOMING LESSON</p>
                    <p className="lesson-title">
                        {new Date(nextLesson.date_time).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {new Date(nextLesson.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="lesson-meta">
                        {nextLesson.subject_program} with {(nextLesson.profiles as any)?.first_name}
                    </p>
                </section>
            )}
        </div>
    )

}

