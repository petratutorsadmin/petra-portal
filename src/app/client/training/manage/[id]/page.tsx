import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { addPersonalCard } from '../actions'
import '../vault.css'

export default async function CardDesignerPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id: libraryId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Fetch library details (ensure student owns it)
    const { data: library, error: libError } = await supabase
        .from('card_libraries')
        .select('*')
        .eq('id', libraryId)
        .eq('created_by', user?.id)
        .single()

    if (libError || !library) {
        redirect('/client/training/manage')
    }

    // 2. Fetch existing cards
    const { data: cards } = await supabase
        .from('cards')
        .select('*')
        .eq('library_id', libraryId)
        .order('created_at', { ascending: false })

    return (
        <div className="vault-page">
            <header className="client-header flex-between">
                <div>
                    <div className="collection-subject">{library.subject}</div>
                    <h1>{library.title}</h1>
                    <p>Card Designer — Add terms, definitions, and hints.</p>
                </div>
                <Link href="/client/training/manage" className="btn-secondary">← Back to Vault</Link>
            </header>

            <div className="card-designer-grid mt-4">
                {/* Add Card Form */}
                <section className="dashboard-section p-6">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>+ Add New Card</h2>
                    <form action={addPersonalCard} className="admin-form">
                        <input type="hidden" name="library_id" value={libraryId} />
                        
                        <div className="form-group">
                            <label htmlFor="front_content">Front (Term / Prompt)</label>
                            <input id="front_content" name="front_content" type="text" placeholder="e.g. Photosynthesis" required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="back_content">Back (Definition / Answer)</label>
                            <textarea id="back_content" name="back_content" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} rows={3} placeholder="The process by which green plants and some other organisms use sunlight to synthesize foods from carbon dioxide and water." required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="hint">Hint (Optional)</label>
                            <input id="hint" name="hint" type="text" placeholder="e.g. Occurs in chloroplasts" />
                        </div>

                        <button type="submit" className="btn-primary w-full mt-2">💾 Save Card</button>
                    </form>
                </section>

                {/* Existing Cards List */}
                <section className="dashboard-section p-6">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Collection Contents ({cards?.length || 0})</h2>
                    <div className="card-list-minimal" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {cards?.map((card) => (
                            <div key={card.id} className="card-mini-row" style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '8px', background: '#f8fafc' }}>
                                <div style={{ fontWeight: 700, color: '#1e293b' }}>{card.front_content}</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>{card.back_content}</div>
                                {card.hint && <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#94a3b8', marginTop: '0.5rem' }}>Hint: {card.hint}</div>}
                            </div>
                        ))}
                        {!cards?.length && (
                            <p className="empty-state">No cards in this collection yet.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}
