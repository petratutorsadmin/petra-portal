import './tutor.css'

export default function TutorDashboard() {
    return (
        <div className="tutor-dashboard">
            <header className="tutor-header">
                <h1>Welcome back</h1>
                <p>Here is your schedule for today.</p>
            </header>

            <div className="dashboard-grid">
                <div className="stat-card">
                    <h3>Today&apos;s Lessons</h3>
                    <p className="stat-number">2</p>
                </div>
                <div className="stat-card">
                    <h3>Upcoming (7 Days)</h3>
                    <p className="stat-number">10</p>
                </div>
                <div className="stat-card">
                    <h3>Pending Reports</h3>
                    <p className="stat-number">1</p>
                </div>
            </div>

            <section className="dashboard-section">
                <h2>Today&apos;s Schedule</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Student</th>
                            <th>Subject</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>16:00 - 17:00</td>
                            <td>Jane Smith</td>
                            <td>IB Physics HL</td>
                            <td><button className="btn-small">View Lesson</button></td>
                        </tr>
                        <tr>
                            <td>18:30 - 20:00</td>
                            <td>Michael Johnson</td>
                            <td>SAT Math</td>
                            <td><button className="btn-small">View Lesson</button></td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </div>
    )
}
