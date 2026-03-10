import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function AdminCalendarPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams
    const view = typeof resolvedParams.view === 'string' ? resolvedParams.view : 'upcoming'

    const supabase = await createClient()

    const { data: lessons, error } = await supabase
        .from('lessons')
        .select(`
      *,
      student:student_profiles(id, profiles(first_name, last_name)),
      tutor:tutor_profiles(id, profiles(first_name, last_name))
    `)
        .order('date_time', { ascending: view === 'upcoming' })
        .limit(50)

    return (
        <div className="admin-calendar-page">
            <header className="admin-header flex-between">
                <div>
                    <h1>Master Calendar</h1>
                    <p>Admin scheduling master view for all lessons and trials.</p>
                </div>
                <button className="btn-primary">+ Schedule Lesson</button>
            </header>

            <div className="tabs">
                <Link href="/admin/calendar?view=upcoming" className={`tab ${view === 'upcoming' ? 'active' : ''}`}>Upcoming</Link>
                <Link href="/admin/calendar?view=past" className={`tab ${view === 'past' ? 'active' : ''}`}>Past</Link>
                <Link href="/admin/calendar?view=requests" className={`tab ${view === 'requests' ? 'active' : ''}`}>Lesson Requests</Link>
            </div>

            <section className="dashboard-section mt-4">
                {error ? (
                    <p className="error-text">Failed to load schedule.</p>
                ) : !lessons || lessons.length === 0 ? (
                    <p className="empty-state">No lessons scheduled in this view.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Student</th>
                                <th>Tutor</th>
                                <th>Subject</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lessons.map((lesson) => {
                                const date = new Date(lesson.date_time)

                                // type assertions for joined data
                                const s = lesson.student as any
                                const t = lesson.tutor as any

                                const sName = s?.profiles ? `${s.profiles.first_name} ${s.profiles.last_name}` : 'Unknown'
                                const tName = t?.profiles ? `${t.profiles.first_name} ${t.profiles.last_name}` : 'Unassigned'

                                return (
                                    <tr key={lesson.id}>
                                        <td>
                                            <div>{date.toLocaleDateString()}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.85em' }}>
                                                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td>{sName}</td>
                                        <td>{tName}</td>
                                        <td>{lesson.subject_program}</td>
                                        <td><span className={`badge ${lesson.status === 'scheduled' ? 'info' : 'success'}`}>{lesson.status}</span></td>
                                        <td><button className="btn-small">Manage</button></td>
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
