// Skeleton loading state for the student Briefing dashboard
// Shown instantly while server fetches data — eliminates blank screen
export default function BriefingLoading() {
    return (
        <div className="student-dashboard" aria-busy="true">
            {/* Header skeleton */}
            <header className="dashboard-header">
                <div style={{ height: '2rem', width: '200px', background: '#e2e8f0', borderRadius: '8px', marginBottom: '1rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
                {/* XP ring skeleton */}
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#e2e8f0', margin: '0 auto', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </header>

            {/* Next session skeleton */}
            <section className="lesson-anchor" style={{ opacity: 0.6 }}>
                <div style={{ height: '0.75rem', width: '80px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '0.5rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ height: '1.25rem', width: '260px', background: '#e2e8f0', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </section>

            {/* Task skeletons */}
            <section style={{ marginBottom: '3rem' }}>
                <div style={{ height: '1rem', width: '160px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '1rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ height: '68px', background: '#e2e8f0', borderRadius: '12px', marginBottom: '0.75rem', animation: 'pulse 1.5s ease-in-out infinite', opacity: 1 - (i * 0.15) }} />
                ))}
            </section>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    )
}
