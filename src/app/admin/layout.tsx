import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({
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
