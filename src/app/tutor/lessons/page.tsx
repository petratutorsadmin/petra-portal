import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function TutorLessonsPage() {
    const supabase = await createClient()

    // RLS limits this to the tutor's own lessons
    const { data: lessons, error } = await supabase
        .from('lessons')
        .select(`
      *,
      student:student_profiles(id, profiles(first_name, last_name))
    `)
        .order('date_time', { ascending: false })
        .limit(30) // Recent and upcoming

    return (
        <div className="tutor-lessons-page">
            <header className="tutor-header">
                <h1>My Lessons</h1>
                <p>View your scheduled lessons, log completions, and submit reports.</p>
            </header>

            <section className="dashboard-section mt-4">
                {error ? (
                    <p className="error-text">Failed to load lessons.</p>
                ) : !lessons || lessons.length === 0 ? (
                    <p className="empty-state">No lessons found.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Student</th>
                                <th>Subject</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lessons.map((lesson) => {
                                const date = new Date(lesson.date_time)
                                const s = lesson.student as any
                                const sName = s?.profiles ? `${s.profiles.first_name} ${s.profiles.last_name}` : 'Unknown'

                                return (
                                    <tr key={lesson.id}>
                                        <td>
                                            <div>{date.toLocaleDateString()}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.85em' }}>
                                                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td>{sName}</td>
                                        <td>{lesson.subject_program}</td>
                                        <td><span className={`badge ${lesson.status === 'scheduled' ? 'info' : 'success'}`}>{lesson.status}</span></td>
                                        <td>
                                            {lesson.status === 'completed' ? (
                                                <button className="btn-small" disabled>Report Submitted</button>
                                            ) : (
                                                <Link href={`/tutor/lessons/${lesson.id}/report`} className="btn-small" style={{ background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' }}>Submit Report</Link>
                                            )}
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
