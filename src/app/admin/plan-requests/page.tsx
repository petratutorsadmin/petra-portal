import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { reviewPlanChangeRequest } from '@/app/client/pricing/actions'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending:      { label: 'Pending',      color: '#92400e', bg: '#fef3c7' },
    under_review: { label: 'Under Review', color: '#1e40af', bg: '#dbeafe' },
    approved:     { label: 'Approved',     color: '#065f46', bg: '#d1fae5' },
    declined:     { label: 'Declined',     color: '#991b1b', bg: '#fee2e2' },
    cancelled:    { label: 'Cancelled',    color: '#4b5563', bg: '#f3f4f6' },
}

const TYPE_LABELS: Record<string, string> = {
    format_change: 'Format Change', frequency_change: 'Frequency Change',
    lesson_length_change: 'Length Change', tutor_change: 'Tutor Change',
    add_subject: 'Add Subject', pause: 'Pause Plan', resume: 'Resume Plan',
    add_sibling: 'Add Sibling', other: 'Other',
}

async function markUnderReview(formData: FormData) {
    'use server'
    const id = formData.get('request_id') as string
    await reviewPlanChangeRequest(id, 'approved', 'Under review - we will be in touch shortly.')
}

async function approveRequest(formData: FormData) {
    'use server'
    const id = formData.get('request_id') as string
    const notes = formData.get('admin_notes') as string
    const date = formData.get('effective_date') as string
    await reviewPlanChangeRequest(id, 'approved', notes, date || undefined)
}

async function declineRequest(formData: FormData) {
    'use server'
    const id = formData.get('request_id') as string
    const notes = formData.get('admin_notes') as string
    await reviewPlanChangeRequest(id, 'declined', notes)
}

export default async function AdminPlanRequestsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: requests } = await supabase
        .from('plan_change_requests')
        .select(`
            *,
            student_profiles!plan_change_requests_student_id_fkey(
                profiles(first_name, last_name, email)
            )
        `)
        .order('created_at', { ascending: false })

    const active = (requests ?? []).filter(r => ['pending', 'under_review'].includes(r.status))
    const resolved = (requests ?? []).filter(r => ['approved', 'declined', 'cancelled'].includes(r.status))

    return (
        <div style={{ maxWidth: '900px', padding: '2rem', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>Plan Change Requests</h1>
                <p style={{ color: '#64748b', margin: 0 }}>{active.length} active · {resolved.length} resolved</p>
            </header>

            {/* Active Requests */}
            {active.length > 0 ? (
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                        Needs Attention
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {active.map(req => {
                            const sp = req.student_profiles as any
                            const studentName = `${sp?.profiles?.first_name ?? ''} ${sp?.profiles?.last_name ?? ''}`.trim()
                            const cfg = STATUS_CONFIG[req.status]

                            return (
                                <div key={req.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                                        <div>
                                            <p style={{ fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem', fontSize: '1.05rem' }}>
                                                {studentName} — {TYPE_LABELS[req.request_type] ?? req.request_type}
                                            </p>
                                            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>{sp?.profiles?.email}</p>
                                        </div>
                                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: cfg?.bg, color: cfg?.color }}>
                                            {cfg?.label}
                                        </span>
                                    </div>

                                    <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                        {req.current_value && (
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, margin: '0 0 0.25rem' }}>CURRENT</p>
                                                <p style={{ margin: 0, fontWeight: 600, color: '#475569' }}>{req.current_value}</p>
                                            </div>
                                        )}
                                        {req.requested_value && (
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, margin: '0 0 0.25rem' }}>REQUESTED</p>
                                                <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{req.requested_value}</p>
                                            </div>
                                        )}
                                        {req.projected_monthly_jpy && (
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, margin: '0 0 0.25rem' }}>PRICE DELTA</p>
                                                <p style={{ margin: 0, fontWeight: 700, color: '#8b5cf6' }}>
                                                    ¥{req.current_monthly_jpy?.toLocaleString()} → ¥{req.projected_monthly_jpy?.toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, margin: '0 0 0.25rem' }}>SUBMITTED</p>
                                            <p style={{ margin: 0, fontWeight: 600, color: '#475569' }}>
                                                {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    {req.notes && (
                                        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.875rem', marginBottom: '1.25rem' }}>
                                            <p style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 700, margin: '0 0 0.25rem' }}>STUDENT NOTE</p>
                                            <p style={{ margin: 0, color: '#0c4a6e', fontSize: '0.9rem' }}>{req.notes}</p>
                                        </div>
                                    )}

                                    {/* Admin action form */}
                                    <form action={approveRequest} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <input type="hidden" name="request_id" value={req.id} />
                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            <input
                                                name="admin_notes"
                                                placeholder="Admin note to student (optional)"
                                                style={{ flex: 1, minWidth: '200px', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                                            />
                                            <input
                                                name="effective_date"
                                                type="date"
                                                style={{ padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button type="submit" style={{ flex: 1, padding: '0.75rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                                                ✓ Approve
                                            </button>
                                            <button formAction={declineRequest} style={{ flex: 1, padding: '0.75rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                                                ✕ Decline
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )
                        })}
                    </div>
                </section>
            ) : (
                <div style={{ background: '#f8fafc', border: '1px dashed #e2e8f0', borderRadius: '12px', padding: '3rem', textAlign: 'center', marginBottom: '3rem' }}>
                    <p style={{ color: '#64748b', margin: 0, fontWeight: 600 }}>No active requests</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0.5rem 0 0' }}>All caught up.</p>
                </div>
            )}

            {/* Resolved */}
            {resolved.length > 0 && (
                <section>
                    <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                        Resolved
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {resolved.map(req => {
                            const sp = req.student_profiles as any
                            const name = `${sp?.profiles?.first_name ?? ''} ${sp?.profiles?.last_name ?? ''}`.trim()
                            const cfg = STATUS_CONFIG[req.status]
                            return (
                                <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', background: '#f8fafc', borderRadius: '10px', gap: '1rem' }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>{name} — {TYPE_LABELS[req.request_type]}</p>
                                        {req.admin_notes && <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{req.admin_notes}</p>}
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: cfg?.bg, color: cfg?.color }}>
                                            {cfg?.label}
                                        </span>
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}
        </div>
    )
}
