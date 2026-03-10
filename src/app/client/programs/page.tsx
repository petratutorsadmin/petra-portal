import Link from 'next/link'
import '@/app/shared/forms.css'
import './programs.css'

const PROGRAMS = [
    {
        code: 'P5',
        name: 'Eiken Preparation',
        description: 'Preparation for Eiken levels 5–1 including reading, writing, listening and interview practice.',
        studentLevel: 'Junior High – High School',
        format: '60 – 90 minute lessons',
        priceRange: '¥5,250 – ¥6,500',
    },
    {
        code: 'P7',
        name: 'International School Core',
        description: 'Comprehensive support for core IB, Edexcel, and Cambridge curriculum subjects.',
        studentLevel: 'MYP / IGCSE Students',
        format: '60 – 120 minute lessons',
        priceRange: '¥7,000 – ¥8,500',
    },
    {
        code: 'P3',
        name: 'Conversational English',
        description: 'Focus on fluency, pronunciation, and practical language for everyday use.',
        studentLevel: 'All Ages',
        format: '45 – 60 minute lessons',
        priceRange: '¥4,200 – ¥5,000',
    },
    {
        code: 'P9',
        name: 'Admissions Essay Coaching',
        description: 'Specialist guidance for university applications, personal statements, and academic writing.',
        studentLevel: 'University Applicants',
        format: '90 – 120 minute sessions',
        priceRange: '¥10,500 – ¥15,000',
    },
    {
        code: 'P2',
        name: 'Standard School Support',
        description: 'General support for school English curriculum, homework, and test prep.',
        studentLevel: 'Elementary – Junior High',
        format: '45 – 60 minute lessons',
        priceRange: '¥3,850 – ¥4,500',
    },
    {
        code: 'P6',
        name: 'Business English',
        description: 'Professional communication, presentation skills, and business writing for adults.',
        studentLevel: 'Working Professionals',
        format: '60 minute lessons',
        priceRange: '¥5,950 – ¥7,500',
    }
]

export default function ProgramCatalogPage() {
    return (
        <div className="program-catalog-page">
            <header className="client-header flex-between">
                <div>
                    <h1>Program Catalog</h1>
                    <p>Explore our structured learning programs designed for specific goals.</p>
                </div>
                <Link href="/client/pricing-estimator" className="btn-primary">Price Estimator →</Link>
            </header>

            <div className="program-grid mt-4">
                {PROGRAMS.map(program => (
                    <div key={program.code} className="program-card">
                        <div className="program-badge">{program.code}</div>
                        <h3>{program.name}</h3>
                        <p className="program-desc">{program.description}</p>
                        
                        <div className="program-details">
                            <div className="detail-item">
                                <strong>Typical Students:</strong> {program.studentLevel}
                            </div>
                            <div className="detail-item">
                                <strong>Format:</strong> {program.format}
                            </div>
                            <div className="detail-item price-item">
                                <strong>Est. Price:</strong> {program.priceRange} / lesson
                            </div>
                        </div>

                        <Link href={`/client/pricing-estimator?program=${program.code}`} className="btn-secondary w-full text-center mt-4">
                            Estimate My Plan
                        </Link>
                    </div>
                ))}
            </div>

            <section className="dashboard-section mt-4 bg-light">
                <h3>Personalized Tutoring</h3>
                <p>Not sure which program fits? Our <strong>Personalized Tutoring</strong> allows you to mix and match topics like Conversation, Essay Writing, and Grammar. The system automatically finds the right pricing for you.</p>
                <Link href="/client/pricing-estimator?custom=true" className="btn-primary mt-2">Build Custom Plan →</Link>
            </section>
        </div>
    )
}
