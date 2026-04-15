'use client'

import { useState } from 'react'
import { submitPlanChangeRequest, RequestType } from '@/app/client/pricing/actions'

const REQUEST_TYPES: { type: RequestType; label: string; description: string; hasValues: boolean }[] = [
    { type: 'format_change', label: 'Change Lesson Format', description: 'Switch between online and in-person', hasValues: true },
    { type: 'frequency_change', label: 'Adjust Lesson Frequency', description: 'Change how many lessons per week', hasValues: true },
    { type: 'lesson_length_change', label: 'Change Lesson Length', description: 'Switch between 45, 60, 90, or 120 minutes', hasValues: true },
    { type: 'tutor_change', label: 'Request Tutor Change', description: 'Request a different tutor assignment', hasValues: false },
    { type: 'add_subject', label: 'Add a Subject', description: 'Add a new subject or focus area', hasValues: false },
    { type: 'pause', label: 'Pause Plan', description: 'Temporarily pause your lessons', hasValues: false },
    { type: 'resume', label: 'Resume Plan', description: 'Resume a paused plan', hasValues: false },
    { type: 'add_sibling', label: 'Add a Sibling', description: 'Enroll another family member', hasValues: false },
    { type: 'other', label: 'Other Request', description: 'A custom request or question for Petra', hasValues: false },
]

const FORMAT_OPTIONS = ['online', 'in-person (nearby)', 'in-person (standard)', 'home visit']
const FREQUENCY_OPTIONS = ['1x per week', '2x per week', '3x per week', '4x per week']
const LENGTH_OPTIONS = ['45 min', '60 min', '90 min', '120 min']

export default function PlanChangeForm() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedType, setSelectedType] = useState<RequestType | null>(null)
    const [requestedValue, setRequestedValue] = useState('')
    const [notes, setNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const typeConfig = REQUEST_TYPES.find(t => t.type === selectedType)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedType) return
        setIsSubmitting(true)

        const fd = new FormData()
        fd.append('request_type', selectedType)
        fd.append('requested_value', requestedValue)
        fd.append('notes', notes)

        const result = await submitPlanChangeRequest(fd)
        if (result.success) {
            setSubmitted(true)
            setIsOpen(false)
        }
        setIsSubmitting(false)
    }

    if (submitted) {
        return (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                <p style={{ fontWeight: 700, color: '#15803d', fontSize: '1.1rem', margin: 0 }}>✓ Request Received</p>
                <p style={{ color: '#166534', fontSize: '0.875rem', margin: '0.5rem 0 0' }}>Petra will review your request and confirm details within 1–2 business days.</p>
            </div>
        )
    }

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                style={{ width: '100%', padding: '1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'opacity 0.2s' }}
            >
                Request a Plan Change →
            </button>
        )
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Step 1: Choose request type */}
            <div>
                <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What would you like to change?</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                    {REQUEST_TYPES.map(rt => (
                        <button
                            key={rt.type}
                            type="button"
                            onClick={() => { setSelectedType(rt.type); setRequestedValue('') }}
                            style={{
                                textAlign: 'left', padding: '1rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                                border: selectedType === rt.type ? '2px solid #0f172a' : '1px solid #e2e8f0',
                                background: selectedType === rt.type ? '#0f172a' : '#ffffff',
                                color: selectedType === rt.type ? '#fff' : '#0f172a',
                            }}
                        >
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rt.label}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.25rem' }}>{rt.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Step 2: Value picker (for simple changes) */}
            {selectedType && typeConfig?.hasValues && (
                <div>
                    <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What would you like it changed to?</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {(selectedType === 'format_change' ? FORMAT_OPTIONS :
                          selectedType === 'frequency_change' ? FREQUENCY_OPTIONS :
                          LENGTH_OPTIONS).map(opt => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => setRequestedValue(opt)}
                                style={{
                                    padding: '0.625rem 1.25rem', borderRadius: '9999px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                                    border: requestedValue === opt ? '2px solid #0f172a' : '1px solid #e2e8f0',
                                    background: requestedValue === opt ? '#0f172a' : '#fff',
                                    color: requestedValue === opt ? '#fff' : '#475569',
                                }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Notes */}
            {selectedType && (
                <div>
                    <label style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                        Additional notes {selectedType === 'other' ? '(required)' : '(optional)'}
                    </label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Any context that would help Petra process your request..."
                        required={selectedType === 'other'}
                        style={{ width: '100%', padding: '0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit' }}
                    />
                </div>
            )}

            {/* Actions */}
            {selectedType && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        type="submit"
                        disabled={isSubmitting || (typeConfig?.hasValues && !requestedValue)}
                        style={{ flex: 1, padding: '0.875rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: (isSubmitting || (typeConfig?.hasValues && !requestedValue)) ? 0.6 : 1 }}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsOpen(false); setSelectedType(null); setRequestedValue('') }}
                        style={{ padding: '0.875rem 1.5rem', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </form>
    )
}
