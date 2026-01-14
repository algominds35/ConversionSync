import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { updateUserGoogleAds, getUserByEmail } from '@/lib/db'
import { verifyAccountAccess, getConversionActions } from '@/lib/googleAds'

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession()
    
    console.log('=== CONNECT API DEBUG ===')
    console.log('Session exists:', !!session)
    console.log('Session user:', session?.user?.email)
    console.log('Has refreshToken:', !!session?.refreshToken)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)
    
    console.log('User found in DB:', !!user)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // Get tokens from session
    const { refreshToken } = session
    
    console.log('RefreshToken present:', !!refreshToken)
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token available. The OAuth flow may not have completed properly. Please try connecting again.' },
        { status: 400 }
      )
    }

    // Get customer ID from request
    const body = await request.json()
    const { customerId } = body
    
    console.log('Request body:', body)
    console.log('Customer ID:', customerId)

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Remove dashes from customer ID (format: 123-456-7890 -> 1234567890)
    const formattedCustomerId = customerId.replace(/-/g, '')

    // Verify account access
    const verifyResult = await verifyAccountAccess(formattedCustomerId, refreshToken)
    if (!verifyResult.success) {
      return NextResponse.json(
        { error: `Unable to access Google Ads account: ${verifyResult.error}` },
        { status: 400 }
      )
    }

    // Get conversion actions
    const conversionActions = await getConversionActions(formattedCustomerId, refreshToken)

    // Update user in database
    await updateUserGoogleAds(user.id, {
      customerId: formattedCustomerId,
      accessToken: session.accessToken,
      refreshToken: refreshToken,
    })

    return NextResponse.json({
      success: true,
      message: 'Google Ads account connected successfully',
      account: {
        customerId: verifyResult.customerId,
        accountName: verifyResult.accountName,
      },
      conversionActions
    })

  } catch (error) {
    console.error('Connect Google Ads error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
