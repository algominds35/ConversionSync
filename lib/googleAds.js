import { GoogleAdsApi } from 'google-ads-api'
import { hashEmail, hashPhone, formatDateForGoogleAds } from './utils'

/**
 * Initialize Google Ads API client
 */
export function getGoogleAdsClient(refreshToken) {
  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  })

  return client
}

/**
 * Get customer from refresh token
 */
export function getCustomer(client, customerId, refreshToken) {
  return client.Customer({
    customer_id: customerId,
    refresh_token: refreshToken,
  })
}

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
    // Get access token
    const accessToken = await getAccessToken(refreshToken)

    // Prepare conversion data
    const conversion = {
      gclid: gclid,
      conversionAction: conversionAction,
      conversionDateTime: formatDateForGoogleAds(conversionDateTime),
      conversionValue: conversionValue,
      currencyCode: currencyCode,
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

    // Upload via REST API
    const response = await fetch(
      `https://googleads.googleapis.com/v16/customers/${customerId}/conversionUploads:uploadClickConversions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
          'login-customer-id': customerId,
        },
        body: JSON.stringify({
          conversions: [conversion],
          partialFailure: true,
        }),
      }
    )

    // Log the response for debugging
    console.log('Google Ads API Response Status:', response.status)
    console.log('Google Ads API Response Headers:', Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log('Google Ads API Response Body:', responseText.substring(0, 500))
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError)
      throw new Error(`API returned non-JSON response: ${responseText.substring(0, 200)}`)
    }

    if (!response.ok) {
      const errorMessage = data.error?.message || data.error || 'Upload failed'
      throw new Error(errorMessage)
    }

    // Check for partial failures
    if (data.partialFailureError) {
      throw new Error(`Partial failure: ${data.partialFailureError.message}`)
    }

    return {
      success: true,
      message: 'Conversion uploaded successfully',
      response: data
    }

  } catch (error) {
    console.error('Google Ads API Error:', error)
    
    // Parse error message
    let errorMessage = error.message || 'Unknown error occurred'
    
    // Common error messages
    if (errorMessage.includes('INVALID_CUSTOMER_ID')) {
      errorMessage = 'Invalid Google Ads Customer ID'
    } else if (errorMessage.includes('CONVERSION_ACTION_NOT_FOUND')) {
      errorMessage = 'Conversion action not found'
    } else if (errorMessage.includes('INVALID_CONVERSION_ACTION_TYPE')) {
      errorMessage = 'Invalid conversion action type'
    } else if (errorMessage.includes('EXPIRED_GCLID')) {
      errorMessage = 'GCLID has expired (older than 90 days)'
    } else if (errorMessage.includes('INVALID_GCLID')) {
      errorMessage = 'Invalid GCLID format'
    }

    return {
      success: false,
      error: errorMessage,
      details: error
    }
  }
}

/**
 * Get conversion actions for a customer
 */
export async function getConversionActions(customerId, refreshToken) {
  try {
    const client = getGoogleAdsClient(refreshToken)
    const customer = getCustomer(client, customerId, refreshToken)

    const results = await customer.query(`
      SELECT
        conversion_action.id,
        conversion_action.name,
        conversion_action.type,
        conversion_action.status,
        conversion_action.resource_name
      FROM conversion_action
      WHERE conversion_action.status = 'ENABLED'
    `)

    // v15 returns an array of results
    return results.map(row => ({
      id: row.conversion_action.id.toString(),
      name: row.conversion_action.name,
      type: row.conversion_action.type,
      status: row.conversion_action.status,
      resourceName: row.conversion_action.resource_name,
    }))

  } catch (error) {
    console.error('Error fetching conversion actions:', error)
    console.error('Error details:', error.message)
    return [] // Return empty array instead of throwing
  }
}

/**
 * Verify Google Ads account access
 */
export async function verifyAccountAccess(customerId, refreshToken) {
  try {
    const client = getGoogleAdsClient(refreshToken)
    const customer = getCustomer(client, customerId, refreshToken)

    // Simple query to verify we can access the account
    const [response] = await customer.query(`
      SELECT 
        customer.id,
        customer.descriptive_name
      FROM customer
      LIMIT 1
    `)
    
    if (response) {
      return {
        success: true,
        customerId: response.customer.id.toString(),
        accountName: response.customer.descriptive_name || 'Google Ads Account',
      }
    }

    return {
      success: false,
      error: 'Unable to access account'
    }

  } catch (error) {
    console.error('Verify access error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
