import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { updateUserGoogleAds } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { customerId, refreshToken } = await request.json()

    if (!customerId || !refreshToken) {
      return Response.json(
        { error: 'Customer ID and Refresh Token are required' },
        { status: 400 }
      )
    }

    // Clean customer ID (remove dashes)
    const cleanCustomerId = customerId.replace(/-/g, '')

    // Validate customer ID format (should be 10 digits)
    if (!/^\d{10}$/.test(cleanCustomerId)) {
      return Response.json(
        { error: 'Invalid Customer ID format. Should be XXX-XXX-XXXX' },
        { status: 400 }
      )
    }

    // Validate refresh token format (should start with 1//)
    if (!refreshToken.startsWith('1//')) {
      return Response.json(
        { error: 'Invalid Refresh Token format. Should start with 1//' },
        { status: 400 }
      )
    }

    console.log('Saving manual Google Ads connection for user:', session.user.email)
    console.log('Customer ID:', cleanCustomerId)
    console.log('Refresh token length:', refreshToken.length)

    // Save to database
    await updateUserGoogleAds({
      email: session.user.email,
      customerId: cleanCustomerId,
      refreshToken: refreshToken
    })

    console.log('✅ Successfully saved Google Ads connection')

    return Response.json({ 
      success: true,
      message: 'Google Ads account connected successfully'
    })

  } catch (error) {
    console.error('Connect manual error:', error)
    return Response.json(
      { error: error.message || 'Failed to connect Google Ads account' },
      { status: 500 }
    )
  }
}
