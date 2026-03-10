import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import TutorSidebar from '@/components/TutorSidebar'

export default async function TutorLayout({
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

    if (!profile || profile.role !== 'tutor') {
        redirect('/login?error=Unauthorized')
    }

    return (
        <div className="tutor-layout">
            <TutorSidebar />
            <main className="tutor-main">
                {children}
            </main>
        </div>
    )
}
