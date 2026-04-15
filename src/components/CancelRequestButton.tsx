'use client'

import React, { useState } from 'react'
import { cancelPlanChangeRequest } from '@/app/client/pricing/actions'

export function CancelRequestButton({ requestId }: { requestId: string }) {
    const [cancelling, setCancelling] = useState(false)
    return (
        <button
            onClick={async (e) => {
                e.stopPropagation()
                setCancelling(true)
                await cancelPlanChangeRequest(requestId)
            }}
            disabled={cancelling}
            style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
        >
            {cancelling ? 'Cancelling...' : 'Cancel request'}
        </button>
    )
}
