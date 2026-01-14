import { updateUserGoogleAds } from '@/lib/db'

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
      return Response.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=missing_parameters`
      )
    }

    // Decode state parameter to get email and customer ID
    const state = JSON.parse(Buffer.from(stateParam, 'base64').toString())
    const { email, customerId } = state

    console.log('OAuth callback - exchanging code for tokens...')
    console.log('User email from state:', email)
    console.log('Customer ID from state:', customerId)

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
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/google-ads/oauth-callback`,
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

    // Save to database
    await updateUserGoogleAds({
      email: email,
      customerId: customerId,
      refreshToken: tokens.refresh_token
    })

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
