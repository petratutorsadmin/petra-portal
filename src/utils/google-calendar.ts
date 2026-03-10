import { google } from 'googleapis'

export async function getCalendarClient() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    // Private keys in Vercel/Env variables need to have proper newlines reconstructed
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
    studentName: string
}) {
    const calendarId = process.env.GOOGLE_CALENDAR_ID
    if (!calendarId) throw new Error('GOOGLE_CALENDAR_ID missing in environment variables.')

    const calendar = await getCalendarClient()

    const start = new Date(lessonDetails.startTime)
    const end = new Date(start.getTime() + lessonDetails.durationMinutes * 60000)

    const event = {
        summary: `${lessonDetails.title} (${lessonDetails.studentName} & ${lessonDetails.tutorName})`,
        description: lessonDetails.description,
        start: {
            dateTime: start.toISOString(),
            timeZone: 'Asia/Tokyo', // Can be dynamic later
        },
        end: {
            dateTime: end.toISOString(),
            timeZone: 'Asia/Tokyo',
        },
    }

    try {
        const res = await calendar.events.insert({
            calendarId,
            requestBody: event,
        })
        console.log('Google Calendar event created:', res.data.htmlLink)
        return { success: true, link: res.data.htmlLink }
    } catch (error) {
        console.error('Failed to create calendar event:', error)
        return { success: false, error }
    }
}
