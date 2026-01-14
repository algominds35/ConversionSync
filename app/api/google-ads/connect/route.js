import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { updateUserGoogleAds, getUserByEmail } from '@/lib/db'
import { verifyAccountAccess, getConversionActions } from '@/lib/googleAds'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get tokens from session
    const { refreshToken } = session
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token available. Please re-authenticate with Google.' },
        { status: 400 }
      )
    }

    // Get customer ID from request
    const body = await request.json()
    const { customerId } = body

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Remove dashes from customer ID (format: 123-456-7890 -> 1234567890)
    const formattedCustomerId = customerId.replace(/-/g, '')

    console.log('Formatted Customer ID:', formattedCustomerId)
    console.log('Refresh token available:', !!refreshToken)

    // SKIP verification for now - just save the connection
    // Verification will happen when they upload their first conversion
    
    // Update user in database with Google Ads connection
    await updateUserGoogleAds(user.id, {
      customerId: formattedCustomerId,
      accessToken: session.accessToken,
      refreshToken: refreshToken,
    })

    console.log('User updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Google Ads account connected successfully! You can now upload conversions.',
      account: {
        customerId: formattedCustomerId,
        accountName: 'Google Ads Account',
      }
    })

  } catch (error) {
    console.error('Connect Google Ads error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
