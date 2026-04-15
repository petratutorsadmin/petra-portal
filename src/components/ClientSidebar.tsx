import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import { createClient } from '@/utils/supabase/server'

// Primary OS modes (top group)
const PRIMARY_NAV = [
    { href: '/client/app',      label: '▶ Briefing', key: 'briefing'  },
    { href: '/client/training', label: '◈ Training', key: 'training'  },
    { href: '/client/progress', label: '◎ Progress', key: 'progress'  },
    { href: '/client/pricing',  label: '⊞ My Plan',   key: 'plan'      },
]

// Utility links (secondary group)
const UTILITY_NAV = [
    { href: '/client/lessons',  label: '≡ Lessons'   },
    { href: '/client/history',  label: '≡ History'   },
    { href: '/client/tutors',   label: 'My Tutors'   },
    { href: '/client/training/manage', label: 'Personal Vault' },
    { href: '/client/payments', label: 'Payments'    },
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
                <ul>
                    {PRIMARY_NAV.map(item => (
                        <li key={item.href}>
                            <Link href={item.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>{item.label}</span>
                                {item.key === 'briefing' && streak > 0 && (
                                    <span style={{ 
                                        color: '#f97316', 
                                        fontSize: '0.75rem', 
                                        fontWeight: 800, 
                                        background: 'rgba(249, 115, 22, 0.1)',
                                        padding: '0.1rem 0.4rem',
                                        borderRadius: '4px',
                                        marginRight: '0.5rem'
                                    }}>
                                        🔥 {streak}
                                    </span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0.75rem 1rem' }} />

                <ul>
                    {UTILITY_NAV.map(item => (
                        <li key={item.href}>
                            <Link href={item.href} style={{ fontSize: '0.8rem' }}>{item.label}</Link>
                        </li>
                    ))}
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
