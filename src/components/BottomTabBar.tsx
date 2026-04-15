// Bottom Tab Bar — mobile navigation (shown ≤768px only via CSS)
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
    { href: '/client/app',      icon: '▶', label: 'Briefing'  },
    { href: '/client/training', icon: '◈', label: 'Training'  },
    { href: '/client/progress', icon: '◎', label: 'Progress'  },
    { href: '/client/pricing',  icon: '⊞', label: 'Plan'      },
    { href: '/client/lessons',  icon: '≡', label: 'More'      },
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
        </nav>
    )
}
