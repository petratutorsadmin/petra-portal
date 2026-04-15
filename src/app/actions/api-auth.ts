'use server'

import { getAuthUrl } from '@/utils/google-oauth'

export async function getGoogleAuthUrl() {
    return getAuthUrl()
}
