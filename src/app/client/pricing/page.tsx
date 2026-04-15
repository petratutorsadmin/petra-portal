import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PlanChangeForm from '@/components/PlanChangeForm'
import PlanDetailsCard from '@/components/PlanDetailsCard'
import BillingCard from '@/components/BillingCard'
import PlanRequestList from '@/components/PlanRequestList'
import './plan.css'

export default async function PlanManagementPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [
        { data: enrollment },
        { data: match },
        { data: recentLesson },
        { data: changeRequests },
        { data: nextInvoice },
    ] = await Promise.all([
        // ACTIVE ENROLLMENT (Truth)
        supabase.from('student_enrollments')
            .select(`
                id, status, start_date, end_date,
                pricing_quotes (
                    id, program_id, program_categories(name),
                    lesson_length_minutes, lessons_per_week, delivery_code, client_price_per_lesson
                )
            `)
            .eq('student_id', user.id)
            .eq('status', 'active')
            .limit(1)
            .maybeSingle(),

        // Active tutor match
        supabase.from('matches')
            .select(`
                id, status, created_at,
                tutor_profiles!matches_tutor_id_fkey(profiles(first_name, last_name))
            `)
            .eq('student_id', user.id)
            .eq('status', 'active')
            .limit(1)
            .maybeSingle(),

        // Most recent lesson (fallback)
        supabase.from('lessons')
            .select('duration_minutes, delivery_type, subject_program')
            .eq('student_id', user.id)
            .order('date_time', { ascending: false })
            .limit(1)
            .maybeSingle(),

        // Plan change requests
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
    const tutorName = tutorProfile?.profiles ? `${tutorProfile.profiles.first_name} ${tutorProfile.profiles.last_name}` : '—'

    const quote = (enrollment?.pricing_quotes as any)
    const programName = quote?.program_categories?.name ?? recentLesson?.subject_program ?? '—'
    const lessonLength = quote?.lesson_length_minutes ?? recentLesson?.duration_minutes
    const lessonsPerWeek = quote?.lessons_per_week ?? '—'
    const deliveryType = quote?.delivery_code ?? recentLesson?.delivery_type

    const activeRequests = (changeRequests ?? []).filter(r => ['pending', 'under_review'].includes(r.status))
    const pastRequests = (changeRequests ?? []).filter(r => ['approved', 'declined', 'cancelled'].includes(r.status))

    return (
        <div className="plan-management-page">
            <header className="plan-header">
                <h1>My Plan</h1>
                <p>Your current setup, billing, and plan requests.</p>
            </header>

            <div className="plan-grid">
                <div className="plan-left">
                    <PlanDetailsCard 
                        tutorName={tutorName}
                        programName={programName}
                        deliveryType={deliveryType as string}
                        lessonsPerWeek={lessonsPerWeek}
                        lessonLength={lessonLength as number}
                        isMatched={!!match}
                    />
                    <BillingCard nextInvoice={nextInvoice as any} />
                </div>

                <div className="plan-right">
                    <PlanRequestList requests={activeRequests} title="Active Requests" />
                    
                    <section className="plan-card">
                        <h2 className="plan-card-title">Request a Change</h2>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                            Submit a structured request. Petra will review and confirm details with you directly.
                        </p>
                        <PlanChangeForm />
                    </section>

                    <PlanRequestList requests={pastRequests} title="Request History" isHistory />
                </div>
            </div>
        </div>
    )
}
