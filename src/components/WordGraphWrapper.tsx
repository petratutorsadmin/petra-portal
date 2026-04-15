'use client'

import dynamic from 'next/dynamic'

const WordGraph = dynamic(() => import('./WordGraph'), { 
    ssr: false, 
    loading: () => <div style={{ height: '400px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>Loading Synapse Map...</div> 
})

export default function WordGraphWrapper({ data }: { data: any }) {
    return <WordGraph data={data} />
}
