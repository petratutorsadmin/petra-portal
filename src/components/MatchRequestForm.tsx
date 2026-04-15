'use client'

import React, { useState } from 'react'

interface MatchRequestFormProps {
    tutorId: string
    tutorName: string
    expertise: string
    onRequestMatch: (tutorId: string, name: string, expertise: string) => Promise<{ success: boolean, message: string }>
}

export default function MatchRequestForm({ tutorId, tutorName, expertise, onRequestMatch }: MatchRequestFormProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')
        try {
            const result = await onRequestMatch(tutorId, tutorName, expertise)
            if (result.success) {
                setStatus('success')
                setMessage(result.message)
            } else {
                setStatus('error')
                setMessage(result.message || 'Something went wrong.')
            }
        } catch (err) {
            setStatus('error')
            setMessage('A server error occurred. Please try again later.')
        }
    }

    if (status === 'success') {
        return (
            <div style={{ 
                background: '#f0fdf4', 
                color: '#166534', 
                padding: '1rem', 
                borderRadius: '8px', 
                fontSize: '0.9rem',
                border: '1px solid #bbf7d0',
                textAlign: 'center'
            }}>
                ✓ {message}
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            <button 
                type="submit" 
                className="btn-primary" 
                disabled={status === 'loading'}
                style={{ 
                    width: '100%', 
                    opacity: status === 'loading' ? 0.7 : 1,
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer'
                }}
            >
                {status === 'loading' ? 'Processing...' : 'Request Match (Test Calendar Sync)'}
            </button>
            {status === 'error' && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>
                    {message}
                </p>
            )}
        </form>
    )
}
