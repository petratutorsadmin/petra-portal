import './admin.css'

export default function AdminDashboard() {
    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h1>Overview</h1>
                <p>Welcome to the Petra Portal Admin Dashboard</p>
            </header>

            <div className="dashboard-grid">
                <div className="stat-card">
                    <h3>Pending Inquiries</h3>
                    <p className="stat-number">12</p>
                </div>
                <div className="stat-card">
                    <h3>Active Tutors</h3>
                    <p className="stat-number">45</p>
                </div>
                <div className="stat-card">
                    <h3>Upcoming Lessons (7 Days)</h3>
                    <p className="stat-number">108</p>
                </div>
                <div className="stat-card">
                    <h3>Pending Reports</h3>
                    <p className="stat-number">3</p>
                </div>
            </div>

            <section className="dashboard-section">
                <h2>Recent Activity</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Task</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Oct 20</td>
                            <td>Trial requested by John Doe</td>
                            <td><span className="badge warning">Pending</span></td>
                            <td><button className="btn-small">Review</button></td>
                        </tr>
                        <tr>
                            <td>Oct 19</td>
                            <td>Invoice #1029 Paid</td>
                            <td><span className="badge success">Paid</span></td>
                            <td><button className="btn-small">View</button></td>
                        </tr>
                        <tr>
                            <td>Oct 19</td>
                            <td>Match Jane S. with Tutor Alex</td>
                            <td><span className="badge info">Scheduled</span></td>
                            <td><button className="btn-small">Manage</button></td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </div>
    )
}
