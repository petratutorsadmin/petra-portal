export default function ProgressLoading() {
    return (
        <div style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ height: '2rem', width: '180px', background: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            {/* XP card */}
            <div style={{ height: '100px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {[1,2,3,4].map(i => (
                    <div key={i} style={{ height: '70px', background: '#f1f5f9', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
            </div>
            {/* Skills card */}
            <div style={{ height: '240px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
    )
}
