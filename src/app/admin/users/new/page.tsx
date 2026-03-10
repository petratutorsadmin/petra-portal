import { createUser } from './actions'
import Link from 'next/link'

export default function NewUserPage() {
    return (
        <div className="admin-new-user-page">
            <header className="admin-header">
                <Link href="/admin/users" className="back-link">← Back to Users</Link>
                <h1 className="mt-4">Add New User</h1>
                <p>Create a new profile. They will need to set their password through the invite email.</p>
            </header>

            <div className="dashboard-section mt-4" style={{ maxWidth: '600px' }}>
                <form className="admin-form" action={createUser}>
                    <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <select id="role" name="role" required>
                            <option value="student">Student</option>
                            <option value="parent">Parent</option>
                            <option value="tutor">Tutor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label htmlFor="first_name">First Name</label>
                            <input id="first_name" name="first_name" type="text" />
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="last_name">Last Name</label>
                            <input id="last_name" name="last_name" type="text" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input id="email" name="email" type="email" required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="timezone">Timezone</label>
                        <select id="timezone" name="timezone" defaultValue="Asia/Tokyo">
                            <option value="Asia/Tokyo">Japan Time (JST)</option>
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="Europe/London">London (GMT/BST)</option>
                            <option value="Europe/Paris">Central European Time (CET)</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Create User</button>
                        <Link href="/admin/users" className="btn-secondary">Cancel</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
