import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import './client.css'

export default async function ClientDashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Fetch next upcoming lesson
    const now = new Date().toISOString()
    const { data: nextLesson } = await supabase
        .from('lessons')
        .select('*, profiles!lessons_tutor_id_fkey(first_name, last_name)')
        .eq('student_id', user?.id)
        .gte('date_time', now)
        .order('date_time', { ascending: true })
        .limit(1)
        .single()

    // Count upcoming lessons
    const { count: upcomingCount } = await supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', user?.id)
        .gte('date_time', now)

    // Count pending homework items
    const { count: homeworkCount } = await supabase
        .from('homework_items')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', user?.id)
        .eq('status', 'pending')

    // Fetch recent lesson report
    const { data: recentReport } = await supabase
        .from('lesson_reports')
        .select('*, lessons(date_time, subject_program)')
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    // Fetch client profile for enrollment status
    const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('assigned_plan')
        .eq('id', user?.id!)
        .single()

    return (
        <div className="client-dashboard">
            <header className="client-header">
                <h1>Dashboard</h1>
                <p>Welcome to Petra Portal. Here is your upcoming learning schedule.</p>
            </header>

            <div className="dashboard-grid">
                <div className="stat-card">
                    <h3>Enrollment Status</h3>
                    <p className="stat-status active">{studentProfile?.assigned_plan || 'Active'}</p>
                </div>
                <div className="stat-card">
                    <h3>Upcoming Lessons</h3>
                    <p className="stat-number">{upcomingCount ?? 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Pending Homework</h3>
                    <p className="stat-number">{homeworkCount ?? 0}</p>
                </div>
            </div>

            <div className="dashboard-splits">
                <section className="dashboard-section split">
                    <h2>Next Lesson</h2>
                    {!nextLesson ? (
                        <p className="empty-state">No upcoming lessons scheduled yet.</p>
                    ) : (
                        <div className="next-lesson-card">
                            <div className="lesson-date">
                                {new Date(nextLesson.date_time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                {' — '}
                                {new Date(nextLesson.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="lesson-subject">{nextLesson.subject_program}</div>
                            <div className="lesson-tutor">
                                {nextLesson.profiles ? `with ${(nextLesson.profiles as any).first_name} ${(nextLesson.profiles as any).last_name}` : ''}
                            </div>
                            <div className="lesson-actions">
                                <Link href="/client/lessons" className="btn-secondary">View All Lessons</Link>
                            </div>
                        </div>
                    )}
                </section>

                <section className="dashboard-section split">
                    <h2>Recent Lesson Notes</h2>
                    {!recentReport ? (
                        <p className="empty-state">No lesson reports yet.</p>
                    ) : (
                        <div className="recent-note">
                            <div className="note-date">
                                {new Date((recentReport.lessons as any)?.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="note-subject">{(recentReport.lessons as any)?.subject_program}</div>
                            <p>{recentReport.summary || 'No notes provided.'}</p>
                            <Link href="/client/history" className="btn-small" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
                                View Full History
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
