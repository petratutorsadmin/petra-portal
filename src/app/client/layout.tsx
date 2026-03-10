import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ClientSidebar from '@/components/ClientSidebar'

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
            <ClientSidebar />
            <main className="client-main">
                {children}
            </main>
        </div>
    )
}
