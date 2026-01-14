import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { updateUserGoogleAds, getUserByEmail } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user
    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Disconnect Google Ads by setting fields to null
    await updateUserGoogleAds(user.id, null, null)

    return NextResponse.json({ 
      success: true,
      message: 'Google Ads disconnected successfully' 
    })
  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Google Ads' },
      { status: 500 }
    )
  }
}
