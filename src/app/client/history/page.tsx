import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import '@/app/shared/forms.css' // Reuse form styles

export default async function ClientHistoryPage() {
    const supabase = await createClient()

    // RLS filters to the current client's records
    const { data: reports, error } = await supabase
        .from('lesson_reports')
        .select(`
      id, created_at, topics_covered, student_visible_comments, student_engagement_rating,
      lesson:lessons(date_time, subject_program, tutor:tutor_profiles(id, profiles(first_name, last_name))),
      tasks:student_tasks(title, description, due_date, status)
    `)
        .order('created_at', { ascending: false })

    return (
        <div className="client-history-page">
            <header className="client-header flex-between">
                <div>
                    <h1>Lesson History & Homework</h1>
                    <p>Review feedback from your tutors and your upcoming tasks.</p>
                </div>
            </header>

            <section className="dashboard-section mt-4">
                {error ? (
                    <p className="error-text">Failed to load history.</p>
                ) : !reports || reports.length === 0 ? (
                    <p className="empty-state">No lesson reports available yet.</p>
                ) : (
                    <div className="reports-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {reports.map((report: any) => {
                            const lesson = report.lesson as any
                            const tutor = lesson?.tutor?.profiles ? `${lesson.tutor.profiles.first_name} ${lesson.tutor.profiles.last_name}` : 'Tutor'
                            const date = lesson ? new Date(lesson.date_time).toLocaleDateString() : 'Unknown Date'
                            const hw = report.homework && report.homework.length > 0 ? report.homework[0] : null

                            return (
                                <div key={report.id} className="report-card" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
                                    <div className="flex-between" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', color: '#1e293b' }}>{lesson?.subject_program || 'Lesson'}</h3>
                                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{date} • with {tutor}</span>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{ fontSize: '0.9rem', color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Tutor Feedback</h4>
                                        <p style={{ color: '#1e293b', fontSize: '0.95rem', lineHeight: '1.5' }}>{report.student_visible_comments || 'No comments provided.'}</p>
                                        {report.topics_covered && <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}><strong>Topics:</strong> {report.topics_covered}</div>}
                                    </div>

                                    {report.tasks && report.tasks.length > 0 && (
                                        <div style={{ backgroundColor: 'var(--bg-layout)', padding: '1rem', borderRadius: '6px', borderLeft: '3px solid var(--petra-purple)', marginTop: '1rem' }}>
                                            <h4 style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 700 }}>Associated Tasks</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {report.tasks.map((task: any, idx: number) => (
                                                    <div key={idx} style={{ padding: '0.5rem 0' }}>
                                                        <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>
                                                            {task.status === 'completed' ? '✓ ' : '○ '}{task.title}
                                                        </p>
                                                        {task.description && (
                                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{task.description}</p>
                                                        )}
                                                        {task.due_date && (
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                                Due: {new Date(task.due_date).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}
