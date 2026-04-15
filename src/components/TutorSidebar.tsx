import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default function TutorSidebar() {
    return (
        <aside className="tutor-sidebar">
            <div className="tutor-sidebar-header">
                <h2>Petra OS</h2>
            </div>
            <nav className="tutor-nav">
                <ul>
                    <li><Link href="/tutor">▶ Summary</Link></li>
                    <li><Link href="/tutor/students">≡ Students</Link></li>
                    <li><Link href="/tutor/lessons">≡ Lessons</Link></li>
                    <li><Link href="/tutor/profile">Profile</Link></li>
                    <li><Link href="/tutor/availability">Availability</Link></li>
                    <li><Link href="/tutor/compensation">Compensation</Link></li>
                    <li><Link href="/tutor/payouts">My Payouts</Link></li>
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
