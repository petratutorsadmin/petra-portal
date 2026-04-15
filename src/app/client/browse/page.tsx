import { createClient } from '@/utils/supabase/server'
import { requestMatch } from './actions'
import TutorCard from '@/components/TutorCard'

export default async function ClientBrowsePage() {
    const supabase = await createClient()

    // Fetch tutors (Batch fetch - No N+1 here)
    const { data: tutors, error } = await supabase
        .from('tutor_profiles')
        .select(`
          id, university, subjects, curriculum_expertise, bio, teaching_style, general_availability_summary,
          profiles(first_name, last_name)
        `)
        .limit(12) // Initial pagination limit

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
                        {tutors.map((t: any) => (
                            <TutorCard 
                                key={t.id} 
                                tutor={t} 
                                onRequestMatch={requestMatch} 
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
