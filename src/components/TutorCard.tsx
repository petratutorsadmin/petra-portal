import React from 'react'

interface TutorCardProps {
    tutor: {
        id: string
        university: string
        curriculum_expertise: string[] | null
        bio: string
        profiles: {
            first_name: string
            last_name: string
        } | null
    }
    onRequestMatch: (tutorId: string, name: string, expertise: string) => void
}

export default function TutorCard({ tutor, onRequestMatch }: TutorCardProps) {
    const name = tutor.profiles ? `${tutor.profiles.first_name} ${tutor.profiles.last_name}` : 'Tutor'
    const expertise = tutor.curriculum_expertise?.[0] || 'General Tutoring'

    return (
        <div className="tutor-card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e2e8f0', marginRight: '1rem' }}></div>
                <div>
                    <h3 style={{ fontSize: '1.15rem', color: '#111827', margin: 0 }}>{name}</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>{tutor.university}</p>
                </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Expertise</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {tutor.curriculum_expertise?.map((cert: string) => (
                        <span key={cert} style={{ background: '#f3f4f6', color: '#374151', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>{cert}</span>
                    )) || <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Not specified</span>}
                </div>
            </div>

            <p style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.5, flex: 1 }}>{tutor.bio}</p>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                <form action={() => onRequestMatch(tutor.id, name, expertise)}>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Request Match (Test Calendar Sync)</button>
                </form>
            </div>
        </div>
    )
}
