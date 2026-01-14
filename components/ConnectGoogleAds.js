'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ConnectGoogleAds() {
  const router = useRouter()
  const [customerId, setCustomerId] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  const handleConnect = async () => {
    if (!customerId) {
      setError('Please enter your Google Ads Customer ID')
      return
    }

    if (!refreshToken) {
      setError('Please enter your OAuth Refresh Token')
      return
    }

    setConnecting(true)
    setError(null)

    try {
      // Call the connect API with customer ID and refresh token
      const response = await fetch('/api/google-ads/connect-manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          customerId: customerId.replace(/-/g, ''),
          refreshToken: refreshToken.trim()
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect Google Ads account')
      }

      setSuccess(true)
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (err) {
      console.error('Connection error:', err)
      setError(err.message)
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Connect Google Ads Account</h2>
      
      <p className="text-gray-600 mb-6">
        To upload conversions, you need to provide your Google Ads Customer ID and OAuth Refresh Token.
      </p>

      {/* Customer ID */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Google Ads Customer ID *
        </label>
        <input
          type="text"
          placeholder="140-461-0772"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Find this at the top of your Google Ads dashboard
        </p>
      </div>

      {/* Refresh Token */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          OAuth Refresh Token *
        </label>
        <textarea
          placeholder="1//0gAB... (paste your refresh token here)"
          value={refreshToken}
          onChange={(e) => setRefreshToken(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
        />
        <button
          type="button"
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-sm text-indigo-600 hover:text-indigo-800 mt-1"
        >
          {showInstructions ? '▼ Hide' : '▶ Show'} instructions on how to get your refresh token
        </button>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-bold text-blue-900 mb-2">How to Get Your OAuth Refresh Token:</p>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Go to <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google OAuth Playground</a></li>
            <li>Click the gear icon (⚙️) in top right</li>
            <li>Check "Use your own OAuth credentials"</li>
            <li>Enter your Client ID: <code className="bg-blue-100 px-1">{process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '[Get from Vercel env vars]'}</code></li>
            <li>Enter your Client Secret</li>
            <li>Close the settings</li>
            <li>In "Step 1", find and select: <strong>Google Ads API v14</strong></li>
            <li>Under it, check: <code className="bg-blue-100 px-1">https://www.googleapis.com/auth/adwords</code></li>
            <li>Click "Authorize APIs"</li>
            <li>Sign in and grant permissions</li>
            <li>In "Step 2", click "Exchange authorization code for tokens"</li>
            <li>Copy the <strong>"Refresh token"</strong> value</li>
            <li>Paste it in the field above!</li>
          </ol>
        </div>
      )}

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

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-900">
          <strong>⚠️ Note:</strong> You only need to do this setup once. After connecting, you can upload unlimited conversions!
        </p>
      </div>
    </div>
  )
}
