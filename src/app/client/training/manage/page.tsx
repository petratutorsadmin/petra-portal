import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { createPersonalLibrary, deletePersonalLibrary } from './actions'

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
        <div className="client-main-view">
            <header className="client-header flex-between" style={{ alignItems: 'flex-end', paddingBottom: '16px', borderBottom: '1px solid var(--border-main)' }}>
                <div>
                    <h1>Personal Vault</h1>
                    <p>Create and manage your custom study collections.</p>
                </div>
            </header>

            <div style={{ marginTop: '32px' }}>
                <h2 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid var(--border-main)', paddingBottom: '8px' }}>
                    New Collection
                </h2>
                <form action={createPersonalLibrary} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-main)' }}>
                    <input 
                        type="text" 
                        name="title" 
                        placeholder="Collection Title" 
                        required 
                        style={{ flex: 2, background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-main)', padding: '8px 0', fontSize: '13px', color: 'var(--text-primary)', outline: 'none' }}
                    />
                    <input 
                        type="text" 
                        name="subject" 
                        placeholder="Subject (Optional)" 
                        style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-main)', padding: '8px 0', fontSize: '13px', color: 'var(--text-primary)', outline: 'none' }}
                    />
                    <button type="submit" style={{ padding: '8px 16px', background: 'var(--text-primary)', color: 'var(--bg-workspace)', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                        Create
                    </button>
                </form>
            </div>

            <div style={{ marginTop: '48px' }}>
                <h2 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid var(--border-main)', paddingBottom: '8px' }}>
                    Database
                </h2>

                {/* Table Header */}
                <div style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid var(--border-main)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    <div style={{ flex: 2 }}>TITLE</div>
                    <div style={{ flex: 1 }}>SUBJECT</div>
                    <div style={{ width: '80px', textAlign: 'right' }}>CARDS</div>
                    <div style={{ width: '120px', textAlign: 'right' }}>ACTIONS</div>
                </div>

                {libraries?.map((lib: any) => (
                    <div key={lib.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-main)', fontSize: '13px' }}>
                        <div style={{ flex: 2, fontWeight: 500, color: 'var(--text-primary)' }}>
                            <Link href={`/client/training/manage/${lib.id}`} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                                {lib.title}
                            </Link>
                        </div>
                        <div style={{ flex: 1, color: 'var(--text-secondary)' }}>{lib.subject || '—'}</div>
                        <div style={{ width: '80px', textAlign: 'right', color: 'var(--text-secondary)' }}>{(lib.cards as any)?.[0]?.count || 0}</div>
                        <div style={{ width: '120px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                            <form action={deletePersonalLibrary.bind(null, lib.id)}>
                                <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '12px', padding: 0 }} title="Delete">
                                    Delete
                                </button>
                            </form>
                        </div>
                    </div>
                ))}

                {!libraries?.length && (
                    <div style={{ padding: '24px 0', borderBottom: '1px solid var(--border-main)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No collections found.</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Empty</span>
                    </div>
                )}
            </div>
        </div>
    )
}
