import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { createLesson } from './actions'
import '@/app/shared/forms.css'

export default async function NewLessonPage() {
    const supabase = await createClient()

    // Fetch confirmed matches to get valid student-tutor pairs
    const { data: matches } = await supabase
        .from('matches')
        .select(`
            id,
            student_id,
            tutor_id,
            student:student_profiles(profiles(first_name, last_name)),
            tutor:tutor_profiles(profiles(first_name, last_name))
        `)
        .eq('status', 'active')

    // Fetch program categories
    const { data: programs } = await supabase
        .from('program_categories')
        .select('id, name, code')
        .order('code')

    return (
        <div className="admin-new-lesson-page">
            <header className="admin-header">
                <Link href="/admin/calendar" className="back-link">← Back to Calendar</Link>
                <h1 className="mt-4">Schedule New Lesson</h1>
                <p>Manually create a lesson for an active student-tutor match.</p>
            </header>

            <section className="dashboard-section mt-4" style={{ maxWidth: '700px' }}>
                <form className="admin-form" action={createLesson}>
                    <div className="form-group">
                        <label htmlFor="match_id">Student-Tutor Match *</label>
                        <select id="match_id" name="match_id" required>
                            <option value="">— Select Match —</option>
                            {matches?.map((m: any) => {
                                const s = m.student?.profiles
                                const t = m.tutor?.profiles
                                return (
                                    <option key={m.id} value={m.id}>
                                        S: {s?.first_name} {s?.last_name} ↔ T: {t?.first_name} {t?.last_name}
                                    </option>
                                )
                            })}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="program_id">Program / Subject *</label>
                        <select id="program_id" name="program_id" required>
                            <option value="">— Select Program —</option>
                            {programs?.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.code} — {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label htmlFor="date_time">Date & Time *</label>
                            <input id="date_time" name="date_time" type="datetime-local" required />
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="duration_minutes">Duration (Minutes)</label>
                            <select id="duration_minutes" name="duration_minutes" defaultValue="60">
                                <option value="45">45 min</option>
                                <option value="60">60 min</option>
                                <option value="90">90 min</option>
                                <option value="120">120 min</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="delivery_type">Delivery Type</label>
                        <select id="delivery_type" name="delivery_type" defaultValue="online">
                            <option value="online">Online</option>
                            <option value="ip_nearby">In-person Nearby</option>
                            <option value="ip_standard">In-person Standard</option>
                            <option value="ip_far">In-person Far</option>
                            <option value="home">Home Visit Premium</option>
                            <option value="cafe">Cafe Lesson</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Internal Notes (Optional)</label>
                        <textarea id="notes" name="notes" rows={2} placeholder="Any specific instructions for this lesson?"></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Create Lesson</button>
                        <Link href="/admin/calendar" className="btn-secondary">Cancel</Link>
                    </div>
                </form>
            </section>
        </div>
    )
}
