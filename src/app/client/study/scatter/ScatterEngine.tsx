'use client'

import { useState, useEffect, useRef } from 'react'

interface Card {
    id: string
    front_content: string
    back_content: string
}

interface ScatterEngineProps {
    deck: Card[]
    libraryTitle: string
    libraryId: string
}

interface Tile {
    uniqueId: string
    cardId: string
    text: string
    type: 'front' | 'back'
    x: number
    y: number
    matched: boolean
}

function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array]
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
    }
    return newArr
}

export default function ScatterEngine({ deck, libraryTitle, libraryId }: ScatterEngineProps) {
    const [tiles, setTiles] = useState<Tile[]>([])
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [isGameOver, setIsGameOver] = useState(false)
    const [result, setResult] = useState<{ xpEarned: number; timeSec: number } | null>(null)
    const [matchCount, setMatchCount] = useState(0)

    const containerRef = useRef<HTMLDivElement>(null)
    const startTimeRef = useRef<number | null>(null)
    
    // Total pairs is the number of cards chosen (max 6 for scatter space)
    const totalPairs = Math.min(deck.length, 6)

    useEffect(() => {
        if (!deck || deck.length === 0) return

        const shuffledDeck = shuffleArray(deck).slice(0, 6)
        const generatedTiles: Tile[] = []
        
        // Randomly place tiles between 10% and 80% to keep them roughly on screen
        shuffledDeck.forEach((c, idx) => {
            generatedTiles.push({
                uniqueId: `f-${c.id}-${idx}`,
                cardId: c.id,
                text: c.front_content,
                type: 'front',
                x: 10 + Math.random() * 70,
                y: 10 + Math.random() * 70,
                matched: false
            })
            generatedTiles.push({
                uniqueId: `b-${c.id}-${idx}`,
                cardId: c.id,
                text: c.back_content,
                type: 'back',
                x: 10 + Math.random() * 70,
                y: 10 + Math.random() * 70,
                matched: false
            })
        })

        setTiles(shuffleArray(generatedTiles))
        startTimeRef.current = Date.now()
    }, [deck])

    const handlePointerDown = (e: React.PointerEvent, id: string) => {
        // Bring to front by moving it to the end of the array, set as dragging
        const targetTile = tiles.find(t => t.uniqueId === id)
        if (!targetTile || targetTile.matched) return

        const otherTiles = tiles.filter(t => t.uniqueId !== id)
        setTiles([...otherTiles, targetTile])
        
        // Use setPointerCapture so mouse/touch moving fast outside tile doesn't lose tracking
        const targetElement = e.currentTarget as HTMLElement
        targetElement.setPointerCapture(e.pointerId)
        
        setDraggingId(id)
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!draggingId || !containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        // Convert pixel coordinates to percentages
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100

        setTiles(ts => ts.map(t => 
            t.uniqueId === draggingId 
                ? { ...t, x: Math.max(0, Math.min(xPercent, 90)), y: Math.max(0, Math.min(yPercent, 90)) } 
                : t
        ))
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!draggingId) return
        
        const targetElement = e.currentTarget as HTMLElement
        targetElement.releasePointerCapture(e.pointerId)

        const draggedTile = tiles.find(t => t.uniqueId === draggingId)
        if (!draggedTile) {
            setDraggingId(null)
            return
        }

        // Check distance to all other active tiles
        const hitTile = tiles.find(t => {
            if (t.uniqueId === draggingId || t.matched) return false
            // Simple distance check (e.g. within 10% of x and y)
            const dx = t.x - draggedTile.x
            const dy = t.y - draggedTile.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            return dist < 8 // 8% distance threshold
        })

        if (hitTile && hitTile.cardId === draggedTile.cardId && hitTile.type !== draggedTile.type) {
            // Match found!
            setTiles(ts => ts.map(t => 
                (t.uniqueId === draggingId || t.uniqueId === hitTile.uniqueId)
                ? { ...t, matched: true }
                : t
            ))
            
            const newMatchCount = matchCount + 1
            setMatchCount(newMatchCount)
            
            if (newMatchCount === totalPairs) {
                setIsGameOver(true)
                const timeSec = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000)
                setResult({ xpEarned: totalPairs * 2, timeSec })
            }
        }

        setDraggingId(null)
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
                        <h2 style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scatter Complete</h2>
                    </div>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-main)' }}>
                        <div style={{ flex: 1, padding: '16px', borderRight: '1px solid var(--border-main)' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Time</p>
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>{result.timeSec}s</p>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{libraryTitle} (Scatter)</span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{matchCount} / {totalPairs} matched</span>
            </div>

            <div 
                ref={containerRef} 
                style={{ flex: 1, position: 'relative', overflow: 'hidden', touchAction: 'none' }}
            >
                {tiles.map(tile => {
                    if (tile.matched) return null

                    return (
                        <div
                            key={tile.uniqueId}
                            onPointerDown={e => handlePointerDown(e, tile.uniqueId)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                            style={{
                                position: 'absolute',
                                left: `${tile.x}%`,
                                top: `${tile.y}%`,
                                transform: 'translate(-50%, -50%)',
                                padding: '12px 24px',
                                background: draggingId === tile.uniqueId ? 'var(--bg-active)' : 'var(--bg-workspace)',
                                border: draggingId === tile.uniqueId ? '1px solid var(--text-primary)' : '1px solid var(--border-main)',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: 'var(--text-primary)',
                                cursor: 'grab',
                                userSelect: 'none',
                                zIndex: draggingId === tile.uniqueId ? 10 : 1,
                                boxShadow: draggingId === tile.uniqueId ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {tile.text}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
