'use client'

import React, { useState, useEffect } from 'react'
import { quickAddCard } from '@/app/client/training/manage/actions'

export default function AddCardModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Keyboard shortcut to open (Cmd/Ctrl + Shift + A)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
                e.preventDefault()
                setIsOpen(true)
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        const formData = new FormData(e.currentTarget)
        const front = formData.get('front') as string
        const back = formData.get('back') as string
        const hint = formData.get('hint') as string

        const res = await quickAddCard({ front, back, hint })
        setIsSubmitting(false)
        if (res?.success) {
            setIsOpen(false)
        } else {
            alert('Failed to add card: ' + res?.error)
        }
    }

    return (
        <>
            {/* The FAB button */}
            <button 
                onClick={() => setIsOpen(true)}
                title="Add Card (Cmd+Shift+A)"
                style={{
                    position: 'fixed',
                    bottom: '1.5rem',
                    right: '1.5rem',
                    background: '#7c3aed',
                    color: '#fff',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.4), 0 2px 4px -1px rgba(124, 58, 237, 0.2)',
                    fontSize: '1.75rem',
                    fontWeight: 300,
                    cursor: 'pointer',
                    zIndex: 9998,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                +
            </button>

            {/* The Modal */}
            {isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '20px', width: '90%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>Capture Knowledge</h2>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Front (Concept)</label>
                                <textarea name="front" required autoFocus rows={2} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', resize: 'none', background: '#f8fafc', boxSizing: 'border-box' }} placeholder="Ex: El perro"></textarea>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Back (Definition)</label>
                                <textarea name="back" required rows={2} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', resize: 'none', background: '#f8fafc', boxSizing: 'border-box' }} placeholder="Ex: The dog"></textarea>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Hint (Optional)</label>
                                <input type="text" name="hint" style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', background: '#f8fafc', boxSizing: 'border-box' }} placeholder="A subtle clue..."/>
                            </div>

                            <button type="submit" disabled={isSubmitting} style={{ background: '#7c3aed', color: '#fff', padding: '1rem', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1, transition: 'background 0.2s' }}>
                                {isSubmitting ? 'Saving...' : 'Save to Vault'}
                            </button>
                            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', margin: 0, marginTop: '0.25rem', fontWeight: 500 }}>Shortcut: Cmd+Shift+A</p>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
