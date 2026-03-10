// src/utils/pricing-engine.ts
// Pure TypeScript pricing engine — no Supabase dependency.
// Used by both the Admin Quote Builder (server) and Client Pricing Preview (client-side).

// ─── Static lookup tables ────────────────────────────────────────────────────

export const LESSON_LENGTH_MULTIPLIERS: Record<number, number> = {
    45: 0.75,
    60: 1.0,
    90: 1.5,
    120: 2.0,
}

export const WEEKLY_DISCOUNT: Record<number, number> = {
    1: 0.00,
    2: 0.05,
    3: 0.08,
    4: 0.10,
}

export const PLAN_MULTIPLIERS: Record<string, { multiplier: number; label: string; months: number }> = {
    PAYG: { multiplier: 1.15, label: 'Pay As You Go', months: 0 },
    M1:   { multiplier: 1.00, label: '1 Month',       months: 1 },
    M2:   { multiplier: 0.97, label: '2 Months',      months: 2 },
    M3:   { multiplier: 0.94, label: '3 Months',      months: 3 },
    M6:   { multiplier: 0.90, label: '6 Months',      months: 6 },
    M12:  { multiplier: 0.85, label: '12 Months',     months: 12 },
}

export const DELIVERY_FEES: Record<string, { label: string; clientFee: number; tutorExtra: number }> = {
    online:       { label: 'Online',              clientFee: 0,    tutorExtra: 0 },
    ip_nearby:    { label: 'In-person Nearby',    clientFee: 500,  tutorExtra: 300 },
    ip_standard:  { label: 'In-person Standard',  clientFee: 1000, tutorExtra: 300 },
    ip_far:       { label: 'In-person Far',        clientFee: 1500, tutorExtra: 700 },
    home:         { label: 'Home Visit Premium',  clientFee: 2000, tutorExtra: 1000 },
    cafe:         { label: 'Cafe Lesson',         clientFee: 500,  tutorExtra: 1200 },
}

export const STUDENT_TYPE_MULTIPLIERS: Record<string, { label: string; multiplier: number }> = {
    early_childhood: { label: 'Early Childhood',      multiplier: 1.10 },
    elementary:      { label: 'Elementary',           multiplier: 1.10 },
    junior_high:     { label: 'Junior High',          multiplier: 1.05 },
    high_school:     { label: 'High School',          multiplier: 1.10 },
    international:   { label: 'International School', multiplier: 1.25 },
    university:      { label: 'University',           multiplier: 0.90 },
    adult:           { label: 'Adult',                multiplier: 1.00 },
    professional:    { label: 'Professional',         multiplier: 1.20 },
}

export const GROUP_SIZE_MULTIPLIERS: Record<number, number> = {
    1: 1.00,
    2: 0.80,
    3: 0.65,
    4: 0.55,
    5: 0.50,
    6: 0.45,
}

export const MARKET_MULTIPLIERS: Record<string, number> = {
    'Developing Markets': 0.65,
    'Emerging Markets':   0.80,
    'Upper Middle':       0.90,
    'Japan Baseline':     1.00,
    'High Income Asia':   1.30,
    'Western Europe':     1.90,
    'UK':                 2.10,
    'North America':      2.20,
    'Premium Cities':     2.50,
}

// Tutor pay: level → [min, standard, max]
export const TUTOR_PAY_RATES: Record<number, [number, number, number]> = {
    0: [1800, 2000, 2200],
    1: [2200, 2400, 2600],
    2: [2800, 3000, 3400],
    3: [3600, 3900, 4300],
    4: [4500, 5000, 6000],
    5: [7000, 8500, 10000],
}

