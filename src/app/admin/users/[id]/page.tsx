import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateUser } from '../../actions'
import '../users.css'

export default async function EditUserPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const userId = (await params).id
    const supabase = await createClient()

    // 1. Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (!profile) notFound()

    // 2. Fetch role-specific profile if it's a tutor
    let tutorProfile = null
    if (profile.role === 'tutor') {
        const { data: tp } = await supabase
            .from('tutor_profiles')
            .select('*')
            .eq('id', userId)
            .single()
        tutorProfile = tp
    }

    const updateUserWithId = updateUser.bind(null, userId)

    return (
        <div className="admin-users-page">
            <header className="admin-header">
                <Link href="/admin/users" className="btn-secondary mb-4" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                    ← Back to Users
                </Link>
                <h1>Edit User: {profile.email}</h1>
                <p>Modify user profile and role-specific permissions.</p>
            </header>

            <div className="dashboard-section mt-4" style={{ maxWidth: '800px' }}>
                <form className="admin-form" action={updateUserWithId}>
                    <div className="form-section">
                        <h3>General Information</h3>
                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label htmlFor="first_name">First Name</label>
                                <input id="first_name" name="first_name" type="text" defaultValue={profile.first_name || ''} />
                            </div>
                            <div className="form-group flex-1">
                                <label htmlFor="last_name">Last Name</label>
                                <input id="last_name" name="last_name" type="text" defaultValue={profile.last_name || ''} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label htmlFor="role">Role</label>
                                <select id="role" name="role" defaultValue={profile.role}>
                                    <option value="student">Student</option>
                                    <option value="tutor">Tutor</option>
                                    <option value="parent">Parent</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="form-group flex-1">
                                <label htmlFor="status">Status</label>
                                <select id="status" name="status" defaultValue={profile.status}>
                                    <option value="active">Active</option>
                                    <option value="onboarding">Onboarding</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="timezone">Timezone</label>
                            <input id="timezone" name="timezone" type="text" defaultValue={profile.timezone || 'Asia/Tokyo'} />
                        </div>
                    </div>

                    {profile.role === 'tutor' && (
                        <div className="form-section mt-4" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                            <h3>Tutor Specific Settings</h3>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label htmlFor="tutor_level">Tutor Level (0-5)</label>
                                    <input 
                                        id="tutor_level" 
                                        name="tutor_level" 
                                        type="number" 
                                        min="0" 
                                        max="5" 
                                        defaultValue={tutorProfile?.tutor_level ?? 1} 
                                    />
                                    <p className="help-text">Controls base pay rates in the pricing engine.</p>
                                </div>
                                <div className="form-group flex-1">
                                    <label htmlFor="tutor_pay_mode">Pay Mode</label>
                                    <select id="tutor_pay_mode" name="tutor_pay_mode" defaultValue={tutorProfile?.tutor_pay_mode ?? 'standard'}>
                                        <option value="standard">Standard (Level Default)</option>
                                        <option value="min">Minimum Rate</option>
                                        <option value="max">Maximum Rate</option>
                                        <option value="custom">Custom (Override)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="university">University</label>
                                <input id="university" name="university" type="text" defaultValue={tutorProfile?.university || ''} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="bio">Admin Bio / Internal Notes</label>
                                <textarea id="bio" name="bio" rows={4} defaultValue={tutorProfile?.bio || ''}></textarea>
                            </div>
                        </div>
                    )}

                    <div className="form-actions mt-4">
                        <button type="submit" className="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
