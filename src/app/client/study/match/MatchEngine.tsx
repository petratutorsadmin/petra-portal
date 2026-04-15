'use client'

import { useState, useEffect, useRef } from 'react'
import { submitMatchScore } from './actions'

interface Card {
    id: string
    front_content: string
    back_content: string
}

interface MatchEngineProps {
    deck: Card[]
    libraryTitle: string
    libraryId: string
}

type TileType = 'front' | 'back'
type TileState = 'idle' | 'selected' | 'matched' | 'error'

interface Tile {
    uniqueId: string
    cardId: string
    text: string
    type: TileType
    state: TileState
}

function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array]
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
    }
    return newArr
}

export default function MatchEngine({ deck, libraryTitle, libraryId }: MatchEngineProps) {
    const [tiles, setTiles] = useState<Tile[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [matchesFound, setMatchesFound] = useState(0)
    const [isGameOver, setIsGameOver] = useState(false)
    const [result, setResult] = useState<{ xpEarned: number; timeSec: number } | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const startTimeRef = useRef<number | null>(null)

    // Settle pairs on mount
    useEffect(() => {
        if (!deck || deck.length === 0) return

        const shuffledDeck = shuffleArray(deck)
        const selectedCards = shuffledDeck.slice(0, 6)

        const generatedTiles: Tile[] = []
        selectedCards.forEach((c, idx) => {
            generatedTiles.push({
                uniqueId: `f-${c.id}-${idx}`,
                cardId: c.id,
                text: c.front_content,
                type: 'front',
                state: 'idle'
            })
            generatedTiles.push({
                uniqueId: `b-${c.id}-${idx}`,
                cardId: c.id,
                text: c.back_content,
                type: 'back',
                state: 'idle'
            })
        })

        setTiles(shuffleArray(generatedTiles))
        startTimeRef.current = Date.now()
    }, [deck])

    const totalPairs = tiles.length / 2

    const handleTileClick = async (tile: Tile) => {
        if (tile.state === 'matched' || tile.state === 'error' || isGameOver) return
        
        if (selectedId === tile.uniqueId) {
            setSelectedId(null)
            setTiles(ts => ts.map(t => t.uniqueId === tile.uniqueId ? { ...t, state: 'idle' } : t))
            return
        }

        if (!selectedId) {
            setSelectedId(tile.uniqueId)
            setTiles(ts => ts.map(t => t.uniqueId === tile.uniqueId ? { ...t, state: 'selected' } : t))
            return
        }

        const selectedTile = tiles.find(t => t.uniqueId === selectedId)
        if (!selectedTile) return

        const isMatch = selectedTile.cardId === tile.cardId && selectedTile.type !== tile.type

        if (isMatch) {
            setTiles(ts => ts.map(t => 
                t.uniqueId === tile.uniqueId || t.uniqueId === selectedTile.uniqueId 
                    ? { ...t, state: 'matched' } 
                    : t
            ))
            setSelectedId(null)
            
            const newMatchesFound = matchesFound + 1
            setMatchesFound(newMatchesFound)

            if (newMatchesFound === totalPairs) {
                setIsGameOver(true)
                const timeSec = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000)
                setIsSubmitting(true)

                const res = await submitMatchScore({ libraryId, timeSeconds: timeSec, pairsMatched: newMatchesFound })
                
                setIsSubmitting(false)
                setResult({ xpEarned: res.xpEarned || 0, timeSec })
            }
        } else {
            setTiles(ts => ts.map(t => 
                t.uniqueId === tile.uniqueId || t.uniqueId === selectedTile.uniqueId 
                    ? { ...t, state: 'error' } 
                    : t
            ))
            setSelectedId(null)
            
            setTimeout(() => {
                setTiles(ts => ts.map(t => 
                    t.state === 'error' ? { ...t, state: 'idle' } : t
                ))
            }, 600)
        }
    }

    if (deck.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-workspace)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No cards available.</p>
            </div>
        )
    }

    if (isGameOver && result) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-workspace)', padding: '24px' }}>
                <div style={{ width: '400px', border: '1px solid var(--border-main)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border-main)', background: 'var(--bg-sidebar)' }}>
                        <h2 style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Match Complete</h2>
                    </div>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-main)' }}>
                        <div style={{ flex: 1, padding: '16px', borderRight: '1px solid var(--border-main)' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Time</p>
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>{result.timeSec}s</p>
                        </div>
                        <div style={{ flex: 1, padding: '16px', borderRight: '1px solid var(--border-main)' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Pairs</p>
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>{totalPairs}</p>
                        </div>
                        <div style={{ flex: 1, padding: '16px' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>XP</p>
                            <p className="pulse-xp" style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>+{result.xpEarned}</p>
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
                <div style={{ height: '100%', width: `${(matchesFound / totalPairs) * 100}%`, background: 'var(--text-primary)', transition: 'width 0.3s' }} />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
                <div style={{ width: '100%', maxWidth: '800px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{libraryTitle}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{matchesFound} / {totalPairs} matched</span>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                        gap: '12px' 
                    }}>
                        {tiles.map((tile) => {
                            let border = '1px solid var(--border-main)'
                            let bg = 'var(--bg-workspace)'
                            let opacity = 1
                            let color = 'var(--text-primary)'

                            if (tile.state === 'selected') {
                                border = '1px solid var(--text-primary)'
                                bg = 'var(--bg-active)'
                            } else if (tile.state === 'error') {
                                border = '1px solid red'
                                bg = '#fee2e2'
                            } else if (tile.state === 'matched') {
                                border = '1px solid var(--border-main)'
                                opacity = 0
                            }

                            return (
                                <button
                                    key={tile.uniqueId}
                                    onClick={() => handleTileClick(tile)}
                                    disabled={tile.state === 'matched' || isSubmitting}
                                    style={{
                                        minHeight: '160px', /* Larger mobile tap target */
                                        touchAction: 'manipulation', /* Prevent double tap zoom */
                                        padding: '16px',
                                        background: bg,
                                        border: border,
                                        borderRadius: '4px',
                                        color: color,
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        cursor: tile.state === 'matched' ? 'default' : 'pointer',
                                        opacity: opacity,
                                        transition: 'all 0.2s',
                                        pointerEvents: tile.state === 'matched' ? 'none' : 'auto'
                                    }}
                                >
                                    {tile.text}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
