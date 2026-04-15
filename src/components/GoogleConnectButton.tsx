'use client'

import React from 'react'
import { getGoogleAuthUrl } from '@/app/actions/api-auth'

export default function GoogleConnectButton() {
    const handleConnect = async () => {
        const url = await getGoogleAuthUrl()
        window.location.href = url
    }

    return (
        <button 
            onClick={handleConnect}
            style={{ 
                background: '#4285F4', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                padding: '0.5rem 1rem', 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '1rem',
                width: '100%'
            }}
        >
            <span style={{ fontSize: '1rem' }}>G</span> Connect Google Calendar
        </button>
    )
}
