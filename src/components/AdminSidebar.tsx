import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import { createClient } from '@/utils/supabase/server'

export default async function AdminSidebar() {
    const supabase = await createClient()
    const { count: pendingCount } = await supabase
        .from('plan_change_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
                <h2>Petra OS</h2>
            </div>
            <nav className="admin-nav">
                <ul>
                    <li><Link href="/admin">Dashboard</Link></li>
                    <li><Link href="/admin/users">Users &amp; Roles</Link></li>
                    <li><Link href="/admin/calendar">Master Calendar</Link></li>
                    <li>
                        <Link href="/admin/pricing">Pricing Engine</Link>
                        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                            <li><Link href="/admin/pricing/quotes" style={{ fontSize: '0.88rem', color: '#94a3b8' }}>└ Quote Builder</Link></li>
                        </ul>
                    </li>
                    <li><Link href="/admin/invoices">Invoices &amp; Payouts</Link></li>
                    <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Link href="/admin/plan-requests">Plan Requests</Link>
                        {pendingCount ? (
                            <span style={{ 
                                background: '#ef4444', 
                                color: 'white', 
                                borderRadius: '9999px', 
                                padding: '0 0.5rem', 
                                fontSize: '0.75rem', 
                                fontWeight: 700,
                                marginRight: '1rem'
                            }}>
                                {pendingCount}
                            </span>
                        ) : null}
                    </li>
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
