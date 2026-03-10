import { createClient } from '@/utils/supabase/server'
import {
    calculateTutorPay,
    formatCurrency,
    PLAN_MULTIPLIERS,
    TUTOR_PAY_RATES,
    type AdminPricingInputs,
} from '@/utils/pricing-engine'
import '@/app/shared/forms.css'

export default async function TutorCompensationPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Fetch tutor profile including level and pay mode
    const { data: tutorProfile } = await supabase
        .from('tutor_profiles')
        .select('tutor_level, tutor_pay_mode')
        .eq('id', user.id)
        .single()

    const tutorLevel = tutorProfile?.tutor_level ?? 1
    const tutorPayMode = (tutorProfile?.tutor_pay_mode ?? 'standard') as 'min' | 'standard' | 'max'
    const rates = TUTOR_PAY_RATES[tutorLevel] ?? [2200, 2400, 2600]

    // Fetch active matches with pricing quote info
    const { data: matches } = await supabase
        .from('matches')
        .select(`
            id,
            student:student_profiles(
                id, assigned_plan,
                profiles(first_name, last_name)
            )
        `)
        .eq('tutor_id', user.id)
        .eq('status', 'active')

    // Fetch approved pricing quotes for matched students to get lesson details
    const studentIds = matches?.map((m: any) => m.student?.id).filter(Boolean) ?? []

    const { data: quotes } = studentIds.length > 0
        ? await supabase
            .from('pricing_quotes')
            .select('student_id, lesson_length_minutes, lessons_per_week, plan_code, delivery_code')
            .in('student_id', studentIds)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
        : { data: [] }

    // Map student_id → most recent quote
    const quoteByStudent: Record<string, any> = {}
    for (const q of quotes ?? []) {
        if (!quoteByStudent[q.student_id]) quoteByStudent[q.student_id] = q
    }

    // Build compensation rows
    const rows = (matches ?? []).map((match: any) => {
        const student = match.student
        const sProfile = student?.profiles
        const quote = quoteByStudent[student?.id]

        const lessonMinutes = quote?.lesson_length_minutes ?? 60
        const lessonsPerWeek = quote?.lessons_per_week ?? 1
        const deliveryCode = quote?.delivery_code ?? 'online'
        const planCode = quote?.plan_code ?? 'M1'

        const inputs: AdminPricingInputs = {
            programCode: 'P1', // placeholder — pay doesn't depend on program
            lessonMinutes,
            lessonsPerWeek,
            planCode,
            deliveryCode,
            studentTypeCode: 'adult',
            marketRegion: 'Japan Baseline',
            groupSize: 1,
            tutorLevel,
            tutorPayMode,
        }

        const payPerLesson = calculateTutorPay(inputs)
        const monthlyEstimate = payPerLesson * lessonsPerWeek * 4

        return {
            id: match.id,
            studentName: sProfile ? `${sProfile.first_name} ${sProfile.last_name}` : 'Unknown',
            lessonMinutes,
            lessonsPerWeek,
            deliveryCode,
            planCode,
            payPerLesson,
            monthlyEstimate,
            hasQuote: !!quote,
        }
    })

    const totalMonthly = rows.reduce((sum, r) => sum + r.monthlyEstimate, 0)

    return (
        <div className="tutor-compensation-page">
            <header className="tutor-header">
                <h1>My Compensation</h1>
                <p>Your pay per lesson and estimated monthly earnings. Client prices and Petra margins are not shown here.</p>
            </header>

            {/* Pay tier summary card */}
            <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>
                <div className="stat-card">
                    <h3>Your Pay Tier</h3>
                    <p className="stat-number" style={{ fontSize: '1.8rem' }}>Level {tutorLevel}</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        ¥{rates[0].toLocaleString()} – ¥{rates[2].toLocaleString()} / 60 min
                    </p>
                </div>
                <div className="stat-card">
                    <h3>Your Pay Mode</h3>
                    <p className="stat-number" style={{ fontSize: '1.8rem', textTransform: 'capitalize' }}>{tutorPayMode}</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        Base: {formatCurrency(rates[tutorPayMode === 'min' ? 0 : tutorPayMode === 'standard' ? 1 : 2])} / 60 min
                    </p>
                </div>
                <div className="stat-card" style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
                    <h3>Total Monthly Estimate</h3>
                    <p className="stat-number" style={{ color: '#166534' }}>{formatCurrency(totalMonthly)}</p>
                    <p style={{ color: '#4ade80', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        Based on {rows.length} active student{rows.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Per-student breakdown */}
            <section className="dashboard-section" style={{ marginTop: '1.5rem' }}>
                <h2 style={{ marginBottom: '1.25rem' }}>Per-Student Breakdown</h2>
                {rows.length === 0 ? (
                    <p className="empty-state">No active matched students yet.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Duration</th>
                                <th>Frequency</th>
                                <th>Delivery</th>
                                <th>Pay / Lesson</th>
                                <th>Est. Monthly</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(row => (
                                <tr key={row.id}>
                                    <td>{row.studentName}</td>
                                    <td>{row.lessonMinutes} min</td>
                                    <td>{row.lessonsPerWeek}×/week</td>
                                    <td style={{ textTransform: 'capitalize' }}>
                                        {row.deliveryCode.replace(/_/g, ' ')}
                                    </td>
                                    <td style={{ fontWeight: 700, color: '#166534' }}>
                                        {formatCurrency(row.payPerLesson)}
                                    </td>
                                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                                        {formatCurrency(row.monthlyEstimate)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <div className="dashboard-section" style={{ marginTop: '1.5rem', background: '#f8fafc' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    💡 Pay is calculated based on your current level and pay mode. Delivery bonuses are added per lesson (e.g. in-person lessons include a travel supplement). Contact Petra admin if you believe your level should be updated.
                </p>
            </div>
        </div>
    )
}
