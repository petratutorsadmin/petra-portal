import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import './users.css'

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams
    const role = typeof resolvedParams.role === 'string' ? resolvedParams.role : 'student'

    const supabase = await createClient()

    // Fetch profiles based on selected role
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false })

    return (
        <div className="admin-users-page">
            <header className="admin-header flex-between">
                <div>
                    <h1>User Management</h1>
                    <p>Manage students, parents, tutors, and administrators.</p>
                </div>
                <Link href="/admin/users/new" className="btn-primary">+ Add User</Link>
            </header>

            <div className="tabs">
                <Link href="/admin/users?role=student" className={`tab ${role === 'student' ? 'active' : ''}`}>Students</Link>
                <Link href="/admin/users?role=tutor" className={`tab ${role === 'tutor' ? 'active' : ''}`}>Tutors</Link>
                <Link href="/admin/users?role=parent" className={`tab ${role === 'parent' ? 'active' : ''}`}>Parents</Link>
                <Link href="/admin/users?role=admin" className={`tab ${role === 'admin' ? 'active' : ''}`}>Admins</Link>
            </div>

            <section className="dashboard-section mt-4">
                {error ? (
                    <p className="error-text">Failed to load users.</p>
                ) : !profiles || profiles.length === 0 ? (
                    <p className="empty-state">No users found for this role.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Timezone</th>
                                <th>Joined</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profiles.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        {p.first_name || p.last_name ? `${p.first_name || ''} ${p.last_name || ''}` : 'No Name Set'}
                                    </td>
                                    <td>{p.email}</td>
                                    <td>{p.timezone}</td>
                                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <Link href={`/admin/users/${p.id}`} className="btn-small">Edit</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    )
}
