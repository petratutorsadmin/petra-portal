import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import './admin.css'

export default async function AdminDashboard() {
    const supabase = await createClient()

    const now = new Date().toISOString()
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // Run all counts in parallel
    const [
        { count: pendingRequests },
        { count: activeTutors },
        { count: upcomingLessons },
        { count: pendingReports },
        { data: recentActivity },
    ] = await Promise.all([
        supabase
            .from('matches')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending'),
        supabase
            .from('tutor_profiles')
            .select('id', { count: 'exact', head: true }),
        supabase
            .from('lessons')
            .select('id', { count: 'exact', head: true })
            .gte('date_time', now)
            .lte('date_time', sevenDaysLater),
        supabase
            .from('lessons')
            .select('id', { count: 'exact', head: true })
            .lt('date_time', now)
            .eq('status', 'scheduled'), // completed but no report yet
        supabase
            .from('matches')
            .select('id, status, created_at, student:student_profiles(profiles(first_name, last_name)), tutor:tutor_profiles(profiles(first_name, last_name))')
            .order('created_at', { ascending: false })
            .limit(5),
    ])

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h1>Overview</h1>
                <p>Welcome to the Petra Portal Admin Dashboard</p>
            </header>

            <div className="dashboard-grid">
                <div className="stat-card">
                    <h3>Pending Match Requests</h3>
                    <p className="stat-number">{pendingRequests ?? 0}</p>
                    <Link href="/admin/users" style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '0.5rem', display: 'block' }}>Review →</Link>
                </div>
                <div className="stat-card">
                    <h3>Active Tutors</h3>
                    <p className="stat-number">{activeTutors ?? 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Upcoming Lessons (7 Days)</h3>
                    <p className="stat-number">{upcomingLessons ?? 0}</p>
                    <Link href="/admin/calendar" style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '0.5rem', display: 'block' }}>View Calendar →</Link>
                </div>
                <div className="stat-card">
                    <h3>Lessons Awaiting Report</h3>
                    <p className="stat-number">{pendingReports ?? 0}</p>
                </div>
            </div>

            <section className="dashboard-section">
                <h2>Recent Match Requests</h2>
                {!recentActivity || recentActivity.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem 0' }}>No match requests yet.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Student</th>
                                <th>Tutor Requested</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.map((match: any) => {
                                const student = match.student?.profiles
                                const tutor = match.tutor?.profiles
                                const statusColor = match.status === 'pending' ? 'warning' : match.status === 'active' ? 'success' : 'info'
                                return (
                                    <tr key={match.id}>
                                        <td>{new Date(match.created_at).toLocaleDateString()}</td>
                                        <td>{student ? `${student.first_name} ${student.last_name}` : 'Unknown'}</td>
                                        <td>{tutor ? `${tutor.first_name} ${tutor.last_name}` : 'Any Available'}</td>
                                        <td><span className={`badge ${statusColor}`}>{match.status}</span></td>
                                        <td><Link href="/admin/users" className="btn-small">Review</Link></td>
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
