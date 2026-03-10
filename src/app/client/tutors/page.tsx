import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import '@/app/shared/forms.css'

export default async function ClientTutorsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: matches, error } = await supabase
        .from('matches')
        .select(`
      tutor:tutor_profiles(
        id, 
        bio, 
        university, 
        teaching_style,
        profiles(first_name, last_name)
      )
    `)
        .eq('student_id', user.id)
        .eq('status', 'active')

    return (
        <div className="client-tutors-page">
            <header className="client-header flex-between">
                <div>
                    <h1>My Tutors</h1>
                    <p>Your currently assigned Petra tutors.</p>
                </div>
                <Link href="/client/browse" className="btn-secondary">Browse More</Link>
            </header>

            <section className="dashboard-section mt-4">
                {error ? (
                    <p className="error-text">Failed to load tutors.</p>
                ) : !matches || matches.length === 0 ? (
                    <p className="empty-state">You are not currently matched with a tutor.</p>
                ) : (
                    <div className="dashboard-grid">
                        {matches.map((match: any) => {
                            if (!match.tutor) return null
                            const t = match.tutor
                            const tName = t.profiles ? `${t.profiles.first_name} ${t.profiles.last_name}` : 'Unknown'
                            return (
                                <div key={t.id} className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.2rem', color: '#111827', textTransform: 'none', marginBottom: '0.2rem' }}>{tName}</h3>
                                    <div style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>{t.university}</div>
                                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '1.5rem', flex: 1 }}>{t.bio?.substring(0, 100)}...</p>
                                    <button className="btn-small">Request Lesson</button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}
