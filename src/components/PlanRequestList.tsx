import React from 'react'
import { CancelRequestButton } from '@/app/client/pricing/PlanChangeForm'

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

interface PlanRequestListProps {
    requests: any[]
    title: string
    isHistory?: boolean
}

export default function PlanRequestList({ requests, title, isHistory }: PlanRequestListProps) {
    if (requests.length === 0) return null

    return (
        <section className={`plan-card ${isHistory ? 'history' : ''}`}>
            <h2 className="plan-card-title" style={isHistory ? { color: '#94a3b8' } : {}}>{title}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: isHistory ? '0.75rem' : '1rem' }}>
                {requests.map(req => {
                    const cfg = STATUS_CONFIG[req.status]
                    
                    if (isHistory) {
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
                    }

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
    )
}
