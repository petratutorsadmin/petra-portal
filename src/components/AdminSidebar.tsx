import Link from 'next/link'

export default function AdminSidebar() {
    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
                <h2>Petra Admin</h2>
            </div>
            <nav className="admin-nav">
                <ul>
                    <li><Link href="/admin">Dashboard</Link></li>
                    <li><Link href="/admin/users">Users & Roles</Link></li>
                    <li><Link href="/admin/calendar">Master Calendar</Link></li>
                    <li><Link href="/admin/pricing">Pricing Engine</Link></li>
                    <li><Link href="/admin/invoices">Invoices & Payouts</Link></li>
                    <li><Link href="/admin/reports">Lesson Reports</Link></li>
                </ul>
            </nav>
        </aside>
    )
}
