import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import '@/app/shared/forms.css'
import { notFound, redirect } from 'next/navigation'
import StructuredReportForm from '@/components/StructuredReportForm'

export default async function SubmitReportPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch the specific lesson being reported
    const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select(`
            id, date_time, subject_program, status,
            student:student_profiles(id, profiles(first_name, last_name))
        `)
        .eq('id', id)
        .single()

    if (lessonError || !lesson) {
        notFound()
    }

    // 2. Fetch the tutor's pending/recent lessons queue for the Split-View
    const { data: { user } } = await supabase.auth.getUser()
    const { data: lessonsQueue } = await supabase
        .from('lessons')
        .select(`
            id, date_time, subject_program, status,
            student:student_profiles(id, profiles(first_name, last_name))
        `)
        .eq('tutor_id', user?.id || '')
        .order('date_time', { ascending: false })
        .limit(15)

    // 3. Fetch card libraries for the task assignment dropdown
    const { data: libraries } = await supabase
        .from('card_libraries')
        .select('id, title')
        .order('title', { ascending: true })

    let studentId = ''
    let studentName = 'Student'
    if (lesson.student) {
        // @ts-expect-error Types returned from joining are complex
        studentId = lesson.student.id || ''
        // @ts-expect-error Types returned from joining are complex
        if (lesson.student.profiles) {
            // @ts-expect-error Types returned from joining are complex
            studentName = `${lesson.student.profiles.first_name} ${lesson.student.profiles.last_name}`
        }
    }

    return (
        <div className="tutor-report-page">
            <header className="tutor-header">
                <Link href="/tutor/lessons" className="back-link" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 600 }}>← Back to Lessons</Link>
                <h1 className="mt-4" style={{ fontSize: '1.75rem' }}>After-Action Protocol</h1>
                <p>Log structured debrief and assign active tasks for {studentName}.</p>
            </header>

            <div className="tablet-split-view" style={{ marginTop: '2rem' }}>
                {/* LEFT PANE: The Queue (Hidden on Mobile) */}
                <div className="tablet-split-list">
                    <h3 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 700 }}>Lesson Queue</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {lessonsQueue?.map(l => {
                            const date = new Date(l.date_time)
                            const s = l.student as any
                            const sName = s?.profiles ? `${s.profiles.first_name} ${s.profiles.last_name}` : 'Unknown'
                            const isActive = l.id === id
                            
                            return (
                                <Link 
                                    href={l.status === 'completed' ? '#' : `/tutor/lessons/${l.id}/report`} 
                                    key={l.id} 
                                    style={{ 
                                        textDecoration: 'none', 
                                        padding: '1rem', 
                                        borderRadius: '8px', 
                                        border: isActive ? '2px solid #8b5cf6' : '1px solid #e2e8f0',
                                        background: isActive ? '#f5f3ff' : l.status === 'completed' ? '#f8fafc' : '#ffffff',
                                        opacity: l.status === 'completed' ? 0.6 : 1,
                                        cursor: l.status === 'completed' ? 'default' : 'pointer',
                                        display: 'block'
                                    }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <h4 style={{ margin: 0, color: '#0f172a', fontSize: '0.95rem' }}>{sName}</h4>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: l.status === 'completed' ? '#10b981' : '#f59e0b' }}>
                                            {l.status === 'completed' ? 'Done' : 'Pending'}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{l.subject_program}</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                                        {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* RIGHT PANE: The Form */}
                <div className="tablet-split-detail">
                    <section className="dashboard-section" style={{ maxWidth: '700px', margin: 0 }}>
                        <StructuredReportForm 
                            lessonId={lesson.id} 
                            studentId={studentId} 
                            studentName={studentName}
                            libraries={libraries ?? []}
                        />
                    </section>
                </div>
            </div>
        </div>
    )
}
