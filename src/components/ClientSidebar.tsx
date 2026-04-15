import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import { createClient } from '@/utils/supabase/server'

const DB_NAV = [
    { href: '/client/app',      label: 'Briefing', key: 'briefing'  },
    { href: '/client/progress', label: 'Progress', key: 'progress'  },
]

const STUDY_NAV = [
    { href: '/client/training/manage', label: 'Personal Vault', key: 'vault' },
    { href: '/client/training', label: 'Training', key: 'training'  },
]

const UTILITY_NAV = [
    { href: '/client/lessons',  label: 'Lessons'   },
    { href: '/client/tutors',   label: 'Tutors'   },
    { href: '/client/payments', label: 'Settings'    },
]

export default async function ClientSidebar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let streak = 0
    if (user) {
        const { data: profile } = await supabase
            .from('student_profiles')
            .select('current_streak')
            .eq('id', user.id)
            .single()
        streak = profile?.current_streak || 0
    }

    return (
        <aside className="client-sidebar">
            <div className="client-sidebar-header">
                <h2>Petra OS</h2>
            </div>
            <nav className="client-nav">
                
                <div className="nav-group">
                    <div className="nav-group-label">Core</div>
                    <ul>
                        {DB_NAV.map(item => (
                            <li key={item.href}>
                                <Link prefetch={false} href={item.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>{item.label}</span>
                                    {item.key === 'briefing' && streak > 0 && (
                                        <span style={{ 
                                            color: 'var(--accent-orange)', 
                                            fontSize: '11px', 
                                            fontWeight: 600, 
                                            background: 'transparent',
                                            border: '1px solid currentColor',
                                            padding: '1px 4px',
                                            borderRadius: '4px',
                                        }}>
                                            {streak} Day
                                        </span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="nav-group">
                    <div className="nav-group-label">Database</div>
                    <ul>
                        {STUDY_NAV.map(item => (
                            <li key={item.href}>
                                <Link prefetch={false} href={item.href}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="nav-group">
                    <div className="nav-group-label">Tools</div>
                    <ul>
                        {UTILITY_NAV.map(item => (
                            <li key={item.href}>
                                <Link prefetch={false} href={item.href}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

            </nav>
            <div style={{ padding: '16px', borderTop: '1px solid var(--border-main)', marginTop: 'auto' }}>
                <form action={logout}>
                    <button type="submit" className="sidebar-logout-btn" style={{
                        width: '100%',
                        padding: '6px 12px',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        border: '1px solid transparent',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textAlign: 'left',
                        fontWeight: 500,
                        transition: 'background 0.1s, color 0.1s'
                    }}>
                        Sign out
                    </button>
                </form>
            </div>
        </aside>
    )
}
