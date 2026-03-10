import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import './tutor.css'

export default async function TutorDashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Fetch today's lessons for this tutor
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

    const { data: todayLessons } = await supabase
        .from('lessons')
        .select('*, profiles!lessons_student_id_fkey(first_name, last_name)')
        .eq('tutor_id', user?.id)
        .gte('date_time', todayStart)
        .lt('date_time', todayEnd)
        .order('date_time', { ascending: true })

    // Fetch upcoming lessons (next 7 days)
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: upcomingLessons } = await supabase
        .from('lessons')
        .select('*, profiles!lessons_student_id_fkey(first_name, last_name)')
        .eq('tutor_id', user?.id)
        .gte('date_time', todayEnd)
        .lte('date_time', nextWeek)
        .order('date_time', { ascending: true })

    // Fetch pending reports
    const { data: pendingReports } = await supabase
        .from('lessons')
        .select('id')
        .eq('tutor_id', user?.id)
        .lt('date_time', todayStart)
        .eq('status', 'scheduled') // Not yet reported

    // Fetch tutor profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user?.id!)
        .single()

    return (
        <div className="tutor-dashboard">
            <header className="tutor-header">
                <h1>Welcome back, {profile?.first_name || 'Tutor'}!</h1>
                <p>Here is your schedule for today.</p>
            </header>

            <div className="dashboard-grid">
                <div className="stat-card">
                    <h3>Today&apos;s Lessons</h3>
                    <p className="stat-number">{todayLessons?.length ?? 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Upcoming (7 Days)</h3>
                    <p className="stat-number">{upcomingLessons?.length ?? 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Pending Reports</h3>
                    <p className="stat-number">{pendingReports?.length ?? 0}</p>
                </div>
            </div>

            <section className="dashboard-section">
                <h2>Today&apos;s Schedule</h2>
                {!todayLessons || todayLessons.length === 0 ? (
                    <p className="empty-state">No lessons scheduled for today.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Student</th>
                                <th>Subject</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todayLessons.map((lesson) => {
                                const time = new Date(lesson.date_time)
                                const p = lesson.profiles as any
                                const studentName = p ? `${p.first_name} ${p.last_name}` : 'Unknown'
                                return (
                                    <tr key={lesson.id}>
                                        <td>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>{studentName}</td>
                                        <td>{lesson.subject_program}</td>
                                        <td>
                                            <Link href={`/tutor/lessons/${lesson.id}/report`} className="btn-small">
                                                Submit Report
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    )
}
