// Bottom Tab Bar — mobile navigation (shown ≤768px only via CSS)
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'

const TABS = [
    { href: '/client/app',      icon: '▶', label: 'Briefing'  },
    { href: '/client/training', icon: '◈', label: 'Training'  },
    { href: '/client/training/manage', icon: '📚', label: 'Vault' },
    { href: '/client/progress', icon: '◎', label: 'Progress'  },
]

export default function BottomTabBar() {
    const path = usePathname()
    return (
        <nav className="bottom-tab-bar" aria-label="Mobile navigation">
            {TABS.map(tab => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className={`tab-item ${path === tab.href || path.startsWith(tab.href + '/') ? 'tab-active' : ''}`}
                >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                </Link>
            ))}
            {/* Mobile Log Out Button */}
            <form action={logout} className="tab-item" style={{ margin: 0, padding: 0 }}>
                <button type="submit" style={{ all: 'unset', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer', gap: '0.2rem' }}>
                    <span className="tab-icon">🚪</span>
                    <span className="tab-label">Sign Out</span>
                </button>
            </form>
        </nav>
    )
}
