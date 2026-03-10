import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { calculateAndLogPayout } from './actions'
import '@/app/shared/forms.css'

export default async function AdminPayoutsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams
    const supabase = await createClient()

    // Fetch tutors for the dropdown
    const { data: tutors } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'tutor')
        .order('first_name')

    // Fetch recent payouts
    const { data: payouts } = await supabase
        .from('payouts')
        .select(`*, tutor:tutor_profiles(profiles(first_name, last_name))`)
        .order('created_at', { ascending: false })
        .limit(20)

    return (
        <div className="admin-payouts-page">
            <header className="admin-header">
                <h1>Tutor Payouts</h1>
                <p>Calculate and log payments to your tutoring team.</p>
            </header>

            {resolvedParams?.success && (
                <div className="success-banner">✓ {resolvedParams.success}</div>
            )}
            {resolvedParams?.error && (
                <div className="error-text" style={{ marginBottom: '1rem' }}>{resolvedParams.error}</div>
            )}

            {/* Calculate Payout Form */}
            <section className="dashboard-section mt-4" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.25rem' }}>Calculate New Payout</h2>
                <form className="admin-form" action={calculateAndLogPayout}>
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label htmlFor="tutor_id">Tutor *</label>
                            <select id="tutor_id" name="tutor_id" required>
                                <option value="">— Select Tutor —</option>
                                {tutors?.map((t) => (
                                    <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="start_date">Start Date *</label>
                            <input id="start_date" name="start_date" type="date" required />
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="end_date">End Date *</label>
                            <input id="end_date" name="end_date" type="date" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="notes">Notes (Internal)</label>
                        <input id="notes" name="notes" type="text" placeholder="e.g. March 2026 Monthly Payout" />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Calculate &amp; Log Payout</button>
                    </div>
                </form>
            </section>

            <div className="tabs">
                <Link href="/admin/invoices" className="tab">Client Invoices</Link>
                <Link href="/admin/invoices/payouts" className="tab active">Tutor Payouts</Link>
            </div>

            <section className="dashboard-section mt-4">
                <h2 style={{ marginBottom: '1.25rem' }}>Recent Payout History</h2>
                {!payouts || payouts.length === 0 ? (
                    <p className="empty-state">No payout records found.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date Logged</th>
                                <th>Tutor</th>
                                <th>Amount</th>
                                <th>Period</th>
                                <th>Status</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map((p) => {
                                const t = p.tutor as any
                                const tutorName = t?.profiles ? `${t.profiles.first_name} ${t.profiles.last_name}` : 'Unknown'
                                const statusColor = p.status === 'paid' ? 'success' : 'info'
                                return (
                                    <tr key={p.id}>
                                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
                                        <td>{tutorName}</td>
                                        <td style={{ fontWeight: '600' }}>¥{Number(p.amount).toLocaleString()}</td>
                                        <td>{p.period_start} to {p.period_end}</td>
                                        <td><span className={`badge ${statusColor}`}>{p.status}</span></td>
                                        <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{p.notes || '—'}</td>
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
