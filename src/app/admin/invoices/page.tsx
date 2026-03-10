import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { createInvoice, logPayment } from '../actions'
import '@/app/shared/forms.css'

export default async function AdminInvoicesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams
    const supabase = await createClient()

    const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`*, student:student_profiles(id, profiles(first_name, last_name))`)
        .order('created_at', { ascending: false })
        .limit(50)

    // Fetch students for the create invoice form
    const { data: students } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'student')
        .order('first_name')

    return (
        <div className="admin-invoices-page">
            <header className="admin-header">
                <h1>Invoices &amp; Payments</h1>
                <p>Track client invoices and record manual payments received.</p>
            </header>

            {resolvedParams?.success && (
                <div className="success-banner">✓ {resolvedParams.success}</div>
            )}
            {resolvedParams?.error && (
                <div className="error-text" style={{ marginBottom: '1rem' }}>{resolvedParams.error}</div>
            )}

            {/* Create Invoice Form */}
            <section className="dashboard-section mt-4" style={{ maxWidth: '700px', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.25rem' }}>Create New Invoice</h2>
                <form className="admin-form" action={createInvoice}>
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label htmlFor="student_id">Student</label>
                            <select id="student_id" name="student_id" required>
                                <option value="">— Select Student —</option>
                                {students?.map((s) => (
                                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="amount">Amount (USD)</label>
                            <input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="e.g. 250.00" required />
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="due_date">Due Date</label>
                            <input id="due_date" name="due_date" type="date" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="notes">Notes (Optional)</label>
                        <input id="notes" name="notes" type="text" placeholder="e.g. April lessons — 4 sessions" />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">+ Create Invoice</button>
                    </div>
                </form>
            </section>

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
                                        <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td>
                                        <td><span className={`badge ${statusColor}`}>{inv.status}</span></td>
                                        <td>
                                            {inv.status !== 'paid' ? (
                                                <form action={logPayment} style={{ display: 'inline' }}>
                                                    <input type="hidden" name="invoice_id" value={inv.id} />
                                                    <button type="submit" className="btn-small" style={{ background: '#dcfce3', color: '#166534', borderColor: '#bbf7d0' }}>
                                                        ✓ Log Payment
                                                    </button>
                                                </form>
                                            ) : (
                                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Paid</span>
                                            )}
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
