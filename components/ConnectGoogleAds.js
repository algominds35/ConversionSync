'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function ConnectGoogleAds() {
  const [customerId, setCustomerId] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleConnect = async () => {
    if (!customerId) {
      setError('Please enter your Google Ads Customer ID')
      return
    }

    setConnecting(true)
    setError(null)

    try {
      // Save customer ID to localStorage before OAuth (so we don't lose it)
      localStorage.setItem('pending_google_ads_customer_id', customerId)

      // Authenticate with Google OAuth (this will redirect)
      await signIn('google', {
        redirect: true,
        callbackUrl: `${window.location.origin}/api/google-ads/connect-callback`
      })

    } catch (err) {
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
          placeholder="123-456-7890"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-2">
          Find this in your Google Ads account (format: XXX-XXX-XXXX)
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          ✅ Successfully connected! Redirecting...
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={connecting}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {connecting ? 'Connecting...' : 'Connect Google Ads'}
      </button>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>What happens next:</strong>
          <br />
          1. You'll authorize access to your Google Ads account
          <br />
          2. We'll verify we can access your conversion data
          <br />
          3. You'll be ready to upload conversions!
        </p>
      </div>
    </div>
  )
}
