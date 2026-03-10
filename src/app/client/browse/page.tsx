import { createClient } from '@/utils/supabase/server'
import { requestMatch } from './actions'

export default async function ClientBrowsePage() {
    const supabase = await createClient()

    // RLS MUST be configured to allow students to read this
    const { data: tutors, error } = await supabase
        .from('tutor_profiles')
        .select(`
      id, university, subjects, curriculum_expertise, bio, teaching_style, general_availability_summary,
      profiles(first_name, last_name)
    `)
        .limit(20)

    return (
        <div className="client-browse-page">
            <header className="client-header">
                <h1>Browse Tutors</h1>
                <p>Explore approved Petra tutors and submit a match request.</p>
            </header>

            <section className="dashboard-section mt-4" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
                {error ? (
                    <p className="error-text">Failed to load tutors directory.</p>
                ) : !tutors || tutors.length === 0 ? (
                    <p className="empty-state" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>No tutors available for browsing at this time.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {tutors.map((t: any) => {
                            const name = t.profiles ? `${t.profiles.first_name} ${t.profiles.last_name}` : 'Tutor'
                            return (
                                <div key={t.id} className="tutor-card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e2e8f0', marginRight: '1rem' }}></div>
                                        <div>
                                            <h3 style={{ fontSize: '1.15rem', color: '#111827', margin: 0 }}>{name}</h3>
                                            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>{t.university}</p>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Expertise</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {t.curriculum_expertise?.map((cert: string) => (
                                                <span key={cert} style={{ background: '#f3f4f6', color: '#374151', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>{cert}</span>
                                            )) || <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Not specified</span>}
                                        </div>
                                    </div>

                                    <p style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.5, flex: 1 }}>{t.bio}</p>

                                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                                        <form action={requestMatch.bind(null, t.id, name, t.curriculum_expertise?.[0] || 'General Tutoring')}>
                                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Request Match (Test Calendar Sync)</button>
                                        </form>
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
