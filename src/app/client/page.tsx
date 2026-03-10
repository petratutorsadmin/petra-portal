import './client.css'

export default function ClientDashboard() {
    return (
        <div className="client-dashboard">
            <header className="client-header">
                <h1>Dashboard</h1>
                <p>Welcome to Petra Portal. Here is your upcoming learning schedule.</p>
            </header>

            <div className="dashboard-grid">
                <div className="stat-card">
                    <h3>Enrollment Status</h3>
                    <p className="stat-status active">Active</p>
                </div>
                <div className="stat-card">
                    <h3>Upcoming Lessons</h3>
                    <p className="stat-number">3</p>
                </div>
                <div className="stat-card">
                    <h3>Pending Homework</h3>
                    <p className="stat-number">1</p>
                </div>
            </div>

            <div className="dashboard-splits">
                <section className="dashboard-section split">
                    <h2>Next Lesson</h2>
                    <div className="next-lesson-card">
                        <div className="lesson-date">Thursday, Oct 19 - 18:30</div>
                        <div className="lesson-subject">SAT Math Preparation</div>
                        <div className="lesson-tutor">with Tutor Alex</div>
                        <div className="lesson-actions">
                            <button className="btn-primary">Connect info</button>
                            <button className="btn-secondary">Request Reschedule</button>
                        </div>
                    </div>
                </section>

                <section className="dashboard-section split">
                    <h2>Recent Lesson Notes</h2>
                    <div className="recent-note">
                        <div className="note-date">Oct 12</div>
                        <div className="note-subject">Completed SAT Reading Diagnostic</div>
                        <p>Great progress today. Homework is to finish Practice Test 2 Section 1.</p>
                    </div>
                </section>
            </div>
        </div>
    )
}
