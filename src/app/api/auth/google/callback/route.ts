import { createClient } from '@/utils/supabase/server'
import { getOAuth2Client } from '@/utils/google-oauth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
        console.error('Google OAuth error:', error)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin?error=google_auth_failed`)
    }

    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin?error=no_code`)
    }

    try {
        const oauth2Client = getOAuth2Client()
        const { tokens } = await oauth2Client.getToken(code)
        
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login`)
        }

        // Save tokens to DB
        // Note: refresh_token is only sent on first consent or if prompt=consent
        const { error: dbError } = await supabase
            .from('user_google_creds')
            .upsert({
                user_id: user.id,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expiry_date: tokens.expiry_date,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

        if (dbError) {
            console.error('Database error storing google creds:', dbError)
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin?error=db_error`)
        }

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin?success=google_connected`)
    } catch (err) {
        console.error('OAuth callback exception:', err)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin?error=exception`)
    }
}
