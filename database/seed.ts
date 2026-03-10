import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

// We must use the service_role key to bypass RLS and create auth users
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function seed() {
    console.log('Seeding Database...')

    // 1. Create a test Admin
    console.log('Creating Admin User...')
    const { data: adminAuth, error: adminErr } = await supabase.auth.admin.createUser({
        email: 'admin@petratutors.com',
        password: 'password123',
        email_confirm: true
    })

    if (adminErr) console.error('Admin error:', adminErr.message)
    else if (adminAuth.user) {
        await supabase.from('profiles').update({ role: 'admin', first_name: 'System', last_name: 'Admin' }).eq('id', adminAuth.user.id)
    }

    // 2. Create a test Tutor
    console.log('Creating Tutor User...')
    const { data: tutorAuth, error: tutorErr } = await supabase.auth.admin.createUser({
        email: 'tutor@petratutors.com',
        password: 'password123',
        email_confirm: true
    })

    if (tutorErr) console.error('Tutor error:', tutorErr.message)
    else if (tutorAuth.user) {
        const tutorId = tutorAuth.user.id
        await supabase.from('profiles').update({ role: 'tutor', first_name: 'Jane', last_name: 'Doe' }).eq('id', tutorId)
        await supabase.from('tutor_profiles').insert({
            id: tutorId,
            tutor_level: 'pro',
            university: 'Oxford University',
            bio: 'Expert in Mathematics and Physics.',
            subjects: ['Math', 'Physics'],
            curriculum_expertise: ['A-Level', 'IB']
        })
    }

    // 3. Create a test Student
    console.log('Creating Student User...')
    const { data: studentAuth, error: studentErr } = await supabase.auth.admin.createUser({
        email: 'student@petratutors.com',
        password: 'password123',
        email_confirm: true
    })

    if (studentErr) console.error('Student error:', studentErr.message)
    else if (studentAuth.user) {
        const studentId = studentAuth.user.id
        await supabase.from('profiles').update({ role: 'student', first_name: 'Sam', last_name: 'Smith', timezone: 'Asia/Tokyo' }).eq('id', studentId)
        await supabase.from('student_profiles').insert({
            id: studentId,
            grade_level: 10,
            school_name: 'Tokyo International School',
            assigned_plan: 'Standard Tier 1'
        })

        // Create an active match if both tutor and student exist
        if (tutorAuth?.user) {
            console.log('Creating Match & Lesson...')
            await supabase.from('matches').insert({
                student_id: studentId,
                tutor_id: tutorAuth.user.id,
                status: 'active'
            })

            // Create an upcoming lesson
            const nextWeek = new Date()
            nextWeek.setDate(nextWeek.getDate() + 7)
            await supabase.from('lessons').insert({
                student_id: studentId,
                tutor_id: tutorAuth.user.id,
                date_time: nextWeek.toISOString(),
                duration_minutes: 60,
                subject_program: 'IB Mathematics',
                status: 'scheduled'
            })
        }
    }

    console.log('Seeding Complete.')
}

seed()
