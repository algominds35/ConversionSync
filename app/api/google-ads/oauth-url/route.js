import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { savePendingCustomerId } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { customerId } = await request.json()

    if (!customerId) {
      return Response.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    // Clean customer ID (remove dashes)
    const cleanCustomerId = customerId.replace(/-/g, '')

    // Save customer ID to database BEFORE OAuth redirect
    console.log('Saving customer ID to database for user:', session.user.email)
    await savePendingCustomerId(session.user.email, cleanCustomerId)
    console.log('Customer ID saved successfully')

    const clientId = process.env.GOOGLE_CLIENT_ID
    
    // Ensure the base URL has https:// protocol
    let baseUrl = process.env.NEXTAUTH_URL || 'https://conversion-sync.vercel.app'
    if (!baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`
    }
    
    const redirectUri = `${baseUrl}/api/google-ads/oauth-callback`
    
    console.log('=== OAuth URL Generation ===')
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
    console.log('Redirect URI:', redirectUri)
    console.log('Client ID:', clientId ? 'Set' : 'NOT SET')
    
    // Build OAuth URL for Google Ads API access
    const oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    
    // Just pass email in state (customer ID is already saved in DB)
    const state = Buffer.from(session.user.email).toString('base64')
    
    console.log('User email:', session.user.email)
    console.log('Encoded state:', state)
    
    oauthUrl.searchParams.append('client_id', clientId)
    oauthUrl.searchParams.append('redirect_uri', redirectUri)
    oauthUrl.searchParams.append('response_type', 'code')
    oauthUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/adwords')
    oauthUrl.searchParams.append('access_type', 'offline')
    oauthUrl.searchParams.append('prompt', 'consent')
    oauthUrl.searchParams.append('state', state)

    console.log('Generated OAuth URL:', oauthUrl.toString())

    return Response.json({ url: oauthUrl.toString() })

  } catch (error) {
    console.error('OAuth URL error:', error)
    return Response.json(
      { error: error.message || 'Failed to generate OAuth URL' },
      { status: 500 }
    )
  }
}
