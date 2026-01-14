import { hashEmail, hashPhone, formatDateForGoogleAds } from './utils'

/**
 * Get OAuth access token from refresh token
 */
async function getAccessToken(refreshToken) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`Failed to get access token: ${data.error_description || data.error}`)
  }

  return data.access_token
}

/**
 * Upload offline conversion to Google Ads via REST API
 * 
 * @param {Object} params
 * @param {string} params.customerId - Google Ads customer ID
 * @param {string} params.refreshToken - OAuth refresh token
 * @param {string} params.gclid - Google Click ID
 * @param {string} params.conversionAction - Conversion action resource name
 * @param {Date} params.conversionDateTime - Conversion date/time
 * @param {number} params.conversionValue - Conversion value
 * @param {string} params.currencyCode - Currency code (default: USD)
 * @param {string} params.email - User email (optional)
 * @param {string} params.phone - User phone (optional)
 */
export async function uploadClickConversion({
  customerId,
  refreshToken,
  gclid,
  conversionAction,
  conversionDateTime,
  conversionValue,
  currencyCode = 'USD',
  email = null,
  phone = null,
}) {
  try {
    console.log('Uploading conversion using Google Ads REST API...')
    console.log('Customer ID:', customerId)
    console.log('GCLID:', gclid)
    
    // Warn about test/fake GCLIDs
    if (gclid.length < 50) {
      console.warn('⚠️ WARNING: GCLID looks short/fake. Real GCLIDs are 100+ chars!')
      console.warn('⚠️ Google will accept but silently drop fake GCLIDs')
      console.warn('⚠️ Use a real ad click or test account for testing')
    }
    
    const accessToken = await getAccessToken(refreshToken)
    const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || customerId

    // Diagnostic call to confirm the Ads API endpoint is reachable
    try {
      const diagResponse = await fetch(
        'https://googleads.googleapis.com/v17/customers:listAccessibleCustomers',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
          },
          body: JSON.stringify({}),
        }
      )

      const diagText = await diagResponse.text()
      console.log('Diagnostics status:', diagResponse.status)
      console.log('Diagnostics content-type:', diagResponse.headers.get('content-type'))
      console.log('Diagnostics body (first 200):', diagText.substring(0, 200))
    } catch (diagError) {
      console.warn('Diagnostics call failed:', diagError?.message || diagError)
    }

    // Prepare conversion data (REST API format)
    const conversion = {
      gclid: gclid,
      conversionAction: conversionAction,
      conversionDateTime: formatDateForGoogleAds(conversionDateTime),
      conversionValue: conversionValue,
      currencyCode: currencyCode,
    }

    // Fail fast if conversionAction customer ID doesn't match customerId
    if (conversionAction && !conversionAction.includes(`customers/${customerId}/`)) {
      throw new Error(
        `Conversion Action customer ID does not match connected customer ID. ` +
          `Expected customers/${customerId}/..., got ${conversionAction}`
      )
    }

    // Add enhanced conversion data if provided
    if (email || phone) {
      conversion.userIdentifiers = []
      
      if (email) {
        conversion.userIdentifiers.push({
          hashedEmail: hashEmail(email)
        })
      }
      
      if (phone) {
        conversion.userIdentifiers.push({
          hashedPhoneNumber: hashPhone(phone)
        })
      }
    }

    console.log('Conversion data:', JSON.stringify(conversion, null, 2))

    const apiVersions = ['v17', 'v16']
    const apiPaths = [
      `customers/${customerId}:uploadClickConversions`,
      `customers/${customerId}/conversionUploads:uploadClickConversions`,
    ]
    const payload = {
      conversions: [conversion],
      partialFailure: true,
    }

    let lastError = null

    for (const version of apiVersions) {
      for (const path of apiPaths) {
        const apiUrl = `https://googleads.googleapis.com/${version}/${path}`
        console.log(`Trying Google Ads API endpoint: ${apiUrl}`)

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          'Accept': 'application/json',
            'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
            'login-customer-id': loginCustomerId,
          },
          body: JSON.stringify(payload),
        })

        const responseText = await response.text()
        const contentType = response.headers.get('content-type') || ''

        // If Google returns an HTML 404 page, try the next endpoint.
        if (response.status === 404 && contentType.includes('text/html')) {
          console.warn(`Got HTML 404 from ${apiUrl}, trying next endpoint...`)
          lastError = new Error(`API returned non-JSON response (status 404)`)
          continue
        }

        let result
        try {
          result = JSON.parse(responseText)
        } catch (parseError) {
          throw new Error(
            `API returned non-JSON response (status ${response.status}): ${responseText.substring(0, 200)}`
          )
        }

        if (!response.ok) {
          const errorMessage = result.error?.message || result.error || 'Upload failed'
          throw new Error(errorMessage)
        }

        console.log('Upload result:', JSON.stringify(result, null, 2))

        return {
          success: true,
          message: 'Conversion uploaded successfully',
          response: result
        }
      }
    }

    throw lastError || new Error('Upload failed for all API versions.')

  } catch (error) {
    console.error('Google Ads API Error:', error)
    console.error('Error details:', error.message)
    
    // Parse error message
    let errorMessage = error.message || 'Unknown error occurred'
    
    // Common error messages
    if (errorMessage.includes('INVALID_CUSTOMER_ID')) {
      errorMessage = 'Invalid Google Ads Customer ID'
    } else if (errorMessage.includes('CONVERSION_ACTION_NOT_FOUND')) {
      errorMessage = 'Conversion action not found. Make sure the resource name is correct.'
    } else if (errorMessage.includes('INVALID_CONVERSION_ACTION_TYPE')) {
      errorMessage = 'Invalid conversion action type'
    } else if (errorMessage.includes('EXPIRED_GCLID')) {
      errorMessage = 'GCLID has expired (older than 90 days)'
    } else if (errorMessage.includes('INVALID_GCLID')) {
      errorMessage = 'Invalid GCLID format'
    } else if (errorMessage.includes('GRPC')) {
      errorMessage = 'Google Ads API connection error. Please check your developer token and account access.'
    }

    return {
      success: false,
      error: errorMessage,
      details: error.message
    }
  }
}

/**
 * Get conversion actions for a customer
 */
export async function getConversionActions(customerId, refreshToken) {
  console.warn('getConversionActions is disabled in REST-only mode.')
  return []
}

/**
 * Verify Google Ads account access
 */
export async function verifyAccountAccess(customerId, refreshToken) {
  console.warn('verifyAccountAccess is disabled in REST-only mode.')
  return {
    success: false,
    error: 'verifyAccountAccess not available in REST-only mode'
  }
}
