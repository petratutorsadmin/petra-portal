import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default function ClientSidebar() {
    return (
        <aside className="client-sidebar">
            <div className="client-sidebar-header">
                <h2>Petra Portal</h2>
            </div>
            <nav className="client-nav">
                <ul>
                    <li><Link href="/client">Dashboard</Link></li>
                    <li><Link href="/client/tutors">My Tutors</Link></li>
                    <li><Link href="/client/browse">Browse Tutors</Link></li>
                    <li><Link href="/client/lessons">Upcoming Lessons</Link></li>
                    <li><Link href="/client/history">Lesson History &amp; Homework</Link></li>
                    <li><Link href="/client/pricing">My Plan &amp; Pricing</Link></li>
                    <li><Link href="/client/payments">Payments / Invoices</Link></li>
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
