import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PlanChangeForm, CancelRequestButton } from './PlanChangeForm'
import './plan.css'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending:      { label: '⏳ Pending',      color: '#92400e', bg: '#fef3c7' },
    under_review: { label: '🔍 Under Review', color: '#1e40af', bg: '#dbeafe' },
    approved:     { label: '✓ Approved',     color: '#065f46', bg: '#d1fae5' },
    declined:     { label: '✕ Declined',     color: '#991b1b', bg: '#fee2e2' },
    cancelled:    { label: '— Cancelled',    color: '#4b5563', bg: '#f3f4f6' },
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
    format_change:        'Lesson Format Change',
    frequency_change:     'Lesson Frequency Change',
    lesson_length_change: 'Lesson Length Change',
    tutor_change:         'Tutor Change Request',
    add_subject:          'Add a Subject',
    pause:                'Plan Pause',
    resume:               'Plan Resume',
    add_sibling:          'Add a Sibling',
    other:                'Other Request',
}

export default async function PlanManagementPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [
        { data: match },
        { data: recentLesson },
        { data: changeRequests },
        { data: nextInvoice },
    ] = await Promise.all([
        // Active tutor match
        supabase.from('matches')
            .select(`
                id, status, created_at,
                tutor_profiles!matches_tutor_id_fkey(
                    profiles(first_name, last_name)
                )
            `)
            .eq('student_id', user.id)
            .eq('status', 'active')
            .limit(1)
            .maybeSingle(),

        // Most recent lesson for current format/length
        supabase.from('lessons')
            .select('duration_minutes, delivery_type, subject_program')
            .eq('student_id', user.id)
            .order('date_time', { ascending: false })
            .limit(1)
            .maybeSingle(),

        // Plan change requests (most recent first)
        supabase.from('plan_change_requests')
            .select('*')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),

        // Most recent invoice
        supabase.from('invoices')
            .select('amount_jpy, status, due_date, period_start, period_end')
            .eq('student_id', user.id)
            .order('due_date', { ascending: false })
            .limit(1)
            .maybeSingle(),
    ])

    const tutorProfile = match?.tutor_profiles as any
    const tutorFirstName = tutorProfile?.profiles?.first_name ?? '—'
    const tutorLastName = tutorProfile?.profiles?.last_name ?? ''

    const activeRequests = (changeRequests ?? []).filter(r => ['pending', 'under_review'].includes(r.status))
    const pastRequests = (changeRequests ?? []).filter(r => ['approved', 'declined', 'cancelled'].includes(r.status))

    return (
        <div className="plan-management-page">
            <header className="plan-header">
                <h1>My Plan</h1>
                <p>Your current setup, billing, and plan requests.</p>
            </header>

            <div className="plan-grid">
                {/* ── LEFT COLUMN ── */}
                <div className="plan-left">

                    {/* Current Plan Card */}
                    <section className="plan-card">
                        <h2 className="plan-card-title">Current Plan</h2>

                        <div className="plan-rows">
                            <div className="plan-row">
                                <span className="plan-row-label">Tutor</span>
                                <span className="plan-row-value">{match ? `${tutorFirstName} ${tutorLastName}` : 'Not yet matched'}</span>
                            </div>
                            <div className="plan-row">
                                <span className="plan-row-label">Focus Area</span>
                                <span className="plan-row-value">{recentLesson?.subject_program ?? '—'}</span>
                            </div>
                            <div className="plan-row">
                                <span className="plan-row-label">Lesson Format</span>
                                <span className="plan-row-value" style={{ textTransform: 'capitalize' }}>
                                    {recentLesson?.delivery_type?.replace(/_/g, ' ') ?? '—'}
                                </span>
                            </div>
                            <div className="plan-row">
                                <span className="plan-row-label">Lesson Length</span>
                                <span className="plan-row-value">
                                    {recentLesson?.duration_minutes ? `${recentLesson.duration_minutes} min` : '—'}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Billing Card */}
                    <section className="plan-card">
                        <h2 className="plan-card-title">Billing</h2>

                        {nextInvoice ? (
                            <div className="plan-rows">
                                <div className="plan-row">
                                    <span className="plan-row-label">Next Invoice</span>
                                    <span className="plan-row-value">
                                        {new Date(nextInvoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="plan-row">
                                    <span className="plan-row-label">Amount</span>
                                    <span className="plan-row-value" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                        ¥{nextInvoice.amount_jpy?.toLocaleString() ?? '—'}
                                    </span>
                                </div>
                                <div className="plan-row">
                                    <span className="plan-row-label">Status</span>
                                    <span className={`invoice-status ${nextInvoice.status}`}>
                                        {nextInvoice.status === 'paid' ? '✓ Paid' : nextInvoice.status === 'overdue' ? '⚠ Overdue' : 'Unpaid'}
                                    </span>
                                </div>
                                {nextInvoice.period_start && (
                                    <div className="plan-row">
                                        <span className="plan-row-label">Period</span>
                                        <span className="plan-row-value" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            {new Date(nextInvoice.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(nextInvoice.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No invoice data yet.</p>
                        )}
                    </section>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="plan-right">

                    {/* Active Requests */}
                    {activeRequests.length > 0 && (
                        <section className="plan-card">
                            <h2 className="plan-card-title">Active Requests</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {activeRequests.map(req => {
                                    const cfg = STATUS_CONFIG[req.status]
                                    return (
                                        <div key={req.id} className="request-item">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                                <div>
                                                    <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                                        {REQUEST_TYPE_LABELS[req.request_type] ?? req.request_type}
                                                    </p>
                                                    {req.requested_value && (
                                                        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                                                            Requested: <strong>{req.requested_value}</strong>
                                                        </p>
                                                    )}
                                                    {req.projected_monthly_jpy && req.current_monthly_jpy && (
                                                        <p style={{ color: '#8b5cf6', fontSize: '0.8rem', margin: '0.25rem 0 0', fontWeight: 600 }}>
                                                            Est. monthly: ¥{req.current_monthly_jpy.toLocaleString()} → ¥{req.projected_monthly_jpy.toLocaleString()}
                                                        </p>
                                                    )}
                                                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.5rem 0 0' }}>
                                                        Submitted {new Date(req.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <span style={{ padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: cfg?.bg, color: cfg?.color, display: 'block', marginBottom: '0.5rem' }}>
                                                        {cfg?.label}
                                                    </span>
                                                    {req.status === 'pending' && <CancelRequestButton requestId={req.id} />}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {/* Request Changes */}
                    <section className="plan-card">
                        <h2 className="plan-card-title">Request a Change</h2>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                            Submit a structured request. Petra will review and confirm details with you directly. Simple changes may include a price preview before you confirm.
                        </p>
                        <PlanChangeForm />
                    </section>

                    {/* Past Requests */}
                    {pastRequests.length > 0 && (
                        <section className="plan-card">
                            <h2 className="plan-card-title" style={{ color: '#94a3b8' }}>Request History</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {pastRequests.map(req => {
                                    const cfg = STATUS_CONFIG[req.status]
                                    return (
                                        <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0, color: '#475569' }}>
                                                    {REQUEST_TYPE_LABELS[req.request_type] ?? req.request_type}
                                                </p>
                                                {req.admin_notes && (
                                                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                                                        Petra: {req.admin_notes}
                                                    </p>
                                                )}
                                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
                                                    {new Date(req.created_at).toLocaleDateString()}
                                                    {req.effective_date && ` · Effective ${new Date(req.effective_date).toLocaleDateString()}`}
                                                </p>
                                            </div>
                                            <span style={{ padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: cfg?.bg, color: cfg?.color, whiteSpace: 'nowrap' }}>
                                                {cfg?.label}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    )
}
