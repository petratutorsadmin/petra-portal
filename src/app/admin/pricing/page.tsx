import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import '@/app/shared/forms.css'

export default async function AdminPricingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams
    const tab = typeof resolvedParams.tab === 'string' ? resolvedParams.tab : 'programs'

    const supabase = await createClient()

    let data: any[] = []
    let error = null

    if (tab === 'programs') {
        const res = await supabase.from('program_categories').select('*').order('name')
        data = res.data || []
        error = res.error
    } else if (tab === 'rules') {
        const res = await supabase.from('pricing_rules').select('*').order('tutor_level')
        data = res.data || []
        error = res.error
    } else if (tab === 'markets') {
        const res = await supabase.from('market_multipliers').select('*').order('region_name')
        data = res.data || []
        error = res.error
    } else if (tab === 'currencies') {
        const res = await supabase.from('currencies').select('*').order('code')
        data = res.data || []
        error = res.error
    }

    return (
        <div className="admin-pricing-page">
            <header className="admin-header flex-between">
                <div>
                    <h1>Pricing Engine</h1>
                    <p>Configure internal pricing arrays, margins, and multipliers.</p>
                </div>
                <button className="btn-primary">+ Add New</button>
            </header>

            <div className="tabs">
                <Link href="/admin/pricing?tab=programs" className={`tab ${tab === 'programs' ? 'active' : ''}`}>Program Categories</Link>
                <Link href="/admin/pricing?tab=rules" className={`tab ${tab === 'rules' ? 'active' : ''}`}>Pricing Rules</Link>
                <Link href="/admin/pricing?tab=markets" className={`tab ${tab === 'markets' ? 'active' : ''}`}>Market Multipliers</Link>
                <Link href="/admin/pricing?tab=currencies" className={`tab ${tab === 'currencies' ? 'active' : ''}`}>Currencies</Link>
            </div>

            <section className="dashboard-section mt-4">
                {error ? (
                    <p className="error-text">Failed to load data.</p>
                ) : data.length === 0 ? (
                    <p className="empty-state">No records found for {tab}.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            {tab === 'programs' && (
                                <tr><th>Name</th><th>Multiplier</th><th>Description</th><th>Action</th></tr>
                            )}
                            {tab === 'rules' && (
                                <tr><th>Tutor Level</th><th>Min Pay</th><th>Standard Pay</th><th>Max Pay</th><th>Action</th></tr>
                            )}
                            {tab === 'markets' && (
                                <tr><th>Region Name</th><th>Multiplier</th><th>Action</th></tr>
                            )}
                            {tab === 'currencies' && (
                                <tr><th>Code</th><th>Exchange Rate</th><th>Action</th></tr>
                            )}
                        </thead>
                        <tbody>
                            {data.map((row) => (
                                <tr key={row.id}>
                                    {tab === 'programs' && (
                                        <><td>{row.name}</td><td>{row.multiplier}x</td><td>{row.description}</td></>
                                    )}
                                    {tab === 'rules' && (
                                        <><td>{row.tutor_level}</td><td>¥{row.min_pay}</td><td>¥{row.standard_pay}</td><td>¥{row.max_pay}</td></>
                                    )}
                                    {tab === 'markets' && (
                                        <><td>{row.region_name}</td><td>{row.multiplier}x</td></>
                                    )}
                                    {tab === 'currencies' && (
                                        <><td>{row.code}</td><td>{row.exchange_rate}</td></>
                                    )}
                                    <td><button className="btn-small">Edit</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    )
}
