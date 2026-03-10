import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function ClientPaymentsPage() {
    const supabase = await createClient()

    // RLS ensures they only see their own invoices
    const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="client-payments-page">
            <header className="client-header">
                <h1>Payments & Invoices</h1>
                <p>Review your billing history and download official Petra invoices.</p>
            </header>

            <div className="dashboard-grid">
                <div className="stat-card" style={{ borderColor: '#ef4444', background: '#fef2f2' }}>
                    <h3 style={{ color: '#991b1b' }}>Outstanding Balance</h3>
                    <p className="stat-number" style={{ color: '#7f1d1d' }}>$0.00</p>
                </div>
                <div className="stat-card">
                    <h3>Last Payment Logged</h3>
                    <p className="stat-status active">Oct 1, 2026</p>
                </div>
            </div>

            <section className="dashboard-section mt-4">
                <h2>Invoice History</h2>
                {error ? (
                    <p className="error-text">Failed to load invoices.</p>
                ) : !invoices || invoices.length === 0 ? (
                    <p className="empty-state">No invoices have been issued yet.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date Issued</th>
                                <th>Amount</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv) => {
                                const statusColor = inv.status === 'paid' ? 'success' : inv.status === 'unpaid' ? 'warning' : 'info'
                                return (
                                    <tr key={inv.id}>
                                        <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                                        <td style={{ fontWeight: '600' }}>${inv.amount.toFixed(2)}</td>
                                        <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}</td>
                                        <td><span className={`badge ${statusColor}`}>{inv.status}</span></td>
                                        <td>
                                            {inv.file_url ? (
                                                <a href={inv.file_url} target="_blank" rel="noreferrer" className="btn-small">Download PDF</a>
                                            ) : (
                                                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No PDF available</span>
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
