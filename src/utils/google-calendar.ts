import { google } from 'googleapis'
import { createClient } from '@/utils/supabase/server'
import { getOAuth2Client } from './google-oauth'

export async function getCalendarClient(userId?: string) {
    if (userId) {
        const supabase = await createClient()
        const { data: creds } = await supabase
            .from('user_google_creds')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (creds) {
            const oauth2Client = getOAuth2Client()
            oauth2Client.setCredentials({
                access_token: creds.access_token,
                refresh_token: creds.refresh_token,
                expiry_date: Number(creds.expiry_date)
            })

            // Auto-refresh if expired
            const isExpired = Number(creds.expiry_date) <= Date.now()
            if (isExpired) {
                const { credentials } = await oauth2Client.refreshAccessToken()
                await supabase.from('user_google_creds').update({
                    access_token: credentials.access_token,
                    expiry_date: credentials.expiry_date,
                    updated_at: new Date().toISOString()
                }).eq('user_id', userId)
            }

            return google.calendar({ version: 'v3', auth: oauth2Client })
        }
    }

    // Fallback to Service Account (JWT) if no userId or no creds found
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!email || !privateKey) {
        throw new Error('Google Calendar credentials missing in environment variables.')
    }

    const auth = new google.auth.JWT({
        email: email,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/calendar.events']
    })

    return google.calendar({ version: 'v3', auth })
}

export async function createCalendarEvent(lessonDetails: {
    title: string,
    description: string,
    startTime: string, // ISO string
    durationMinutes: number,
    tutorName: string,
    studentName: string,
    userId?: string // New optional param to use specific user's calendar
}) {
    const calendarId = process.env.GOOGLE_CALENDAR_ID
    if (!calendarId) throw new Error('GOOGLE_CALENDAR_ID missing in environment variables.')

    const calendar = await getCalendarClient(lessonDetails.userId)

    const start = new Date(lessonDetails.startTime)
    const end = new Date(start.getTime() + lessonDetails.durationMinutes * 60000)

    const event = {
        summary: `${lessonDetails.title} (${lessonDetails.studentName} & ${lessonDetails.tutorName})`,
        description: lessonDetails.description,
        start: {
            dateTime: start.toISOString(),
            timeZone: 'Asia/Tokyo',
        },
        end: {
            dateTime: end.toISOString(),
            timeZone: 'Asia/Tokyo',
        },
    }

    try {
        const res = await calendar.events.insert({
            calendarId: lessonDetails.userId ? 'primary' : calendarId, // 'primary' for user, specific ID for service account
            requestBody: event,
        })
        console.log('Google Calendar event created:', res.data.htmlLink)
        return { success: true, link: res.data.htmlLink }
    } catch (error) {
        console.error('Failed to create calendar event:', error)
        return { success: false, error }
    }
}
