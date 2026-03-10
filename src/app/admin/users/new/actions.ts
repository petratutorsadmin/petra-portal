'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function createUser(formData: FormData) {
    const role = formData.get('role') as string
    const email = formData.get('email') as string
    const first_name = formData.get('first_name') as string
    const last_name = formData.get('last_name') as string
    const timezone = formData.get('timezone') as string

    // We need the service role key to bypass RLS and create users via Admin API
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Create auth user with invite
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)

    if (authError) {
        console.error('Error creating user:', authError)
        redirect('/admin/users/new?error=Could not create user')
    }

    const userId = authData.user.id

    // 2. Insert into profiles
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: userId,
            role: role,
            first_name,
            last_name,
            email,
            timezone,
        })

    if (profileError) {
        console.error('Error creating profile:', profileError)
        redirect('/admin/users/new?error=Could not create profile record')
    }

    // 3. Create role specific record
    if (role === 'tutor') {
        await supabaseAdmin.from('tutor_profiles').insert({ id: userId })
    } else if (role === 'student') {
        await supabaseAdmin.from('student_profiles').insert({ id: userId })
    }

    revalidatePath('/admin/users')
    redirect(`/admin/users?role=${role}`)
}
