'use client'

import { useState } from 'react'

export default function ConnectGoogleAds() {
  const [customerId, setCustomerId] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)

  const handleConnect = async () => {
    if (!customerId) {
      setError('Please enter your Google Ads Customer ID')
      return
    }

    // Validate customer ID format
    const cleanId = customerId.replace(/-/g, '')
    if (!/^\d{10}$/.test(cleanId)) {
      setError('Invalid Customer ID format. Should be XXX-XXX-XXXX (10 digits)')
      return
    }

    setConnecting(true)
    setError(null)

    try {
      // Get OAuth URL from server
      const response = await fetch('/api/google-ads/oauth-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate OAuth URL')
      }

      // Redirect to Google OAuth
      window.location.href = data.url

    } catch (err) {
      console.error('Connection error:', err)
      setError(err.message)
      setConnecting(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Connect Google Ads Account</h2>
      
      <p className="text-gray-600 mb-6">
        To upload conversions, we need to connect to your Google Ads account.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Google Ads Customer ID
        </label>
        <input
          type="text"
          placeholder="140-461-0772"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          disabled={connecting}
        />
        <p className="text-sm text-gray-500 mt-2">
          Find this at the top of your Google Ads dashboard (format: XXX-XXX-XXXX)
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={connecting}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {connecting ? 'Redirecting to Google...' : 'Connect Google Ads'}
      </button>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>What happens next:</strong>
          <br />
          1. You'll be redirected to Google to authorize access
          <br />
          2. Grant permissions for Google Ads API access
          <br />
          3. You'll be redirected back and ready to upload conversions!
        </p>
      </div>
    </div>
  )
}
