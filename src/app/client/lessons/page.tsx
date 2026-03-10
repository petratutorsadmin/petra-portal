import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import '@/app/shared/forms.css'

export default async function ClientLessonsPage() {
    const supabase = await createClient()

    // RLS will automatically filter this to the logged-in student's or parent's lessons
    const { data: lessons, error } = await supabase
        .from('lessons')
        .select(`
      *,
      tutor:tutor_profiles(id, profiles(first_name, last_name))
    `)
        .order('date_time', { ascending: true })
        .gte('date_time', new Date().toISOString())

    return (
        <div className="client-lessons-page">
            <header className="client-header flex-between">
                <div>
                    <h1>Upcoming Lessons</h1>
                    <p>View your scheduled lessons and join links.</p>
                </div>
                <button className="btn-primary">Request Lesson</button>
            </header>

            <section className="dashboard-section mt-4">
                {error ? (
                    <p className="error-text">Failed to load lessons.</p>
                ) : !lessons || lessons.length === 0 ? (
                    <p className="empty-state">No upcoming lessons scheduled.</p>
                ) : (
                    <div className="dashboard-splits" style={{ gridTemplateColumns: '1fr' }}>
                        {lessons.map((lesson) => {
                            const date = new Date(lesson.date_time)
                            const t = lesson.tutor as any
                            const tName = t?.profiles ? `${t.profiles.first_name} ${t.profiles.last_name}` : 'Tutor TBD'

                            return (
                                <div key={lesson.id} className="next-lesson-card mb-4" style={{ marginBottom: '1rem' }}>
                                    <div className="lesson-date">{date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    <div className="lesson-subject">{lesson.subject_program}</div>
                                    <div className="lesson-tutor">with {tName}</div>
                                    <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                                        <span className={`badge ${lesson.status === 'scheduled' ? 'info' : 'success'}`}>{lesson.status}</span>
                                    </div>
                                    <div className="lesson-actions">
                                        <button className="btn-primary">Connect info</button>
                                        <button className="btn-secondary">Request Reschedule</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}
