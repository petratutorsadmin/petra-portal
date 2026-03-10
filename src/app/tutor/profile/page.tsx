import { createClient } from '@/utils/supabase/server'
import { updateTutorProfile } from '../actions'
import '@/app/shared/forms.css'

export default async function TutorProfilePage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string }>
}) {
    const supabase = await createClient()
    const resolvedParams = await searchParams

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, tutor_profiles(*)')
        .eq('id', user.id)
        .single()

    const tutorInfo = (profile?.tutor_profiles as any[])?.[0] || {}

    return (
        <div className="tutor-profile-page">
            <header className="tutor-header flex-between">
                <div>
                    <h1>My Profile</h1>
                    <p>Update your public directory information and settings.</p>
                </div>
            </header>

            {resolvedParams?.success && (
                <div className="success-banner">✓ Profile saved successfully!</div>
            )}

            <section className="dashboard-section mt-4" style={{ maxWidth: '800px' }}>
                <form className="admin-form" action={updateTutorProfile}>
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label htmlFor="first_name">First Name</label>
                            <input id="first_name" name="first_name" type="text" defaultValue={profile?.first_name} />
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="last_name">Last Name</label>
                            <input id="last_name" name="last_name" type="text" defaultValue={profile?.last_name} />
                        </div>
                    </div>

                    <div className="form-row mt-4">
                        <div className="form-group flex-1">
                            <label htmlFor="university">University / Alma Mater</label>
                            <input id="university" name="university" type="text" defaultValue={tutorInfo.university} placeholder="e.g. University of Tokyo" />
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="timezone">Timezone</label>
                            <input id="timezone" name="timezone" type="text" defaultValue={profile?.timezone} disabled style={{ backgroundColor: '#f8fafc' }} />
                        </div>
                    </div>

                    <div className="form-group mt-4">
                        <label htmlFor="bio">Public Biography</label>
                        <textarea id="bio" name="bio" rows={4} defaultValue={tutorInfo.bio} placeholder="Share your academic background and passions..."></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="teaching_style">Teaching Style</label>
                        <textarea id="teaching_style" name="teaching_style" rows={3} defaultValue={tutorInfo.teaching_style} placeholder="How do you approach learning with your students?"></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="general_availability_summary">General Availability Summary</label>
                        <input id="general_availability_summary" name="general_availability_summary" type="text" defaultValue={tutorInfo.general_availability_summary} placeholder="e.g. Weekday evenings and Saturday mornings (JST)" />
                    </div>

                    <hr style={{ margin: '1.5rem 0', borderTop: '1px solid #e2e8f0' }} />

                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Save Changes</button>
                    </div>
                </form>
            </section>
        </div>
    )
}
