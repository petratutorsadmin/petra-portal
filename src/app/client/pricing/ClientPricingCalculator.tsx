'use client'

import { useState, useCallback } from 'react'
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
} from '@/utils/pricing-engine'
import './pricing.css'

interface Props {
    isLocked: boolean
    currentPlanCode?: string
    enrollmentId?: string
}

const PROGRAMS = Object.entries(PROGRAM_BASE_PRICES).map(([code, v]) => ({ code, ...v }))
const PLANS = Object.entries(PLAN_MULTIPLIERS).map(([code, v]) => ({ code, ...v }))
const DELIVERIES = Object.entries(DELIVERY_FEES).map(([code, v]) => ({ code, ...v }))
const STUDENT_TYPES = Object.entries(STUDENT_TYPE_MULTIPLIERS).map(([code, v]) => ({ code, ...v }))

export default function ClientPricingCalculator({ isLocked, currentPlanCode }: Props) {
    const [programCode, setProgramCode] = useState('P1')
    const [lessonMinutes, setLessonMinutes] = useState(60)
    const [lessonsPerWeek, setLessonsPerWeek] = useState(1)
    const [planCode, setPlanCode] = useState(currentPlanCode || 'M1')
    const [deliveryCode, setDeliveryCode] = useState('online')
    const [studentTypeCode, setStudentTypeCode] = useState('adult')
    const [groupSize, setGroupSize] = useState(1)

    // Calculate live price using the pricing engine (client-only inputs - no tutor pay/margin)
    const result = calculateClientPrice({
        programCode,
        lessonMinutes,
        lessonsPerWeek,
        planCode,
        deliveryCode,
        studentTypeCode,
        marketRegion: 'Japan Baseline', // always baseline for client preview
        groupSize,
        currencyCode: 'JPY',
        exchangeRate: 1.0,
    })

    const planMonths = PLAN_MULTIPLIERS[planCode]?.months ?? 1
    const planTotal = planMonths > 0 ? result.clientMonthlyJpy * planMonths : result.clientMonthlyJpy

    return (
        <div className="client-pricing-calculator">
            {isLocked && (
                <div className="locked-banner">
                    🔒 Your plan is locked. Contact Petra to make changes.
                </div>
            )}

            <div className="pricing-layout">
                {/* ── LEFT: Controls ── */}
                <div className="pricing-controls">
                    <fieldset disabled={isLocked}>
                        <div className="control-group">
                            <label>Program</label>
                            <select value={programCode} onChange={e => setProgramCode(e.target.value)}>
                                {PROGRAMS.map(p => (
                                    <option key={p.code} value={p.code}>{p.code} — {p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="control-row">
                            <div className="control-group">
                                <label>Lesson Length</label>
                                <select value={lessonMinutes} onChange={e => setLessonMinutes(Number(e.target.value))}>
                                    {Object.keys(LESSON_LENGTH_MULTIPLIERS).map(m => (
                                        <option key={m} value={m}>{m} min</option>
                                    ))}
                                </select>
                            </div>
                            <div className="control-group">
                                <label>Lessons / Week</label>
                                <select value={lessonsPerWeek} onChange={e => setLessonsPerWeek(Number(e.target.value))}>
                                    {Object.keys(WEEKLY_DISCOUNT).map(n => (
                                        <option key={n} value={n}>{n}×/week{Number(n) > 1 ? ` (save ${Math.round(WEEKLY_DISCOUNT[Number(n)] * 100)}%)` : ''}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="control-group">
                            <label>Plan Type</label>
                            <div className="plan-pills">
                                {PLANS.map(p => (
                                    <button
                                        key={p.code}
                                        type="button"
                                        className={`plan-pill ${planCode === p.code ? 'active' : ''}`}
                                        onClick={() => setPlanCode(p.code)}
                                    >
                                        <span className="plan-pill-code">{p.code}</span>
                                        <span className="plan-pill-label">{p.label}</span>
                                        <span className="plan-pill-mult">
                                            {p.code === 'PAYG' ? '+15%' : p.code === 'M1' ? 'base' : `-${Math.round((1 - p.multiplier) * 100)}%`}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="control-row">
                            <div className="control-group">
                                <label>Delivery Type</label>
                                <select value={deliveryCode} onChange={e => setDeliveryCode(e.target.value)}>
                                    {DELIVERIES.map(d => (
                                        <option key={d.code} value={d.code}>
                                            {d.label}{d.clientFee > 0 ? ` (+¥${d.clientFee.toLocaleString()})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="control-group">
                                <label>Group Size</label>
                                <select value={groupSize} onChange={e => setGroupSize(Number(e.target.value))}>
                                    {Object.entries(GROUP_SIZE_MULTIPLIERS).map(([s, m]) => (
                                        <option key={s} value={s}>
                                            {s === '1' ? '1:1 (Private)' : `${s} Students${Math.round((1 - m) * 100) > 0 ? ` (-${Math.round((1 - m) * 100)}%)` : ''}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="control-group">
                            <label>Student Type</label>
                            <select value={studentTypeCode} onChange={e => setStudentTypeCode(e.target.value)}>
                                {STUDENT_TYPES.map(s => (
                                    <option key={s.code} value={s.code}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </fieldset>
                </div>

                {/* ── RIGHT: Live Price Card ── */}
                <div className="pricing-result-card">
                    <div className="result-program">{PROGRAM_BASE_PRICES[programCode]?.name}</div>
                    <div className="result-plan">{PLAN_MULTIPLIERS[planCode]?.label} · {lessonMinutes} min · {lessonsPerWeek}×/week</div>

                    <div className="result-price-main">
                        <span className="result-label">Per Lesson</span>
                        <span className="result-amount">{formatCurrency(result.clientPricePerLessonJpy)}</span>
                    </div>

                    <div className="result-price-monthly">
                        <span className="result-label">Per Month</span>
                        <span className="result-amount-lg">{formatCurrency(result.clientMonthlyJpy)}</span>
                    </div>

                    {planMonths > 0 && (
                        <div className="result-price-total">
                            <span className="result-label">Plan Total ({planMonths} month{planMonths > 1 ? 's' : ''})</span>
                            <span className="result-amount-xl">{formatCurrency(planTotal)}</span>
                        </div>
                    )}

                    {lessonsPerWeek > 1 && (
                        <div className="result-badge">
                            🎉 {Math.round((WEEKLY_DISCOUNT[lessonsPerWeek] ?? 0) * 100)}% multi-lesson discount applied
                        </div>
                    )}

                    <div className="result-note">
                        Prices shown in JPY (Japan Baseline). Exact pricing for your market will be confirmed by Petra.
                    </div>

                    {!isLocked && (
                        <a href="/client/contact" className="result-cta">Request a Personalised Quote →</a>
                    )}
                </div>
            </div>
        </div>
    )
}
