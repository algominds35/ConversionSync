import { updateUserGoogleAds, getUserByEmail } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const stateParam = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      return Response.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=${encodeURIComponent(error)}`
      )
    }

    if (!code || !stateParam) {
      console.error('Missing code or state parameter')
      return Response.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=missing_parameters`
      )
    }

    console.log('Raw state parameter:', stateParam)

    // Decode state parameter to get email
    let email
    try {
      email = Buffer.from(stateParam, 'base64').toString()
      console.log('Decoded email:', email)
    } catch (err) {
      console.error('Failed to decode state:', err)
      return Response.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=invalid_state`
      )
    }

    if (!email) {
      console.error('Missing email in state')
      return Response.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=missing_email`
      )
    }

    // Get user from database to retrieve customer ID
    console.log('Fetching user from database:', email)
    const user = await getUserByEmail(email)
    
    if (!user) {
      console.error('User not found:', email)
      return Response.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=user_not_found`
      )
    }

    const customerId = user.google_ads_customer_id

    if (!customerId) {
      console.error('Customer ID not found for user:', email)
      return Response.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=missing_customer_id`
      )
    }

    console.log('OAuth callback - exchanging code for tokens...')
    console.log('User email:', email)
    console.log('Customer ID from database:', customerId)

    // Ensure the base URL has https:// protocol
    let baseUrl = process.env.NEXTAUTH_URL || 'https://conversion-sync.vercel.app'
    if (!baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${baseUrl}/api/google-ads/oauth-callback`,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenResponse.json()

    console.log('Token response status:', tokenResponse.status)
    console.log('Has refresh_token:', !!tokens.refresh_token)

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokens)
      return Response.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=token_exchange_failed`
      )
    }

    if (!tokens.refresh_token) {
      console.error('No refresh token received!')
      return Response.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=no_refresh_token`
      )
    }

    console.log('Saving Google Ads connection...')
    console.log('Customer ID:', customerId)
    console.log('Refresh token length:', tokens.refresh_token.length)

    // Save refresh token to database (customer ID already saved)
    await updateUserGoogleAds(email, tokens.refresh_token)

    console.log('✅ Google Ads connected successfully!')

    // Redirect back to dashboard
    return Response.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard?success=google_ads_connected`
    )

  } catch (error) {
    console.error('OAuth callback error:', error)
    return Response.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard?error=${encodeURIComponent(error.message)}`
    )
  }
}
