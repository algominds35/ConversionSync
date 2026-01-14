import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { uploadClickConversion } from '@/lib/googleAds'
import { createConversion, getUserByEmail } from '@/lib/db'
import { isValidGclid, isValidEmail } from '@/lib/utils'

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession()
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

    // Check if user has connected Google Ads
    if (!user.google_ads_customer_id || !user.google_refresh_token) {
      return NextResponse.json(
        { error: 'Please connect your Google Ads account first' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      gclid,
      email,
      phone,
      conversionDateTime,
      conversionValue,
      currencyCode = 'USD',
      conversionAction
    } = body

    // Validate required fields
    if (!gclid || !conversionDateTime || !conversionValue || !conversionAction) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate GCLID
    if (!isValidGclid(gclid)) {
      return NextResponse.json(
        { error: 'Invalid GCLID format' },
        { status: 400 }
      )
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate conversion value
    const value = parseFloat(conversionValue)
    if (isNaN(value) || value < 0) {
      return NextResponse.json(
        { error: 'Invalid conversion value' },
        { status: 400 }
      )
    }

    // Upload to Google Ads
    const uploadResult = await uploadClickConversion({
      customerId: user.google_ads_customer_id,
      refreshToken: user.google_refresh_token,
      gclid,
      conversionAction,
      conversionDateTime: new Date(conversionDateTime),
      conversionValue: value,
      currencyCode,
      email,
      phone,
    })

    // Save to database
    const conversion = await createConversion({
      user_id: user.id,
      gclid,
      email,
      phone,
      conversion_date: new Date(conversionDateTime),
      conversion_value: value,
      currency_code: currencyCode,
      upload_status: uploadResult.success ? 'success' : 'failed',
      error_message: uploadResult.error || null,
      google_ads_response: uploadResult.response || uploadResult.details,
    })

    if (!uploadResult.success) {
      return NextResponse.json(
        {
          error: uploadResult.error,
          conversion: conversion
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Conversion uploaded successfully',
      conversion: conversion
    })

  } catch (error) {
    console.error('Upload conversion error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
