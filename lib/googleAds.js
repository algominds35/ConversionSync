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
 * Upload offline conversion to Google Ads
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
    // Initialize client
    const client = getGoogleAdsClient(refreshToken)
    const customer = getCustomer(client, customerId, refreshToken)

    // Prepare conversion upload
    const clickConversion = {
      gclid: gclid,
      conversion_action: conversionAction,
      conversion_date_time: formatDateForGoogleAds(conversionDateTime),
      conversion_value: conversionValue,
      currency_code: currencyCode,
    }

    // Add enhanced conversion data (hashed email/phone) if provided
    if (email || phone) {
      const userIdentifiers = []
      
      if (email) {
        userIdentifiers.push({
          hashed_email: hashEmail(email)
        })
      }
      
      if (phone) {
        userIdentifiers.push({
          hashed_phone_number: hashPhone(phone)
        })
      }

      clickConversion.user_identifiers = userIdentifiers
    }

    // Upload conversion
    const response = await customer.conversionUploads.uploadClickConversions([
      clickConversion
    ])

    // Check for partial failures
    if (response.partial_failure_error) {
      throw new Error(`Partial failure: ${response.partial_failure_error.message}`)
    }

    return {
      success: true,
      message: 'Conversion uploaded successfully',
      response: response
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

    return results.map(row => ({
      id: row.conversion_action.id.toString(),
      name: row.conversion_action.name,
      type: row.conversion_action.type,
      status: row.conversion_action.status,
      resourceName: row.conversion_action.resource_name,
    }))

  } catch (error) {
    console.error('Error fetching conversion actions:', error)
    throw error
  }
}

/**
 * Verify Google Ads account access
 */
export async function verifyAccountAccess(customerId, refreshToken) {
  try {
    const client = getGoogleAdsClient(refreshToken)
    const customer = getCustomer(client, customerId, refreshToken)

    // Use a simple search to verify access
    const results = await customer.query(`
      SELECT 
        customer.id,
        customer.descriptive_name,
        customer.resource_name
      FROM customer
      WHERE customer.id = ${customerId}
    `)
    
    if (results && results.length > 0) {
      return {
        success: true,
        customerId: results[0].customer.id.toString(),
        accountName: results[0].customer.descriptive_name || 'Google Ads Account',
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
