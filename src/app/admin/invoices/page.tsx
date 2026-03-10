import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import '@/app/shared/forms.css'

export default async function AdminInvoicesPage() {
    const supabase = await createClient()

    // Admins see all invoices and payouts
    // We'll show invoices for now as the default view
    const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
      *,
      student:student_profiles(id, profiles(first_name, last_name))
    `)
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <div className="admin-invoices-page">
            <header className="admin-header flex-between">
                <div>
                    <h1>Invoices & Payments</h1>
                    <p>Track client invoices and record manual payments received.</p>
                </div>
                <button className="btn-primary">+ Create Invoice</button>
            </header>

            <div className="tabs">
                <Link href="/admin/invoices" className="tab active">Client Invoices</Link>
                <Link href="/admin/invoices/payouts" className="tab">Tutor Payouts</Link>
            </div>

            <section className="dashboard-section mt-4">
                {error ? (
                    <p className="error-text">Failed to load invoices.</p>
                ) : !invoices || invoices.length === 0 ? (
                    <p className="empty-state">No invoices found currently.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Student</th>
                                <th>Amount</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv) => {
                                const s = inv.student as any
                                const studentName = s?.profiles ? `${s.profiles.first_name} ${s.profiles.last_name}` : 'Unknown'
                                const statusColor = inv.status === 'paid' ? 'success' : inv.status === 'unpaid' ? 'warning' : 'info'

                                return (
                                    <tr key={inv.id}>
                                        <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                                        <td>{studentName}</td>
                                        <td style={{ fontWeight: '600' }}>${inv.amount.toFixed(2)}</td>
                                        <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}</td>
                                        <td><span className={`badge ${statusColor}`}>{inv.status}</span></td>
                                        <td>
                                            <button className="btn-small">Log Payment</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    )
}
