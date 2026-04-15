// Route-level loading state for the entire /client section
// Shown instantly when navigating between any client pages
export default function ClientLoading() {
    return (
        <div style={{ 
            padding: '2.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem',
            maxWidth: '800px'
        }}>
            {/* Title */}
            <div style={{ height: '2rem', width: '200px', background: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            {/* Subtitle */}
            <div style={{ height: '1rem', width: '320px', background: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            {/* Cards */}
            {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '80px', background: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0', animation: 'pulse 1.5s ease-in-out infinite', opacity: 1 - i * 0.1 }} />
            ))}
            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            `}</style>
        </div>
    )
}
