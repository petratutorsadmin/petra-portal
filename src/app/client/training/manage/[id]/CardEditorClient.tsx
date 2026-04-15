'use client'

import { useState, useRef, useEffect } from 'react'

export default function CardEditorClient({ 
    libraryTitle, 
    libraryId, 
    cards, 
    onAddCard 
}: { 
    libraryTitle: string, 
    libraryId: string, 
    cards: any[],
    onAddCard: (formData: FormData) => Promise<void>
}) {
    const formRef = useRef<HTMLFormElement>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [front, setFront] = useState('')
    const [back, setBack] = useState('')
    const [hint, setHint] = useState('')
    const [selectedCard, setSelectedCard] = useState<any | null>(null)

    // Cmd + Enter listener for creation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                if (selectedCard) {
                    // Cannot save from view mode currently
                    return
                }
                e.preventDefault()
                if (formRef.current && front.trim() && back.trim()) {
                    formRef.current.requestSubmit()
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [front, back, selectedCard])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        const formData = new FormData(e.currentTarget)
        await onAddCard(formData)
        setFront('')
        setBack('')
        setHint('')
        setIsSubmitting(false)
        document.getElementById('front_content')?.focus()
    }

    return (
        <div className="responsive-editor-layout">
            
            {/* Left Pane: Card List (280px) */}
            <div className="responsive-editor-sidebar">
                <div style={{ padding: '24px 16px', borderBottom: '1px solid var(--border-main)' }}>
                    <h2 style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {libraryTitle}
                    </h2>
                    <button 
                        onClick={() => setSelectedCard(null)} 
                        style={{ width: '100%', padding: '8px', background: !selectedCard ? 'var(--bg-active)' : 'transparent', border: '1px solid var(--border-main)', borderRadius: '4px', fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left' }}>
                        + Add New Card
                    </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {cards.map(card => (
                            <button 
                                key={card.id} 
                                onClick={() => setSelectedCard(card)}
                                style={{ 
                                    padding: '8px', 
                                    borderLeft: `2px solid ${selectedCard?.id === card.id ? 'var(--text-primary)' : 'transparent'}`,
                                    background: selectedCard?.id === card.id ? 'var(--bg-active)' : 'transparent',
                                    borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                                    outline: 'none', cursor: 'pointer', textAlign: 'left'
                                }}
                            >
                                <div style={{ fontSize: '12px', fontWeight: selectedCard?.id === card.id ? 600 : 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {card.front_content}
                                </div>
                            </button>
                        ))}
                        {cards.length === 0 && (
                            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Database is empty.</p>
                        )}
                    </div>
                </div>
                <div style={{ padding: '16px', borderTop: '1px solid var(--border-main)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <a href={`/client/study?library_id=${libraryId}`} style={{ display: 'block', padding: '6px 0', textAlign: 'center', background: 'var(--bg-workspace)', border: '1px solid var(--border-main)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>
                        Flashcards
                    </a>
                    <a href={`/client/study/match?library_id=${libraryId}`} style={{ display: 'block', padding: '6px 0', textAlign: 'center', background: 'var(--bg-workspace)', border: '1px solid var(--border-main)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>
                        Match
                    </a>
                    <a href={`/client/study/speller?library_id=${libraryId}`} style={{ display: 'block', padding: '6px 0', textAlign: 'center', background: 'var(--bg-workspace)', border: '1px solid var(--border-main)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>
                        Speller
                    </a>
                    <a href={`/client/study/scatter?library_id=${libraryId}`} style={{ display: 'block', padding: '6px 0', textAlign: 'center', background: 'var(--bg-workspace)', border: '1px solid var(--border-main)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>
                        Scatter
                    </a>
                    <a href="/client/training/manage" style={{ gridColumn: 'span 2', display: 'block', padding: '8px 0', textAlign: 'center', background: 'transparent', border: 'none', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '12px', marginTop: '4px' }}>
                        ← Back to Vault
                    </a>
                </div>
            </div>

            {/* Right Pane: Canvas */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {selectedCard ? (
                    // VIEW MODE
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '48px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-main)', paddingBottom: '16px', marginTop: 0 }}>
                            {selectedCard.front_content}
                        </h1>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, paddingTop: '16px', whiteSpace: 'pre-wrap' }}>
                            {selectedCard.back_content}
                        </p>
                        {selectedCard.hint && (
                            <div style={{ borderTop: '1px solid var(--border-main)', paddingTop: '16px', marginTop: 'auto' }}>
                                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: 0 }}>
                                    💡 {selectedCard.hint}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    // CREATE MODE
                    <form ref={formRef} onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '48px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                        <input type="hidden" name="library_id" value={libraryId} />
                        
                        <textarea 
                            id="front_content"
                            name="front_content"
                            value={front}
                            onChange={e => setFront(e.target.value)}
                            placeholder="Term / Concept"
                            required
                            style={{ 
                                fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)',
                                border: 'none', outline: 'none', background: 'transparent',
                                resize: 'none', padding: '0 0 16px', borderBottom: '1px solid transparent',
                                width: '100%', minHeight: '60px'
                            }}
                            onFocus={(e) => e.target.style.borderBottom = '1px solid var(--border-main)'}
                            onBlur={(e) => e.target.style.borderBottom = '1px solid transparent'}
                        />

                        <textarea 
                            id="back_content"
                            name="back_content"
                            value={back}
                            onChange={e => setBack(e.target.value)}
                            placeholder="Definition / Details..."
                            required
                            style={{ 
                                fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6,
                                border: 'none', outline: 'none', background: 'transparent',
                                resize: 'none', padding: '16px 0',
                                width: '100%', flex: 1
                            }}
                        />

                        <div style={{ borderTop: '1px solid var(--border-main)', paddingTop: '16px', marginTop: 'auto' }}>
                            <input 
                                name="hint"
                                value={hint}
                                onChange={e => setHint(e.target.value)}
                                placeholder="Add a hint (optional)..."
                                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--text-tertiary)' }}
                            />
                        </div>

                        <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Cmd + Enter
                            </span>
                            <button type="submit" disabled={isSubmitting} style={{ padding: '8px 16px', background: 'var(--text-primary)', color: 'var(--bg-workspace)', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                                {isSubmitting ? 'Saving...' : '+ Add Entry'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
            
        </div>
    )
}
