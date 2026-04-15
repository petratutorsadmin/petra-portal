import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ClientSidebar from '@/components/ClientSidebar'
import ContextPanel from '@/components/ContextPanel'
import BottomTabBar from '@/components/BottomTabBar'
import './client.css'

export default async function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'student' && profile.role !== 'parent')) {
        redirect('/login?error=Unauthorized')
    }

    return (
        <div className="client-layout">
            {/* Left sidebar — shown on desktop/tablet, hidden on mobile */}
            <ClientSidebar />

            {/* Main workspace */}
            <main className="client-main">
                {children}
            </main>

            {/* Right context panel — shown on desktop ≥1024px only via CSS */}
            <ContextPanel userId={user.id} />

            {/* Bottom tab bar — shown on mobile ≤768px only via CSS */}
            <BottomTabBar />
        </div>
    )
}
