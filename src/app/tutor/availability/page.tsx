import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function TutorAvailabilityPage() {
    const supabase = await createClient()

    // Simplified fetch for tutor availability (RLS handles user restriction)
    // We need to fetch the tutor's rules and exceptions.
    const { data: rules } = await supabase
        .from('tutor_availability_rules')
        .select('*')
        .order('day_of_week')

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    return (
        <div className="tutor-availability-page">
            <header className="tutor-header flex-between">
                <div>
                    <h1>My Availability</h1>
                    <p>Set your recurring weekly schedule and special exceptions.</p>
                </div>
                <button className="btn-primary">+ Add Rule</button>
            </header>

            <section className="dashboard-section mt-4">
                <h2>Recurring Schedule</h2>
                {!rules || rules.length === 0 ? (
                    <p className="empty-state mt-4">No recurring availability set. Add a rule to get started.</p>
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
                                    <td>{rule.start_time} - {rule.end_time}</td>
                                    <td><button className="btn-small">Remove</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    )
}
