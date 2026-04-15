import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { createPersonalLibrary, deletePersonalLibrary } from './actions'
import './vault.css'

export default async function PersonalVaultPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: libraries } = await supabase
        .from('card_libraries')
        .select(`
            *,
            cards(count)
        `)
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div className="vault-page">
            <header className="client-header flex-between">
                <div>
                    <h1>The Personal Vault</h1>
                    <p>Create and manage your custom study collections.</p>
                </div>
            </header>

            <div className="vault-grid mt-4">
                {/* Create New Card */}
                <section className="vault-card new-set">
                    <h3>New Collection</h3>
                    <form action={createPersonalLibrary} className="vault-form">
                        <div className="form-group">
                            <input type="text" name="title" placeholder="Collection Title (e.g. Biology Exam)" required />
                        </div>
                        <div className="form-group">
                            <input type="text" name="subject" placeholder="Subject (Optional)" />
                        </div>
                        <button type="submit" className="btn-primary w-full">+ Create Library</button>
                    </form>
                </section>

                {libraries?.map((lib: any) => (
                    <div key={lib.id} className="vault-card collection-item">
                        <div className="collection-info">
                            <div className="collection-subject">{lib.subject || 'Personal Set'}</div>
                            <h3 className="collection-title">{lib.title}</h3>
                            <p className="collection-meta">{(lib.cards as any)?.[0]?.count || 0} cards</p>
                        </div>
                        <div className="collection-actions">
                            <Link href={`/client/training/manage/${lib.id}`} className="btn-secondary">Manage Cards</Link>
                            <form action={deletePersonalLibrary.bind(null, lib.id)}>
                                <button type="submit" className="btn-icon delete" title="Delete Collection">🗑</button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
            
            {!libraries?.length && (
                <div className="empty-state mt-4">
                    <p>You haven&apos;t created any personal study sets yet.</p>
                </div>
            )}
        </div>
    )
}
