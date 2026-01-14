import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { updateUserGoogleAds, getUserByEmail } from '@/lib/db'
import { verifyAccountAccess, getConversionActions } from '@/lib/googleAds'

export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session || !session.refreshToken) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.redirect(new URL('/auth/signup', request.url))
    }

    // Get customer ID from query params or will be set from client
    // This route will be called by the client after OAuth
    return NextResponse.redirect(new URL('/connect?step=finalize', request.url))

  } catch (error) {
    console.error('Connect callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=connection_failed', request.url))
  }
}
