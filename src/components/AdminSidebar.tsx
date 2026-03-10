import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default function AdminSidebar() {
    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
                <h2>Petra Admin</h2>
            </div>
            <nav className="admin-nav">
                <ul>
                    <li><Link href="/admin">Dashboard</Link></li>
                    <li><Link href="/admin/users">Users &amp; Roles</Link></li>
                    <li><Link href="/admin/calendar">Master Calendar</Link></li>
                    <li><Link href="/admin/pricing">Pricing Engine</Link></li>
                    <li><Link href="/admin/invoices">Invoices &amp; Payouts</Link></li>
                </ul>
            </nav>
            <div className="sidebar-footer">
                <form action={logout}>
                    <button type="submit" className="logout-btn">Sign Out</button>
                </form>
            </div>
        </aside>
    )
}
