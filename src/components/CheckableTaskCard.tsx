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
            padding: '12px 0', 
            borderBottom: '1px solid var(--border-main)',
            opacity: isCompleting ? 0 : 1,
            transition: 'opacity 0.2s',
        }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                    fontSize: '11px', fontWeight: 600, 
                    color: isStudyTask ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: '1px solid var(--border-main)',
                    background: isStudyTask ? 'var(--bg-hover)' : 'transparent',
                    padding: '2px 6px', borderRadius: '4px', 
                    textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                    {isStudyTask ? 'Training' : 'Task'}
                </span>
                <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                    {task.title}
                </h4>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {!isStudyTask && (
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)' }}>
                        +{task.xp_reward} XP
                    </span>
                )}

                {isStudyTask ? (
                    <Link
                        href={`/client/study?task_id=${task.id}`}
                        style={{
                            padding: '4px 12px',
                            background: 'var(--text-primary)',
                            color: 'var(--bg-workspace)',
                            borderRadius: '4px',
                            fontWeight: 500,
                            fontSize: '12px',
                            textDecoration: 'none',
                        }}
                    >
                        Start
                    </Link>
                ) : (
                    <button 
                        onClick={handleCheck}
                        disabled={isCompleting}
                        style={{ 
                            width: '20px', height: '20px', borderRadius: '4px', 
                            border: '1px solid var(--border-main)', background: 'transparent',
                            cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.1s, border-color 0.1s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-primary)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-main)' }}
                    >
                        {isCompleting && <span style={{ width: '10px', height: '10px', background: 'var(--text-primary)', borderRadius: '2px' }}></span>}
                    </button>
                )}
            </div>
        </div>
    )
}
