'use client'

import { useState } from 'react'
import { submitStructuredReport, StructuredReportPayload } from '@/app/tutor/lessons/[id]/report/actions'

interface Library {
    id: string
    title: string
}

export default function StructuredReportForm({
    lessonId, studentId, studentName, libraries = []
}: {
    lessonId: string
    studentId: string
    studentName: string
    libraries?: Library[]
}) {
    const [coreFeedback, setCoreFeedback] = useState('')
    const [skills, setSkills] = useState({ Grammar: 0, Vocabulary: 0, Fluency: 0, Pronunciation: 0 })
    const [bonusXp, setBonusXp] = useState(50)
    
    const [taskInput, setTaskInput] = useState('')
    const [taskType, setTaskType] = useState<'standard' | 'study_session'>('standard')
    const [selectedLibraryId, setSelectedLibraryId] = useState<string>('')
    const [tasks, setTasks] = useState<{ title: string; type: 'standard' | 'study_session'; libraryId?: string }[]>([])
    
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSkillChange = (skill: string, delta: number) => {
        setSkills(prev => ({ ...prev, [skill]: Math.max(-50, Math.min(50, prev[skill as keyof typeof prev] + delta)) }))
    }

    const addTask = () => {
        if (taskType === 'study_session') {
            if (!selectedLibraryId) return
            const lib = libraries.find(l => l.id === selectedLibraryId)
            setTasks([...tasks, { title: `Study: ${lib?.title ?? 'Library'}`, type: 'study_session', libraryId: selectedLibraryId }])
            setSelectedLibraryId('')
        } else {
            if (!taskInput.trim()) return
            setTasks([...tasks, { title: taskInput.trim(), type: 'standard' }])
            setTaskInput('')
        }
    }

    const removeTask = (index: number) => setTasks(tasks.filter((_, i) => i !== index))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        
        const payload: StructuredReportPayload = {
            lesson_id: lessonId,
            student_id: studentId,
            core_feedback: coreFeedback,
            skills,
            bonus_xp: bonusXp,
            tasks
        }

        await submitStructuredReport(payload)
    }

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
                <label>Core Headline Feedback</label>
                <textarea 
                    value={coreFeedback} 
                    onChange={e => setCoreFeedback(e.target.value)} 
                    rows={2} 
                    required 
                    placeholder="Brief 1-2 sentence summary for the student..." 
                />
            </div>

            <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }}/>
            <h3>Analytics (Skill Toggles)</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>Click to adjust skill increments for the student&apos;s progress matrix.</p>
            <div className="skills-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                {Object.entries(skills).map(([skill, val]) => (
                    <div key={skill} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontWeight: 500 }}>{skill}</span>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button type="button" onClick={() => handleSkillChange(skill, -5)} className="btn-small" style={{background: '#e2e8f0', color: 'black'}}>-5</button>
                            <span style={{ width: '40px', textAlign: 'center', fontWeight: 'bold', color: val > 0 ? '#10b981' : val < 0 ? '#ef4444' : '#64748b' }}>
                                {val > 0 ? '+' : ''}{val}
                            </span>
                            <button type="button" onClick={() => handleSkillChange(skill, 5)} className="btn-small" style={{background: '#e2e8f0', color: 'black'}}>+5</button>
                        </div>
                    </div>
                ))}
            </div>

            <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }}/>
            <h3>Bonus Effort XP</h3>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                    type="range" min="0" max="100" step="5" 
                    value={bonusXp} 
                    onChange={e => setBonusXp(parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: '#8b5cf6' }}
                />
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#8b5cf6', minWidth: '80px', textAlign: 'right' }}>+{bonusXp} XP</span>
            </div>

            <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }}/>
            <h3>Assign Tasks</h3>
            
            {/* Task Type Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                    type="button"
                    onClick={() => setTaskType('standard')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer', background: taskType === 'standard' ? '#0f172a' : '#e2e8f0', color: taskType === 'standard' ? '#fff' : '#475569' }}
                >
                    ✓ Checkbox Task
                </button>
                <button
                    type="button"
                    onClick={() => setTaskType('study_session')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer', background: taskType === 'study_session' ? '#7c3aed' : '#e2e8f0', color: taskType === 'study_session' ? '#fff' : '#475569' }}
                >
                    ▶ Study Session
                </button>
            </div>

            {taskType === 'standard' ? (
                <div className="form-group" style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                        type="text" value={taskInput} 
                        onChange={e => setTaskInput(e.target.value)} 
                        placeholder="e.g. Read Chapter 4"
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTask(); } }}
                    />
                    <button type="button" onClick={addTask} className="btn-secondary" style={{ padding: '0 1.5rem', flexShrink: 0 }}>Add</button>
                </div>
            ) : (
                <div className="form-group" style={{ display: 'flex', gap: '0.5rem' }}>
                    <select value={selectedLibraryId} onChange={e => setSelectedLibraryId(e.target.value)} style={{ flex: 1 }}>
                        <option value="">— Select card library —</option>
                        {libraries.map(lib => (
                            <option key={lib.id} value={lib.id}>{lib.title}</option>
                        ))}
                    </select>
                    <button type="button" onClick={addTask} className="btn-secondary" style={{ padding: '0 1.5rem', flexShrink: 0 }} disabled={!selectedLibraryId}>Assign</button>
                </div>
            )}
            
            {tasks.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {tasks.map((task, i) => (
                        <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: task.type === 'study_session' ? '#f5f3ff' : '#f8fafc', padding: '0.75rem 1rem', borderRadius: '4px', border: `1px solid ${task.type === 'study_session' ? '#ddd6fe' : '#e2e8f0'}` }}>
                            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{task.type === 'study_session' ? '▶ ' : '✓ '}{task.title}</span>
                            <button type="button" onClick={() => removeTask(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="form-actions" style={{ marginTop: '2.5rem' }}>
                <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '0.875rem' }}>
                    {isSubmitting ? 'Submitting Protocol...' : 'Submit Debrief Protocol'}
                </button>
            </div>
        </form>
    )
}
