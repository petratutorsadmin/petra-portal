'use client'

import { useState } from 'react'

export default function CheckableTaskCard({ task, onComplete }: { task: any, onComplete: (taskId: string) => Promise<void> }) {
    const [isCompleting, setIsCompleting] = useState(false)
    const [isDone, setIsDone] = useState(task.status === 'completed')

    const handleClick = async () => {
        if (isDone || isCompleting) return
        setIsCompleting(true)
        await onComplete(task.id)
        setIsDone(true)
    }

    if (isDone) return null // Hide once complete

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: '#ffffff', 
            padding: '1rem', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            opacity: isCompleting ? 0.5 : 1,
            transition: 'opacity 0.3s ease'
        }}>
            <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>{task.title}</h4>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6', background: '#ede9fe', padding: '0.25rem 0.5rem', borderRadius: '9999px', display: 'inline-block', marginTop: '0.5rem' }}>
                    +{task.xp_reward} XP
                </span>
            </div>
            <button 
                onClick={handleClick}
                disabled={isCompleting}
                style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    border: '2px solid #cbd5e1', 
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {isCompleting && <span style={{ width: '12px', height: '12px', background: '#8b5cf6', borderRadius: '50%' }}></span>}
            </button>
        </div>
    )
}
