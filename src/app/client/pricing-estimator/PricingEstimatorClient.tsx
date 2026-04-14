'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
    calculateClientPrice,
    formatCurrency,
    PROGRAM_BASE_PRICES,
    PLAN_MULTIPLIERS,
    DELIVERY_FEES,
    STUDENT_TYPE_MULTIPLIERS,
    GROUP_SIZE_MULTIPLIERS,
    MARKET_MULTIPLIERS,
    LESSON_LENGTH_MULTIPLIERS,
    WEEKLY_DISCOUNT,
    TOPICS_MAPPING,
} from '@/utils/pricing-engine'
import '@/app/client/pricing/pricing.css' // Reuse pricing layout
import './estimator.css'

interface Topic {
    name: string
    category_code: string
}

const ALL_TOPICS = Object.entries(TOPICS_MAPPING).map(([name, category_code]) => ({ name, category_code }))

export default function PricingEstimatorClient({ initialProgram }: { initialProgram?: string }) {
    const [mode, setMode] = useState<'structured' | 'topics'>(initialProgram ? 'structured' : 'topics')
    const [programCode, setProgramCode] = useState(initialProgram || 'P1')
    const [selectedTopics, setSelectedTopics] = useState<string[]>([])
    
    // Core inputs
    const [lessonMinutes, setLessonMinutes] = useState(60)
    const [lessonsPerWeek, setLessonsPerWeek] = useState(1)
    const [planCode, setPlanCode] = useState('M1')
    const [deliveryCode, setDeliveryCode] = useState('online')
    const [studentTypeCode, setStudentTypeCode] = useState('adult')
    const [groupSize, setGroupSize] = useState(1)
    const [currency, setCurrency] = useState('JPY')

    const toggleTopic = (name: string) => {
        setSelectedTopics(prev => 
            prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]
        )
    }

    // Guard: only calculate when we have valid input
    const canCalculate = mode === 'structured' || (mode === 'topics' && selectedTopics.length > 0)

    const result = canCalculate ? calculateClientPrice({
        programCode: mode === 'structured' ? programCode : undefined,
        topics: mode === 'topics' ? selectedTopics : undefined,
        lessonMinutes,
        lessonsPerWeek,
        planCode,
        deliveryCode,
        studentTypeCode,
        marketRegion: 'Japan Baseline',
        groupSize,
        currencyCode: currency,
        exchangeRate: currency === 'USD' ? 0.0066 : (currency === 'EUR' ? 0.0061 : (currency === 'GBP' ? 0.0052 : 1.0))
    }) : null

    const planMonths = PLAN_MULTIPLIERS[planCode]?.months ?? 1

    return (
        <div className="client-pricing-estimator">
            <div className="mode-toggle">
                <button 
                    className={`btn-toggle ${mode === 'structured' ? 'active' : ''}`}
                    onClick={() => setMode('structured')}
                >
                    Structured Program
                </button>
                <button 
                    className={`btn-toggle ${mode === 'topics' ? 'active' : ''}`}
                    onClick={() => setMode('topics')}
                >
                    Personalized Tutoring
                </button>
            </div>

            <div className="pricing-layout">
                {/* ── LEFT: Controls ── */}
                <div className="pricing-controls">
                    {mode === 'structured' ? (
                        <div className="control-group">
                            <label>Structured Program</label>
                            <select value={programCode} onChange={e => setProgramCode(e.target.value)}>
                                {Object.entries(PROGRAM_BASE_PRICES).map(([code, p]) => (
                                    <option key={code} value={code}>{code} — {p.name}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="control-group">
                            <label>Learning Topics (Select multiple)</label>
                            <div className="topic-grid">
                                {ALL_TOPICS.map(topic => (
                                    <label key={topic.name} className={`topic-pill ${selectedTopics.includes(topic.name) ? 'active' : ''}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedTopics.includes(topic.name)}
                                            onChange={() => toggleTopic(topic.name)}
                                            hidden
                                        />
                                        {topic.name}
                                    </label>
                                ))}
                            </div>
                            {selectedTopics.length === 0 && (
                                <p className="hint">Select topics to see estimated pricing.</p>
                            )}
                        </div>
                    )}

                    <div className="control-row">
                        <div className="control-group">
                            <label>Duration</label>
                            <select value={lessonMinutes} onChange={e => setLessonMinutes(Number(e.target.value))}>
                                {Object.keys(LESSON_LENGTH_MULTIPLIERS).map(m => (
                                    <option key={m} value={m}>{m} min</option>
                                ))}
                            </select>
                        </div>
                        <div className="control-group">
                            <label>Frequency</label>
                            <select value={lessonsPerWeek} onChange={e => setLessonsPerWeek(Number(e.target.value))}>
                                {Object.keys(WEEKLY_DISCOUNT).map(n => (
                                    <option key={n} value={n}>{n}×/week</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="control-group">
                        <label>Plan Commitment</label>
                        <div className="plan-pills">
                            {Object.entries(PLAN_MULTIPLIERS).map(([code, p]) => (
                                <button
                                    key={code}
                                    type="button"
                                    className={`plan-pill ${planCode === code ? 'active' : ''}`}
                                    onClick={() => setPlanCode(code)}
                                >
                                    <span className="plan-pill-code">{code}</span>
                                    <span className="plan-pill-label">{p.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="control-row">
                        <div className="control-group">
                            <label>Delivery</label>
                            <select value={deliveryCode} onChange={e => setDeliveryCode(e.target.value)}>
                                {Object.entries(DELIVERY_FEES).map(([code, d]) => (
                                    <option key={code} value={code}>{d.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="control-group">
                            <label>Group Size</label>
                            <select value={groupSize} onChange={e => setGroupSize(Number(e.target.value))}>
                                {Object.entries(GROUP_SIZE_MULTIPLIERS).map(([s, m]) => (
                                    <option key={s} value={s}>{s === '1' ? '1:1 Private' : `${s} Students`}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="control-row">
                        <div className="control-group" style={{ flex: 'none', width: '50%' }}>
                            <label>Display Currency</label>
                            <select value={currency} onChange={e => setCurrency(e.target.value)}>
                                <option value="JPY">JPY (¥)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Result ── */}
                <div className="pricing-result-card">
                    <div className="result-program">
                        {mode === 'structured' 
                            ? PROGRAM_BASE_PRICES[programCode]?.name 
                            : selectedTopics.length > 0 
                                ? `Personalized: ${selectedTopics.join(', ')}`
                                : 'Choose some topics...'}
                    </div>

                    {result ? (
                        <>
                        <div className="result-price-main">
                            <span className="result-label">Per Lesson</span>
                            <span className="result-amount">{formatCurrency(result.clientPriceConverted, result.currencyCode)}</span>
                        </div>

                        <div className="result-price-monthly">
                            <span className="result-label">Monthly Tuition</span>
                            <span className="result-amount-lg">{formatCurrency(result.clientMonthlyConverted, result.currencyCode)}</span>
                        </div>

                        <div className="result-price-total">
                            <span className="result-label">Plan Total</span>
                            <span className="result-amount-xl">{formatCurrency(planMonths > 0 ? result.clientMonthlyConverted * planMonths : result.clientMonthlyConverted, result.currencyCode)}</span>
                        </div>
                        </>
                    ) : (
                        <div style={{ padding: '2rem 0', textAlign: 'center', color: '#94a3b8' }}>
                            <p style={{ margin: 0, fontWeight: 600 }}>Select topics above</p>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>to see estimated pricing.</p>
                        </div>
                    )}

                    <div className="result-note">
                        Final pricing will be confirmed after your personal tutor match.
                    </div>

                    <Link href="/client/browse" className="result-cta">Request Final Quote →</Link>
                </div>
            </div>
        </div>
    )
}
