import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import '../../admin/users/users.css' // Form/Table utility classes

export default async function TutorPayoutsPage() {
    const supabase = await createClient()

    // RLS filters this down to only the tutor's own payouts
    const { data: payouts, error } = await supabase
        .from('payouts')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="tutor-payouts-page">
            <header className="tutor-header">
                <h1>My Payouts</h1>
                <p>View your past payment history and pending balances.</p>
            </header>

            <div className="dashboard-grid">
                <div className="stat-card" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
                    <h3>Next Expected Payout</h3>
                    <p className="stat-number" style={{ color: '#3b82f6' }}>—</p>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Pending admin calculation.</p>
                </div>
                <div className="stat-card">
                    <h3>Total Earnings (YTD)</h3>
                    <p className="stat-number">—</p>
                </div>
            </div>

            <section className="dashboard-section mt-4">
                <h2>Payout History</h2>
                {error ? (
                    <p className="error-text">Failed to load payouts.</p>
                ) : !payouts || payouts.length === 0 ? (
                    <p className="empty-state">No payout records found yet.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Period / Notes</th>
                                <th>Amount</th>
                                <th>Date Paid</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map((payout: any) => {
                                const statusColor = payout.status === 'paid' ? 'success' : 'warning'
                                return (
                                    <tr key={payout.id}>
                                        <td>{payout.notes || 'Monthly Payout'}</td>
                                        <td style={{ fontWeight: '600' }}>${payout.amount.toFixed(2)}</td>
                                        <td>{payout.payout_date ? new Date(payout.payout_date).toLocaleDateString() : '-'}</td>
                                        <td><span className={`badge ${statusColor}`}>{payout.status}</span></td>
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
