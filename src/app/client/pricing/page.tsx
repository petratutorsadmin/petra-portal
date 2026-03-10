import { createClient } from '@/utils/supabase/server'
import ClientPricingCalculator from './ClientPricingCalculator'
import '@/app/shared/forms.css'

export default async function ClientPricingPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Check if they have a locked enrollment
    const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select('*, pricing_quotes(plan_code)')
        .eq('student_id', user?.id!)
        .eq('locked', true)
        .maybeSingle()

    const isLocked = !!enrollment
    const currentPlanCode = (enrollment?.pricing_quotes as any)?.plan_code

    return (
        <div className="client-pricing-page">
            <header className="client-header">
                <h1>Pricing Explorer</h1>
                <p>See how different programs, plans, and lesson configurations affect your tuition. Final pricing is confirmed by Petra.</p>
            </header>

            <ClientPricingCalculator
                isLocked={isLocked}
                currentPlanCode={currentPlanCode}
            />
        </div>
    )
}
