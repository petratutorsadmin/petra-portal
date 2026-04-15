export default function AdminLoading() {
    return (
        <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px' }}>
            <div style={{ height: '2rem', width: '220px', background: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ height: '100px', background: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
            </div>
            <div style={{ height: '350px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        </div>
    )
}
