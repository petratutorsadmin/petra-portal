import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function TutorStudentsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // RLS filters this down to students matched to this tutor
    const { data: matches, error } = await supabase
        .from('matches')
        .select(`
      student:student_profiles(
        id, assigned_plan,
        profiles(first_name, last_name, email, timezone)
      )
    `)
        .eq('tutor_id', user.id)
        .eq('status', 'active')

    return (
        <div className="tutor-students-page">
            <header className="tutor-header">
                <h1>My Students</h1>
                <p>A list of your currently active and assigned students.</p>
            </header>

            <section className="dashboard-section mt-4">
                {error ? (
                    <p className="error-text">Failed to load students.</p>
                ) : !matches || matches.length === 0 ? (
                    <p className="empty-state">You do not have any active matched students.</p>
                ) : (
                    <div className="dashboard-grid">
                        {matches.map((match: any) => {
                            if (!match.student) return null
                            const s = match.student
                            const sName = s.profiles ? `${s.profiles.first_name} ${s.profiles.last_name}` : 'Unknown'
                            return (
                                <div key={s.id} className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.2rem', color: '#0f172a', textTransform: 'none', marginBottom: '0.2rem' }}>{sName}</h3>
                                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>{s.profiles?.timezone || 'Unknown Timezone'}</div>

                                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem', flex: 1 }}>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Plan</div>
                                        <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 500 }}>{s.assigned_plan || 'Standard Tutoring'}</div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-small flex-1">View History</button>
                                        <button className="btn-primary flex-1" style={{ fontSize: '0.8rem', padding: '0.4rem' }}>Log Lesson</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}
