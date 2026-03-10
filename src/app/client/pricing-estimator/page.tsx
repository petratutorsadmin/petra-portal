import PricingEstimatorClient from './PricingEstimatorClient'
import '@/app/shared/forms.css'

export default async function PricingEstimatorPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams
    const initialProgram = typeof resolvedParams.program === 'string' ? resolvedParams.program : undefined

    return (
        <div className="pricing-estimator-page">
            <header className="client-header">
                <h1>Tuition Estimator</h1>
                <p>Customize your tutoring plan and see an instant price estimate.</p>
            </header>

            <PricingEstimatorClient initialProgram={initialProgram} />
        </div>
    )
}
