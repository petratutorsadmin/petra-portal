import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { submitReport } from './actions'
import '../../../../admin/users/users.css' // Import shared form styles
import { notFound } from 'next/navigation'

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
      student:student_profiles(profiles(first_name, last_name))
    `)
        .eq('id', id)
        .single()

    if (error || !lesson) {
        notFound()
    }

    const s = lesson.student as any
    const studentName = s?.profiles ? `${s.profiles.first_name} ${s.profiles.last_name}` : 'Student'

    return (
        <div className="tutor-report-page">
            <header className="tutor-header">
                <Link href="/tutor/lessons" className="back-link">← Back to Lessons</Link>
                <h1 className="mt-4">Submit Lesson Report</h1>
                <p>Log feedback and assign homework for {studentName} ({lesson.subject_program}).</p>
            </header>

            <section className="dashboard-section mt-4" style={{ maxWidth: '700px' }}>
                <form className="admin-form" action={submitReport}>
                    <input type="hidden" name="lesson_id" value={lesson.id} />
                    <input type="hidden" name="student_id" value={s?.id || ''} />

                    <div className="form-group">
                        <label htmlFor="topics_covered">Topics Covered</label>
                        <textarea id="topics_covered" name="topics_covered" rows={3} required placeholder="What did you cover in today's lesson?"></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="student_visible_comments">Feedback for Student & Parent</label>
                        <textarea id="student_visible_comments" name="student_visible_comments" rows={4} required placeholder="Praise, constructive feedback, and general notes."></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="admin_only_notes">Private Notes for Admin (Optional)</label>
                        <textarea id="admin_only_notes" name="admin_only_notes" rows={2} placeholder="Any internal concerns or notes for Petra staff only."></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="student_engagement_rating">Engagement Rating (1-5)</label>
                        <select id="student_engagement_rating" name="student_engagement_rating">
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Very Good</option>
                            <option value="3" selected>3 - Good / Standard</option>
                            <option value="2">2 - Distracted</option>
                            <option value="1">1 - Poor</option>
                        </select>
                    </div>

                    <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                    <h3>Assign Next Lesson Focus / Homework</h3>

                    <div className="form-group mt-4">
                        <label htmlFor="task_description">Task Description (Optional)</label>
                        <textarea id="task_description" name="task_description" rows={2} placeholder="What should the student prepare for next time?"></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Submit Report & Complete Lesson</button>
                        <Link href="/tutor/lessons" className="btn-secondary">Cancel</Link>
                    </div>
                </form>
            </section>
        </div>
    )
}