export const PROGRAM_BASE_PRICES: Record<string, { name: string; basePrice: number }> = {
    P1:  { name: 'Basic Language Support',            basePrice: 3500 },
    P2:  { name: 'Standard School Support',           basePrice: 3850 },
    P3:  { name: 'Conversation & Practical Language', basePrice: 4200 },
    P4:  { name: 'Academic Language Support',         basePrice: 4700 },
    P5:  { name: 'Standard Exam Prep',                basePrice: 5250 },
    P6:  { name: 'Adult Professional / Business',     basePrice: 5950 },
    P7:  { name: 'International School Core',         basePrice: 7000 },
    P8:  { name: 'Advanced International Curriculum', basePrice: 8400 },
    P9:  { name: 'Premium Writing / Admissions',      basePrice: 10500 },
    P10: { name: 'Specialist Premium',                basePrice: 13300 },
    P11: { name: 'Ultra Premium Consulting',          basePrice: 17500 },
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PricingInputs {
    programCode: string     // P1–P11
    lessonMinutes: number   // 45, 60, 90, 120
    lessonsPerWeek: number  // 1–4
    planCode: string        // PAYG, M1–M12
    deliveryCode: string    // online, ip_nearby, etc.
    studentTypeCode: string // adult, high_school, etc.
    marketRegion: string    // Japan Baseline, UK, etc.
    groupSize: number       // 1–6
    currencyCode?: string   // JPY (default), USD, etc.
    exchangeRate?: number   // 1.0 for JPY
}

export interface AdminPricingInputs extends PricingInputs {
    tutorLevel: number      // 0–5
    tutorPayMode: 'min' | 'standard' | 'max' | 'custom'
    customTutorPay?: number // only if mode = 'custom'
}

export interface PricingResult {
    clientPricePerLessonJpy: number
    clientMonthlyJpy: number
    clientPriceConverted: number
    clientMonthlyConverted: number
    currencyCode: string
}

export interface AdminPricingResult extends PricingResult {
    tutorPayPerLessonJpy: number
    tutorMonthlyJpy: number
    petraMarginPerLessonJpy: number
    petraMarginPercent: number
}

// ─── Engine functions ─────────────────────────────────────────────────────────

/**
 * Calculate the client-facing price per lesson in JPY.
 * Never include tutor pay or margin in this function's return.
 */
export function calculateClientPrice(inputs: PricingInputs): PricingResult {
    const program = PROGRAM_BASE_PRICES[inputs.programCode]
    if (!program) throw new Error(`Unknown program code: ${inputs.programCode}`)

    const lenMult   = LESSON_LENGTH_MULTIPLIERS[inputs.lessonMinutes] ?? 1.0
    const stMult    = STUDENT_TYPE_MULTIPLIERS[inputs.studentTypeCode]?.multiplier ?? 1.0
    const mktMult   = MARKET_MULTIPLIERS[inputs.marketRegion] ?? 1.0
    const planMult  = PLAN_MULTIPLIERS[inputs.planCode]?.multiplier ?? 1.0
    const discount  = WEEKLY_DISCOUNT[inputs.lessonsPerWeek] ?? 0
    const grpMult   = GROUP_SIZE_MULTIPLIERS[inputs.groupSize] ?? 1.0
    const delivery  = DELIVERY_FEES[inputs.deliveryCode]?.clientFee ?? 0

    const clientPricePerLessonJpy = Math.round(
        program.basePrice
        * lenMult
        * stMult
        * mktMult
        * planMult
        * (1 - discount)
        * grpMult
        + delivery
    )

    const lessonsInPlan = inputs.planCode === 'PAYG'
        ? inputs.lessonsPerWeek * 4
        : (PLAN_MULTIPLIERS[inputs.planCode]?.months ?? 1) * inputs.lessonsPerWeek * 4

    const clientMonthlyJpy = clientPricePerLessonJpy * inputs.lessonsPerWeek * 4

    const rate = inputs.exchangeRate ?? 1.0

    return {
        clientPricePerLessonJpy,
        clientMonthlyJpy,
        clientPriceConverted: Math.round(clientPricePerLessonJpy * rate * 100) / 100,
        clientMonthlyConverted: Math.round(clientMonthlyJpy * rate * 100) / 100,
        currencyCode: inputs.currencyCode ?? 'JPY',
    }
}

/**
 * Calculate tutor pay per lesson in JPY (admin-only).
 */
export function calculateTutorPay(inputs: AdminPricingInputs): number {
    const rates = TUTOR_PAY_RATES[inputs.tutorLevel]
    if (!rates) throw new Error(`Unknown tutor level: ${inputs.tutorLevel}`)

    let basePayJpy: number
    if (inputs.tutorPayMode === 'min') basePayJpy = rates[0]
    else if (inputs.tutorPayMode === 'standard') basePayJpy = rates[1]
    else if (inputs.tutorPayMode === 'max') basePayJpy = rates[2]
    else basePayJpy = inputs.customTutorPay ?? rates[1]

    const lenMult    = LESSON_LENGTH_MULTIPLIERS[inputs.lessonMinutes] ?? 1.0
    const tutorExtra = DELIVERY_FEES[inputs.deliveryCode]?.tutorExtra ?? 0

    return Math.round(basePayJpy * lenMult + tutorExtra)
}

/**
 * Full pricing calculation for admin view only.
 */
export function calculateAdminPricing(inputs: AdminPricingInputs): AdminPricingResult {
    const clientResult = calculateClientPrice(inputs)
    const tutorPayPerLessonJpy = calculateTutorPay(inputs)
    const petraMarginPerLessonJpy = clientResult.clientPricePerLessonJpy - tutorPayPerLessonJpy
    const petraMarginPercent = clientResult.clientPricePerLessonJpy > 0
        ? Math.round((petraMarginPerLessonJpy / clientResult.clientPricePerLessonJpy) * 100)
        : 0

    return {
        ...clientResult,
        tutorPayPerLessonJpy,
        tutorMonthlyJpy: tutorPayPerLessonJpy * inputs.lessonsPerWeek * 4,
        petraMarginPerLessonJpy,
        petraMarginPercent,
    }
}

/**
 * Format a JPY number as a currency string.
 */
export function formatCurrency(amount: number, code = 'JPY'): string {
    if (code === 'JPY') return `¥${amount.toLocaleString()}`
    if (code === 'USD') return `$${amount.toFixed(2)}`
    if (code === 'GBP') return `£${amount.toFixed(2)}`
    if (code === 'EUR') return `€${amount.toFixed(2)}`
    return `${amount.toLocaleString()} ${code}`
}
