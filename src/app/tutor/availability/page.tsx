import { createClient } from '@/utils/supabase/server'
import { addAvailabilityRule, removeAvailabilityRule } from '../actions'
import '@/app/shared/forms.css'

export default async function TutorAvailabilityPage() {
    const supabase = await createClient()

    const { data: rules } = await supabase
        .from('tutor_availability_rules')
        .select('*')
        .order('day_of_week')

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    return (
        <div className="tutor-availability-page">
            <header className="tutor-header">
                <h1>My Availability</h1>
                <p>Set your recurring weekly schedule. Admins use this to match you with students.</p>
            </header>

            <section className="dashboard-section mt-4" style={{ maxWidth: '600px' }}>
                <h2 style={{ marginBottom: '1.25rem' }}>Add Availability Window</h2>
                <form className="admin-form" action={addAvailabilityRule}>
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label htmlFor="day_of_week">Day of Week</label>
                            <select id="day_of_week" name="day_of_week">
                                {daysOfWeek.map((day, i) => (
                                    <option key={i} value={i}>{day}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="start_time">Start Time</label>
                            <input id="start_time" name="start_time" type="time" defaultValue="09:00" />
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="end_time">End Time</label>
                            <input id="end_time" name="end_time" type="time" defaultValue="12:00" />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">+ Add Rule</button>
                    </div>
                </form>
            </section>

            <section className="dashboard-section mt-4">
                <h2 style={{ marginBottom: '1rem' }}>Current Schedule</h2>
                {!rules || rules.length === 0 ? (
                    <p className="empty-state">No recurring availability set yet. Add a rule above to get started.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Time Window</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rules.map((rule) => (
                                <tr key={rule.id}>
                                    <td>{daysOfWeek[rule.day_of_week]}</td>
                                    <td>{rule.start_time} – {rule.end_time}</td>
                                    <td>
                                        <form action={removeAvailabilityRule} style={{ display: 'inline' }}>
                                            <input type="hidden" name="rule_id" value={rule.id} />
                                            <button type="submit" className="btn-small" style={{ color: '#dc2626', borderColor: '#fca5a5' }}>Remove</button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    )
}
