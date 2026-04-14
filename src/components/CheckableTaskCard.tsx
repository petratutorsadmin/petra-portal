'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CheckableTaskCard({ task, onComplete }: { task: any, onComplete: (taskId: string) => Promise<void> }) {
    const [isCompleting, setIsCompleting] = useState(false)
    const [isDone, setIsDone] = useState(task.status === 'completed')

    const isStudyTask = task.task_type === 'study_session'

    const handleCheck = () => {
        if (isDone || isCompleting || isStudyTask) return
        setIsCompleting(true)
        onComplete(task.id).catch(console.error)
        setTimeout(() => setIsDone(true), 300)
    }

    if (isDone) return null

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: '#ffffff', 
            padding: '1rem', 
            borderRadius: '12px', 
            border: isStudyTask ? '1px solid #ddd6fe' : '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            opacity: isCompleting ? 0 : 1,
            transform: isCompleting ? 'scale(0.98)' : 'scale(1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            gap: '1rem'
        }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.title}
                </h4>
                <span style={{ 
                    fontSize: '0.75rem', fontWeight: 600, 
                    color: isStudyTask ? '#7c3aed' : '#8b5cf6', 
                    background: isStudyTask ? '#f5f3ff' : '#ede9fe', 
                    padding: '0.25rem 0.5rem', borderRadius: '9999px', 
                    display: 'inline-block', marginTop: '0.5rem' 
                }}>
                    {isStudyTask ? '▶ Training' : `+${task.xp_reward} XP`}
                </span>
            </div>

            {isStudyTask ? (
                <Link
                    href={`/client/study?task_id=${task.id}`}
                    style={{
                        flexShrink: 0,
                        padding: '0.5rem 1rem',
                        background: '#7c3aed',
                        color: '#fff',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Start →
                </Link>
            ) : (
                <button 
                    onClick={handleCheck}
                    disabled={isCompleting}
                    style={{ 
                        flexShrink: 0,
                        width: '32px', height: '32px', borderRadius: '50%', 
                        border: '2px solid #cbd5e1', background: 'transparent',
                        cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    {isCompleting && <span style={{ width: '12px', height: '12px', background: '#8b5cf6', borderRadius: '50%' }}></span>}
                </button>
            )}
        </div>
    )
}

