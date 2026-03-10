'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    console.log('--- LOGIN ACTION TRIGGERED ---')
    const supabase = await createClient()

    // type-casting here for convenience
    // in production, use zod to validate
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }
    console.log('Login attempt for:', data.email)

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        console.error('Supabase auth error:', error)
        redirect('/login?error=Could not authenticate user')
    }

    console.log('Supabase auth successful. Checking profile...')

    // Check user role to redirect appropriately
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile) {
            if (profile.role === 'admin') redirect('/admin')
            if (profile.role === 'tutor') redirect('/tutor')
            if (profile.role === 'student' || profile.role === 'parent') redirect('/client')
        }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        redirect('/login?error=Could not authenticate user')
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Check email to continue sign in process')
}
