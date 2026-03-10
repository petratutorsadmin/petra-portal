/**
 * Formats a date string or Date object into a human-readable format,
 * optionally using a specific timezone.
 */
export function formatDateTime(
    date: string | Date,
    timezone: string = 'Asia/Tokyo',
    options: Intl.DateTimeFormatOptions = {
        dateStyle: 'medium',
        timeStyle: 'short',
    }
): string {
    const d = typeof date === 'string' ? new Date(date) : date
    try {
        return new Intl.DateTimeFormat('en-US', {
            ...options,
            timeZone: timezone,
        }).format(d)
    } catch (e) {
        console.error('Timezone formatting error:', e)
        return d.toLocaleString()
    }
}

/**
 * Get current time in ISO format
 */
export function nowIso(): string {
    return new Date().toISOString()
}
