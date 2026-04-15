import React from 'react'

interface BillingCardProps {
    nextInvoice: {
        amount_jpy: number
        status: string
        due_date: string
        period_start: string | null
        period_end: string | null
    } | null
}

export default function BillingCard({ nextInvoice }: BillingCardProps) {
    return (
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
                    {nextInvoice.period_start && nextInvoice.period_end && (
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
    )
}
