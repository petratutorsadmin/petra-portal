import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // user is now guaranteed to be defined
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user!.id)
        .single()

    if (profileError) {
        console.error('Admin layout profile error:', profileError)
        // Profile fetch failed - redirect to login with more context
        redirect('/login?error=Profile+not+found.+Please+contact+admin.')
    }

    if (!profile || profile.role !== 'admin') {
        redirect('/login?error=Unauthorized')
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main">
                {children}
            </main>
        </div>
    )
}
