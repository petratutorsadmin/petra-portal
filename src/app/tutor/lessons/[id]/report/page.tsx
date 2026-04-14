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

    // Fetch the lesson to ensure it exists and belongs to the tutor
    const { data: lesson, error } = await supabase
        .from('lessons')
        .select(`
      id, date_time, subject_program, status,
      student:student_profiles(id, profiles(first_name, last_name))
    `)
        .eq('id', id)
        .single()

    if (error || !lesson) {
        notFound()
    }

    // Determine actual student fields
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
                <Link href="/tutor/lessons" className="back-link">← Back to Lessons</Link>
                <h1 className="mt-4">After-Action Protocol</h1>
                <p>Log structured debrief and assign active tasks for {studentName}.</p>
            </header>

            <section className="dashboard-section mt-4" style={{ maxWidth: '700px' }}>
                <StructuredReportForm 
                    lessonId={lesson.id} 
                    studentId={studentId} 
                    studentName={studentName} 
                />
            </section>
        </div>
    )
}
