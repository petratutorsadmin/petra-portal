'use client'

import { useState, useEffect, useRef } from 'react'
import { submitMatchScore } from './actions'
import './match.css'

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

        // Pick up to 6 random cards for a smooth mobile experience
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
        
        // Deselect if clicking the same selected tile
        if (selectedId === tile.uniqueId) {
            setSelectedId(null)
            setTiles(ts => ts.map(t => t.uniqueId === tile.uniqueId ? { ...t, state: 'idle' } : t))
            return
        }

        // No tile selected yet
        if (!selectedId) {
            setSelectedId(tile.uniqueId)
            setTiles(ts => ts.map(t => t.uniqueId === tile.uniqueId ? { ...t, state: 'selected' } : t))
            return
        }

        const selectedTile = tiles.find(t => t.uniqueId === selectedId)
        if (!selectedTile) return

        // Check Match
        const isMatch = selectedTile.cardId === tile.cardId && selectedTile.type !== tile.type

        if (isMatch) {
            // Match success
            setTiles(ts => ts.map(t => 
                t.uniqueId === tile.uniqueId || t.uniqueId === selectedTile.uniqueId 
                    ? { ...t, state: 'matched' } 
                    : t
            ))
            setSelectedId(null)
            
            const newMatchesFound = matchesFound + 1
            setMatchesFound(newMatchesFound)

            // Game over logic
            if (newMatchesFound === totalPairs) {
                setIsGameOver(true)
                const timeSec = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000)
                setIsSubmitting(true)

                const res = await submitMatchScore({ libraryId, timeSeconds: timeSec, pairsMatched: newMatchesFound })
                
                setIsSubmitting(false)
                setResult({ xpEarned: res.xpEarned || 0, timeSec })
            }
        } else {
            // Match failed
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
            <div className="match-engine error">
                <p>No cards available to play Match.</p>
                <a href="/client/app" className="btn-primary mt-4">Return Home</a>
            </div>
        )
    }

    if (isGameOver && result) {
        return (
            <div className="match-engine debrief">
                <h2>Match Complete!</h2>
                <div className="debrief-matrix mt-4">
                    <div className="matrix-row">
                        <span className="matrix-label">TIME</span>
                        <span className="matrix-value">{result.timeSec}s</span>
                    </div>
                    <div className="matrix-row">
                        <span className="matrix-label">PAIRS</span>
                        <span className="matrix-value">{totalPairs}</span>
                    </div>
                    <div className="matrix-row">
                        <span className="matrix-label">XP EARNED</span>
                        <span className="matrix-value purple">+{result.xpEarned}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button onClick={() => window.location.reload()} className="btn-secondary">Play Again</button>
                    <a href="/client/training" className="btn-primary">Exit</a>
                </div>
            </div>
        )
    }

    return (
        <div className="match-engine active">
            <header className="match-header">
                <h2>{libraryTitle} (Match)</h2>
                <div className="match-progress">
                    {matchesFound} / {totalPairs} matched
                </div>
            </header>

            <div className="match-grid">
                {tiles.map((tile) => (
                    <button
                        key={tile.uniqueId}
                        className={`match-tile state-${tile.state}`}
                        onClick={() => handleTileClick(tile)}
                        disabled={tile.state === 'matched' || isSubmitting}
                    >
                        {tile.text}
                    </button>
                ))}
            </div>
        </div>
    )
}
