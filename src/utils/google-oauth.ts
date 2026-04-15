import { google } from 'googleapis'

export function getOAuth2Client() {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`

    if (!clientId || !clientSecret) {
        throw new Error('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing.')
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export function getAuthUrl() {
    const oauth2Client = getOAuth2Client()
    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Required for refresh tokens
        scope: ['https://www.googleapis.com/auth/calendar.events'],
        prompt: 'consent' // Force consent to ensure refresh token is returned
    })
}
