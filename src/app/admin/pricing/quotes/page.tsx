import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { saveQuote, approveQuoteAndCreateInvoice } from './quote-actions'
import '@/app/shared/forms.css'
import './quotes.css'

export default async function AdminQuotesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams
    const supabase = await createClient()

    // Fetch all data needed for the form dropdowns
    const [
        { data: programs },
        { data: students },
        { data: tutors },
        { data: markets },
        { data: currencies },
        { data: quotes },
    ] = await Promise.all([
        supabase.from('program_categories').select('id, code, name, base_price_jpy').order('code'),
        supabase.from('profiles').select('id, first_name, last_name').eq('role', 'student').order('first_name'),
        supabase.from('profiles').select('id, first_name, last_name, tutor_profiles(tutor_level, tutor_pay_mode)').eq('role', 'tutor').order('first_name'),
        supabase.from('market_multipliers').select('region_name, multiplier').order('region_name'),
        supabase.from('currencies').select('code, exchange_rate').order('code'),
        supabase.from('pricing_quotes')
            .select('*, student:student_profiles(profiles(first_name, last_name)), program:program_categories(code, name)')
            .order('created_at', { ascending: false })
            .limit(20),
    ])

    return (
        <div className="admin-quotes-page">
            <header className="admin-header flex-between">
                <div>
                    <h1>Quote Builder</h1>
                    <p>Generate client pricing quotes with live margin preview. Clients and tutors cannot see this page.</p>
                </div>
                <Link href="/admin/pricing" className="btn-secondary">← Pricing Tables</Link>
            </header>

            {resolvedParams?.success && <div className="success-banner">✓ {resolvedParams.success}</div>}
            {resolvedParams?.error && <div className="error-text" style={{ marginBottom: '1rem' }}>{resolvedParams.error}</div>}

            {/* ── QUOTE BUILDER FORM ── */}
            <section className="dashboard-section mt-4">
                <h2 style={{ marginBottom: '1.5rem' }}>New Quote</h2>
                <form className="admin-form" action={saveQuote} id="quote-form">
                    {/* Row 1: Student + Tutor */}
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label htmlFor="student_id">Student *</label>
                            <select id="student_id" name="student_id" required>
                                <option value="">— Select Student —</option>
                                {students?.map(s => (
                                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="tutor_id">Tutor</label>
                            <select id="tutor_id" name="tutor_id">
                                <option value="">— Unassigned —</option>
                                {tutors?.map((t: any) => (
                                    <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Program + Lesson Length */}
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label htmlFor="program_id">Program *</label>
                            <select id="program_id" name="program_id" required>
                                <option value="">— Select Program —</option>
                                {programs?.map(p => (
                                    <option key={p.id} value={p.id} data-price={p.base_price_jpy} data-code={p.code}>
                                        {p.code} — {p.name} (¥{Number(p.base_price_jpy).toLocaleString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ width: '160px' }}>
                            <label htmlFor="lesson_length_minutes">Lesson Length</label>
                            <select id="lesson_length_minutes" name="lesson_length_minutes">
                                <option value="45">45 min</option>
                                <option value="60" selected>60 min</option>
                                <option value="90">90 min</option>
                                <option value="120">120 min</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ width: '140px' }}>
                            <label htmlFor="lessons_per_week">Per Week</label>
                            <select id="lessons_per_week" name="lessons_per_week">
                                <option value="1">1×/week</option>
                                <option value="2">2×/week</option>
                                <option value="3">3×/week</option>
                                <option value="4">4×/week</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Plan + Delivery + Group */}
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label htmlFor="plan_code">Plan Type</label>
                            <select id="plan_code" name="plan_code">
                                <option value="PAYG">PAYG (+15%)</option>
                                <option value="M1" selected>1 Month (baseline)</option>
                                <option value="M2">2 Months (-3%)</option>
                                <option value="M3">3 Months (-6%)</option>
                                <option value="M6">6 Months (-10%)</option>
                                <option value="M12">12 Months (-15%)</option>
                            </select>
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="delivery_code">Delivery Type</label>
                            <select id="delivery_code" name="delivery_code">
                                <option value="online" selected>Online</option>
                                <option value="ip_nearby">In-person Nearby (+¥500)</option>
                                <option value="ip_standard">In-person Standard (+¥1000)</option>
                                <option value="ip_far">In-person Far (+¥1500)</option>
                                <option value="home">Home Visit (+¥2000)</option>
                                <option value="cafe">Cafe Lesson (+¥500)</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ width: '130px' }}>
                            <label htmlFor="group_size">Group Size</label>
                            <select id="group_size" name="group_size">
                                <option value="1" selected>1 (1:1)</option>
                                <option value="2">2 (-20%)</option>
                                <option value="3">3 (-35%)</option>
                                <option value="4">4 (-45%)</option>
                                <option value="5">5 (-50%)</option>
                                <option value="6">6 (-55%)</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 4: Student type + Market + Currency */}
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label htmlFor="student_type_code">Student Type</label>
                            <select id="student_type_code" name="student_type_code">
                                <option value="early_childhood">Early Childhood (+10%)</option>
                                <option value="elementary">Elementary (+10%)</option>
                                <option value="junior_high">Junior High (+5%)</option>
                                <option value="high_school">High School (+10%)</option>
                                <option value="international">International School (+25%)</option>
                                <option value="university">University (-10%)</option>
                                <option value="adult" selected>Adult (baseline)</option>
                                <option value="professional">Professional (+20%)</option>
                            </select>
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="market_region">Market</label>
                            <select id="market_region" name="market_region">
                                {markets?.map(m => (
                                    <option key={m.region_name} value={m.region_name}
                                        selected={m.region_name === 'Japan Baseline'}>
                                        {m.region_name} (×{m.multiplier})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ width: '120px' }}>
                            <label htmlFor="currency_code">Currency</label>
                            <select id="currency_code" name="currency_code">
                                {currencies?.map(c => (
                                    <option key={c.code} value={c.code} selected={c.code === 'JPY'}>{c.code}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Row 5: Tutor level + pay mode */}
                    <div className="form-row" style={{ background: '#fef3c7', padding: '1rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
                        <div style={{ width: '100%', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔒 Admin Only — Tutor Compensation</span>
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="tutor_level">Tutor Level</label>
                            <select id="tutor_level" name="tutor_level">
                                <option value="0">Level 0 (¥1800–2200)</option>
                                <option value="1" selected>Level 1 (¥2200–2600)</option>
                                <option value="2">Level 2 (¥2800–3400)</option>
                                <option value="3">Level 3 (¥3600–4300)</option>
                                <option value="4">Level 4 (¥4500–6000)</option>
                                <option value="5">Level 5 (¥7000–10000)</option>
                            </select>
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="tutor_pay_mode">Pay Mode</label>
                            <select id="tutor_pay_mode" name="tutor_pay_mode">
                                <option value="min">Min</option>
                                <option value="standard" selected>Standard</option>
                                <option value="max">Max</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '0.5rem' }}>
                        <button type="submit" className="btn-primary">💾 Save Quote</button>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Price preview will appear in the Saved Quotes table below after saving.</span>
                    </div>
                </form>
            </section>

            {/* ── SAVED QUOTES TABLE ── */}
            <section className="dashboard-section mt-4">
                <h2 style={{ marginBottom: '1.25rem' }}>Saved Quotes</h2>
                {!quotes || quotes.length === 0 ? (
                    <p className="empty-state">No quotes yet. Create one above.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Student</th>
                                <th>Program</th>
                                <th>Client / Lesson</th>
                                <th>Client / Month</th>
                                <th>Tutor Pay</th>
                                <th>Margin</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.map((q: any) => {
                                const sProfile = q.student?.profiles
                                const sName = sProfile ? `${sProfile.first_name} ${sProfile.last_name}` : '—'
                                const statusColor = q.status === 'approved' ? 'success' : q.status === 'draft' ? 'info' : 'warning'
                                const marginPct = q.client_price_per_lesson && q.tutor_pay_per_lesson
                                    ? Math.round(((q.client_price_per_lesson - q.tutor_pay_per_lesson) / q.client_price_per_lesson) * 100)
                                    : null

                                return (
                                    <tr key={q.id}>
                                        <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(q.created_at).toLocaleDateString()}</td>
                                        <td>{sName}</td>
                                        <td>{q.program?.code} — {q.program?.name}</td>
                                        <td style={{ fontWeight: 600, color: '#1e293b' }}>
                                            {q.currency_code || 'JPY'} {q.client_price_per_lesson?.toLocaleString() ?? '—'}
                                        </td>
                                        <td>{q.client_price_per_lesson ? `¥${(q.client_price_per_lesson * (q.lessons_per_week ?? 1) * 4).toLocaleString()}` : '—'}</td>
                                        <td style={{ color: '#64748b' }}>¥{q.tutor_pay_per_lesson?.toLocaleString() ?? '—'}</td>
                                        <td style={{ fontWeight: 600, color: marginPct && marginPct > 0 ? '#166534' : '#dc2626' }}>
                                            {marginPct !== null ? `${marginPct}%` : '—'}
                                        </td>
                                        <td><span className={`badge ${statusColor}`}>{q.status}</span></td>
                                        <td>
                                            {q.status === 'draft' && (
                                                <form action={approveQuoteAndCreateInvoice} style={{ display: 'inline' }}>
                                                    <input type="hidden" name="quote_id" value={q.id} />
                                                    <button type="submit" className="btn-small" style={{ background: '#dcfce3', color: '#166534', borderColor: '#bbf7d0' }}>
                                                        ✓ Approve &amp; Invoice
                                                    </button>
                                                </form>
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
