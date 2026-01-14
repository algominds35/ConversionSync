import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { updateUserGoogleAds, getUserByEmail } from '@/lib/db'
import { verifyAccountAccess, getConversionActions } from '@/lib/googleAds'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Connect callback - Session exists:', !!session)
    console.log('Connect callback - Has refreshToken:', !!session?.refreshToken)

    if (!session?.user?.email) {
      console.error('Connect callback error: No session')
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    // Get customerId from URL params
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      console.error('Connect callback error: No customerId')
      return NextResponse.redirect(
        new URL('/dashboard?error=no_customer_id', request.url)
      )
    }

    console.log('Connect callback - Customer ID:', customerId)

    // Get user from database
    const user = await getUserByEmail(session.user.email)
    
    console.log('Connect callback - User found in DB:', !!user)

    if (!user) {
      console.error('Connect callback error: User not found in database')
      return NextResponse.redirect(
        new URL('/dashboard?error=user_not_found', request.url)
      )
    }

    // Use the refresh token from the session
    const refreshToken = session.refreshToken

    if (!refreshToken) {
      console.error('Connect callback error: No refresh token in session')
      return NextResponse.redirect(
        new URL('/dashboard?error=no_refresh_token', request.url)
      )
    }

    console.log('Connect callback - Has refresh token:', !!refreshToken)

    // Verify access and get conversion actions
    try {
      await verifyAccountAccess(customerId, refreshToken)
      console.log('Connect callback - Access verified')
      
      const conversionActions = await getConversionActions(customerId, refreshToken)
      console.log('Connect callback - Conversion actions fetched:', conversionActions.length)
    } catch (error) {
      console.error('Connect callback - Verification error:', error)
      return NextResponse.redirect(
        new URL('/dashboard?error=verification_failed', request.url)
      )
    }

    // Update user with Google Ads info
    await updateUserGoogleAds(user.id, customerId, refreshToken)
    console.log('Connect callback - User updated successfully')

    // Redirect to dashboard with success
    return NextResponse.redirect(
      new URL('/dashboard?success=connected', request.url)
    )
  } catch (error) {
    console.error('Connect callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard?error=connection_failed', request.url)
    )
  }
}
