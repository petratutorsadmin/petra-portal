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

    let redirectUrl = '/' // Default

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) {
            console.error('Supabase getUser error:', userError)
            throw userError
        }

        if (user) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profileError) {
                console.error('Supabase profile fetch error:', profileError)
                // We don't throw here, we just let them go to '/' where they might see an error or default state
            }

            if (profile) {
                if (profile.role === 'admin') redirectUrl = '/admin'
                if (profile.role === 'tutor') redirectUrl = '/tutor'
                if (profile.role === 'student' || profile.role === 'parent') redirectUrl = '/client'
            } else {
                console.log('No profile found. Defaulting to /')
            }
        }
    } catch (err) {
        console.error('Unexpected error during login role resolution:', err)
        redirect('/login?error=An unexpected error occurred during login.')
    }

    revalidatePath('/', 'layout')
    redirect(redirectUrl)
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
