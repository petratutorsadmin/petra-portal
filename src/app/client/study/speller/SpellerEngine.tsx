'use client'

import { useState, useEffect, useRef } from 'react'

interface Card {
    id: string
    front_content: string
    back_content: string
    hint: string | null
}

interface SpellerEngineProps {
    deck: Card[]
    libraryTitle: string
    libraryId: string
}

export default function SpellerEngine({ deck, libraryTitle, libraryId }: SpellerEngineProps) {
    const [index, setIndex] = useState(0)
    const [inputValue, setInputValue] = useState('')
    const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle')
    const [isDebrief, setIsDebrief] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // The user must type exactly the front_content.
    const currentCard = deck[index]

    const speak = (text: string) => {
        if (!window.speechSynthesis) return
        // Cancel any ongoing speech to avoid overlap
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        
        // Attempt to guess language if obvious (or default)
        uttrToLanguage(utterance, text)
        window.speechSynthesis.speak(utterance)
    }

    // Basic language heuristic for Voice Synthesis
    const uttrToLanguage = (u: SpeechSynthesisUtterance, text: string) => {
        if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\uFAFF\uFF66-\uFF9F]/.test(text)) {
            u.lang = 'ja-JP'
        } else if (/^[a-zA-Z\s.,!?']+$/.test(text)) {
            u.lang = 'en-US'
        }
    }

    useEffect(() => {
        if (currentCard && !isDebrief) {
            speak(currentCard.front_content)
        }
    }, [index, isDebrief])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentCard || status === 'correct') return
        
        // We do case-insensitive exact matching
        if (inputValue.trim().toLowerCase() === currentCard.front_content.trim().toLowerCase()) {
            setStatus('correct')
            setTimeout(() => {
                if (index + 1 >= deck.length) {
                    setIsDebrief(true)
                } else {
                    setStatus('idle')
                    setInputValue('')
                    setIndex(i => i + 1)
                }
            }, 800)
        } else {
            setStatus('wrong')
            setTimeout(() => setStatus('idle'), 600)
            setInputValue('')
            speak(currentCard.front_content) // Replay immediately on fail
        }
        inputRef.current?.focus()
    }

    if (deck.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-workspace)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No cards available.</p>
            </div>
        )
    }

    if (isDebrief) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-workspace)', padding: '24px' }}>
                <div style={{ width: '400px', border: '1px solid var(--border-main)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border-main)', background: 'var(--bg-sidebar)' }}>
                        <h2 style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Speller Complete</h2>
                    </div>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-main)' }}>
                        <div style={{ flex: 1, padding: '16px', borderRight: '1px solid var(--border-main)' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Terms Written</p>
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>{deck.length}</p>
                        </div>
                        <div style={{ flex: 1, padding: '16px' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>XP</p>
                            <p className="pulse-xp" style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>+{(deck.length * 3)}</p>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                    <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-main)', borderRadius: '4px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px' }}>
                        Play Again
                    </button>
                    <a href="/client/training" style={{ padding: '8px 16px', background: 'var(--text-primary)', border: '1px solid var(--text-primary)', borderRadius: '4px', color: 'var(--bg-workspace)', cursor: 'pointer', fontSize: '12px', textDecoration: 'none' }}>
                        Exit
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-workspace)' }}>
            <div style={{ height: '4px', background: 'var(--border-main)', width: '100%' }}>
                <div style={{ height: '100%', width: `${(index / deck.length) * 100}%`, background: 'var(--text-primary)', transition: 'width 0.3s' }} />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{libraryTitle} (Speller)</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{index + 1} / {deck.length}</span>
                    </div>

                    <div style={{ 
                        border: `1px solid ${status === 'wrong' ? 'red' : status === 'correct' ? '#22c55e' : 'var(--border-main)'}`,
                        borderRadius: '4px',
                        background: status === 'wrong' ? '#fee2e2' : status === 'correct' ? '#f0fdf4' : 'var(--bg-workspace)',
                        padding: '48px 32px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transition: 'all 0.2s ease-out'
                    }}>
                        
                        <div style={{ fontSize: '18px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
                            {currentCard.back_content}
                        </div>

                        <button 
                            type="button" 
                            onClick={() => speak(currentCard.front_content)}
                            style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-main)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '32px' }}>
                            🔊
                        </button>

                        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                            <input
                                ref={inputRef}
                                type="text"
                                autoFocus
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                disabled={status === 'correct'}
                                placeholder="Type what you hear..."
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    fontSize: '24px',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    textAlign: 'center',
                                    border: 'none',
                                    borderBottom: '2px solid var(--text-primary)',
                                    background: 'transparent',
                                    outline: 'none'
                                }}
                            />
                        </form>
                    </div>

                </div>
            </div>
        </div>
    )
}
